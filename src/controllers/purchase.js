const Razorpay = require("razorpay");
const Order = require("../models/order");
require("dotenv").config();
const user = require("../models/userSignupData");

exports.purchasePremium = async (req, res) => {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEYSECRET,
  });

  let options = {
    amount: 2500,
    currency: "INR",
  };
  try {
    //creting order with razorpay
    const order = await instance.orders.create(options);
    //creating order in the database
    await req.user.createOrder({
      orderId: order.id,
      status: "pending",
    });

    //sending response with razorpay keyid and order id
    res
      .status(201)
      .json({ orderId: order.id, key_id: process.env.RAZORPAY_KEYID });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ message: "Error creating order", error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  const { success, orderId, payment_id } = req.body;

  if (!success) {
    try {
      await Order.update(
        { status: "failed", payment_id },
        { where: { orderId } }
      );
      return res.status(200).json({ message: "Transaction failed" });
    } catch (err) {
      console.error("Error updating transaction status:", err);
      return res
        .status(500)
        .json({ message: "Error updating transaction status", error: err });
    }
  } else {
    try {
      // Update order status
      await Order.update(
        { status: "success", payment_id },
        { where: { orderId } }
      );

      // ✅ Update the user to set isPremiumUser = true
      await req.user.update({ isPremiumUser: true });

      return res
        .status(200)
        .json({ message: "Transaction successful", isPremiumUser: true });
    } catch (err) {
      console.error("Error updating transaction status:", err);
      return res
        .status(500)
        .json({ message: "Error updating transaction status", error: err });
    }
  }
};

exports.isPremium = async (req, res) => {
  try {
    const user = await req.user;
    console.log("isPremiumUser from DB:", user.isPremiumUser);
    return res.status(200).json({ isPremiumUser: user.isPremiumUser });
  } catch (err) {
    console.error("Error checking premium status:", err);
    return res
      .status(500)
      .json({ message: "Error checking premium status", error: err });
  }
};
