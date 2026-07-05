const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function testQuery() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    const teacherEmail = "guru@school.edu"; // Siti Rahma
    const [[teacher]] = await connection.query(`SELECT t.id, u.name FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = ?`, [teacherEmail]);
    
    console.log("Teacher:", teacher);

    const schedules = await connection.query(`SELECT * FROM schedules WHERE teacher_id = ?`, [teacher.id]);
    console.log("Schedules Count:", schedules[0].length);

    const attendanceData = await connection.query(`
      SELECT 
        st.id as studentId, u.name as name, sub.name as subjectName, c.name as className
      FROM schedules sch
      JOIN students st ON sch.class_id = st.class_id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON sch.subject_id = sub.id
      JOIN classes c ON sch.class_id = c.id
      WHERE sch.teacher_id = ?
    `, [teacher.id]);

    console.log("Attendance Data Count:", attendanceData[0].length);
    if (attendanceData[0].length > 0) {
      console.log("Sample Data:", attendanceData[0][0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

testQuery();
