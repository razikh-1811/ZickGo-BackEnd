// api/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import 'dotenv/config';
import serverless from "serverless-http";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

// Import your routes
import foodRouter from "../routes/foodRoute.js";
import userRouter from "../routes/UserRoute.js";
import cartRouter from "../routes/cartRoute.js";
import orderRouter from "../routes/orderRoute.js";

const app = express();

// ✅ Manual CORS fix (works reliably on Vercel)
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

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ✅ Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ File serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "../uploads")));

// ✅ Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ Health check route
app.get("/api", (req, res) => {
  res.json({ success: true, message: "🚀 Backend running and CORS active!" });
});

// ✅ Export handler for Vercel
export const handler = serverless(app);
export default handler;














