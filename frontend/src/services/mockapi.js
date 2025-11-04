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

// Initialize staff data directly
const initializeStaffData = () => {
    const storedStaff = localStorage.getItem('mockStaff');
    if (!storedStaff) {
        const staffMembers = [
            {
                username: 'admin',
                password: 'Admin123!',
                role: 'admin',
                name: 'System Administrator',
                fullName: 'Admin User',
                permissions: ['view_users', 'view_payments', 'manage_users', 'manage_payments']
            },
            {
                username: 'staff1',
                password: 'Staff123!',
                role: 'staff',
                name: 'Support Staff',
                fullName: 'Staff User',
                permissions: ['view_users', 'view_payments']
            },
            {
                username: 'manager',
                password: 'Manager123!',
                role: 'manager',
                name: 'Operations Manager',
                fullName: 'Manager User',
                permissions: ['view_users', 'view_payments', 'manage_payments']
            }
        ];
        localStorage.setItem('mockStaff', JSON.stringify(staffMembers));
        return staffMembers;
    }
    return JSON.parse(storedStaff);
};

// Get staff members
const getStaffMembers = () => {
    return initializeStaffData();
};


/*
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
*/

/**
 * Staff login
 */
export const loginStaff = async (credentials) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const staffMembers = getStaffMembers(); // Get staff data
                
                const staffMember = staffMembers.find(s => 
                    s.username === credentials.username && 
                    s.password === credentials.password
                );

                if (staffMember) {
                    resolve({
                        message: "Staff login successful.",
                        token: "staff-jwt-token-" + Date.now(),
                        staff: {
                            username: staffMember.username,
                            role: staffMember.role,
                            name: staffMember.name,
                            fullName: staffMember.fullName,
                            permissions: staffMember.permissions
                        },
                    });
                } else {
                    reject(new Error("Invalid staff credentials"));
                }
            } catch (error) {
                reject(new Error("Staff login failed: " + error.message));
            }
        }, 1000);
    });
};
/**
 * Staff: Register new user
 */
export const registerUserByStaff = async (userData) => {
    try {
        const token = localStorage.getItem("staffToken");
        
        if (!token) {
            throw new Error("No staff authentication token found.");
        }

        const response = await fetch(`${API_BASE_URL}/staff/register-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("staffToken");
                localStorage.removeItem("staff");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || "User registration failed");
        }

        return data;
    } catch (error) {
        console.error("Register user by staff error:", error);
        throw error;
    }
};

/**
 * Staff: Get all users
 */
export const getAllUsers = async () => {
    try {
        const token = localStorage.getItem("staffToken");
        
        if (!token) {
            throw new Error("No staff authentication token found.");
        }

        const response = await fetch(`${API_BASE_URL}/staff/users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("staffToken");
                localStorage.removeItem("staff");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || "Failed to fetch users");
        }

        return data;
    } catch (error) {
        console.error("Get all users error:", error);
        throw error;
    }
};

/**
 * Staff: Get all payments
 */
export const getAllPayments = async () => {
    try {
        const token = localStorage.getItem("staffToken");
        
        if (!token) {
            throw new Error("No staff authentication token found.");
        }

        const response = await fetch(`${API_BASE_URL}/staff/payments`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("staffToken");
                localStorage.removeItem("staff");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || "Failed to fetch payments");
        }

        return data;
    } catch (error) {
        console.error("Get all payments error:", error);
        throw error;
    }
};

/**
 * Staff: Get dashboard statistics
 */
export const getDashboardStats = async () => {
    try {
        const token = localStorage.getItem("staffToken");
        
        if (!token) {
            throw new Error("No staff authentication token found.");
        }

        const response = await fetch(`${API_BASE_URL}/staff/dashboard-stats`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("staffToken");
                localStorage.removeItem("staff");
                throw new Error("Session expired. Please login again.");
            }
            throw new Error(data.message || "Failed to fetch dashboard stats");
        }

        return data;
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        throw error;
    }
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