const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("expenseapp", "root", "Abhishek@123", {
  dialect: "mysql",
  host: "localhost",
});

sequelize
  .authenticate()
  .then((res) => console.log("Database connected successfully"))
  .catch((err) => console.log("Error connection to database:" + err));

module.exports = sequelize;
