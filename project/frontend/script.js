    // Base URL of your Flask API
    const apiUrl = 'http://localhost:5000';

    // Helper function to make API requests
    async function makeRequest(method, endpoint, data, token) {
        try {
            const headers = {};

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            let response;

            if (method === 'GET') {
                response = await axios.get(`${apiUrl}/${endpoint}`, { headers });
            } else {
                headers['Content-Type'] = 'application/json';
                response = await axios({
                    method: method,
                    url: `${apiUrl}/${endpoint}`,
                    headers: headers,
                    data: data
                });
            }

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    }

    // Register function
    function register() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const name = document.getElementById('register-name').value;
        const city = document.getElementById('register-city').value;
        const age = document.getElementById('register-age').value;
        const isLibrarian = document.getElementById('register-is-librarian').checked;

        const requestBody = {
            username,
            password,
            name,
            city,
            age,
            is_librarian: isLibrarian
        };

        makeRequest('POST', 'register', requestBody)
            .then(response => {
                console.log(response);
                // Handle the response as needed
                // You might want to redirect to a login page or show a success message
            })
            .catch(error => console.error(error));
    }

    // Login function
    function login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        makeRequest('POST', 'login', { username, password })
            .then(response => {
                console.log(response);
                // Handle the response as needed
                // You might want to store the received JWT token for subsequent requests
            })
            .catch(error => console.error(error));
    }

    // Add Book function
    async function addBook() {
        try {
            // Get the JWT token from localStorage (assuming you stored it after login)
            const token = localStorage.getItem('jwt_token');
            console.log('Token:', token);

            // Check if the token is available
            if (!token) {
                console.error('JWT token is missing.');
                alert('Failed to add book. Please login again.');
                return;
            }

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
            const response = await axios.post(`${apiUrl}/add_book`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',  // Set content type for FormData
                },
            });

            console.log(response.data);

            if (response.data.message) {
                // Handle success (e.g., show a success message)
                alert('Book added successfully!');
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




    // Loan Book function
    function loanBook() {
        const bookName = document.getElementById('loan-book-name').value;

        // Get the JWT token from localStorage (assuming you stored it after login)
        const token = localStorage.getItem('jwt_token');

        makeRequest('POST', 'loan_book', { name: bookName }, token)
            .then(response => {
                console.log(response);
                // Handle the response as needed
            })
            .catch(error => console.error(error));
    }

    // Return Book function
    function returnBook() {
        const bookName = document.getElementById('return-book-name').value;

        // Get the JWT token from localStorage (assuming you stored it after login)
        const token = localStorage.getItem('jwt_token');

        makeRequest('POST', 'return_book', { name: bookName }, token)
            .then(response => {
                console.log(response);
                // Handle the response as needed
            })
            .catch(error => console.error(error));
    }

    // Find Customer By Name function
    function findCustomerByName() {
        const customerName = document.getElementById('find-customer-name').value;

        makeRequest('GET', `find_customer_by_name?name=${customerName}`)
            .then(response => {
                console.log(response);
                // Display search results in the 'find-customer-results' div
                const findCustomerDiv = document.getElementById('find-customer-results');
                findCustomerDiv.innerHTML = '';

                response.found_customers.forEach(customer => {
                    const customerDiv = document.createElement('div');
                    customerDiv.innerHTML = `<strong>${customer.name}</strong> (${customer.username}) - Age: ${customer.age}, City: ${customer.city}`;
                    findCustomerDiv.appendChild(customerDiv);
                });
            })
            .catch(error => console.error(error));
    }

    // Remove Customer function
    function removeCustomer() {
        const customerName = document.getElementById('remove-customer-name').value;

        makeRequest('POST', 'remove_customer', { name: customerName })
            .then(response => {
                console.log(response);
                // Handle the response as needed
            })
            .catch(error => console.error(error));
    }

    // Display All Customers function
    function displayAllCustomers() {
        makeRequest('GET', 'display_all_customers')
            .then(response => {
                console.log(response);
                // Display customers in the 'display-customers-results' div
                const displayCustomersDiv = document.getElementById('display-customers-results');
                displayCustomersDiv.innerHTML = '';

                response.customers.forEach(customer => {
                    const customerDiv = document.createElement('div');
                    customerDiv.innerHTML = `<strong>${customer.name}</strong> (${customer.username}) - Age: ${customer.age}, City: ${customer.city}`;
                    displayCustomersDiv.appendChild(customerDiv);
                });
            })
            .catch(error => console.error(error));
    }

    // Display All Loans function
    function displayAllLoans() {
        makeRequest('GET', 'display_all_loans')
            .then(response => {
                console.log(response);
                // Display loans in the 'display-loans-results' div
                const displayLoansDiv = document.getElementById('display-loans-results');
                displayLoansDiv.innerHTML = '';

                response.loans.forEach(loan => {
                    const loanDiv = document.createElement('div');
                    loanDiv.innerHTML = `<strong>${loan.book_name}</strong> - Loaned to: ${loan.customer_name}, Due Date: ${loan.due_date}`;
                    displayLoansDiv.appendChild(loanDiv);
                });
            })
            .catch(error => console.error(error));
    }

    // Display Late Loans function
    function displayLateLoans() {
        makeRequest('GET', 'display_late_loans')
            .then(response => {
                console.log(response);
                // Display late loans in the 'display-late-loans-results' div
                const displayLateLoansDiv = document.getElementById('display-late-loans-results');
                displayLateLoansDiv.innerHTML = '';

                response.late_loans.forEach(loan => {
                    const lateLoanDiv = document.createElement('div');
                    lateLoanDiv.innerHTML = `<strong>${loan.book_name}</strong> - Loaned to: ${loan.customer_name}, Due Date: ${loan.due_date}`;
                    displayLateLoansDiv.appendChild(lateLoanDiv);
                });
            })
            .catch(error => console.error(error));
    }