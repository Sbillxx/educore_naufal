const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function addTimestamp() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    try {
      await connection.query(`ALTER TABLE attendances ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`);
      console.log("Kolom updated_at berhasil ditambahkan.");
    } catch(e) {
      console.log("Kolom updated_at sudah ada atau error:", e.message);
    }
  } catch (err) {
    console.error("❌ Terjadi kesalahan:", err.message);
  } finally {
    await connection.end();
  }
}

addTimestamp();
