const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function testRecap() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    const teacherId = 2; // Siti Rahma

    const gradesData = await connection.query(`
      SELECT 
        c.name as className, 
        sub.name as subjectName, 
        u.name as studentName, 
        st.nisn as nis,
        MAX(IF(g.exam_type = 'Tugas 1', g.score, 0)) as tugas,
        MAX(IF(g.exam_type = 'UTS', g.score, 0)) as uts,
        MAX(IF(g.exam_type = 'UAS', g.score, 0)) as uas
      FROM schedules sch
      JOIN students st ON sch.class_id = st.class_id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON sch.subject_id = sub.id
      JOIN classes c ON sch.class_id = c.id
      LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = sub.id
      WHERE sch.teacher_id = ?
      GROUP BY c.name, sub.name, u.name, st.nisn, st.id
      ORDER BY c.name ASC, sub.name ASC, u.name ASC
    `, [teacherId]);

    console.log("Grades Data Count:", gradesData[0].length);
    if(gradesData[0].length > 0) {
      console.log(gradesData[0][0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

testRecap();
