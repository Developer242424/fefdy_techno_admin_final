'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class test_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  test_history.init({
    subject: DataTypes.INTEGER,
    topic: DataTypes.INTEGER,
    level_id: DataTypes.INTEGER,
    sub_topic: DataTypes.INTEGER,
    question_ids: DataTypes.JSON,
    correct_ans: DataTypes.INTEGER,
    wrong_ans: DataTypes.INTEGER,
    time_taken: DataTypes.BIGINT,
    entered_at: DataTypes.DATE,
    edited_at: DataTypes.DATE,
    is_deleted: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'test_history',
  });
  return test_history;
};