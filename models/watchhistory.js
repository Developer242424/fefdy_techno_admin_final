"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class WatchHistory extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

WatchHistory.init(
  {
    org_id: { type: DataTypes.INTEGER, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    subtopic: { type: DataTypes.INTEGER, allowNull: true },
    subtopic_data: { type: DataTypes.INTEGER, allowNull: true },
    category: { type: DataTypes.INTEGER, allowNull: true },
    category_type: { type: DataTypes.STRING, allowNull: true },
    ttl_time: { type: DataTypes.STRING, allowNull: true },
    seen_time: { type: DataTypes.STRING, allowNull: true },
    seen_percent: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
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
    modelName: "WatchHistory",
    tableName: "watch_history",
    paranoid: true,
    deletedAt: "is_deleted",
    timestamps: false,
  }
);

module.exports = WatchHistory;
