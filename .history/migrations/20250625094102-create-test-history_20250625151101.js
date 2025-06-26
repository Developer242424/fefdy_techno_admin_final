'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subject: {
        type: Sequelize.INTEGER
      },
      topic: {
        type: Sequelize.INTEGER
      },
      level_id: {
        type: Sequelize.INTEGER
      },
      sub_topic: {
        type: Sequelize.INTEGER
      },
      question_ids: {
        type: Sequelize.JSON
      },
      correct_ans: {
        type: Sequelize.INTEGER
      },
      wrong_ans: {
        type: Sequelize.INTEGER
      },
      time_taken: {
        type: Sequelize.BIGINT
      },
      entered_at: {
        type: Sequelize.DATE
      },
      edited_at: {
        type: Sequelize.DATE
      },
      is_deleted: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('test_histories');
  }
};