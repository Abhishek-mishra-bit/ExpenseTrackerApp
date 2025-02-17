const { Cashfree } = require("cashfree-pg");
require("dotenv").config();

const cashfree = new Cashfree({
  XClientId: process.env.CASHFREE_APPID, // Use environment variables
  XClientSecret: process.env.CASHFREE_SECRETKEY,
  XEnvironment: Cashfree.Environment.SANDBOX, // Change to PRODUCTION in live mode
});

exports.createOrder = async (
  orderId,
  orderAmount,
  orderCurrency = "INR",
  customerID,
  customerPhone
) => {
  try {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,
      customer_details: {
        customer_id: customerID,
        customer_phone: customerPhone,
      },
      order_expiry_time: expiryDate,
      order_meta: {
        return_url: `http://localhost:3000/payment-status?order_id=${orderId}`,
        notify_url: `http://localhost:3000/payment-status/${orderId}`,
        payment_methods: "cc,dc,upi",
      },
    };

    const response = await cashfree.pg.orders.createOrder({
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency,
      customer_details: {
        customer_id: customerID,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `http://localhost:3000/payment-status?order_id=${orderId}`,
        notify_url: `http://localhost:3000/payment-status/${orderId}`,
        payment_methods: "cc,dc,upi",
      },
    });

    if (response && response.payment_session_id) {
      return response.payment_session_id;
    } else {
      throw new Error("Failed to create order with Cashfree");
    }
  } catch (error) {
    console.error("Error:", error.response?.data?.message || error.message);
    throw error;
  }
};
module.exports = cashfree;
