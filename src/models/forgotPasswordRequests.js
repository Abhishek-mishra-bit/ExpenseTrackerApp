const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user");

const ForgotPasswordRequest = sequelize.define("forgotpasswordrequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
});

User.hasMany(ForgotPasswordRequest, { foreignKey: "userId" });
ForgotPasswordRequest.belongsTo(User, { foreignKey: "userId" });

module.exports = ForgotPasswordRequest;
