"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Topics extends Model {}

Topics.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subject: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    thumbnail: { type: DataTypes.STRING, allowNull: true },
    levels: { type: DataTypes.INTEGER, allowNull: true },
    entered_at: { type: DataTypes.DATE, allowNull: true },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Topics",
    tableName: "topics",
    timestamps: false,
    paranoid: true,
    deletedAt: "is_deleted",
  }
);

Topics.associate = function (models) {
  Topics.belongsTo(models.Subjects, {
    foreignKey: "subject",
    as: "subjectDetails",
  });
};

module.exports = Topics;
