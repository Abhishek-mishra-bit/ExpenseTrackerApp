const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./src/routes/user");
const sequelize = require("./src/util/database");
const path = require("path");
const User = require("./src/models/userSignupData");
const Expense = require("./src/models/expenseData");
const { FORCE } = require("sequelize/lib/index-hints");

const app = express();

// Built-in Express middleware for parsing JSON
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

// Add a route for user signup
app.use("/user", userRoutes);

User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "userId" });

sequelize
  .sync({ force: false })
  .then((res) => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => console.log("Error connection to database:" + err));
