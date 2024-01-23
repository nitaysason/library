from datetime import datetime
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_bcrypt import Bcrypt
from datetime import timedelta

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a secure secret key
jwt = JWTManager(app)

# SQLite database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# User entity model
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(50), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    is_librarian = db.Column(db.Boolean, default=False)
    books = db.relationship('Book', backref='customer', lazy=True)


# Book entity model
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    year_published = db.Column(db.Integer, nullable=True)
    book_type = db.Column(db.Integer, nullable=True)  # Assuming book type is an integer field (1/2/3)
    image = db.Column(db.String(255), nullable=True)  # Assuming image is a string field for the image URL/file path
    user_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)



class Loan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    BookID = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    CustID = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    Loandate = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    Returndate = db.Column(db.DateTime, nullable=True)


# Create tables
with app.app_context():
    db.create_all()

# Routes

# User Routes
# Add this route to handle user registration
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Extract registration details
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')
        city = data.get('city')
        age = data.get('age')
        is_librarian = data.get('is_librarian', False)  # Default to False if not provided

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create a new user instance
        new_user = Customer(username=username, password=hashed_password, name=name, city=city, age=age, is_librarian=is_librarian)

        # Add the user to the database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"message": "Error registering user", "error": str(e)}), 500



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Customer.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "access_token": access_token, "is_librarian": user.is_librarian}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# Add this route to get all books
@app.route('/get_all_books', methods=['GET'])
def get_all_books():
    try:
        # Query all books from the database
        all_books = Book.query.all()
        
        # Convert the books to a list of dictionaries for JSON response
        books_list = []
        for book in all_books:
            book_data = {
                'id': book.id,
                'name': book.name,
                'author': book.author,
                'year_published': book.year_published,
                'book_type': book.book_type,
                'image': book.image,
                'user_id': book.user_id
            }
            books_list.append(book_data)
        
        return jsonify({"books": books_list}), 200
    
    except Exception as e:
        return jsonify({"message": "Error retrieving books", "error": str(e)}), 500

# Add this route to add a new book


@app.route('/add_book', methods=['POST'])
@jwt_required()  
def add_book():
    try:
        # Get data from the request
        data = request.form.to_dict()

        # Extract book details
        name = data.get('name')
        author = data.get('author')
        year_published = data.get('year_published')
        book_type = data.get('type')  # Update to match the key in your FormData
        image = data.get('image')
        user_id = get_jwt_identity()  

        # Create a new book instance
        new_book = Book(name=name, author=author, year_published=year_published, book_type=book_type, image=image, user_id=user_id)
        
        # Add the book to the database
        db.session.add(new_book)
        db.session.commit()

        return jsonify({"message": "Book added successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": f"Error adding book: {str(e)}"}), 500



# Add this route to update a book
@app.route('/update_book/<int:book_id>', methods=['PUT'])
@jwt_required()  # Use this decorator to ensure that the request is authenticated with a valid JWT token
def update_book(book_id):
    try:
        # Get data from the request
        data = request.get_json()

        # Find the book by ID
        book = Book.query.get(book_id)

        # Check if the book exists
        if not book:
            return jsonify({"message": "Book not found"}), 404

        # Ensure that the user making the request is the owner of the book
        current_user_id = get_jwt_identity()
        if book.user_id != current_user_id:
            return jsonify({"message": "You are not authorized to update this book"}), 403

        # Update book details
        book.name = data.get('name', book.name)
        book.author = data.get('author', book.author)
        book.year_published = data.get('year_published', book.year_published)
        book.book_type = data.get('book_type', book.book_type)
        book.image = data.get('image', book.image)

        # Commit changes to the database
        db.session.commit()

        return jsonify({"message": "Book updated successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Error updating book", "error": str(e)}), 500


