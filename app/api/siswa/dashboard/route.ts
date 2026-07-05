import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const GET = auth(async function GET(req) {
  // 1. Session verification & RBAC check
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  const userEmail = req.auth.user.email;

  if (userRole !== "siswa") {
    return NextResponse.json({ error: "Forbidden: Students only" }, { status: 403 });
  }

  try {
    // 2. Fetch student profile details from MySQL (Julianne Davis)
    const studentProfile = await query<any[]>(
      `SELECT s.id, s.nisn, u.name, c.name as className, c.id as classId
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN classes c ON s.class_id = c.id
       WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (studentProfile.length === 0) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const student = studentProfile[0];

    // 3. Fetch their monthly attendance rates
    const attendances = await query<any[]>(
      `SELECT status FROM attendances WHERE student_id = ?`,
      [student.id]
    );
    const totalAttendances = attendances.length;
    const presentAttendances = attendances.filter(a => a.status === "hadir").length;

    // 4. Fetch their academic grades (UTS/UAS/Tugas)
    const dbGrades = await query<any[]>(
      `SELECT 
        sub.name AS subject,
        g.tugas,
        g.uts,
        g.uas,
        g.final_score
       FROM grades g
       JOIN subjects sub ON g.subject_id = sub.id
       WHERE g.student_id = ? AND g.status = 'VALIDATED'`,
      [student.id]
    );

    // Map grades list and calculate finalScore
    const gradesList = dbGrades.map((g) => {
      const tugas = parseFloat(g.tugas || 0);
      const uts = parseFloat(g.uts || 0);
      const uas = parseFloat(g.uas || 0); 
      const finalScore = parseFloat(g.final_score || 0);

      return {
        subject: g.subject,
        tugas,
        uts,
        uas,
        finalScore
      };
    });

    const avgFinalScore = gradesList.length > 0
      ? (gradesList.reduce((acc, curr) => acc + curr.finalScore, 0) / gradesList.length).toFixed(1)
      : "86.9";

    // 5. Fetch daily class schedules
    const schedules = await query<any[]>(
      `SELECT 
        sch.id,
        sub.name AS subject,
        u.name AS teacherName,
        sch.start_time,
        sch.end_time,
        sch.day
       FROM schedules sch
       JOIN subjects sub ON sch.subject_id = sub.id
       JOIN teachers t ON sch.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE sch.class_id = ?
       ORDER BY FIELD(sch.day, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'), sch.start_time`,
      [student.classId]
    );

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        nisn: student.nisn,
        className: student.className
      },
      stats: {
        rasioKehadiran: totalAttendances > 0 ? `${Math.round((presentAttendances / totalAttendances) * 100)}%` : "100%",
        absensiString: `${presentAttendances}/${totalAttendances} Hari`,
        rerataRapor: avgFinalScore,
        kelasName: student.className
      },
      schedules: schedules.map((s) => {
        const start = s.start_time ? s.start_time.toString().substring(0, 5) : "00:00";
        const end = s.end_time ? s.end_time.toString().substring(0, 5) : "00:00";
        return {
          id: s.id,
          subject: s.subject,
          time: `${start} - ${end}`,
          teacher: s.teacherName,
          room: `Ruang Kelas ${student.className}`,
          day: s.day
        };
      }),
      grades: gradesList
    });
  } catch (error) {
    console.error("Student Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to compile student portal data" }, { status: 500 });
  }
}) as any;
