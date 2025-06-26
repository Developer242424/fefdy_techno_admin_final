'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
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
  Questions.init({
    subject: DataTypes.INTEGER,
    topic: DataTypes.INTEGER,
    level_id: DataTypes.INTEGER,
    sub_topic: DataTypes.INTEGER,
    question_type: DataTypes.INTEGER,
    data: DataTypes.JSON,
    entered_at: DataTypes.DATE,
    edited_at: DataTypes.DATE,
    is_deleted: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Questions',
  });
  return Questions;
};