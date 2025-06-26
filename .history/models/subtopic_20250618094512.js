"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Subtopic extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

Subtopic.init(
  {
    subject: { type: DataTypes.INTEGER, allowNull: true },
    topic: { type: DataTypes.INTEGER, allowNull: true },
    level_id: { type: DataTypes.INTEGER, allowNull: true },
    category: { type: DataTypes.JSON, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    thumbnail: { type: DataTypes.STRING, allowNull: true },
    cat_data_ids: { type: DataTypes.JSON, allowNull: true },
    entered_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Subtopic",
    tableName: "subtopics",
    timestamps: false,
    paranoid: true,
    deletedAt: "is_deleted",
  }
);

module.exports = Subtopic;
