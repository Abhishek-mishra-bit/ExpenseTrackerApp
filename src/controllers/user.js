const path = require("path");
const bcrypt = require("bcrypt");
const rootDir = require("../util/path");
const userData = require("../models/user");
const jwt = require("jsonwebtoken");
const { isPremium } = require("./purchase");
const sequelize = require("../util/database");


exports.getSignUpPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "signup.html"));
};
exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

exports.postSignUpPage = async (req, res) => {
  const { name, email, password } = req.body;

  const t = await sequelize.transaction();
  try {
    const user = await userData.findOne({
      where: { email: email },
      transaction: t,
    });
    if (user) {
      await t.rollback();
      return res.status(400).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userData.create(
      {
        name,
        email,
        password: hashedPassword,
      },
      { transaction: t }
    );
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    await t.rollback();
    res.status(500).json({ error: "Error creating user" });
  }
};

exports.postLoginPage = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userData.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

    return res.status(200).json({
      message: "User login successful",
      success: true,
      token: token,
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
