import express from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, userOrders, verifyOrder ,listOrders,updateStatus} from "../controllers/OrderController.js"
import authMidddleware from "../middleware/auth.js";


const orderRouter = express.Router();
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userOrders",authMidddleware,userOrders)
orderRouter.get("/list",listOrders);
orderRouter.post("/status",updateStatus)

export default orderRouter;