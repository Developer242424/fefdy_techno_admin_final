"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("watch_history", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      subtopic: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      subtopic_data: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      category: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      category_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ttl_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      seen_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      seen_percent: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("0", "1"),
        allowNull: true,
        defaultValue: "0",
        comment: "0 - not fully watched, 1 - fully watched",
      },
      entered_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
      },
      is_deleted: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("watch_history");
  },
};
