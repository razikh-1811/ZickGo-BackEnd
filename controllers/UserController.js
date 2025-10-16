import userModel from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Create JWT token
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

// REGISTER
const RegisterUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be 8+ chars" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword });
    const token = createToken(user._id);

    res.json({ success: true, token, user: { id: user._id, name, email } });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

export { loginUser, RegisterUser };

