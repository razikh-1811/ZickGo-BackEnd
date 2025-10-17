import express from "express";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../controllers/OrderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", userOrders);  // updated route
orderRouter.get("/list", listOrders);
orderRouter.put("/status", updateStatus);

export default orderRouter;

