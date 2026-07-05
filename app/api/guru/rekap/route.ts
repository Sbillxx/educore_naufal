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

  if (userRole !== "guru_mapel" && userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Teachers only" }, { status: 403 });
  }

  try {
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
    const teacherId = teacher.id;

    const gradesData = await query<any[]>(
      `SELECT 
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
      ORDER BY c.name ASC, sub.name ASC, u.name ASC`,
      [teacherId]
    );

    const formattedGrades = gradesData.map(row => {
      const tugas = Number(row.tugas || 0);
      const uts = Number(row.uts || 0);
      const uas = Number(row.uas || 0);
      return {
        ...row,
        tugas, uts, uas,
        finalScore: Number((tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(1))
      };
    });

    const attendanceData = await query<any[]>(
      `SELECT 
        c.name as className, 
        sub.name as subjectName, 
        u.name as studentName, 
        st.nisn as nis,
        SUM(IF(a.status = 'hadir', 1, 0)) as hadir,
        SUM(IF(a.status = 'sakit', 1, 0)) as sakit,
        SUM(IF(a.status = 'izin', 1, 0)) as izin,
        SUM(IF(a.status = 'alpha', 1, 0)) as alpha
      FROM schedules sch
      JOIN students st ON sch.class_id = st.class_id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON sch.subject_id = sub.id
      JOIN classes c ON sch.class_id = c.id
      LEFT JOIN attendances a ON a.student_id = st.id AND a.subject_id = sub.id
      WHERE sch.teacher_id = ?
      GROUP BY c.name, sub.name, u.name, st.nisn, st.id
      ORDER BY c.name ASC, sub.name ASC, u.name ASC`,
      [teacherId]
    );

    return NextResponse.json({ 
      teacher: { name: teacher.name },
      grades: formattedGrades,
      attendances: attendanceData
    });
  } catch (error) {
    console.error("Rekap API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
