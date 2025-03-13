const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const DownloadHistory = sequelize.define("DownloadHistory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = DownloadHistory;
