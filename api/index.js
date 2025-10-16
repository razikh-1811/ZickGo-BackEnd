import express from "express";
import cors from "cors";
import 'dotenv/config';
import mongoose from "mongoose";
import serverless from "serverless-http";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/UserRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// ------------------------------
// Setup Express
// ------------------------------
const app = express();

// ✅ Fix CORS for Vercel Frontends
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",
    "https://zikh-go-admin.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// ------------------------------
// MongoDB Connection
// ------------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------------------
// Stripe Setup
// ------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ------------------------------
// File Serving (uploads)
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "uploads")));

// ------------------------------
// API Routes
// ------------------------------
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ------------------------------
// Test Routes
// ------------------------------
app.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ success: true, message: "Stripe connected successfully!", balance });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ success: false, message: "Stripe not connected", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Zick-Go Backend running on Vercel successfully!");
});

// ------------------------------
// Export for Vercel
// ------------------------------
export const handler = serverless(app);
export default handler;










