const path = require("path");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to generate JWT token
const generateAccessToken = (id, name, isPremium) => {
  return jwt.sign({ userId: id, name: name, isPremium }, process.env.JWT_SECRET);
};

// Serve the signup page
exports.getSignUp = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "signup.html"));
};

// Handle user signup
exports.postSignUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // Create a new user
    await User.create({ name, email, password: hash });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Serve the login page
exports.getLogin = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
};

// Handle user login
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Respond with a token on successful login
      res.status(200).json({
        message: "User login successful",
        token: generateAccessToken(user._id, user.name, user.isPremiumUser),
      });
    } else {
      // Respond with an error for wrong password
      res.status(401).json({ message: "User not authorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user premium status
exports.getUserStatus = async (req, res) => {
  try {
    // The user object is attached by the authenticate middleware
    res.status(200).json({ 
      name: req.user.name,
      isPremium: req.user.isPremiumUser || false, 
      success: true 
    });
  } catch (err) {
    console.error('Error fetching user status:', err);
    res.status(500).json({ error: 'Failed to retrieve user status', success: false });
  }
};
