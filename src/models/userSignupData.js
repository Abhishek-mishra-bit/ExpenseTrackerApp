const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const userData = sequelize.define("userSignup", {
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
  },
  email: {
    allowNull: false,

    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = userData;
