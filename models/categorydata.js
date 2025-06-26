"use strict";
const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/database");

class CategoryData extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

CategoryData.init(
  {
    subtopic: { type: DataTypes.INTEGER, allowNull: true },
    category: { type: DataTypes.INTEGER, allowNull: true },
    source: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true },
    entered_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "CategoryData",
    tableName: "categorydata",
    timestamps: false,
    paranoid: true,
    deletedAt: "is_deleted",
  }
);

module.exports = CategoryData;
