import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUserByStaff, getAllUsers, getAllPayments, getDashboardStats } from "../services/mockapi";

function StaffDashboard() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [activeTab, setActiveTab] = useState("stats"); // stats, users, payments, register
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Data states
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        fullName: "",
        idNumber: "",
        accountNumber: "",
        username: "",
        password: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("staffToken");
        const staffData = localStorage.getItem("staff");
        
        if (!token || !staffData) {
            alert("Please login as staff first");
            navigate("/staff/login");
            return;
        }

        try {
            setStaff(JSON.parse(staffData));
            loadDashboardStats();
        } catch (err) {
            console.error("Error parsing staff data:", err);
            navigate("/staff/login");
        }
    }, [navigate]);

    const loadDashboardStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data.stats);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data.users);
        } catch (err) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await getAllPayments();
            setPayments(data.payments);
        } catch (err) {
            setError(err.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError("");
        setSuccess("");
        
        if (tab === "users") loadUsers();
        if (tab === "payments") loadPayments();
    };

    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await registerUserByStaff(registerForm);
            setSuccess(`User ${response.user.username} registered successfully!`);
            setRegisterForm({
                fullName: "",
                idNumber: "",
                accountNumber: "",
                username: "",
                password: "",
            });
            loadDashboardStats(); // Refresh stats
        } catch (err) {
            setError(err.message || "Failed to register user");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staff");
        navigate("/staff/login");
    };

    if (!staff) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ 
                backgroundColor: '#007bff', 
                color: 'white',
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0' }}>Staff Portal</h2>
                    <p style={{ margin: '0', fontSize: '14px' }}>Welcome, {staff.fullName}</p>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: 'white',
                        color: '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px',
                borderBottom: '2px solid #ddd'
            }}>
                {["stats", "users", "payments", "register"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
                            color: activeTab === tab ? 'white' : '#007bff',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #007bff' : 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: activeTab === tab ? 'bold' : 'normal'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div style={{ 
                    color: 'red', 
                    marginBottom: '15px', 
                    padding: '10px', 
                    backgroundColor: '#ffe6e6', 
                    border: '1px solid red',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ 
                    color: 'green', 
                    marginBottom: '15px', 
                    padding: '10px', 
                    backgroundColor: '#e6ffe6', 
                    border: '1px solid green',
                    borderRadius: '4px'
                }}>
                    {success}
                </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{stats.totalUsers}</h3>
                        <p style={{ margin: '0', color: '#666' }}>Total Users</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>{stats.totalPayments}</h3>
                        <p style={{ margin: '0', color: '#666' }}>Total Payments</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>{stats.pendingPayments}</h3>
                        <p style={{ margin: '0', color: '#666' }}>Pending Payments</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>${stats.totalAmount}</h3>
                        <p style={{ margin: '0', color: '#666' }}>Total Amount</p>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3>All Users ({users.length})</h3>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : users.length === 0 ? (
                        <p>No users found</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Full Name</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Username</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Account Number</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID Number</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user._id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.fullName}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.username}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.accountNumber}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.idNumber}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3>All Payments ({payments.length})</h3>
                    {loading ? (
                        <p>Loading payments...</p>
                    ) : payments.length === 0 ? (
                        <p>No payments found</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>User</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Amount</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Currency</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Provider</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <tr key={payment._id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                                {payment.userDetails?.fullName || 'N/A'}<br/>
                                                <small style={{ color: '#666' }}>{payment.userDetails?.username}</small>
                                            </td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{payment.amount}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{payment.currency}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{payment.provider}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    backgroundColor: payment.status === 'pending' ? '#ffc107' : '#28a745',
                                                    color: 'white',
                                                    fontSize: '12px'
                                                }}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Register User Tab */}
            {activeTab === "register" && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', maxWidth: '500px', margin: '0 auto' }}>
                    <h3>Register New User</h3>
                    <form onSubmit={handleRegisterSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                            <input 
                                name="fullName" 
                                placeholder="Enter full name" 
                                value={registerForm.fullName}
                                onChange={handleRegisterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ID Number</label>
                            <input 
                                name="idNumber" 
                                placeholder="Enter ID number" 
                                value={registerForm.idNumber}
                                onChange={handleRegisterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Number</label>
                            <input 
                                name="accountNumber" 
                                placeholder="Enter account number" 
                                value={registerForm.accountNumber}
                                onChange={handleRegisterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
                            <input 
                                name="username" 
                                placeholder="Enter username" 
                                value={registerForm.username}
                                onChange={handleRegisterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                            <input 
                                name="password" 
                                type="password"
                                placeholder="Min 8 chars, uppercase, lowercase, number, special char" 
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                backgroundColor: loading ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? "Registering..." : "Register User"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default StaffDashboard;