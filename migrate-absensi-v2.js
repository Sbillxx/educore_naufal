const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function migrateAbsensi() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    await connection.query(`TRUNCATE TABLE attendances;`);
    console.log("Tabel attendances di-truncate (data dummy dihapus).");

    try {
      await connection.query(`ALTER TABLE attendances DROP INDEX unique_attendance_meeting;`);
    } catch(e) {}
    
    await connection.query(`ALTER TABLE attendances ADD UNIQUE KEY unique_attendance_meeting (student_id, subject_id, week_number, meeting_number);`);
    console.log("Index unique_attendance_meeting baru berhasil ditambahkan tanpa class_id.");
  } catch (err) {
    console.error("❌ Terjadi kesalahan:", err.message);
  } finally {
    await connection.end();
  }
}

migrateAbsensi();
