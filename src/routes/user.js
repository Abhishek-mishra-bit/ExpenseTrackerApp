const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const expenseController = require("../controllers/expense");

router.get("/signup", userController.getSignUpPage);
router.post("/signup", userController.postSignUpPage);

router.get("/login", userController.getLoginPage);
router.post("/login", userController.postLoginPage);

router.get("/expenses", expenseController.getExpensePage);
router.post("/expenses", expenseController.postExpensePage);
router.get("/expenses/data", expenseController.getExpensesDataInJson);
router.delete("/expenses/:expenseId", expenseController.deleteExpense);
module.exports = router;
