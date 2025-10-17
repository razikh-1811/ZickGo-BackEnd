import orderModel from "../models/OrderModel.js";
import userModel from "../models/usermodel.js";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY missing in env!");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || ""); // will throw on create if empty

const placeOrder = async (req, res) => {
  const frontend_url =
    process.env.USER_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    "https://idyllic-cuchufli-3a1ecf.netlify.app";

  try {
    console.log("placeOrder handler invoked");
    console.log("req.body:", JSON.stringify(req.body).slice(0,1000));

    const { userId, items, amount, address } = req.body ?? {};

    // Basic validation
    if (!userId) return res.status(400).json({ success: false, message: "User ID missing" });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    if (amount === undefined || typeof amount !== "number") {
      return res.status(400).json({ success: false, message: "Amount missing or invalid" });
    }
    if (!address) return res.status(400).json({ success: false, message: "Address missing" });

    // Save order
    const newOrder = new orderModel({ userId, items, amount, address });
    await newOrder.save();
    console.log("New order saved:", newOrder._id);

    // Clear user's cart (non-blocking safeguard)
    try {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    } catch (e) {
      console.warn("Failed to clear user cart:", e.message);
    }

    // Build Stripe line items (validate each entry)
    const line_items = items.map((item, idx) => {
      if (!item || typeof item !== "object") throw new Error(`Invalid item at index ${idx}`);
      if (!item.name) throw new Error(`Item.name missing at index ${idx}`);
      if (item.price == null || isNaN(item.price)) throw new Error(`Item.price invalid at index ${idx}`);
      if (!item.quantity || isNaN(item.quantity)) throw new Error(`Item.quantity invalid at index ${idx}`);
      return {
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: Math.max(1, parseInt(item.quantity, 10)),
      };
    });

    // Add delivery
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 20 * 100,
      },
      quantity: 1,
    });

    // Create Stripe session (this may throw if Stripe key invalid)
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    return res.json({ success: true, session_url: session.url });
  } catch (err) {
    console.error("placeOrder error:", err && err.message, err && err.stack);
    // send the real error message for debugging (can remove detail later)
    return res.status(500).json({ success: false, message: err.message || "Error creating payment session" });
  }
};

// keep your unchanged controllers, but add safe error handling as done above
const verifyOrder = async (req, res) => {
  const success = req.body.success || req.query.success;
  const orderId = req.body.orderId || req.query.orderId;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("Verify Order Error:", error.message);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};


const userOrders = async (req, res) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ success: false, message: "User ID missing" });
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body ?? {};
    if (!orderId || !status) return res.status(400).json({ success: false, message: "Order ID or status missing" });
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };




