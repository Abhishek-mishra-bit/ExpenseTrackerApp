const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const expenseData = sequelize.define("expense", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
  expenseAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    index: true, // Add index to userId
  },
});

module.exports = expenseData;
