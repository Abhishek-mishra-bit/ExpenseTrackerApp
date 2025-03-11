const User = require("../models/user");

const checkPremium = (req, res, next) => {
  const userId = req.user.id;

  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.isPremium) {
      next();
    } else {
      return res
        .status(403)
        .send("Access denied. Premium membership required.");
    }
  });
};
