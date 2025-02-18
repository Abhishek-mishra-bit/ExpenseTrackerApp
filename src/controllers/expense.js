const path = require("path");
const expenseData = require("../models/expenseData");
const rootDir = require("../util/path");
const User = require("../models/user");
const sequelize = require("../util/database");

exports.getExpensePage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "expense.html"));
};

exports.postExpensePage = async (req, res) => {
  console.log(req.body);
  const userId = req.user.id;
  const t = await sequelize.transaction();
  try {
    const { amount, description, category } = req.body;
    const expenseAmount = parseInt(amount);

    // add all the expense amount for same userId to store it in the user table
    await User.increment("totalExpense", {
      by: expenseAmount,
      where: { id: userId },
      transaction: t,
    });

    console.log("received expense data:", amount, description, category);
    await expenseData.create(
      {
        expenseAmount,
        description,
        category,
        userId,
      },
      { transaction: t }
    );
    await t.commit();

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    await t.rollback();
    res.status(500).json({ error: "Error adding data" });
  }
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
  const t = await sequelize.transaction();

  try {
    //  Fetching expense with transaction
    const expense = await expenseData.findOne({
      where: { id: expenseId, userId: userId },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }

    // Subtracting expense amount from user's totalExpense
    await User.decrement("totalExpense", {
      by: expense.expenseAmount,
      where: { id: userId },
      transaction: t,
    });

    //Delete the expense using the same transaction
    await expense.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    await t.rollback();
    return res.status(500).json({ error: "Error deleting expense" });
  }
};
