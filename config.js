const mysql = require("mysql");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "fefdybraingym_root",
//   password: "RwthZh4hGO2K",
//   database: "fefdybraingym_techno",
// });

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fefdy_techno_demo",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

module.exports = db;
