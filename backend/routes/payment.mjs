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

// Create payment
router.post("/payments", authenticateToken, async (req, res) => {
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

export default router;