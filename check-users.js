const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
  });

  const [rows] = await connection.execute("SELECT email, password, role FROM users");
  console.log(rows);
  process.exit(0);
}

checkUsers().catch(console.error);
