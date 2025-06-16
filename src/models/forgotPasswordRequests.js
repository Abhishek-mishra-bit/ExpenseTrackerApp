const mongoose = require('mongoose');
const User = require("./user");

const forgotPasswordRequestSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const ForgotPasswordRequest = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);

module.exports = ForgotPasswordRequest;
