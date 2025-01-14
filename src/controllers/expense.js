const path = require("path");
const expenseData = require("../models/expenseData");
const rootDir = require("../util/path");

exports.getExpensePage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "expense.html"));
};

exports.postExpensePage = (req, res) => {
  const { amount, description, category } = req.body;
  const expenseAmount = parseInt(amount);

  console.log("received expense data:", amount, description, category);
  expenseData
    .create({
      expenseAmount,
      description,
      category,
    })
    .then((expense) => {
      res.status(201).json({ message: "Data added successfully" });
    })
    .catch((error) => {
      console.error("Error adding data:", error);
      res.status(500).json({ error: "Error adding data" });
    });
};

exports.getExpensesDataInJson = (req, res) => {
  expenseData
    .findAll()
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      console.error("Error fetching items:", err.message);
      res
        .status(500)
        .json({ error: "Failed to fetch items", details: err.message });
    });
};

exports.deleteExpense = (req, res) => {
  const expenseId = parseInt(req.params.expenseId);
  expenseData.findByPk(expenseId).then((expense) => {
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully" });
  });
};
