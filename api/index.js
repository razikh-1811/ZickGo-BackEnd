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

// --------------------------------
// Setup Express
// --------------------------------
const app = express();

// ✅ FIX 1 — Universal CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://zick-go-frontend.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// --------------------------------
// MongoDB Connection
// --------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------------------------------
// Stripe Setup
// --------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --------------------------------
// File Serving (uploads)
// --------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "uploads")));

// --------------------------------
// API Routes
// --------------------------------
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// --------------------------------
// Test Routes
// --------------------------------
app.get("/test", (req, res) => {
  res.json({ message: "✅ CORS test passed. Backend reachable!" });
});

app.get("/", (req, res) => {
  res.send("🚀 Zick-Go Backend running on Vercel successfully!");
});

// --------------------------------
// Export for Vercel
// --------------------------------
export const handler = serverless(app);
export default handler;












