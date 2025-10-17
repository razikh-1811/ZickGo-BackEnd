import express from "express";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../controllers/OrderController.js";

const orderRouter = express.Router();

// Place order
orderRouter.post("/place", placeOrder);

// Verify payment
orderRouter.post("/verify", verifyOrder);

// Get orders for a specific user (match frontend)
orderRouter.post("/userOrders", userOrders);

// List all orders (Admin)
orderRouter.get("/list", listOrders);

// Update order status (Admin)
orderRouter.put("/status", updateStatus);

export default orderRouter;


