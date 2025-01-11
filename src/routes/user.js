const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
router.get("/signup", userController.getSignUpPage);
router.post("/signup", (req, res, next) => {
  console.log(req.body);
});
module.exports = router;
