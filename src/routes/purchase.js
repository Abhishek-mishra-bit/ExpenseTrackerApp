const express = require("express");

const { authenticate } = require("../middleware/auth");
const router = express.Router();
const purchaseController = require("../controllers/purchase");

// Route to initiate the premium purchase
router.post('/premiummembership', authenticate, purchaseController.purchasePremium);

// Route to update the transaction status after payment
router.post('/updatetransactionstatus', authenticate, purchaseController.updateTransactionStatus);

// Route to check if the current user is a premium user
router.get('/ispremium', authenticate, purchaseController.isPremium);

module.exports = router;