# Add this route to delete a book
@app.route('/delete_book/<int:book_id>', methods=['DELETE'])
@jwt_required()  # Use this decorator to ensure that the request is authenticated with a valid JWT token
def delete_book(book_id):
    try:
        # Find the book by ID
        book = Book.query.get(book_id)

        # Check if the book exists
        if not book:
            return jsonify({"message": "Book not found"}), 404

        # Ensure that the user making the request is the owner of the book
        current_user_id = get_jwt_identity()
        if book.user_id != current_user_id:
            return jsonify({"message": "You are not authorized to delete this book"}), 403

        # Delete the book from the database
        db.session.delete(book)
        db.session.commit()

        return jsonify({"message": "Book deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Error deleting book", "error": str(e)}), 500

@app.route('/loan_book/<int:book_id>', methods=['POST'])
@jwt_required()  # Use this decorator to ensure that the request is authenticated with a valid JWT token
def loan_book(book_id):
    try:
        # Find the book by ID
        book = Book.query.get(book_id)

        # Check if the book exists
        if not book:
            return jsonify({"message": "Book not found"}), 404

        # Ensure that the book is not already on loan
        if book.user_id:
            return jsonify({"message": "Book is already on loan"}), 400

        # Get the current user ID from the JWT token
        current_user_id = get_jwt_identity()

        # Update book details to indicate it's on loan
        book.user_id = current_user_id

        # Determine the maximum loan time based on the book type
        book_type = book.book_type
        if book_type == 1:
            max_loan_days = 10
        elif book_type == 2:
            max_loan_days = 5
        elif book_type == 3:
            max_loan_days = 2
        else:
            return jsonify({"message": "Invalid book type"}), 400

        # Calculate the return date based on the maximum loan time
        return_date = datetime.utcnow() + timedelta(days=max_loan_days)

        # Create a new loan record
        new_loan = Loan(BookID=book_id, CustID=current_user_id, Loandate=datetime.utcnow(), Returndate=return_date)

        # Add the book and loan to the database
        db.session.add(book)
        db.session.add(new_loan)
        db.session.commit()

        return jsonify({"message": "Book loan successful", "return_date": return_date}), 200

    except Exception as e:
        return jsonify({"message": "Error processing book loan", "error": str(e)}), 500


# Add this route to handle book returns
@app.route('/return_book/<int:book_id>', methods=['POST'])
@jwt_required()  # Use this decorator to ensure that the request is authenticated with a valid JWT token
def return_book(book_id):
    try:
        # Find the book by ID
        book = Book.query.get(book_id)

        # Check if the book exists
        if not book:
            return jsonify({"message": "Book not found"}), 404

        # Ensure that the book is on loan
        if not book.user_id:
            return jsonify({"message": "Book is not on loan"}), 400

        # Ensure that the user making the request is the one who borrowed the book
        current_user_id = get_jwt_identity()
        if book.user_id != current_user_id:
            return jsonify({"message": "You are not authorized to return this book"}), 403

        # Update book details to indicate it's returned
        book.user_id = None

        # Find the corresponding loan record
        loan = Loan.query.filter_by(BookID=book_id, CustID=current_user_id, Returndate=None).first()

        # Update the loan record with the return date
        if loan:
            loan.Returndate = datetime.utcnow()

        # Commit changes to the database
        db.session.commit()

        return jsonify({"message": "Book return successful"}), 200

    except Exception as e:
        return jsonify({"message": "Error processing book return", "error": str(e)}), 500
    
    # Add this route to display all customers
@app.route('/display_all_customers', methods=['GET'])
def display_all_customers():
    try:
        # Query all customers from the database
        all_customers = Customer.query.all()

        # Convert the customers to a list of dictionaries for JSON response
        customers_list = []
        for customer in all_customers:
            customer_data = {
                'id': customer.id,
                'username': customer.username,
                'name': customer.name,
                'city': customer.city,
                'age': customer.age,
                'is_librarian': customer.is_librarian
            }
            customers_list.append(customer_data)

        return jsonify({"customers": customers_list}), 200

    except Exception as e:
        return jsonify({"message": "Error retrieving customers", "error": str(e)}), 500


