const expenseController = require("../controllers/expense");
const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

router.get(
  "/expenses/data",
  authenticate,
  expenseController.getExpensesDataInJson
);
router.post("/expensesData", authenticate, expenseController.postExpenseData);
router.get("/expenses/", expenseController.getExpensePage);

router.delete(
  "/expenses/:expenseId",
  authenticate,
  expenseController.deleteExpense
);

router.get(
  "/expenses/paginated",
  authenticate,
  expenseController.getExpensesDataPaginated
);

module.exports = router;
