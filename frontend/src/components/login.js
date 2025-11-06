import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api"; // connecting front and back with api

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ 
        username: "", 
        accountNumber: "", 
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

        if (!formData.username || !formData.accountNumber || !formData.password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting login with:", formData);
            const response = await loginUser(formData);
            console.log("Login response:", response);
            
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            alert("Login successful!");
            navigate("/dashboard");//dashboard for payments created in app.js
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
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
                        placeholder="Username" 
                        value={formData.username}
                        onChange={handleChange}
                        style={{ width: '100%', margin: '5px 0', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                        disabled={loading}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        name="accountNumber" 
                        placeholder="Account Number" 
                        value={formData.accountNumber}
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
                        placeholder="Password" 
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
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default Login;