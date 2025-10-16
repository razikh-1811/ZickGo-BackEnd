// api/index.js
import express from "express";
import cors from "cors";
import 'dotenv/config';          // Load .env variables
import { connectDB } from "../config/db.js";
import foodRouter from "../routes/foodRoute.js";
import userRouter from "../routes/UserRoute.js";
import cartRouter from "../routes/cartRoute.js";
import orderRouter from "../routes/orderRoute.js";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",
    "https://zikh-go-admin.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "../uploads")));

// ✅ MongoDB connection for serverless
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
    console.error("Stripe connection failed:", error.message);
    res.json({ success: false, message: "Stripe not connected", error: error.message });
  }
});

// Wrap all routes with DB connection check
app.use("/api/food", async (req, res, next) => { await connectDBOnce(); next(); }, foodRouter);
app.use("/api/user", async (req, res, next) => { await connectDBOnce(); next(); }, userRouter);
app.use("/api/cart", async (req, res, next) => { await connectDBOnce(); next(); }, cartRouter);
app.use("/api/order", async (req, res, next) => { await connectDBOnce(); next(); }, orderRouter);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully 🚀" });
});

// ❌ Remove app.listen() for Vercel
// app.listen(port, ...)

// Export for Vercel
export const handler = serverless(app);
export default handler;






