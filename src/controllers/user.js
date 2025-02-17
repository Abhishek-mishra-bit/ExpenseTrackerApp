const path = require("path");
const bcrypt = require("bcrypt");
const rootDir = require("../util/path");
const userData = require("../models/userSignupData");
const jwt = require("jsonwebtoken");
const { isPremium } = require("./purchase");
require("dotenv").config();

exports.getSignUpPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "signup.html"));
};
exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

exports.postSignUpPage = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received data:", req.body);
  try {
    const user = await userData.findOne({ where: { email: email } });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userData.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

exports.postLoginPage = async (req, res) => {
  const { email, password } = req.body;
  console.log("Received data:", email, password);
  try {
    const user = await userData.findOne({ where: { email: email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
      res.status(200).json({
        message: "User login Successful",
        success: true,
        token: token,
      });
    } else {
      res.status(401).json({ success: false, message: "Incorrect password" });
    }
  } catch (err) {
    console.error("Error finding user:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// exports.getUserStatus = async (req, res) => {
//   try {
//     const user = await req.user;
//     res.status(200).json({ isPremiumUser: user.isPremiumUser });
//   } catch (err) {
//     console.log("error checking user status: " + err);
//     res.status(500).json({ "internale server error": err });
//   }
// };
