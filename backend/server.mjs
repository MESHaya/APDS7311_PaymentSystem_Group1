import https from "https";
import fs from "fs";
import express from "express"
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import morgan from "morgan";
import dotenv from "dotenv";
import users from "./routes/user.mjs"; // your routes

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// Load SSL certificate and key
const options = {
  key: fs.readFileSync("keys/privatekey.pem"),
  cert: fs.readFileSync("keys/certificate.pem"),
};

//  Security middlewares
app.use(helmet()); // adds secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*", // restrict this in production
  credentials: true,
}));
app.use(xssClean()); // cleans user input to prevent XSS
app.use(express.json({ limit: "10kb" })); // limits payload size
app.use(express.urlencoded({ extended: true }));

//Logging requests
app.use(morgan("combined"));

// Rate limiting (prevents brute-force/DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per 15min per IP
  message: { message: "Too many requests, please try again later." },
});
app.use(apiLimiter);

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

// Use routes
app.use("/user", users);

// Simple error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

//  Create HTTPS server
const server = https.createServer(options, app);
server.listen(PORT, () => console.log(`Secure server running on port ${PORT}`));
