const { DataTypes } = require("sequelize");
const sequelize = require("../utils/databaseUtil");

const PasswordReset = sequelize.define("password_reset", {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.STRING,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = PasswordReset;
