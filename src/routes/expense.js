const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');
const userAuthentication = require('../middleware/auth');

// Route to serve the main expense page
router.get('/expenses', expenseController.getExpensePage);

// Route to add a new expense
router.post('/expensesData', userAuthentication.authenticate, expenseController.postExpenseData);

// Route to get a paginated list of expenses
router.get("/expenses/paginated",userAuthentication.authenticate, expenseController.getExpenses);
// Route to delete an expense
router.delete('/expenses/:expenseId', userAuthentication.authenticate, expenseController.deleteExpense);

// Route to download expenses as a file
router.get('/expenses/download', userAuthentication.authenticate, expenseController.getExpenses);

// Route to get the user's download history
router.get('/expensess/download-history', userAuthentication.authenticate, expenseController.getDownloadHistory);

module.exports = router;
