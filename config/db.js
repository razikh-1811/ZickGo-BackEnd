import mongoose from "mongoose";
export const connectDB=async()=>
{
   await mongoose.connect("mongodb+srv://razikh1811:Razikh%401811@cluster0.vapkc3l.mongodb.net/svigi").then(()=>console.log("DB Connected"));
}