const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/signup", userController.getSignUpPage);
router.post("/signup", userController.postSignUpPage);

router.get("/login", userController.getLoginPage);
router.post("/login", userController.postLoginPage);

// router.get("/user-status", userController.getUserStatus);

module.exports = router;
