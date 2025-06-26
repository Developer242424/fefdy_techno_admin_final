"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Ensure correct path to database connection

class User extends Model {}

User.init(
  {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    entered_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    edited_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users", // Explicitly mention the table name
    timestamps: false, // Disable Sequelize automatic timestamps
    paranoid: true,
    deletedAt: 'is_deleted',
  }
);

module.exports = User; // ✅ Ensure correct export
