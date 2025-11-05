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

// ✅ Security middlewares (BEFORE routes!)
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3001","http://localhost:3003","http://localhost:3004", "https://localhost:3003"], // Changed to 3003 to match your frontend
    credentials: true,
  })
);
app.use(xssClean());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(cookieParser());
app.use(mongoSanitize());

// ✅ Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests, please try again later." },
});
app.use(apiLimiter);

// ✅ Use routes
app.use("/user", users);
app.use("/payment", payments);
app.use("/staff", staff);

// ✅ Simple error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// FOR DEVELOPMENT: Use HTTP only
app.listen(3000, () => {
  console.log("✅ Dev server running on http://localhost:3000");
});

/* COMMENT OUT HTTPS FOR NOW - USE IN PRODUCTION
// Load SSL certificate and key
const options = {
  key: fs.readFileSync("./keys/privatekey.pem"),
  cert: fs.readFileSync("./keys/certificate.pem"),
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`✅ Secure HTTPS server running on https://localhost:${HTTPS_PORT}`);
});

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
});
*/