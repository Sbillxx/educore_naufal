const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function seedSitiRahma() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    // 1. Tambah mata pelajaran Biologi jika belum ada
    await connection.query(`
      INSERT INTO subjects (name, code) VALUES ('Biologi', 'BIOL101')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);
    
    const [[bio]] = await connection.query(`SELECT id FROM subjects WHERE name = 'Biologi'`);
    const bioId = bio.id;

    // Asumsi Siti Rahma adalah teacher_id = 2 (sesuai init.sql)
    const teacherId = 2;

    // Hapus jadwal lama Siti Rahma agar tidak bentrok
    await connection.query(`DELETE FROM schedules WHERE teacher_id = ?`, [teacherId]);

    // 2. Buat jadwal baru untuk Siti Rahma dengan 3 mapel di kelas berbeda
    // - Fisika (subject_id = 2) di X-IPA-1 (class_id = 1) dan XI-IPA-2 (class_id = 2)
    // - Kimia (subject_id = 3) di XI-IPA-2 (class_id = 2)
    // - Biologi (subject_id = bioId) di XII-IPS-1 (class_id = 3)
    await connection.query(`
      INSERT INTO schedules (class_id, subject_id, teacher_id, day, start_time, end_time) VALUES 
      (1, 2, ?, 'Senin', '07:30:00', '09:00:00'),   -- Fisika di X-IPA-1
      (2, 2, ?, 'Selasa', '09:15:00', '10:45:00'),  -- Fisika di XI-IPA-2
      (2, 3, ?, 'Rabu', '08:00:00', '09:30:00'),    -- Kimia di XI-IPA-2
      (3, ?, ?, 'Kamis', '10:00:00', '11:30:00')    -- Biologi di XII-IPS-1
    `, [teacherId, teacherId, teacherId, bioId, teacherId]);

    console.log("✅ Berhasil membuat jadwal 3 mapel berbeda untuk Siti Rahma di berbagai kelas!");
  } catch (err) {
    console.error("❌ Gagal membuat jadwal:", err.message);
  } finally {
    await connection.end();
  }
}

seedSitiRahma();
