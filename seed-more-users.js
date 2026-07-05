const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function seedMoreUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    // 1. Wali Kelas
    await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('wali2@school.edu', 'password', 'wali_kelas', 'Ahmad Dahlan', 'active'),
      ('wali3@school.edu', 'password', 'wali_kelas', 'Siti Hajar', 'active')
    `);
    
    // 2. Guru Mapel
    const [gResult] = await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('guru_bambang@school.edu', 'password', 'guru_mapel', 'Bambang Pamungkas', 'active'),
      ('guru_ratna@school.edu', 'password', 'guru_mapel', 'Ratna Sari', 'active')
    `);
    const guruStartId = gResult.insertId;

    await connection.query(`
      INSERT INTO teachers (user_id, nip, specialty_subject_id) VALUES 
      (?, '198001012010012001', 1), -- Bambang
      (?, '198102022011022002', 5)  -- Ratna
    `, [guruStartId, guruStartId + 1]);

    // 3. Siswa for X-IPA-1 (class_id = 1)
    const [s1Result] = await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('siswa1@school.edu', 'password', 'siswa', 'Ayu Lestari', 'active'),
      ('siswa2@school.edu', 'password', 'siswa', 'Budi Santoso', 'active'),
      ('siswa3@school.edu', 'password', 'siswa', 'Citra Kirana', 'active'),
      ('siswa4@school.edu', 'password', 'siswa', 'Deni Setiawan', 'active'),
      ('siswa5@school.edu', 'password', 'siswa', 'Eko Patrio', 'active')
    `);
    const siswaStart1 = s1Result.insertId;
    await connection.query(`
      INSERT INTO students (user_id, nisn, class_id) VALUES 
      (?, '0010010001', 1),
      (?, '0010010002', 1),
      (?, '0010010003', 1),
      (?, '0010010004', 1),
      (?, '0010010005', 1)
    `, [siswaStart1, siswaStart1+1, siswaStart1+2, siswaStart1+3, siswaStart1+4]);

    // Siswa for XI-IPA-2 (class_id = 2)
    const [s2Result] = await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('siswa6@school.edu', 'password', 'siswa', 'Fani Rahma', 'active'),
      ('siswa7@school.edu', 'password', 'siswa', 'Gilang Ramadhan', 'active'),
      ('siswa8@school.edu', 'password', 'siswa', 'Hani Nabila', 'active')
    `);
    const siswaStart2 = s2Result.insertId;
    await connection.query(`
      INSERT INTO students (user_id, nisn, class_id) VALUES 
      (?, '0020020001', 2),
      (?, '0020020002', 2),
      (?, '0020020003', 2)
    `, [siswaStart2, siswaStart2+1, siswaStart2+2]);

    // Siswa for XII-IPS-1 (class_id = 3)
    const [s3Result] = await connection.query(`
      INSERT INTO users (email, password, role, name, status) VALUES 
      ('siswa9@school.edu', 'password', 'siswa', 'Ivan Gunawan', 'active'),
      ('siswa10@school.edu', 'password', 'siswa', 'Joko Widodo', 'active')
    `);
    const siswaStart3 = s3Result.insertId;
    await connection.query(`
      INSERT INTO students (user_id, nisn, class_id) VALUES 
      (?, '0030030001', 3),
      (?, '0030030002', 3)
    `, [siswaStart3, siswaStart3+1]);

    console.log("✅ Successfully injected more wali_kelas, guru_mapel, and siswa!");
  } catch (err) {
    console.error("❌ Failed to seed more users:", err.message);
  } finally {
    await connection.end();
  }
}

seedMoreUsers();
