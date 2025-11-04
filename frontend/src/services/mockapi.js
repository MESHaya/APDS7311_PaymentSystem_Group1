const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Simple in-memory mock database
let users = JSON.parse(localStorage.getItem('mockUsers')) || [];

const saveUsers = () => {
    localStorage.setItem('mockUsers', JSON.stringify(users));
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
export const createPayment = async (paymentData) => {
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            throw new Error("No authentication token found. Please login.");
        }

        const response = await fetch(`${API_BASE_URL}/payment/payments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // JWT token for authentication
            },
            body: JSON.stringify(paymentData),
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle expired token
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || "Payment creation failed");
        }

        return data;
    } catch (error) {
        console.error("Payment API error:", error);
        throw error;
    }
};

/*history payments*/
export const getPaymentHistory = async () => {
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            throw new Error("No authentication token found. Please login.");
        }

        const response = await fetch(`${API_BASE_URL}/payment/payments`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || "Failed to fetch payment history");
        }

        return data;
    } catch (error) {
        console.error("Get payment history error:", error);
        throw error;
    }
};