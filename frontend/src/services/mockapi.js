const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Simple in-memory mock database
let users = JSON.parse(localStorage.getItem('mockUsers')) || [];
let payments = JSON.parse(localStorage.getItem('mockPayments')) || [];

const saveUsers = () => {
    localStorage.setItem('mockUsers', JSON.stringify(users));
};
const savePayments = () => {
    localStorage.setItem('mockPayments', JSON.stringify(payments));
};

export const registerUser = async (userData) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check if username already exists
            const existingUser = users.find(user => user.username === userData.username);
            if (existingUser) {
                reject(new Error("Username already exists"));
                return;
            }

            // Check if account number already exists
            const existingAccount = users.find(user => user.accountNumber === userData.accountNumber);
            if (existingAccount) {
                reject(new Error("Account number already exists"));
                return;
            }

            const newUser = { 
                ...userData, 
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            saveUsers();
            
            console.log("Current users:", users); 
            
            resolve({ 
                success: true,
                message: "User registered successfully", 
                user: { ...newUser, password: undefined } // Don't return password
            });
        }, 1000);
    });
};

export const loginUser = async (credentials) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => 
                u.username === credentials.username && 
                u.accountNumber === credentials.accountNumber &&
                u.password === credentials.password
            );

            if (user) {
                resolve({
                    success: true,
                    token: "mock-jwt-token-" + Date.now(),
                    user: {
                        id: user.id,
                        username: user.username,
                        accountNumber: user.accountNumber,
                        fullName: user.fullName,
                        idNumber: user.idNumber
                    }
                });
            } else {
                reject(new Error("Invalid username, account number, or password"));
            }
        }, 1000);
    });
};

/*payment*/
// Create payment in memory
export const createPayment = async (paymentData) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const token = localStorage.getItem("token");
            if (!token) return reject(new Error("Not logged in"));

            const newPayment = { ...paymentData, id: Date.now().toString(), createdAt: new Date().toISOString() };
            payments.push(newPayment);
            savePayments();
            resolve(newPayment);
        }, 500);
    });
};

// Get payment history from memory
export const getPaymentHistory = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const token = localStorage.getItem("token");
            if (!token) return reject(new Error("Not logged in"));
            resolve(payments);
        }, 500);
    });
};