import express from "express";
import cors from "cors";
import 'dotenv/config';
import mongoose from "mongoose";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

// Import your route files
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/UserRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",   // your frontend
    "https://zikh-go-admin.vercel.app"       // your admin panel
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// ✅ Stripe connection test
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ success: true, message: "Stripe connected successfully!", balance });
  } catch (error) {
    console.error("Stripe connection failed:", error.message);
    res.status(500).json({ success: false, message: error.message });
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

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
