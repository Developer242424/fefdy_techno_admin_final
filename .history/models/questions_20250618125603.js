"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
class Questions extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

Questions.init(
  {
    subject: { type: DataTypes.INTEGER, allowNull: true },
    topic: { type: DataTypes.INTEGER, allowNull: true },
    level_id: { type: DataTypes.INTEGER, allowNull: true },
    sub_topic: { type: DataTypes.INTEGER, allowNull: true },
    question_type: { type: DataTypes.INTEGER, allowNull: true },
    data: { type: DataTypes.JSON, allowNull: true },
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
    modelName: "Questions",
    tableName: "questions",
    paranoid: true,
    timestamps: false,
    deletedAt: "is_deleted",
  }
);
