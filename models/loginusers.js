"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class LoginUsers extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

LoginUsers.init(
  {
    org_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    mobile: { type: DataTypes.BIGINT, allowNull: true },
    username: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.TEXT, allowNull: true },
    standard: { type: DataTypes.INTEGER, allowNull: true },
    section: { type: DataTypes.STRING, allowNull: true },
    profile_image: { type: DataTypes.STRING, allowNull: true },
    subject: { type: DataTypes.JSON, allowNull: true },
    level: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true },
    web_token: { type: DataTypes.TEXT, allowNull: true },
    app_token: { type: DataTypes.TEXT, allowNull: true },
    entered_at: { type: DataTypes.DATE, allowNull: true },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "LoginUsers",
    tableName: "loginusers",
    paranoid: true,
    deletedAt: "is_deleted",
    timestamps: false,
  }
);

module.exports = LoginUsers;
