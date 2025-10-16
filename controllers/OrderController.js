const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Validation
    if (!userId || !items || !items.length || !amount || !address) {
      return res.json({ success: false, message: "Missing required fields for placing order" });
    }

    // Create order
    const newOrder = new orderModel({ userId, items, amount, address });
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Stripe session creation...
    const line_items = items.map(item => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name || "Unnamed Item" },
        unit_amount: (item.price || 0) * 100,
      },
      quantity: item.quantity || 1,
    }));

    // Add delivery charge
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 80 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${process.env.USER_FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${process.env.USER_FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.json({ success: false, message: "Error placing order" });
  }
};

