const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function seedMoreTeachers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    const [result] = await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('guru2@school.edu', 'password', 'guru_mapel', 'Rina Kusuma', 'active'),
      ('guru3@school.edu', 'password', 'guru_mapel', 'Andi Wijaya', 'active'),
      ('guru4@school.edu', 'password', 'guru_mapel', 'Diana Putri', 'active')
    `);

    const startUserId = result.insertId;

    await connection.query(`
      INSERT INTO teachers (user_id, nip, specialty_subject_id) VALUES 
      (?, '198501012010012001', 4),
      (?, '198602022011022002', 5),
      (?, '198703032012032003', 3)
    `, [startUserId, startUserId + 1, startUserId + 2]);

    const [[teacher1]] = await connection.query(`SELECT id FROM teachers WHERE user_id = ?`, [startUserId]);
    const teacherStartId = teacher1.id;

    await connection.query(`
      INSERT INTO schedules (class_id, subject_id, teacher_id, day, start_time, end_time) VALUES 
      (2, 4, ?, 'Senin', '10:00:00', '11:30:00'),
      (3, 5, ?, 'Selasa', '07:30:00', '09:00:00'),
      (1, 3, ?, 'Rabu', '08:00:00', '09:30:00')
    `, [teacherStartId, teacherStartId + 1, teacherStartId + 2]);

    console.log("✅ Successfully injected 3 new teachers and their schedules!");
  } catch (err) {
    console.error("❌ Failed to seed more teachers:", err.message);
  } finally {
    await connection.end();
  }
}

seedMoreTeachers();
