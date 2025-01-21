const jwt = require("jsonwebtoken");
const User = require("../models/userSignupData");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const params = req.params.token;
    console.log(authHeader, params);

    if (!authHeader && !params) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader; // Extract token from "Bearer <token>"
    const decoded = jwt.verify(token || params, process.env.SECRET_KEY);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    req.user = user; // Attach user to request
    next(); // Proceed to next middleware or controller
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};
