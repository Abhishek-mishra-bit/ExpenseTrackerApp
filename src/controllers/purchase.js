const Razorpay = require("razorpay");
const Order = require("../models/order");
require("dotenv").config();
const User = require("../models/user");
const sequelize = require("../util/database");

exports.purchasePremium = async (req, res) => {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEYSECRET,
  });

  let options = {
    amount: 2500,
    currency: "INR",
  };

  //Correct transaction initialization
  const t = await sequelize.transaction();

  try {
    const order = await instance.orders.create(options);

    if (!order || !order.id) {
      throw new Error("Failed to create order with Razorpay");
    }

    //Create order in the database with Sequelize
    await req.user.createOrder(
      {
        orderId: order.id,
        status: "pending",
      },
      { transaction: t }
    );

    await t.commit();

    res
      .status(201)
      .json({ orderId: order.id, key_id: process.env.RAZORPAY_KEYID });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    await t.rollback();
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  const { success, orderId, payment_id } = req.body;
  const t = await sequelize.transaction();

  try {
    if (!success) {
      // Update order status to "failed"
      await Order.update(
        { status: "failed", payment_id },
        { where: { orderId }, transaction: t }
      );

      await t.commit();
      return res.status(200).json({ message: "Transaction failed" });
    }

    // Update order status to successful
    await Order.update(
      { status: "success", payment_id },
      { where: { orderId }, transaction: t }
    );

    // Fetch user from the database
    const user = await User.findByPk(req.user.id, { transaction: t });
    if (!user) {
      throw new Error("User not found");
    }

    // Update user to set isPremiumUser = true
    await user.update({ isPremiumUser: true }, { transaction: t });

    await t.commit();

    return res
      .status(200)
      .json({ message: "Transaction successful", isPremiumUser: true });
  } catch (err) {
    console.error("Error updating transaction status:", err);
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Error updating transaction status", error: err });
  }
};

exports.isPremium = async (req, res) => {
  try {
    const user = await req.user;

    return res.status(200).json({ isPremiumUser: user.isPremiumUser });
  } catch (err) {
    console.error("Error checking premium status:", err);
    return res
      .status(500)
      .json({ message: "Error checking premium status", error: err });
  }
};
