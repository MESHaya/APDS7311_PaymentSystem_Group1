import https from "https";
import http from "http";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import users from "./routes/user.mjs";
import payments from "./routes/payment.mjs";
import staff from "./routes/staff.mjs";

dotenv.config();

const HTTPS_PORT = process.env.HTTPS_PORT || 3000;
const HTTP_PORT = process.env.HTTP_PORT || 8080;

const app = express();

// Load SSL certificate and key
const options = {
  key: fs.readFileSync("keys/privatekey.pem"),
  cert: fs.readFileSync("keys/certificate.pem"),
};

// ✅ Security middlewares
app.use(helmet()); // Adds secure HTTP headers
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*", // Restrict this in production
    credentials: true,
  })
);
app.use(xssClean()); // Cleans user input to prevent XSS
app.use(express.json({ limit: "10kb" })); // Limits payload size
app.use(express.urlencoded({ extended: true }));

// ✅ Logging requests
app.use(morgan("combined"));

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Sanitize MongoDB inputs
app.use(mongoSanitize());

// ✅ Rate limiting (prevents brute-force/DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per 15min per IP
  message: { message: "Too many requests, please try again later." },
});
app.use(apiLimiter);

// ✅ CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

// ✅ Use routes
app.use("/user", users);      // Routes: /user/signup, /user/login
app.use("/payment", payments); // Routes: /payment/payments
app.use("/staff", staff);      // Routes: /staff/

// ✅ Simple error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ✅ Create HTTPS server
const httpsServer = https.createServer(options, app);
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`✅ Secure HTTPS server running on https://localhost:${HTTPS_PORT}`);
});

// ✅ Create HTTP server to warn users (optional redirect alternative below)
const httpServer = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Insecure connection detected. Please use HTTPS.",
      instructions: `Use https://localhost:${HTTPS_PORT}${req.url}`,
    })
  );
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`🚫 Plain HTTP catcher listening on http://localhost:${HTTP_PORT}`);
  console.log(`→ HTTP requests will receive a JSON error advising HTTPS.`);
});
