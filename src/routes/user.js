const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const expenseController = require("../controllers/expense");
const { authenticate } = require("../middleware/auth");

router.get("/signup", userController.getSignUpPage);
router.post("/signup", userController.postSignUpPage);

router.get("/login", userController.getLoginPage);
router.post("/login", userController.postLoginPage);

router.get(
  "/expenses/data",
  authenticate,
  expenseController.getExpensesDataInJson
);
router.post("/expenses", authenticate, expenseController.postExpensePage);
router.get("/expenses/:token", authenticate, expenseController.getExpensePage);

router.delete(
  "/expenses/:expenseId",
  authenticate,
  expenseController.deleteExpense
);
module.exports = router;
