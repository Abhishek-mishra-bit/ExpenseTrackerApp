const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  status: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Order', orderSchema);
