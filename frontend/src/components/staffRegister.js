import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerStaff } from "../services/api";

function StaffRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (!formData.fullName || !formData.username || !formData.password) {
            setError("Full name, username and password are required");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await registerStaff({
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            setSuccess(true);
        } catch (err) {
            console.error("Staff registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#e6ffe6' }}>
                <h2 style={{ textAlign: 'center', color: '#28a745' }}>✅ Registration Submitted!</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Your staff registration has been submitted for approval. 
                    You will be able to login once an existing staff member approves your account.
                </p>
                <button 
                    onClick={() => navigate("/staff/login")}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Staff Registration</h2>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                    Register to become a staff member
                </p>
            </div>
            
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
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Full Name
                    </label>
                    <input 
                        name="fullName" 
                        placeholder="Enter your full name" 
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Username
                    </label>
                    <input 
                        name="username" 
                        placeholder="Choose a username" 
                        value={formData.username}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                        disabled={loading}
                    />
                    <small style={{ color: '#666' }}>3-20 characters, letters, numbers, and underscore only</small>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Email (Optional)
                    </label>
                    <input 
                        name="email" 
                        type="email"
                        placeholder="your.email@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Password
                    </label>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Create a strong password" 
                        value={formData.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                        disabled={loading}
                    />
                    <small style={{ color: '#666' }}>
                        Min 8 chars: uppercase, lowercase, number, special char
                    </small>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Confirm Password
                    </label>
                    <input 
                        name="confirmPassword" 
                        type="password" 
                        placeholder="Re-enter your password" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
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
                        margin: '10px 0', 
                        padding: '12px', 
                        backgroundColor: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? "Submitting..." : "Register as Staff"}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account?{' '}
                <button 
                    onClick={() => navigate('/staff/login')}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#007bff', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Login here
                </button>
            </p>
        </div>
    );
}

export default StaffRegister;