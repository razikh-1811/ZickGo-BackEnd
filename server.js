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
const port = process.env.PORT || 4000;

// ✅ Middleware
app.use(express.json());

// ✅ CORS Configuration
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",
    "https://zikh-go-admin.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ✅ Preflight for all routes
app.options('/*', cors());

// ✅ Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB
connectDB();

// ✅ Stripe test route
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

// ✅ API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ Default root route
app.get("/", (req, res) => {
  res.send("🚀 Zick-Go Backend running successfully!");
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});



