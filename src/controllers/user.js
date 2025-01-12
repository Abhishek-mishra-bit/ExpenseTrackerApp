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

exports.postLoginPage = (req, res, next) => {
  const { email, password } = req.body;

  userData
    .findOne({
      where: {
        email: email,
        password: password,
      },
    })
    .then((res) => {
      if (res.email === email && res.password === password) {
        res.send("Logged In");
      } else if (res.password != password) {
        res.send("Password is incorrect");
      }
    })
    .catch((err) => {
      res.status(403).json({ message: "User does not exist" });
    });
};
