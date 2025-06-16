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


exports.getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.row) || 5;
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    const totalExpenses = await Expense.countDocuments({ userId: userId });
    const totalPages = Math.ceil(totalExpenses / limit);

    const expenses = await Expense.find({ userId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      expenses,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve expenses' });
  }
};

exports.deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const expenseId = req.params.id;
    const userId = req.user._id;

    const expense = await Expense.findById(expenseId).session(session);

    if (!expense || expense.userId.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    const user = await User.findById(userId).session(session);
    user.totalExpenses -= expense.expenseAmount;
    await user.save({ session });

    await Expense.findByIdAndDelete(expenseId, { session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ message: 'Failed to delete expense' });
  } finally {
    session.endSession();
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

