const path = require("path");
const expenseData = require("../models/expenseData");
const rootDir = require("../util/path");

exports.getExpensePage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "expense.html"));
};

exports.postExpensePage = (req, res) => {
  console.log(req.body);
  const userId = req.user.id;

  const { amount, description, category } = req.body;
  const expenseAmount = parseInt(amount);

  console.log("received expense data:", amount, description, category);
  expenseData
    .create({
      expenseAmount,
      description,
      category,
      userId,
    })
    .then((expense) => {
      res.status(201).json({ message: "Data added successfully" });
    })
    .catch((error) => {
      console.error("Error adding data:", error);
      res.status(500).json({ error: "Error adding data" });
    });
};

exports.getExpensesDataInJson = async (req, res) => {
  const userId = req.user.id; // Get userId from the middleware

  try {
    const items = await expenseData.findAll({ where: { userId: userId } });
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching items:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch items", details: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const expenseId = parseInt(req.params.expenseId);
  const userId = req.user.id; // Get userId from the middleware

  try {
    const expense = await expenseData.findOne({
      where: { id: expenseId, userId: userId },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Error deleting expense" });
  }
};
