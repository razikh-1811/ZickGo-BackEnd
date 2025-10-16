import express from "express";
import cors from "cors";
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/UserRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Middleware
app.use(express.json());

// ✅ CORS Configuration
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",
    "https://zikh-go-admin.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "token"] // allow token header
}));

// ✅ Preflight OPTIONS for all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", [
    "https://zick-go-frontend.vercel.app",
    "https://zikh-go-admin.vercel.app"
  ]);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
  res.sendStatus(200);
});

// Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

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

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Zick-Go Backend running successfully!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});




