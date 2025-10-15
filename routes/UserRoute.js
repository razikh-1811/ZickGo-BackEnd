import express from "express"
import { loginUser,RegisterUser } from "../controllers/UserController.js"

const userRouter = express.Router()
userRouter.post("/register",RegisterUser);
userRouter.post("/login",loginUser);

export default userRouter;
