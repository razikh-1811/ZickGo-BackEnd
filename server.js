// server.js
import express from "express";
import cors from "cors";
import 'dotenv/config';            // Load .env variables first
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/UserRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 4000;

// ✅ CORS configuration for frontend
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",   // frontend
    "https://zikh-go-admin.vercel.app"       // admin panel
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Middleware
app.use(express.json());

// Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "uploads")));

// ✅ Connect MongoDB
connectDB();

// ✅ Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ success: true, message: "Stripe connected successfully!", balance });
  } catch (error) {
    console.error("Stripe connection failed:", error.message);
    res.status(500).json({ success: false, message: "Stripe not connected", error: error.message });
  }
});

// ✅ API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 Zick-Go Backend running successfully on Render!");
});

// ✅ Global error handling (optional but recommended)
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

