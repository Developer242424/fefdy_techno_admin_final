"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("standards", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      standard: {
        type: Sequelize.STRING,
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

    await queryInterface.bulkInsert("standards", [
      {
        standard: "PreKg",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "LKG",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "UKG",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "1st Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "2nd Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "3rd Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "4th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "5th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "6th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "7th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "8th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "9th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "10th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "11th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
      {
        standard: "12th Standard",
        entered_at: new Date(),
        edited_at: new Date(),
        is_deleted: null,
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("standards");
  },
};
