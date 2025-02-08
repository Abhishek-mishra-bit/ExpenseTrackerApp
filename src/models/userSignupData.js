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
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isPremiumUser: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = userData;
