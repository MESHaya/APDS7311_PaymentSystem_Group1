import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/mockapi"; // Temp

function Register(){
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        idNumber: "",
        accountNumber: "",
        username: "",
        password: "",
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

        //validation
        if (!formData.fullName || !formData.idNumber || !formData.accountNumber || !formData.username || !formData.password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting registration with:", formData);
            const response = await registerUser(formData);
            console.log("Registration response:", response);
            
            alert("Signup successful! Please login with your credentials.");
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
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
                        name="fullName" 
                        placeholder="Full Name" 
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{ width: '100%', margin: '5px 0', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                        disabled={loading}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        name="idNumber" 
                        placeholder="ID Number" 
                        value={formData.idNumber}
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
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Password (min. 6 characters)" 
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
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account?{" "}
                <button 
                    onClick={() => navigate("/")}
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

export default Register;