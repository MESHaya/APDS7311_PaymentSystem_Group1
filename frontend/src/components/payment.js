import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPayment, getPaymentHistory } from "../services/mockapi";

function Payment() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: "",
        currency: "USD",
        provider: "SWIFT"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]); // payment history
    const [historyLoading, setHistoryLoading] = useState(true);

    // Check login and load user
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (!token || !userData) {
            alert("Please login first");
            navigate("/");
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch (err) {
            console.error("Error parsing user data:", err);
            navigate("/");
        }
    }, [navigate]);

    // Fetch payment history after user is set
    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            setHistoryLoading(true);
            try {
                const data = await getPaymentHistory();
                setHistory(data || []); // fallback to empty array
            } catch (err) {
                console.error("Error fetching payment history:", err);
                setError("Failed to load payment history");
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.amount || !formData.currency || !formData.provider) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            setError("Please enter a valid amount");
            setLoading(false);
            return;
        }

        try {
            const response = await createPayment(formData);
            setSuccess("Payment created successfully!");
            setFormData({ amount: "", currency: "USD", provider: "SWIFT" });

            // Refresh history after creating a payment
            const updatedHistory = await getPaymentHistory();
            setHistory(updatedHistory || []);
        } catch (err) {
            console.error("Payment error:", err);
            setError(err.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
            {/* User Info */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Welcome, {user.fullName}</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Account: {user.accountNumber}</p>
                </div>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
            </div>

            {/* Payment History */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Payment History</h2>
                {historyLoading ? (
                    <p>Loading payment history...</p>
                ) : history.length === 0 ? (
                    <p>No payments yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Date</th>
                                <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Amount</th>
                                <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Currency</th>
                                <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Provider</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((payment, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '8px' }}>{payment.createdAt || new Date().toLocaleString()}</td>
                                    <td style={{ padding: '8px' }}>{payment.amount}</td>
                                    <td style={{ padding: '8px' }}>{payment.currency}</td>
                                    <td style={{ padding: '8px' }}>{payment.provider}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Payment Form */}
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Payment</h2>
                {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid red', borderRadius: '4px' }}>{error}</div>}
                {success && <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', border: '1px solid green', borderRadius: '4px' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount</label>
                        <input name="amount" type="number" step="0.01" placeholder="Enter amount" value={formData.amount} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} required disabled={loading} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Currency</label>
                        <select name="currency" value={formData.currency} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} required disabled={loading}>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Provider</label>
                        <select name="provider" value={formData.provider} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} required disabled={loading}>
                            <option value="SWIFT">SWIFT</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Stripe">Stripe</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} style={{ width: '100%', margin: '10px 0', padding: '12px', backgroundColor: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                        {loading ? "Processing..." : "Create Payment"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Payment;
