const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const userRoutes = require("./src/routes/user");
const expenseRoutes = require("./src/routes/expense");
const purchaseRoutes = require("./src/routes/purchase");

const sequelize = require("./src/util/database");

const User = require("./src/models/userSignupData");
const Expense = require("./src/models/expenseData");
const Order = require("./src/models/order");

const app = express();

// Built-in Express middleware for parsing JSON
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "src", "public")));

// Add a route for user signup
app.use("/user", userRoutes);
app.use("/userexpense", expenseRoutes);
app.use("/purchase", purchaseRoutes);

User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order);
Order.belongsTo(User);

sequelize
  .sync({ force: false })
  .then((res) => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => console.log("Error connection to database:" + err));
