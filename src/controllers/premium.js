const User = require("../models/user");
const Expense = require("../models/expenseData");
const sequelize = require("../util/database");

exports.leaderboard = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Fetch user names for each user ID in totalExpenses

    const users = await User.findAll({
      attributes: [
        "name",
        "id",
        [sequelize.fn("sum", sequelize.col("expenseAmount")), "total_cost"],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["id"],
      raw: true,
      transaction: t,
    });

    // Sort users by total_cost in descending order
    users.sort((a, b) => b.total_cost - a.total_cost);
    await t.commit();
    return res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching leaderboard function", err);
    await t.rollback();
    return res.status(500).json({ error: "Error fetching leaderboard" });
  }
};
