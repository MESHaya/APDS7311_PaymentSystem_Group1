import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../middleware/auth.js";

const regexPatterns = {
  fullName: /^[A-Za-z ]{1,50}$/,
  idNumber: /^[0-9]{6,20}$/,
  accountNumber: /^[0-9]{6,20}$/,
  username: /^[A-Za-z0-9_]{3,20}$/,
  password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,20}$/
};

const router = express.Router();

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "this_secret_should_be_longer_and_kept_safe";
const JWT_EXPIRES_IN = "1h";

// Middleware to check if user is staff
const requireStaff = (req, res, next) => {
  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied. Staff only." });
  }
  next();
};

// Staff Login - FIXED: Only one login route, checks approval status
router.post("/login", bruteforce.prevent, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    if (
      !regexPatterns.username.test(username) ||
      !regexPatterns.password.test(password)
    ) {
      return res.status(400).json({ message: "Invalid input format." });
    }

    const collection = await db.collection("staff");
    const staff = await collection.findOne({ username });

    if (!staff) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    // Check if staff is approved
    if (staff.status !== "approved") {
      return res.status(403).json({ 
        message: staff.status === "pending" 
          ? "Your account is pending approval. Please contact an existing staff member." 
          : "Your account has been rejected. Please contact administration."
      });
    }

    const passwordMatch = await bcrypt.compare(password, staff.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    const payload = {
      sub: staff._id.toString(),
      username: staff.username,
      role: "staff",
      fullName: staff.fullName
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      message: "Authentication successful.",
      token,
      staff: {
        id: staff._id,
        username: staff.username,
        fullName: staff.fullName,
        role: "staff"
      },
    });
  } catch (err) {
    console.error("Staff login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
});

// Staff: Register new staff (public - but needs approval)
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, password, email } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (
      !regexPatterns.fullName.test(fullName) ||
      !regexPatterns.username.test(username) ||
      !regexPatterns.password.test(password)
    ) {
      return res.status(400).json({ message: "Invalid input format." });
    }

    const collection = await db.collection("staff");

    // Check if username already exists
    const existing = await collection.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newStaff = {
      username,
      password: hashedPassword,
      fullName,
      email: email || null,
      role: "staff",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newStaff);

    res.status(201).json({
      message: "Registration submitted. Awaiting approval from existing staff.",
      staffId: result.insertedId
    });
  } catch (err) {
    console.error("Staff registration error:", err);
    res.status(500).json({ message: "Registration failed." });
  }
});

// Create first admin user (one-time setup endpoint)
router.post("/create-admin", async (req, res) => {
  try {
    const collection = await db.collection("staff");
    
    // Check if any staff exists
    const existingStaff = await collection.findOne({});
    if (existingStaff) {
      return res.status(400).json({ message: "Admin user already exists." });
    }

    const hashedPassword = await bcrypt.hash("Admin@123", SALT_ROUNDS);
    
    const adminUser = {
      username: "admin",
      password: hashedPassword,
      fullName: "System Administrator",
      email: null,
      role: "admin",
      status: "approved",
      createdAt: new Date(),
    };

    await collection.insertOne(adminUser);
    
    res.status(201).json({ 
      message: "Admin user created successfully.",
      credentials: {
        username: "admin",
        password: "Admin@123"
      }
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Failed to create admin user." });
  }
});

// Staff: Get all pending staff registrations
router.get("/pending-staff", authenticateToken, requireStaff, async (req, res) => {
  try {
    const collection = await db.collection("staff");
    const pendingStaff = await collection
      .find({ status: "pending" }, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      message: "Pending staff retrieved successfully.",
      count: pendingStaff.length,
      pendingStaff
    });
  } catch (err) {
    console.error("Get pending staff error:", err);
    res.status(500).json({ message: "Failed to retrieve pending staff." });
  }
});

// Staff: Approve staff registration
router.patch("/approve-staff/:id", authenticateToken, requireStaff, async (req, res) => {
  try {
    const collection = await db.collection("staff");
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), status: "pending" },
      { 
        $set: { 
          status: "approved",
          approvedAt: new Date(),
          approvedBy: new ObjectId(req.user.sub)
        } 
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Pending staff not found" });
    }

    res.json({ 
      message: "Staff approved successfully", 
      staff: {
        id: result._id,
        username: result.username,
        fullName: result.fullName,
        status: result.status
      }
    });
  } catch (err) {
    console.error("Error approving staff:", err);
    res.status(500).json({ message: "Error approving staff" });
  }
});

