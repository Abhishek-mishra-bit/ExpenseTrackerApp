const User = require("../models/userSignupData");
const Expense = require("../models/expenseData");

exports.leaderboard = async (req, res) => {
  try {
    // Fetch all expenses
    const expenses = await Expense.findAll(); // <-- Added 'await'

    // Calculate total expenses per user
    let totalExpenses = {};
    expenses.forEach((expense) => {
      // <-- Iterate over 'expenses' instead of 'totalExpenses'
      totalExpenses[expense.userId] =
        (totalExpenses[expense.userId] || 0) + expense.expenseAmount;
    });

    let finalObj = {};

    // Fetch user names for each user ID in totalExpenses
    const promises = Object.keys(totalExpenses).map(async (userId) => {
      try {
        const user = await User.findOne({
          attributes: ["name"],
          where: { id: userId },
        });

        if (user) {
          finalObj[user.name] = totalExpenses[userId]; // <-- Assigning correct values
        }
      } catch (err) {
        console.error(`Error fetching user with ID ${userId}`, err);
      }
    });

    await Promise.all(promises); // <-- Ensures all user lookups are completed

    const sortedArray = Object.entries(finalObj).sort((a, b) => b[1] - a[1]);
    const sortedObj = Object.fromEntries(sortedArray);

    return res.status(200).json(sortedObj);
  } catch (err) {
    console.error("Error fetching leaderboard function", err);
    return res.status(500).json({ error: "Error fetching leaderboard" });
  }
};
