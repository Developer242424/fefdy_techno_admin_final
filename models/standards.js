"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Standards extends Model {
  static associate(models) {
    // define association here
  }
}

Standards.init(
  {
    standard: { type: DataTypes.STRING, allowNull: true },
    entered_at: { type: DataTypes.DATE, allowNull: true },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Standards",
    tableName: "standards",
    paranoid: true,
    deletedAt: "is_deleted",
    timestamps: false,
  }
);

module.exports = Standards;
