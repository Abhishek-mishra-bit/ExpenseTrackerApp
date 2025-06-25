const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgot_password');

router.get("/emailform", forgotPasswordController.getForgotPasswordPage);

// Route to initiate the password reset process
router.post('/forgotpassword', forgotPasswordController.forgotPassword);

// Route to display the password reset form to the user
router.get('/reset-password/:id', forgotPasswordController.resetPasswordPage);

// Route to handle the submission of the new password
router.post('/update-password/:id', forgotPasswordController.updatePassword);

module.exports = router;
