const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const premiumRouter = require("../controllers/premium");

router.get("/leaderboard", premiumRouter.showLeaderboard);

module.exports = router;
