# APDS7311_PaymentSystem_Group1
## Running the Application
1.	Clone the repository from GitHub to your local machine.
2.	Navigate to the .env file inside the backend directory and add your MongoDB connection string using your own database credentials.
3.	Start the server —
- Navigate to backend folder in the terminal PS C:\Users\user\APDS7311_PaymentSystem_Group1\backend> and then type npm start 
- Open a new terminal and navigate to frontend folder in the terminal PS C:\Users\user\APDS\APDS7311_PaymentSystem_Group1\frontend> and then type npm start  
- An admin user is automatically generated on first run.
---------
   Username: admin
   Password: Admin@123
 ----------
5.	Once the app is running, use the Staff Portal to log in with admin credentials and to then create general user accounts.
-----
Input Validation Rules (User Registration)
All user information is strictly validated before being processed. A new user will only be registered if the following requirements are met:
Full Name
•	Only letters and spaces allowed
•	Length: 1–50 characters

ID Number
•	Digits only
•	Length: 6–20 digits

Account Number
•	Digits only
•	Length: 6–20 digits

Username
•	Letters, numbers, and underscores only
•	No spaces or other special characters
•	Length: 3–20 characters

Password
•	Length: 8–20 characters
•	Must include at least:
1 uppercase letter
1 lowercase letter
1 number
1 special character (@, $, !, %, *, ?, &)
•	Spaces not allowed

-------------------------------------

## Security Implementations
1.	HTTPS Encryption
All traffic is encrypted using SSL/TLS certificates. This ensures data transferred between the client and the server is secure and cannot be intercepted by attackers. It prevents man-in-the-middle (MITM) attacks and keeps sensitive information such as passwords and payment details private.
2.	Helmet
Helmet enhances security by setting secure HTTP headers. It protects the application from common vulnerabilities like clickjacking, cross-site scripting (XSS), MIME-sniffing, and other attacks that exploit browser behavior (Kobimbo, 2023).
3.	CORS (Cross-Origin Resource Sharing)
CORS configuration defines which external domains can access the API. This prevents unauthorized websites from making requests to the backend. In production, the origin is restricted to the official frontend domain for added security.
4.	XSS Protection
The application uses an XSS cleaning middleware to sanitize user input. This helps prevent attackers from injecting malicious JavaScript or HTML into web pages viewed by other users (KirstenS, n.d.).
5.	Payload Size Limiting
Incoming request payloads are limited to a maximum size to prevent denial-of-service (DoS) attacks that attempt to overwhelm the server with large or malformed requests.
6.	MongoDB Injection Sanitization
The system automatically removes dangerous MongoDB operators from user input to prevent NoSQL injection attacks. This ensures that database queries cannot be manipulated by injecting special characters or malicious query syntax.
7.	Rate Limiting
Rate limiting restricts each IP address to a certain number of requests within a specific time window. This prevents brute-force login attempts, API abuse, and distributed denial-of-service (DDoS) attacks.
8.	Cookie Parsing and Security
Cookies are parsed and managed securely to handle authentication tokens and session data without exposing sensitive information to unauthorized parties.
9.	Request Logging
All incoming requests are logged with details such as timestamps, IP addresses, and status codes. This creates an audit trail for monitoring and identifying suspicious activity or potential security incidents.

10.	Global Error Handling
A centralized error handler ensures that no sensitive system information is exposed to the client in error messages. This prevents attackers from gaining insights into the internal workings of the application.
11.	Custom CORS Headers
Custom response headers define which HTTP methods, origins, and headers are allowed. This adds another layer of control over how external clients interact with the API.

------

## Password Security
1.	Password Hashing in the Backend
Password in the staff and user routes are hashed using bcrypt and salting. This means that there are no plain text passwords stored in the database.

2.	Password Validation while Logging In
Passwords are protected with brute force, validation is done through Regex Patterns, passwords are compared with bcrypt, and JWT token is assigned.
 
3.	Password Regex Pattern Validation
Regex Patterns implemented to prevent injections by ensuring password has the following standards:
•	Minimum of 8 characters, maximum 20
•	At least 1 uppercase letter
•	At least 1 lowercase letter
•	At least 1 number
•	At least 1 special character

4.	JWT Token Security
Token is signed with the secret key and verified on every route request and ensures that invalid tokens are rejected.
Auth.js in Middleware folder:

5.	Brute Force Protection
Prevents repeated login attempts and password guessing from attackers.
 
6.	Server Security
Applied Helmet, XSS, NoSQL Injection, CORS in Server.

7.	API Base URL Configuration

 --------
 ## Functioning of Web App
 - Staff Register
 - Default Staff Approves or Rejects Registration
 - Staff Login
 - Staff Registers User
 - User login (Static Login)
 - Users create payment
 - Payments appear in staff portal
 - Staff approve payments
 - Users see status update

 ------
 ## YouTube Link: https://youtu.be/y6YUVhVzdRA
 ------
 ### Group Members:
 Meshaya Munnhar
 Zoe Heyneke
 Panashe Mavhunga
 Joy Kgomo

