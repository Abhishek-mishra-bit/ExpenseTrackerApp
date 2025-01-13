const path = require("path");
const rootDir = require("../util/path");
const userData = require("../models/userSignupData");

exports.getSignUpPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "signup.html"));
};
exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

exports.postSignUpPage = (req, res, next) => {
  const { name, email, password } = req.body;

  // Log the received data for debugging
  console.log("Received data:", req.body);

  // Check if all necessary fields are present
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }
  userData
    .findOne({
      where: {
        email: email,
      },
    })
    .then((user) => {
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
    });

  // Create a new user record in the database
  userData
    .create({
      name,
      email,
      password,
    })
    .then((newUser) => {
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Error creating user" });
    });
};

exports.postLoginPage = (req, res) => {
  const { email, password } = req.body;
  console.log("Received data:", email, password);

  userData
    .findOne({
      where: {
        email: email,
        password: password,
      },
    })
    .then((user) => {
      if (user.email === email && user.password === password) {
        res.json({ success: true, message: "User logged in successfully" });
      } else if (user && user.password !== password) {
        res
          .status(401)
          .json({ success: false, message: "User is not authorized" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "User does not exist" });
      }
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    });
};
