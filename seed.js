const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function seed() {
  console.log("Starting DB Seeding...");
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    multipleStatements: true // critical for running large SQL scripts
  });

  try {
    console.log("Dropping existing tables to clean schema...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("DROP TABLE IF EXISTS `grades`;");
    await connection.query("DROP TABLE IF EXISTS `attendances`;");
    await connection.query("DROP TABLE IF EXISTS `schedules`;");
    await connection.query("DROP TABLE IF EXISTS `students`;");
    await connection.query("DROP TABLE IF EXISTS `teachers`;");
    await connection.query("DROP TABLE IF EXISTS `subjects`;");
    await connection.query("DROP TABLE IF EXISTS `classes`;");
    await connection.query("DROP TABLE IF EXISTS `users`;");
    await connection.query("DROP TABLE IF EXISTS `announcements`;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Existing tables dropped.");

    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    console.log("Reading init.sql...");
    await connection.query(sql);
    
    const realSqlPath = path.join(__dirname, "seed-real.sql");
    if (fs.existsSync(realSqlPath)) {
        const realSql = fs.readFileSync(realSqlPath, "utf8");
        console.log("Reading seed-real.sql...");
        await connection.query(realSql);
    }

    console.log("✅ Success: Database tables created and mock data seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await connection.end();
  }
}

seed();
