const Razorpay = require("razorpay");
const Order = require("../models/order");
require("dotenv").config();

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
      await Order.update({ status: "failed" }, { where: { orderId } });
      res.status(200).json({ message: "Transaction failed" });
    } catch (err) {
      console.error("Error updating transaction status:", err);
      res
        .status(500)
        .json({ message: "Error updating transaction status", error: err });
    }
  } else {
    try {
      await Order.update(
        { status: "success", payment_id },
        { where: { orderId } }
      );
      res.status(200).json({ message: "Transaction successful" });
    } catch (err) {
      console.error("Error updating transaction status:", err);
      res
        .status(500)
        .json({ message: "Error updating transaction status", error: err });
    }
  }
};
