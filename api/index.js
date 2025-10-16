import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app",
    "https://zikh-go-admin.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected ");
  } catch (err) {
    console.error("MongoDB error ", err);
  }
}

// Test route
app.get("/api", (req, res) => {
  res.json({ message: "🚀 Backend running on Vercel!" });
});

// Food list route
app.get("/api/food/list", async (req, res) => {
  await connectDB();
  // Replace with actual Mongo query
  const foodList = [
    { _id: "1", name: "Pizza", price: 10 },
    { _id: "2", name: "Burger", price: 8 }
  ];
  res.json({ data: foodList });
});

// Cart routes (example)
app.post("/api/cart/add", async (req, res) => {
  await connectDB();
  // implement add to cart logic
  res.json({ message: "Item added to cart" });
});

app.post("/api/cart/remove", async (req, res) => {
  await connectDB();
  // implement remove from cart logic
  res.json({ message: "Item removed from cart" });
});

app.post("/api/cart/get", async (req, res) => {
  await connectDB();
  // implement get cart logic
  res.json({ cartData: {} });
});

// Export for Vercel
export const handler = serverless(app);
export default handler;




