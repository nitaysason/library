# Flask Library Management System

A simple Flask application for managing a library system with user registration, book management, and loan tracking features. The application provides basic CRUD (Create, Read, Update, Delete) operations for users and books.

## CRUD Functionality

### Users

- **Create User:**
  - Endpoint: `/register`
  - Method: `POST`
  - Description: Register a new user.

- **Read User:**
  - Endpoint: `/display_all_customers`
  - Method: `GET`
  - Description: Get information about all registered customers.

- **Update User:**
  - Endpoint: `/users/{user_id}`
  - Method: `PUT`
  - Description: Update information about a user.

- **Delete User:**
  - Endpoint: `/remove_customer/{customer_id}`
  - Method: `DELETE`
  - Description: Remove a customer from the system.

### Books

- **Create Book:**
  - Endpoint: `/add_book`
  - Method: `POST`
  - Description: Add a new book to the library.

- **Read Books:**
  - Endpoint: `/get_all_books`
  - Method: `GET`
  - Description: Get information about all books.

- **Update Book:**
  - Endpoint: `/books/{book_id}`
  - Method: `PUT`
  - Description: Update information about a book.

- **Delete Book:**
  - Endpoint: `/books/{book_id}`
  - Method: `DELETE`
  - Description: Delete a book from the library.

### Loans

- **Loan Book:**
  - Endpoint: `/loan_book/{book_id}`
  - Method: `POST`
  - Description: Loan a book to a user.

- **Return Book:**
  - Endpoint: `/return_book/{book_id}`
  - Method: `POST`
  - Description: Return a previously loaned book.

- **Get All Loans:**
  - Endpoint: `/get_all_loans`
  - Method: `GET`
  - Description: Get information about all book loans.

- **Get Late Loans:**
  - Endpoint: `/get_late_loans`
  - Method: `GET`
  - Description: Get information about late book loans.

## Prerequisites

- Python 3.x
- Flask
- Flask SQLAlchemy
- Flask CORS
- Flask JWT Extended
- Flask Bcrypt

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/nitaysason/library.git
    cd flask-library-management
    ```

2. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Set up the database:

    ```bash
    python
    from app import db
    db.create_all()
    exit()
    ```

## Usage

1. Run the Flask application:

    ```bash
    python app.py
    ```

2. Access the application at [http://localhost:5000](http://localhost:5000).


