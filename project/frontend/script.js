const baseUrl = 'http://localhost:5000'; // Update with your Flask app URL
let authToken = null;
let isLibrarian = false;

function setAuthToken(token, librarianStatus) {
    authToken = token;
    isLibrarian = librarianStatus;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('bookSection').style.display = 'none';
    document.getElementById('userActions').style.display = 'none';
}

function showRegistrationForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
    document.getElementById('bookSection').style.display = 'none';
    document.getElementById('userActions').style.display = 'none';
}

function showBookSection() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('bookSection').style.display = 'block';

    const userActions = document.getElementById('userActions');
    const addBookForm = document.getElementById('addBookForm');
    const bookList = document.getElementById('bookList');

    if (isLibrarian) {
        userActions.style.display = 'none';
        addBookForm.style.display = 'block';
    } else {
        userActions.style.display = 'block';
        addBookForm.style.display = 'none';
    }

    // Fetch and display books for all users
    fetchBooks();
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    axios.post(`${baseUrl}/login`, { username, password })
        .then(response => {
            const { access_token, is_librarian } = response.data;
            setAuthToken(access_token, is_librarian);
            showBookSection();
            fetchBooks();
        })
        .catch(error => {
            console.error('Login failed:', error.response ? error.response.data.message : error.message);
        });
}

async function register() {
    try {
        const regUsername = document.getElementById('regUsername').value;
        const regPassword = document.getElementById('regPassword').value;
        const regName = document.getElementById('regName').value;
        const regCity = document.getElementById('regCity').value;
        const regAge = document.getElementById('regAge').value;
        const regIsLibrarian = document.getElementById('regIsLibrarian').checked;

        const requestBody = {
            username: regUsername,
            password: regPassword,
            name: regName,
            city: regCity,
            age: regAge,
            is_librarian: regIsLibrarian,
        };

        const response = await axios.post(`${baseUrl}/register`, requestBody);
        console.log(response.data.message);
        showLoginForm();
    } catch (error) {
        console.error('Registration failed:', error.response ? error.response.data.message : error.message);
    }
}

