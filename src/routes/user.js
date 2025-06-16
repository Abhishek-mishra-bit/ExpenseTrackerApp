const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { authenticate } = require("../middleware/auth");

router.get("/signup", userController.getSignUp);
router.post("/signup", userController.postSignUp);

router.get("/login", userController.getLogin);
router.post("/login", userController.postLogin);

// Get the premium status of the logged-in user
router.get("/user/status", authenticate, userController.getUserStatus);

module.exports = router;
