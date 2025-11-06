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

export const registerUser = async (userData) => {
  return fetchAPI("/user/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  return fetchAPI("/user/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// ==================== PAYMENT APIs ====================

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
  return fetchAPI(`/payment/approve/${paymentId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectPayment = async (paymentId) => {
  const token = localStorage.getItem("staffToken");
  return fetchAPI(`/payment/reject/${paymentId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
};

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

export const loginStaff = async (credentials) => {
  return fetchAPI("/staff/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const registerStaff = async (staffData) => {
  return fetchAPI("/staff/register", {
    method: "POST",
    body: JSON.stringify(staffData),
  });
};

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

// ==================== STAFF APPROVAL APIs ====================

export const getPendingStaff = async () => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI("/staff/pending-staff", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const approveStaff = async (staffId) => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI(`/staff/approve-staff/${staffId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const rejectStaff = async (staffId) => {
  const token = localStorage.getItem("staffToken");
  
  if (!token) {
    throw new Error("No staff authentication token found.");
  }

  return fetchAPI(`/staff/reject-staff/${staffId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};