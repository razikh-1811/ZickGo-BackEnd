// api/index.js
import express from "express";
import 'dotenv/config'; // load env variables
import serverless from "serverless-http";
import { connectDB } from "../config/db.js";
import foodRouter from "../routes/foodRoute.js";
import userRouter from "../routes/UserRoute.js";
import cartRouter from "../routes/cartRoute.js";
import orderRouter from "../routes/orderRoute.js";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Middleware
app.use(express.json());

// Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "../uploads")));

// ✅ MongoDB connection (safe for serverless)
let isConnected = false;
async function connectDBOnce() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("MongoDB connected ✅");
  }
}

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ success: true, message: "Stripe connected successfully!", balance });
  } catch (error) {
    res.json({ success: false, message: "Stripe not connected", error: error.message });
  }
});

// Wrap all API routes with DB connection
app.use("/api/food", async (req, res, next) => { await connectDBOnce(); next(); }, foodRouter);
app.use("/api/user", async (req, res, next) => { await connectDBOnce(); next(); }, userRouter);
app.use("/api/cart", async (req, res, next) => { await connectDBOnce(); next(); }, cartRouter);
app.use("/api/order", async (req, res, next) => { await connectDBOnce(); next(); }, orderRouter);

// Default route for testing
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully 🚀" });
});

// Export for Vercel
export const handler = serverless(app);
export default handler;








