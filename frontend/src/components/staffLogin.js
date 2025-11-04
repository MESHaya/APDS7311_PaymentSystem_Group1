import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginStaff } from "../services/mockapi";

function StaffLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ 
        username: "", 
        password: "" 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.username || !formData.password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        try {
            console.log("Staff login attempt:", formData);
            const response = await loginStaff(formData);
            console.log("Staff login response:", response);
            
            localStorage.setItem("staffToken", response.token);
            localStorage.setItem("staff", JSON.stringify(response.staff));
            alert("Staff login successful!");
            navigate("/staff/dashboard");
        } catch (err) {
            console.error("Staff login error:", err);
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Staff Portal</h2>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Login to manage users and payments</p>
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
                    <input 
                        name="username" 
                        placeholder="Staff Username" 
                        value={formData.username}
                        onChange={handleChange}
                        style={{ width: '100%', margin: '5px 0', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                        disabled={loading}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Staff Password" 
                        value={formData.password}
                        onChange={handleChange}
                        style={{ width: '100%', margin: '5px 0', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
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
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? "Logging in..." : "Staff Login"}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                    onClick={() => navigate('/')}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#007bff', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    ← Back to User Login
                </button>
            </p>
        </div>
    );
}

export default StaffLogin;