const { Sequelize } = require("sequelize");

require("dotenv").config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME, // Database Name
//   process.env.DB_USER, // Database Username
//   process.env.DB_PASSWORD, // Database Password
//   {
//     host: process.env.DB_HOST || "localhost", // Database Host
//     dialect: "mysql", // Change this if using PostgreSQL, SQLite, etc.
//     logging: false, // Disable logging queries in the console
//     timezone: process.env.TIMEZONE || "+05:30",
//   }
// );

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database Name
  process.env.DB_USER, // Database Username
  process.env.DB_PASSWORD, // Database Password
  {
    host: process.env.DB_HOST || "localhost", // Database Host
    dialect: "mysql", // Change this if using PostgreSQL, SQLite, etc.
    logging: false, // Disable logging queries in the console
    timezone: process.env.TIMEZONE || "+05:30",
  }
);

module.exports = sequelize;