# Add this route to display all loans
@app.route('/get_all_loans', methods=['GET'])
def get_all_loans():
    try:
        # Query all loans from the database
        all_loans = Loan.query.all()

        # Convert the loans to a list of dictionaries for JSON response
        loans_list = []
        for loan in all_loans:
            loan_data = {
                'id': loan.id,
                'book_id': loan.BookID,
                'customer_id': loan.CustID,
                'loan_date': loan.Loandate.strftime("%Y-%m-%d %H:%M:%S"),
                'return_date': loan.Returndate.strftime("%Y-%m-%d %H:%M:%S") if loan.Returndate else None
            }
            loans_list.append(loan_data)

        return jsonify({"loans": loans_list}), 200

    except Exception as e:
        return jsonify({"message": "Error retrieving loans", "error": str(e)}), 500

# Add this route to display late loans
@app.route('/get_late_loans', methods=['GET'])
def get_late_loans():
    try:
        # Query late loans from the database
        late_loans = Loan.query.filter(Loan.Returndate < datetime.utcnow()).all()

        # Convert the late loans to a list of dictionaries for JSON response
        late_loans_list = []
        for loan in late_loans:
            late_loan_data = {
                'id': loan.id,
                'book_id': loan.BookID,
                'customer_id': loan.CustID,
                'loan_date': loan.Loandate.strftime("%Y-%m-%d %H:%M:%S"),
                'return_date': loan.Returndate.strftime("%Y-%m-%d %H:%M:%S") if loan.Returndate else None
            }
            late_loans_list.append(late_loan_data)

        return jsonify({"late_loans": late_loans_list}), 200

    except Exception as e:
        return jsonify({"message": "Error retrieving late loans", "error": str(e)}), 500

# Add this route to find a book by name
@app.route('/find_book_by_name', methods=['GET'])
def find_book_by_name():
    try:
        # Get the book name from the request parameters
        book_name = request.args.get('name')

        if not book_name:
            return jsonify({"message": "Book name parameter is missing"}), 400

        # Query the book by name from the database
        found_books = Book.query.filter(Book.name.ilike(f"%{book_name}%")).all()

        # Convert the found books to a list of dictionaries for JSON response
        found_books_list = []
        for book in found_books:
            book_data = {
                'id': book.id,
                'name': book.name,
                'author': book.author,
                'year_published': book.year_published,
                'book_type': book.book_type,
                'image': book.image,
                'user_id': book.user_id
            }
            found_books_list.append(book_data)

        return jsonify({"found_books": found_books_list}), 200

    except Exception as e:
        return jsonify({"message": "Error finding books by name", "error": str(e)}), 500
# Add this route to find a customer by name
@app.route('/find_customer_by_name', methods=['GET'])
def find_customer_by_name():
    try:
        # Get the customer name from the request parameters
        customer_name = request.args.get('name')

        if not customer_name:
            return jsonify({"message": "Customer name parameter is missing"}), 400

        # Query the customer by name from the database
        found_customers = Customer.query.filter(Customer.name.ilike(f"%{customer_name}%")).all()

        # Convert the found customers to a list of dictionaries for JSON response
        found_customers_list = []
        for customer in found_customers:
            customer_data = {
                'id': customer.id,
                'username': customer.username,
                'name': customer.name,
                'city': customer.city,
                'age': customer.age,
                'is_librarian': customer.is_librarian
            }
            found_customers_list.append(customer_data)

        return jsonify({"found_customers": found_customers_list}), 200

    except Exception as e:
        return jsonify({"message": "Error finding customers by name", "error": str(e)}), 500
    
# Add this route to remove a customer by ID
@app.route('/remove_customer/<int:customer_id>', methods=['DELETE'])
@jwt_required()  # Use this decorator to ensure that the request is authenticated with a valid JWT token
def remove_customer(customer_id):
    try:
        # Find the customer by ID
        customer = Customer.query.get(customer_id)

        # Check if the customer exists
        if not customer:
            return jsonify({"message": "Customer not found"}), 404

        # Ensure that the user making the request is an administrator or the owner of the customer account
        current_user_id = get_jwt_identity()
        if not customer.is_librarian and current_user_id != customer.id:
            return jsonify({"message": "You are not authorized to remove this customer"}), 403

        # Delete the customer from the database
        db.session.delete(customer)
        db.session.commit()

        return jsonify({"message": "Customer removed successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Error removing customer", "error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)