// Staff: Reject staff registration
router.patch("/reject-staff/:id", authenticateToken, requireStaff, async (req, res) => {
  try {
    const collection = await db.collection("staff");
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), status: "pending" },
      { 
        $set: { 
          status: "rejected",
          rejectedAt: new Date(),
          rejectedBy: new ObjectId(req.user.sub)
        } 
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Pending staff not found" });
    }

    res.json({ 
      message: "Staff registration rejected", 
      staff: {
        id: result._id,
        username: result.username,
        fullName: result.fullName,
        status: result.status
      }
    });
  } catch (err) {
    console.error("Error rejecting staff:", err);
    res.status(500).json({ message: "Error rejecting staff" });
  }
});

// Staff: Register new user
router.post("/register-user", authenticateToken, requireStaff, async (req, res) => {
  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    if (!fullName || !idNumber || !accountNumber || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (
      !regexPatterns.fullName.test(fullName) ||
      !regexPatterns.idNumber.test(idNumber) ||
      !regexPatterns.accountNumber.test(accountNumber) ||
      !regexPatterns.username.test(username) ||
      !regexPatterns.password.test(password)
    ) {
      return res.status(400).json({ message: "Invalid input format." });
    }

    const collection = await db.collection("users");

    const existing = await collection.findOne({
      $or: [{ username }, { accountNumber }],
    });
    if (existing) {
      return res.status(409).json({ message: "Username or account number already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newCustomer = {
      fullName,
      idNumber,
      accountNumber,
      username,
      password: hashedPassword,
      createdAt: new Date(),
      createdBy: new ObjectId(req.user.sub),
    };

    const result = await collection.insertOne(newCustomer);

    res.status(201).json({
      message: "User registered successfully by staff.",
      user: {
        id: result.insertedId,
        username,
        accountNumber,
        fullName
      },
    });
  } catch (err) {
    console.error("Staff register user error:", err);
    res.status(500).json({ message: "User registration failed." });
  }
});

// Staff: Get all users
router.get("/users", authenticateToken, requireStaff, async (req, res) => {
  try {
    const collection = await db.collection("users");
    const users = await collection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      message: "Users retrieved successfully.",
      count: users.length,
      users
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
});

// Staff: Get all payments
router.get("/payments", authenticateToken, requireStaff, async (req, res) => {
  try {
    const paymentsCollection = await db.collection("payments");

    const payments = await paymentsCollection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            amount: 1,
            currency: 1,
            provider: 1,
            status: 1,
            createdAt: 1,
            "userDetails.fullName": 1,
            "userDetails.username": 1,
            "userDetails.accountNumber": 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    res.status(200).json({
      message: "Payments retrieved successfully.",
      count: payments.length,
      payments
    });
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ message: "Failed to retrieve payments." });
  }
});

// Staff: Get dashboard statistics
router.get("/dashboard-stats", authenticateToken, requireStaff, async (req, res) => {
  try {
    const usersCollection = await db.collection("users");
    const paymentsCollection = await db.collection("payments");
    const staffCollection = await db.collection("staff");

    const totalUsers = await usersCollection.countDocuments();
    const totalPayments = await paymentsCollection.countDocuments();
    const pendingPayments = await paymentsCollection.countDocuments({ status: "pending" });
    const pendingStaff = await staffCollection.countDocuments({ status: "pending" });

    const paymentStats = await paymentsCollection
      .aggregate([
        {
          $group: {
            _id: "$currency",
            totalAmount: { $sum: { $toDouble: "$amount" } }
          }
        }
      ])
      .toArray();

    const totalAmountByCurrency = {};
    paymentStats.forEach(stat => {
      totalAmountByCurrency[stat._id] = stat.totalAmount.toFixed(2);
    });

    res.status(200).json({
      message: "Dashboard stats retrieved successfully.",
      stats: {
        totalUsers,
        totalPayments,
        pendingPayments,
        pendingStaff,
        totalAmountByCurrency
      }
    });
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    res.status(500).json({ message: "Failed to retrieve dashboard stats." });
  }
});

export default router;