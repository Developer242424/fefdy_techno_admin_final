const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "fefdybraingym_root",
  password: "RwthZh4hGO2K",
  database: "fefdybraingym_techno",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

module.exports = db;
