const User = require('../models/user');

exports.showLeaderboard = async (req, res) => {
  try {
    // Find all users, select only name and totalExpenses, 
    // and sort by totalExpenses in descending order.
    const leaderboard = await User.find({})
      .select('name totalExpenses')
      .sort({ totalExpenses: -1 });
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: err });
  }
};
