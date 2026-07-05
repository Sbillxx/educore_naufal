const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function seedMoreStudents() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    // Insert new users
    const [result] = await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('siswa2@school.edu', 'password', 'siswa', 'Bima Satria', 'active'),
      ('siswa3@school.edu', 'password', 'siswa', 'Cinta Laura', 'active'),
      ('siswa4@school.edu', 'password', 'siswa', 'Dimas Anggara', 'active'),
      ('siswa5@school.edu', 'password', 'siswa', 'Eka Putra', 'active')
    `);

    const startUserId = result.insertId;

    // Insert into students table mapping to the newly created users
    await connection.query(`
      INSERT INTO students (user_id, nisn, class_id) VALUES 
      (?, '0054321988', 1),
      (?, '0054321989', 2),
      (?, '0054321990', 2),
      (?, '0054321991', 3)
    `, [startUserId, startUserId + 1, startUserId + 2, startUserId + 3]);

    console.log("✅ Successfully injected 4 new students!");
  } catch (err) {
    console.error("❌ Failed to seed more students:", err.message);
  } finally {
    await connection.end();
  }
}

seedMoreStudents();
