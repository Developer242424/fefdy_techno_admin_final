const { Sequelize } = require("sequelize");
const config = require("../config/config.json").development;
const { Topics, Subjects } = require("../models");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import all models
db.Subjects = require("./subjects");
db.Topics = require("./topics");

// Associate models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
