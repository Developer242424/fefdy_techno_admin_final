"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class OrgDetails extends Model {
  static associate(models) {
    // define association here
  }
}

OrgDetails.init(
  {
    org_id: { type: DataTypes.INTEGER, allowNull: true },
    standard: { type: DataTypes.INTEGER, allowNull: true },
    section: { type: DataTypes.STRING, allowNull: true },
    levels: { type: DataTypes.INTEGER, allowNull: true },
    stu_count: { type: DataTypes.INTEGER, allowNull: true },
    entered_at: { type: DataTypes.DATE, allowNull: true },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "OrgDetails",
    tableName: "org_details",
    paranoid: true,
    deletedAt: "is_deleted",
    timestamps: false,
  }
);

module.exports = OrgDetails;
