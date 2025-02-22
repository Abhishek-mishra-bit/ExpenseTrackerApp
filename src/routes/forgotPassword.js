const express = require("express");
const router = express.Router();
const forgotController = require("../controllers/forgot_password");

router.get("/emailform", forgotController.getForgotPasswordPage);

router.post("/password", forgotController.sendForgotPasswordEmail);

router.get("/update_password/:id", forgotController.updatePasswordForm);

router.post("/resetPassword", forgotController.resetPassword);

module.exports = router;
