const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Order = sequelize.define(
  "order",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    orderId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    paymentId: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Enable timestamps
  }
);

module.exports = Order;
