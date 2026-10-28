Secrets App 🔐

A web application built with Node.js, Express, PostgreSQL, and Passport.js that allows users to register, log in, and access a protected page. Users can authenticate with an email and password or sign in with their Google account.

Features

User Registration: Create an account using an email address and password.

Password Hashing: Securely hash passwords using bcrypt before storing them in the database.

Local Authentication: Log in with an email address and password using Passport Local Strategy.

Google Authentication: Sign in with Google using OAuth 2.0 and Passport Google OAuth 2.0 Strategy.

Session Management: Maintain authenticated sessions using Express Session and Passport.

Protected Route: Restrict access to the secrets page to authenticated users.

PostgreSQL Database: Store user information in a relational database.

Logout: End the authenticated session.

Technologies Used

Node.js — JavaScript runtime.

Express.js — Web application framework.

PostgreSQL — Relational database.

node-postgres (pg) — PostgreSQL client for Node.js.

EJS — Template engine for rendering views.

Passport.js — Authentication middleware.

Passport Local — Email and password authentication.

Passport Google OAuth 2.0 — Google sign-in.

bcrypt — Password hashing.

express-session — Session management.

body-parser — Parsing URL-encoded form data.

dotenv — Loading environment variables.

HTML and CSS — Frontend structure and styling.

Prerequisites

Before running the project, make sure you have installed:

Node.js

PostgreSQL

npm, which comes with Node.js

A Google Cloud project with OAuth 2.0 credentials for Google sign-in

Installation and Setup

1. Clone the repository

git clone <YOUR_REPOSITORY_URL>
cd secrets-app

Replace <YOUR_REPOSITORY_URL> with your GitHub repository URL.

2. Install dependencies

npm install

3. Create the PostgreSQL database

Open PostgreSQL and create a database named secrets:

CREATE DATABASE secrets;

Connect to the database and import the provided SQL file:

psql -U postgres -d secrets -f secrets.sql

Replace postgres with your PostgreSQL username if necessary.

The secrets.sql file contains the table structure used to store user accounts.

4. Configure environment variables

Create a local .env file in the root directory and add the following variables:

PG_USER=your_postgres_username
PG_HOST=localhost
PG_DATABASE=secrets
PG_PASSWORD=your_postgres_password
PG_PORT=5432

SESSION_SECRET=your_random_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

Replace the example values with your actual PostgreSQL credentials, a strong session secret, and your Google OAuth credentials.

Important: Never commit your .env file or expose your credentials publicly.

5. Configure Google OAuth 2.0

To enable Google sign-in:

Open the Google Cloud Console.

Create or select a project.

Configure the OAuth consent screen.

Create an OAuth 2.0 Client ID.

Add the following authorized redirect URI to your OAuth client:

http://localhost:3000/auth/google/secrets

Copy the Client ID and Client Secret into your .env file.

The redirect URI must match the callbackURL configured in index.js.

6. Run the application

Start the server with:

node index.js

Once the server starts, open the following URL in your browser:

http://localhost:3000

Application Routes

Route

Method

Description

/

GET

Displays the home page.

/register

GET

Displays the registration page.

/register

POST

Creates a new user account.

/login

GET

Displays the login page.

/login

POST

Authenticates a user with email and password.

/auth/google

GET

Starts Google authentication.

/auth/google/secrets

GET

Handles the Google OAuth callback.

/secrets

GET

Displays the protected secrets page to authenticated users.

/logout

GET

Logs the user out and redirects to the home page.

Project Structure

secrets-app/
├── css/
│   └── styles.css
├── public/
│   └── css/
│       └── styles.css
├── views/
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── secrets.ejs
├── index.js
├── package.json
├── package-lock.json
├── secrets.sql
└── README.md

Key Files

index.js — Configures the Express server, database connection, authentication strategies, sessions, and application routes.

secrets.sql — Defines the database structure.

views/ — Contains the EJS templates used to render the application pages.

views/partials/ — Contains reusable header and footer templates.

public/css/styles.css — Contains the stylesheet served by Express.

package.json — Lists the project dependencies and package configuration.

package-lock.json — Records the resolved dependency versions.

Authentication Flow

Email and Password

The user submits the registration form.

The application checks whether the email address is already registered.

The password is hashed with bcrypt.

The new account is stored in PostgreSQL.

Passport logs the user in and the application redirects them to the protected secrets page.

For subsequent logins, Passport Local retrieves the account and bcrypt compares the submitted password with the stored hash.

Google Sign-In

The user selects the Google sign-in option.

Passport redirects the user to Google for authentication.

Google redirects back to the configured callback URL.

The application searches PostgreSQL for an account with the user's email address.

If an account exists, it is used to authenticate the user. Otherwise, the application creates an account.

The user is redirected to the protected secrets page.

Security Notes

Passwords for locally registered accounts are hashed with bcrypt before being stored.

Database credentials and OAuth secrets should be stored in environment variables.

The secrets page checks whether the user is authenticated before rendering protected content.

Use a strong, unpredictable SESSION_SECRET.

For production deployment, configure secure session cookies, HTTPS, and a persistent session store.

Never commit .env or node_modules/ to the repository.

Future Improvements

Potential improvements include:

Adding server-side form validation and clearer error messages.

Improving session serialization by storing user IDs instead of complete user objects.

Adding automated tests for authentication and routes.

Improving responsive design and accessibility.

Deploying the application to a production environment.

Author
NicolasFlorez