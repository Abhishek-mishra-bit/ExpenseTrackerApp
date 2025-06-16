const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.purchasePremium = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEYID,
      key_secret: process.env.RAZORPAY_KEYSECRET,
    });
    const amount = 2500; // Amount in paise (e.g., 25.00 INR)

    const razorpayOrder = await rzp.orders.create({ amount, currency: 'INR' });

    const order = new Order({
      orderId: razorpayOrder.id,
      status: 'PENDING',
      userId: req.user._id,
    });
    await order.save();

    res.status(201).json({ order: razorpayOrder, key_id: rzp.key_id });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ message: 'Something went wrong', error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id, success } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ orderId: order_id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentId = payment_id; // Fix typo: should be paymentId (capital "I")

   if (success) {
    order.status = 'SUCCESSFUL';

    await Promise.all([
      User.findByIdAndUpdate(userId, { isPremiumUser: true }),
      order.save()
    ]);

    console.log('Transaction successful, user updated to premium');
    return res.status(202).json({ success: true, message: 'Transaction Successful' });

    } else {
      order.status = 'FAILED';
      await order.save();
      return res.status(200).json({ success: false, message: 'Transaction Failed' });
    }
  } catch (err) {
    console.error('Error updating transaction status:', err);
    res.status(500).json({ message: 'Something went wrong', error: err });
  }
};


exports.isPremium = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ isPremiumUser: user.isPremiumUser }); 
    } catch (err) {
        console.error('Error checking premium status:', err);
        res.status(500).json({ message: 'Failed to check premium status' });
    }
};

