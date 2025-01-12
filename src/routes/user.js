const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/signup", userController.getSignUpPage);
router.post("/signup", userController.postSignUpPage);

module.exports = router;
