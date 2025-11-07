import React from "react";
import { useNavigate } from "react-router-dom";

function Register(){
    const navigate = useNavigate();

    // REGISTRATION DISABLED - Show message instead
    return (
        <div style={{ 
            maxWidth: '500px', 
            margin: '50px auto', 
            padding: '40px', 
            border: '2px solid #dc3545', 
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>X</div>
            <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
                Registration Disabled
            </h2>
            <p style={{ 
                fontSize: '16px', 
                color: '#666', 
                marginBottom: '20px',
                lineHeight: '1.6'
            }}>
                User registration is currently disabled. Only staff members can create user accounts.
            </p>
            
            <div style={{ 
                padding: '20px', 
                backgroundColor: '#e7f3ff', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #b3d9ff'
            }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#004085' }}>
                    <strong>To get an account:</strong> Please contact a staff member who can register you through the Staff Portal.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => navigate("/")}
                    style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    ← Back to Login
                </button>
                
                <button 
                    onClick={() => navigate("/staff/login")}
                    style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Staff Login →
                </button>
            </div>
        </div>
    );
}

export default Register;