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