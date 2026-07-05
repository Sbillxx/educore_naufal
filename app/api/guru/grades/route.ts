import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  const userEmail = req.auth.user.email;

  if (userRole !== "guru_mapel" && userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Teachers only" }, { status: 403 });
  }

  try {
    const teacherProfile = await query<any[]>(
      `SELECT t.id 
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (teacherProfile.length === 0) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const teacherId = teacherProfile[0].id;

    const gradesData = await query<any[]>(
      `SELECT 
        st.id as id,
        u.name as name,
        st.nisn as nis,
        sub.name as subjectName,
        c.name as className,
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
      GROUP BY st.id, u.name, st.nisn, sub.name, c.name
      ORDER BY sub.name ASC, c.name ASC, u.name ASC`,
      [teacherId]
    );

    // Transform raw DB results
    const formattedGrades = gradesData.map(row => {
      const tugas = Number(row.tugas || 0);
      const uts = Number(row.uts || 0);
      const uas = Number(row.uas || 0);
      const finalScore = Number((tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(1));
      
      return {
        id: row.id.toString(),
        name: row.name,
        nis: row.nis,
        subjectName: row.subjectName,
        className: row.className,
        tugas,
        uts,
        uas,
        finalScore,
        status: finalScore > 0 ? "VALIDATED" : "PENDING"
      };
    });

    return NextResponse.json({ grades: formattedGrades });
  } catch (error) {
    console.error("Grades API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;

  if (userRole !== "guru_mapel" && userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Teachers only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { subjectName, grades } = body;

    if (!subjectName || !grades || !Array.isArray(grades)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const subjectResult = await query<any[]>("SELECT id FROM subjects WHERE name = ? LIMIT 1", [subjectName]);
    if (subjectResult.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    const subjectId = subjectResult[0].id;

    for (const g of grades) {
      const studentId = parseInt(g.id);
      
      // Clear existing records for these exam types
      await query(
        `DELETE FROM grades WHERE student_id = ? AND subject_id = ? AND exam_type IN ('Tugas 1', 'UTS', 'UAS')`, 
        [studentId, subjectId]
      );

      // Insert new values
      await query(
        `INSERT INTO grades (student_id, subject_id, exam_type, score) VALUES 
        (?, ?, 'Tugas 1', ?),
        (?, ?, 'UTS', ?),
        (?, ?, 'UAS', ?)`, 
        [
          studentId, subjectId, g.tugas,
          studentId, subjectId, g.uts,
          studentId, subjectId, g.uas
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Grades POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
