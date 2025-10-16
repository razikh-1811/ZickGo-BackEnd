import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://zick-go-frontend.vercel.app/",
    "https://zikh-go-admin.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

//  Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected "))
  .catch(err => console.log("Mongo error ", err));

// Test route
app.get("/api", (req, res) => {
  res.send("🚀 Backend running on Vercel!");
});

//  Export for Vercel
export const handler = serverless(app);
export default handler;

