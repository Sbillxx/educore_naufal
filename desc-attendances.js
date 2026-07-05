const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function descTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    const [rows] = await connection.query(`DESCRIBE attendances`);
    console.log(rows);
    
    const [indexes] = await connection.query(`SHOW INDEX FROM attendances`);
    console.log("Indexes:", indexes);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

descTable();
