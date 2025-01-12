const path = require("path");
const rootDir = require("../util/path");
const userData = require("../models/userSignupData");

exports.getSignUpPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "signup.html"));
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
