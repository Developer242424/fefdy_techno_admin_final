"use strict";
const { Model } = require("sequelize");
const sequelize = require("../config/database");
class TestHistory extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

TestHistory.init(
  {
    subject: { type: DataTypes.INTEGER, allowNull: true },
    topic: { type: DataTypes.INTEGER, allowNull: true },
    level_id: { type: DataTypes.INTEGER, allowNull: true },
    sub_topic: { type: DataTypes.INTEGER, allowNull: true },
    question_ids: { type: DataTypes.JSON, allowNull: true },
    correct_ans: { type: DataTypes.INTEGER, allowNull: true },
    wrong_ans: { type: DataTypes.INTEGER, allowNull: true },
    time_taken: { type: DataTypes.BIGINT, allowNull: true },
    entered_at: { type: DataTypes.DATE, allowNull: true },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "TestHistory",
    tableName: "test_histories",
    timestamps: false,
    paranoid: true,
    deletedAt: "is_deleted",
  }
);

module.exports = TestHistory;
