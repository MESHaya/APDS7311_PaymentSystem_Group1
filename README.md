# APDS7311_PaymentSystem_Group1
Security Implementations
1. HTTPS Encryption

All traffic is encrypted using SSL/TLS certificates. This ensures data transferred between the client and the server is secure and cannot be intercepted by attackers. It prevents man-in-the-middle (MITM) attacks and keeps sensitive information such as passwords and payment details private.

2. HTTP Request Blocking

A separate HTTP server warns users when attempting to connect insecurely. This ensures that all users access the site through HTTPS only, preventing unencrypted data transmission.

3. Helmet

Helmet enhances security by setting secure HTTP headers. It protects the application from common vulnerabilities like clickjacking, cross-site scripting (XSS), MIME-sniffing, and other attacks that exploit browser behavior.

4. CORS (Cross-Origin Resource Sharing)

CORS configuration defines which external domains can access the API. This prevents unauthorized websites from making requests to the backend. In production, the origin is restricted to the official frontend domain for added security.

5. XSS Protection

The application uses an XSS cleaning middleware to sanitize user input. This helps prevent attackers from injecting malicious JavaScript or HTML into web pages viewed by other users.

6. Payload Size Limiting

Incoming request payloads are limited to a maximum size to prevent denial-of-service (DoS) attacks that attempt to overwhelm the server with large or malformed requests.

7. MongoDB Injection Sanitization

The system automatically removes dangerous MongoDB operators from user input to prevent NoSQL injection attacks. This ensures that database queries cannot be manipulated by injecting special characters or malicious query syntax.

8. Rate Limiting

Rate limiting restricts each IP address to a certain number of requests within a specific time window. This prevents brute-force login attempts, API abuse, and distributed denial-of-service (DDoS) attacks.

9. Cookie Parsing and Security

Cookies are parsed and managed securely to handle authentication tokens and session data without exposing sensitive information to unauthorized parties.

10. Request Logging

All incoming requests are logged with details such as timestamps, IP addresses, and status codes. This creates an audit trail for monitoring and identifying suspicious activity or potential security incidents.

11. Global Error Handling

A centralized error handler ensures that no sensitive system information is exposed to the client in error messages. This prevents attackers from gaining insights into the internal workings of the application.

12. Custom CORS Headers

Custom response headers define which HTTP methods, origins, and headers are allowed. This adds another layer of control over how external clients interact with the API.