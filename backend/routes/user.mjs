import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

// Define whitelist RegEx Patterns for user-related fields
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


// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // Check all fields are present
    if (!fullName || !idNumber || !accountNumber || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate inputs against regex patterns
    if (
      !regexPatterns.fullName.test(fullName) ||
      !regexPatterns.idNumber.test(idNumber) ||
      !regexPatterns.accountNumber.test(accountNumber) ||
      !regexPatterns.username.test(username) ||
      !regexPatterns.password.test(password)
    ) {
      return res.status(400).json({ message: "Invalid input format." });
    }

    // Hashing & saving
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
    };

    const result = await collection.insertOne(newCustomer);

    res.status(201).json({
      message: "Customer registered successfully.",
      user: {
        id: result.insertedId,
        username,
        accountNumber,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed." });
  }
});


// Login
router.post("/login", bruteforce.prevent, async (req, res) => {
  try {
    const { username, accountNumber, password } = req.body;

    if (!username || !accountNumber || !password) {
      return res
        .status(400)
        .json({ message: "Username, account number and password are required." });
    }

    // Validate inputs against regex patterns
    if (
      !regexPatterns.username.test(username) ||
      !regexPatterns.accountNumber.test(accountNumber) ||
      !regexPatterns.password.test(password)
    ) {
      return res.status(400).json({ message: "Invalid input format." });
    }

    const collection = await db.collection("users");
    const user = await collection.findOne({ username, accountNumber });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      accountNumber: user.accountNumber,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      message: "Authentication successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        accountNumber: user.accountNumber,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
});

export default router;