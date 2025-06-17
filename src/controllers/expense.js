const mongoose = require('mongoose');
const Expense = require('../models/expenseData');
const User = require('../models/user');
const DownloadHistory = require('../models/downloadHistory');
const path = require("path");
const rootDir = require('../util/path');
const fsPromises = require("fs/promises");



exports.getExpensePage = (req, res) => {
  res.sendFile(path.join(rootDir, "src/views", "expense.html"));
};

exports.postExpenseData = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.user._id;

    const expense = new Expense({
      amount: Number(amount),
      description,
      category,
      userId,
    });
    await expense.save();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    user.totalExpenses = (user.totalExpenses || 0) + Number(amount);
    await user.save();

    res.status(201).json({ expense, message: 'Expense created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create expense' });
  }
};


// GET /userexpense/expenses/paginated?page=1&row=5
exports.getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.row) || 5;
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    const filter = req.query.filter || "all";

    let query = { userId };

    const now = new Date();
    let startDate, endDate;

    switch (filter) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        query.createdAt = { $gte: startDate, $lte: endDate };
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date();
        query.createdAt = { $gte: startDate, $lte: endDate };
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        query.createdAt = { $gte: startDate, $lte: endDate };
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
        query.createdAt = { $gte: startDate, $lte: endDate };
        break;
      case "custom":
        if (req.query.from && req.query.to) {
          startDate = new Date(req.query.from);
          endDate = new Date(req.query.to);
          query.createdAt = { $gte: startDate, $lte: endDate };
        }
        break;
      case "all":
      default:
        break;
    }

    const totalExpenses = await Expense.countDocuments(query);
    const totalPages = Math.ceil(totalExpenses / limit);

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ expenses, currentPage: page, totalPages });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Failed to retrieve expenses" });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    const userId = req.user._id;   

    const expense = await Expense.findOne({ _id: expenseId, userId });

    if (!expense) {
      console.log("Expense not found or unauthorized");
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    await Expense.deleteOne({ _id: expenseId });

    // Optional: subtract from totalExpenses
    await User.findByIdAndUpdate(userId, { $inc: { totalExpenses: -expense.amount } });

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};


exports.downloadExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ userId });

    if (!expenses.length) {
      return res.status(404).json({ message: 'No expenses found' });
    }

    res.status(200).json({ expenses });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};




exports.getDownloadHistory = async (req, res) => {
  try {
    const history = await DownloadHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve download history' });
  }
};

