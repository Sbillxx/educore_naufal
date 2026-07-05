import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  const userEmail = req.auth.user.email;

  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Homeroom teachers only" }, { status: 403 });
  }

  try {
    // 1. Fetch teacher profile
    const teacherProfile = await query<any[]>(
      `SELECT t.id, u.name 
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (teacherProfile.length === 0) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const teacher = teacherProfile[0];
    const classDetail = await query<any[]>(
      "SELECT id, name FROM classes WHERE homeroom_teacher_id = ? LIMIT 1",
      [teacher.id]
    );

    if (classDetail.length === 0) {
      return NextResponse.json({ error: "No class assigned to this homeroom teacher" }, { status: 404 });
    }

    const classId = classDetail[0].id;
    const className = classDetail[0].name;

    // 2. Fetch subjects taught in this class with their teachers
    const subjects = await query<any[]>(
      `SELECT DISTINCT sub.id, sub.name, u.name as teacherName 
       FROM schedules sch
       JOIN subjects sub ON sch.subject_id = sub.id
       JOIN teachers t ON sch.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE sch.class_id = ?
       ORDER BY sub.name`,
      [classId]
    );

    // 3. Fetch students and their average grades per subject (categorized into harian, UTS, UAS)
    const rawGrades = await query<any[]>(
      `SELECT 
        st.id as studentId,
        u.name as studentName,
        st.nisn as nis,
        sub.id as subjectId,
        sub.name as subjectName,
        AVG(g.tugas) as harianScore,
        AVG(g.uts) as utsScore,
        AVG(g.uas) as uasScore
      FROM students st
      JOIN users u ON st.user_id = u.id
      CROSS JOIN subjects sub
      LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = sub.id
      WHERE st.class_id = ? AND sub.id IN (
        SELECT DISTINCT subject_id FROM schedules WHERE class_id = ?
      )
      GROUP BY st.id, u.name, st.nisn, sub.id, sub.name
      ORDER BY u.name, sub.name`,
      [classId, classId]
    );

    // 4. Format and pivot the data
    const studentsMap: Record<string, any> = {};

    rawGrades.forEach(row => {
      const sId = row.studentId.toString();
      if (!studentsMap[sId]) {
        studentsMap[sId] = {
          id: sId,
          name: row.studentName,
          nis: row.nis,
          subjectGrades: {}
        };
      }
      
      studentsMap[sId].subjectGrades[row.subjectId.toString()] = {
        harian: row.harianScore !== null ? parseFloat(row.harianScore).toFixed(1) : "-",
        uts: row.utsScore !== null ? parseFloat(row.utsScore).toFixed(1) : "-",
        uas: row.uasScore !== null ? parseFloat(row.uasScore).toFixed(1) : "-"
      };
    });

    const studentsList = Object.values(studentsMap);

    return NextResponse.json({
      teacher: { name: teacher.name, className },
      subjects,
      students: studentsList
    });
  } catch (error) {
    console.error("Wali Kelas Rekap API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
