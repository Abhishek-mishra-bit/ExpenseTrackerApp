const express = require("express");
const router = express.Router();
const forgotController = require("../controllers/forgot_password");

router.get("/emailform", forgotController.getForgotPasswordPage);

router.post("/password", forgotController.sendForgotPasswordEmail);

module.exports = router;
