import orderModel from "../models/OrderModel.js";
import userModel from "../models/usermodel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = process.env.USER_FRONTEND_URL || process.env.FRONTEND_URL || "https://zick-go-frontend.vercel.app";

  try {
    const { userId, items, amount, address } = req.body;

    // ✅ Input validation
    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing required fields or empty items" });
    }

    // 1️⃣ Create new order in database
    const newOrder = new orderModel({ userId, items, amount, address });
    await newOrder.save();

    // 2️⃣ Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // 3️⃣ Prepare Stripe line items
    const line_items = items.map((item) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error("Item data incomplete: name, price, or quantity missing");
      }
      return {
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    // 4️⃣ Add delivery charge
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 20 * 100,
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
    console.error("Stripe Session Error:", error);
    res.status(500).json({ success: false, message: "Error creating payment session", error: error.message });
  }
};

export { placeOrder, /* keep other exports unchanged */ };


