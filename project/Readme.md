# Library Management App

A simple library management system implemented using Flask, SQLAlchemy, and JWT authentication.

## Overview

This Flask application provides a basic library management system with user registration, login, and book management features. Users can register, log in and take and return books.
 Librarians can add books, update book details, and delete books. 

## Features

- **User Registration:** Users can register with a unique username and password.

- **User Login:** Registered users can log in securely to access the system.

- **Book Management:**
  - **Get All Books:** Retrieve a list of all books in the library.
  - **Add Book:** Librarians can add new books to the library.
  - **Update Book:** Librarians can update the details of existing books.
  - **Delete Book:** Librarians can remove books from the library.

- **Book Transactions:**
  - **Take Book:** Users (non-librarians) can take books, and the system records the transaction.
  - **Return Book:** Users (non-librarians) can return books, and the system records the transaction.

## Prerequisites

Make sure you have the following installed:

- Python (3.6 or higher)
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Flask-JWT-Extended
- Flask-Bcrypt

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/nitaysason/project.git
