const expenseController = require("../controllers/expense");
const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

router.get(
  "/expenses/data",
  authenticate,
  expenseController.getExpensesDataInJson
);
router.post("/expenses", authenticate, expenseController.postExpensePage);
router.get("/expenses/", expenseController.getExpensePage);

router.delete(
  "/expenses/:expenseId",
  authenticate,
  expenseController.deleteExpense
);

module.exports = router;
