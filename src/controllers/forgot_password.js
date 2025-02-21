const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
const path = require("path");
const rootDir = require("../util/path");

exports.getForgotPasswordPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "forgotEmailForm.html"));
};

exports.sendForgotPasswordEmail = async (req, res) => {
  const client = Sib.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.SIB_API_KEY;
  const transEmailApi = new Sib.TransactionalEmailsApi();
  const sender = {
    name: "Shivam",
    email: "techshivam.56@gmail.com",
  };
  const { email } = req.body;
  console.log("Received data:", email);
  const reciever = {
    email: email,
  };

  try {
    transEmailApi.sendTransacEmail({
      sender,
      to: [reciever],
      replyTo: sender,
      subject: "Reset Password",
      htmlContent: `<p>Click <a href="http://localhost:3000/user/reset_password/${email}">here</a> to reset your password.
       thanks for using this service</p>`,
    });
  } catch (e) {
    console.error("Error sending email", e);
    res.status(500).json({ message: "Error sending email" });
    return;
  }
};
