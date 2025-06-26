"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Subjects extends Model {}

Subjects.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subject: { type: DataTypes.STRING, allowNull: false },
    thumbnail: { type: DataTypes.STRING, allowNull: false },
    entered_at: { type: DataTypes.DATE, allowNull: true },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Subjects",
    tableName: "subjects",
    timestamps: false,
    paranoid: true,
    deletedAt: "is_deleted",
  }
);

Subjects.associate = function (models) {
  Subjects.hasMany(models.Topics, {
    foreignKey: "subject",
    as: "topics",
  });
};

module.exports = Subjects;
