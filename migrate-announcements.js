const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    // Add columns if they do not exist
    try {
      await connection.query(`ALTER TABLE announcements ADD COLUMN attachment_url VARCHAR(255) DEFAULT NULL;`);
      console.log("Column attachment_url added successfully.");
    } catch (e) {
      console.log("Column attachment_url might already exist.");
    }

    try {
      await connection.query(`ALTER TABLE announcements ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;`);
      console.log("Column image_url added successfully.");
    } catch (e) {
      console.log("Column image_url might already exist.");
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await connection.end();
  }
}

migrate();
