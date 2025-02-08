const express = require("express");

const { authenticate } = require("../middleware/auth");
const router = express.Router();
const purchaseController = require("../controllers/purchase");

router.post(
  "/purchase-premium",
  authenticate,
  purchaseController.purchasePremium
);

router.post(
  "/update-transaction-status",
  authenticate,
  purchaseController.updateTransactionStatus
);

module.exports = router;
