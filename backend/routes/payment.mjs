import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../middleware/auth.js";

// Define whitelist RegEx Patterns for payment-related fields
const regexPatterns = {
  amount: /^[0-9]+(\.[0-9]{1,2})?$/,
  currency: /^[A-Z]{3}$/
};

const router = express.Router();

// Middleware to verify staff/admin token
const verifyStaffToken = async (req, res, next) => {
  try {
    // First authenticate the token
    await authenticateToken(req, res, () => {});
    
    // Then check if user is staff/admin
    const usersCollection = await db.collection("staff");
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.sub) });
    
    if (!user || user.role !== "staff") {
      return res.status(403).json({ message: "Access denied. Staff only." });
    }
    
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get all payments for the authenticated user
// Mounted at: /payment (base) + / = /payment
router.get("/", authenticateToken, async (req, res) => {
  try {
    const collection = await db.collection("payments");
    const payments = await collection
      .find({ userId: new ObjectId(req.user.sub) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payments: ", err);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
});

// Create payment
// Mounted at: /payment (base) + / = /payment
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { amount, currency, provider } = req.body;

    if (!amount || !currency || !provider) {
      return res.status(400).json({ message: "Amount, currency and provider are required." });
    }

    // Validate inputs against regex patterns
    if (
      !regexPatterns.amount.test(amount) ||
      !regexPatterns.currency.test(currency)
    ) {
      return res.status(400).json({ message: "Invalid amount or currency format." });
    }

    const validProviders = ["SWIFT", "PayPal", "Stripe"];
    if (!validProviders.includes(provider)) {
      return res
        .status(400)
        .json({ message: `Invalid provider. Choose one of: ${validProviders.join(", ")}` });
    }

    const collection = await db.collection("payments");
    const newPayment = {
      amount,
      currency,
      provider,
      status: "pending",
      createdAt: new Date(),
      userId: new ObjectId(req.user.sub),
    };

    const result = await collection.insertOne(newPayment);

    res.status(201).json({
      message: "Payment record created successfully.",
      payment: {
        id: result.insertedId,
        ...newPayment,
      },
    });
  } catch (err) {
    console.error("Payment error: ", err);
    res.status(500).json({ message: "Failed to create payment." });
  }
});

// Approve payment (Staff/Admin only)
// Mounted at: /payment (base) + /approve/:id = /payment/approve/:id
router.patch("/approve/:id", verifyStaffToken, async (req, res) => {
  try {
    const collection = await db.collection("payments");
    
    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
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
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment approved", payment: result });
  } catch (err) {
    console.error("Error approving payment:", err);
    res.status(500).json({ message: "Error approving payment" });
  }
});

// Reject payment (Staff/Admin only)
// Mounted at: /payment (base) + /reject/:id = /payment/reject/:id
router.patch("/reject/:id", verifyStaffToken, async (req, res) => {
  try {
    const collection = await db.collection("payments");
    
    // Validate ObjectId
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
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
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment rejected", payment: result });
  } catch (err) {
    console.error("Error rejecting payment:", err);
    res.status(500).json({ message: "Error rejecting payment" });
  }
});

export default router;