const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
const path = require("path");
const rootDir = require("../util/path");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequests");
const { v4: uuidv4 } = require("uuid");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;
const bcrypt = require("bcrypt");

exports.getForgotPasswordPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "forgotEmailForm.html"));
};

exports.sendForgotPasswordEmail = async (req, res) => {
  const { email } = req.body;
  console.log("Received data:", email);
  const user = await User.findOne({ where: { email } });
  console.log("User found:", user);

  if (user === null) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate a unique ID for reset request
  const requestId = uuidv4();
  await ForgotPasswordRequest.create({ id: requestId, userId: user.id });

  const transEmailApi = new Sib.TransactionalEmailsApi();
  const sender = {
    name: "Shivam",
    email: "techshivam.56@gmail.com",
  };

  const resetPasswordLink = `http://localhost:3000/forgot/update_password/${requestId}`;

  const reciever = {
    email: email,
  };

  try {
    transEmailApi.sendTransacEmail({
      sender,
      to: [reciever],
      replyTo: sender,
      subject: "Reset Password",
      htmlContent: `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password.</p>`,
    });
  } catch (e) {
    console.error("Error sending email", e);
    res.status(500).json({ message: "Error sending email" });
    return;
  }
};

exports.updatePasswordForm = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "updatePasswordForm.html"));
};

exports.resetPassword = async (req, res) => {
  const { newPassword, requestId } = req.body;
  console.log(req.body);

  console.log("Request ID is:", requestId);
  try {
    const request = await ForgotPasswordRequest.findByPk(requestId);

    if (!request) {
      res.status(404).json({ message: "Invalid request" });
    }
    const user = await User.findOne({ where: { id: request.userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    //encrypting password
    const hashpassword = await bcrypt.hash(newPassword, 2);
    await user.update({ password: hashpassword });

    // await request.destroy();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password", err);
    res.status(500).json({ message: "Error updating password" });
  }
};
