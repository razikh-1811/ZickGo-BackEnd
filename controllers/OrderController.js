import orderModel from "../models/OrderModel.js";
import userModel from "../models/usermodel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🟢 Place user order and create Stripe checkout session
const placeOrder = async (req, res) => {
  const frontend_url =
    process.env.USER_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    "https://zick-go-frontend.vercel.app";

  try {
    const { userId, items, amount, address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 1️⃣ Create new order in DB
    const newOrder = new orderModel({ userId, items, amount, address });
    await newOrder.save();

    // 2️⃣ Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // 3️⃣ Prepare Stripe line items safely
    const line_items = items.map((item) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error("Item data incomplete");
      }
      return {
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: item.price * 100, // convert to paise
        },
        quantity: item.quantity,
      };
    });

    // 4️⃣ Add delivery charge
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 20 * 100, // ₹20
      },
      quantity: 1,
    });

    // 5️⃣ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Error creating payment session" });
  }
};

// 🟢 Verify order payment
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// 🟢 Get orders for a specific user
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// 🟢 List all orders (Admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders" });
  }
};

// 🟢 Update order status (Admin)
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };




