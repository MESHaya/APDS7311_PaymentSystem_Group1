import { body, validationResult } from "express-validator";
import xss from "xss";                
import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

const router = express.Router();

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "this_secret_should_be_longer_and_kept_safe";
const JWT_EXPIRES_IN = "1h";

//JWT Middleware
function authenticateToken(req,res,next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.status(401).json({message: "Access token required."});

    jwt.verify(token, JWT_SECRET, (err, user)=>{
        if(err) return res.status(403).json({message:"Invaild or expired token"});
        req.user = user;
        next();
    });
}

//Sign up

router.post("/signup", async(req,res)=>{
    try{
        const { fullName, idNumber, accountNumber, username, password } = req.body;

        if(!fullName || !idNumber || !accountNumber || !username || !password){
            return res.status(400).json({message: "All fields are required."});
        }
        const collection = await db.collection("users");

        const existing = await collection.findOne({
            $or: [{username}, {accountNumber}],
        });
        if(existing){
            return res.status(409).json({message:"username or account number already exists."});
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
    }catch(err){
        console.error("signup error:", err);
        res.status(500).json({message: "Signup failed."});
    }
});

//login
router.post("/login",bruteforce.prevent, async (req,res)=>{
    try{
        const {username, accountNumber, password} = req.body;

        if(!username || !accountNumber || !password) {
            return res
            .status(400)
            .json({message: "Username, account number and password are required."});
        }

        const collection = await db.collection("users");
        const user = await collection.findOne({username, accountNumber});
        
        if(!user){
            return res.status(401).json({message: "Authentication failed."});
        }

        const passwordMatch = await bcrypt.compare(password,user.password);
        if (!passwordMatch){
            return res.status(401).json({message:"Authentication failed."});
        }

        const payload = {
            sub: user._id.toString(),
            username: user.username,
            accountNumber: user.accountNumber,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});

        res.status(200).json({
            message: "Authentication successful.",
            token,
            user:{
                id:user._id,
                username: user.username,
                accountNumber: user.accountNumber,
                fullName: user.fullName,
            },
        });
    } catch(err){
        console.error("Login error:", err);
        res.status(500).json({message:"Login failed."});
    }
});

//create payment
router.post("/payments",authenticateToken, async (req,res)=>{
    try{
        const {amount, currency, provider} = req.body;

        if(!amount || !currency || !provider) {
            return res.status(400).json({message: "Amount, currency and provider are required."});
        }

        const validProviders = ["SWIFT", "PayPal","Stripe"];
        if (!validProviders.includes(provider)) {
            return res
            .status(400)
            .json({message: `Invalid provider. Choose one of: ${validProviders.join(", ")}`});
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
    } catch (err){
        console.error("Payment error: ",err);
        res.status(500).json({message: "Failed to create payment."});
    }
});

export default router;