'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestionType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QuestionType.init({
    type: DataTypes.STRING,
    entered_at: DataTypes.DATE,
    edited_at: DataTypes.DATE,
    is_deleted: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'QuestionType',
  });
  return QuestionType;
};