async function fetchBooks() {
    try {
        const response = await axios.get(`${baseUrl}/get_all_books`);
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '';

        response.data.books.forEach(book => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>ID:</strong> ${book.id} 
                <strong>Title:</strong> ${book.name} 
                <strong>Author:</strong> ${book.author} 
                ${isLibrarian ? '<button class="update-button" onclick="updateBook(' + book.id + ')">Update</button>' : ''} 
                ${isLibrarian ? '<button class="delete-button" onclick="deleteBook(' + book.id + ')">Delete</button>' : ''}
                ${!isLibrarian ? '<button class="take-button" onclick="takeBook(' + book.id + ')">Take Book</button>' : ''}
                ${!isLibrarian ? '<button class="return-button" onclick="returnBook(' + book.id + ')">Return Book</button>' : ''}
            `;
            bookList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching books:', error.response ? error.response.data.message : error.message);
    }
}

async function addBook() {
    try {
        const bookName = document.getElementById('add-book-name').value;
        const author = document.getElementById('add-book-author').value;
        const year = document.getElementById('add-book-year').value;
        const type = document.getElementById('add-book-type').value;
        const imageInput = document.getElementById('add-book-image');

        // Check if required elements are present
        if (!bookName || !author || !year || !type || !imageInput.files[0]) {
            console.error('Missing required fields.');
            alert('Please fill in all the required fields.');
            return;
        }

        // Create FormData object and append data
        const formData = new FormData();
        formData.append('name', bookName);
        formData.append('author', author);
        formData.append('year_published', year);
        formData.append('book_type', type);
        formData.append('image', imageInput.files[0]);

        // Make the request using axios with proper headers
        const response = await axios.post(`${baseUrl}/add_book`, formData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,  // Use the stored authToken
                'Content-Type': 'multipart/form-data',  // Set content type for FormData
            },
        });

        console.log(response.data);

        if (response.data.message) {
            // Handle success (e.g., show a success message)
            alert('Book added successfully!');
            fetchBooks(); // Update book list after a successful addition
        } else if (response.data.error) {
            // Handle error with more details (e.g., show an error message with details)
            console.error(response.data.error);
            alert(`Failed to add book. Error: ${response.data.error}`);
        } else {
            // Handle other unexpected responses
            console.error('Unexpected response format');
            alert('Failed to add book. Unexpected response format.');
        }

        // Log the request headers
        console.log('Request Headers:', response.headers);

        // You may want to update your UI or perform additional actions after adding the book
    } catch (error) {
        console.error('Error adding book:', error.response ? error.response.data.message : error.message);
        alert('Failed to add book. Please try again.');
    }
}

// Function to update a book
function updateBook(bookId) {
    const newName = prompt('Enter new name:');
    const newAuthor = prompt('Enter new author:');
    const year_published = prompt('Enter new year_published:');
    const book_type = prompt('Enter new Book_type:');
    axios.put(`${baseUrl}/books/${bookId}`, { name: newName, author: newAuthor,year_published:year_published,book_type:book_type })
        .then(response => {
            console.log(response.data.message);
            fetchBooks();
        })
        .catch(error => {
            console.error('Error updating book:', error.response ? error.response.data.message : error.message);
            alert(' Cannot update the book. It is currently taken by a user');
        });
}

function deleteBook(bookId) {
    const confirmDelete = confirm('Are you sure you want to delete this book?');
    if (confirmDelete) {
        axios.delete(`${baseUrl}/books/${bookId}`)
            .then(response => {
                console.log(response.data.message);
                fetchBooks();
            })
            .catch(error => {
                console.error('Error deleting book:', error.response ? error.response.data.message : error.message);
                alert(' Cannot delete the book. It is currently taken by a user');
            });
    }
}
    // Loan Book function
 function takeBook(bookId) {
    axios.post(`${baseUrl}/loan_book/${bookId}`)
        .then(response => {
            console.log(response.data.message);
            fetchBooks();
        })
        .catch(error => {
            console.error('Error taking book:', error.response ? error.response.data.message : error.message);
            alert('book alredy taken');
        });
}
    // Return Book function
   async function returnBook(bookId) {
    try {
        // Fetch API to make a POST request to the return_book endpoint
        const response = await fetch(`${baseUrl}/return_book/${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken, // Use the stored authToken
            },
        });

        // Parse the JSON response
        const result = await response.json();

        // Check if the request was successful
        if (response.ok) {
            console.log(result.message);
            // Perform any additional actions on success
            fetchBooks(); // Example: Update book list after successful return
        } else {
            console.error(result.message);
            // Handle errors appropriately
            // You may want to display an error message to the user
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle network or other errors
        // You may want to display an error message to the user
    }
}
    // // Find Customer By Name function
    // function findCustomerByName() {
    //     const customerName = document.getElementById('find-customer-name').value;

    //     makeRequest('GET', `find_customer_by_name?name=${customerName}`)
    //         .then(response => {
    //             console.log(response);
    //             // Display search results in the 'find-customer-results' div
    //             const findCustomerDiv = document.getElementById('find-customer-results');
    //             findCustomerDiv.innerHTML = '';

    //             response.found_customers.forEach(customer => {
    //                 const customerDiv = document.createElement('div');
    //                 customerDiv.innerHTML = `<strong>${customer.name}</strong> (${customer.username}) - Age: ${customer.age}, City: ${customer.city}`;
    //                 findCustomerDiv.appendChild(customerDiv);
    //             });
    //         })
    //         .catch(error => console.error(error));
    // }

    // // Remove Customer function
    // function removeCustomer() {
    //     const customerName = document.getElementById('remove-customer-name').value;

    //     makeRequest('POST', 'remove_customer', { name: customerName })
    //         .then(response => {
    //             console.log(response);
    //             // Handle the response as needed
    //         })
    //         .catch(error => console.error(error));
    // }

    // // Display All Customers function
    // function displayAllCustomers() {
    //     makeRequest('GET', 'display_all_customers')
    //         .then(response => {
    //             console.log(response);
    //             // Display customers in the 'display-customers-results' div
    //             const displayCustomersDiv = document.getElementById('display-customers-results');
    //             displayCustomersDiv.innerHTML = '';

    //             response.customers.forEach(customer => {
    //                 const customerDiv = document.createElement('div');
    //                 customerDiv.innerHTML = `<strong>${customer.name}</strong> (${customer.username}) - Age: ${customer.age}, City: ${customer.city}`;
    //                 displayCustomersDiv.appendChild(customerDiv);
    //             });
    //         })
    //         .catch(error => console.error(error));
    // }

    // // Display All Loans function
    // function displayAllLoans() {
    //     makeRequest('GET', 'display_all_loans')
    //         .then(response => {
    //             console.log(response);
    //             // Display loans in the 'display-loans-results' div
    //             const displayLoansDiv = document.getElementById('display-loans-results');
    //             displayLoansDiv.innerHTML = '';

    //             response.loans.forEach(loan => {
    //                 const loanDiv = document.createElement('div');
    //                 loanDiv.innerHTML = `<strong>${loan.book_name}</strong> - Loaned to: ${loan.customer_name}, Due Date: ${loan.due_date}`;
    //                 displayLoansDiv.appendChild(loanDiv);
    //             });
    //         })
    //         .catch(error => console.error(error));
    // }

    // // Display Late Loans function
    // function displayLateLoans() {
    //     makeRequest('GET', 'display_late_loans')
    //         .then(response => {
    //             console.log(response);
    //             // Display late loans in the 'display-late-loans-results' div
    //             const displayLateLoansDiv = document.getElementById('display-late-loans-results');
    //             displayLateLoansDiv.innerHTML = '';

    //             response.late_loans.forEach(loan => {
    //                 const lateLoanDiv = document.createElement('div');
    //                 lateLoanDiv.innerHTML = `<strong>${loan.book_name}</strong> - Loaned to: ${loan.customer_name}, Due Date: ${loan.due_date}`;
    //                 displayLateLoansDiv.appendChild(lateLoanDiv);
    //             });
    //         })
    //         .catch(error => console.error(error));
    // }