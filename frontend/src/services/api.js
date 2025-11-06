// Base URL for your backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// ==================== USER APIs ====================

/**
 * Register a new user (DISABLED - will return error from backend)
 */
export const registerUser = async (userData) => {
  return fetchAPI("/user/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  return fetchAPI("/user/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// ==================== PAYMENT APIs ====================

/**
 * Create a payment (requires user token)
 */
export const createPayment = async (paymentData) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  return fetchAPI("/payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
};

export const approvePayment = async (paymentId) => {
  const token = localStorage.getItem("staffToken");
  return fetchAPI(`/payment/approve/${paymentId}`, {  // Removed extra "payment"
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectPayment = async (paymentId) => {
  const token = localStorage.getItem("staffToken");
  return fetchAPI(`/payment/reject/${paymentId}`, {  // Removed extra "payment"
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
};
/**
 * Get user's payment history (if you implement this endpoint later)
 */
export const getPaymentHistory = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  return fetchAPI("/payment", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==================== STAFF APIs ====================

/**
 * Staff login
 */
export const loginStaff = async (credentials) => {
  return fetchAPI("/staff/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

/**
 * Staff: Register new user
 */
export const registerUserByStaff = async (userData) => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI("/staff/register-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
};

/**
 * Staff: Get all users
 */
export const getAllUsers = async () => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI("/staff/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Staff: Get all payments
 */
export const getAllPayments = async () => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI("/staff/payments", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Staff: Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI("/staff/dashboard-stats", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};