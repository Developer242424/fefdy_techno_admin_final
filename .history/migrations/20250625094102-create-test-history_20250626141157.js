"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("test_histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      subject: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      topic: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sub_topic: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      question_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      correct_ans: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      wrong_ans: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_taken: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      entered_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      is_deleted: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("test_histories");
  },
};
