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
    const url = new URL(req.url);
    const weekQuery = parseInt(url.searchParams.get("week") || "1", 10);
    const meetingQuery = parseInt(url.searchParams.get("meeting") || "1", 10);

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

    // Get total meetings per week for each class-subject combo
    const scheduleCounts = await query<any[]>(
      `SELECT c.name as className, sub.name as subjectName, COUNT(*) as meetingCount 
       FROM schedules sch
       JOIN classes c ON sch.class_id = c.id
       JOIN subjects sub ON sch.subject_id = sub.id
       WHERE sch.teacher_id = ? 
       GROUP BY c.name, sub.name`,
      [teacher.id]
    );

    // Fetch schedules and join with students and their attendance for the given week & meeting
    const attendanceData = await query<any[]>(
      `SELECT 
        st.id as studentId,
        u.name as name,
        st.nisn as nis,
        sub.id as subjectId,
        sub.name as subjectName,
        c.id as classId,
        c.name as className,
        COALESCE(a.status, 'hadir') as status,
        COALESCE(a.notes, '') as note,
        a.updated_at as updatedAt
      FROM schedules sch
      JOIN students st ON sch.class_id = st.class_id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON sch.subject_id = sub.id
      JOIN classes c ON sch.class_id = c.id
      LEFT JOIN attendances a ON a.student_id = st.id 
                              AND a.subject_id = sub.id 
                              AND a.week_number = ?
                              AND a.meeting_number = ?
      WHERE sch.teacher_id = ?
      ORDER BY sub.name ASC, c.name ASC, u.name ASC`,
      [weekQuery, meetingQuery, teacher.id]
    );

    const formattedAttendances = attendanceData.map(row => ({
      id: row.studentId.toString(),
      name: row.name,
      nis: row.nis,
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      classId: row.classId,
      className: row.className,
      status: String(row.status).toUpperCase(), // HADIR, SAKIT, IZIN, ALPA
      note: row.note,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toLocaleString("id-ID", { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }) : ""
    }));

    return NextResponse.json({ 
      teacher: { name: teacher.name },
      attendances: formattedAttendances,
      scheduleCounts 
    });
  } catch (error) {
    console.error("Absensi API GET Error:", error);
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
    const { week, meeting, subjectName, className, attendances } = body;

    // Use current date for the database required 'date' field, as 'date' cannot be null
    const dateQuery = new Date().toISOString().split("T")[0];

    if (!week || !meeting || !subjectName || !className || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const subjectResult = await query<any[]>("SELECT id FROM subjects WHERE name = ? LIMIT 1", [subjectName]);
    const classResult = await query<any[]>("SELECT id FROM classes WHERE name = ? LIMIT 1", [className]);

    if (subjectResult.length === 0 || classResult.length === 0) {
      return NextResponse.json({ error: "Subject or Class not found" }, { status: 404 });
    }

    const subjectId = subjectResult[0].id;
    const classId = classResult[0].id;

    for (const a of attendances) {
      const studentId = parseInt(a.id);
      const statusLower = a.status.toLowerCase();
      
      // UPSERT attendance based on unique key
      await query(
        `INSERT INTO attendances (student_id, subject_id, date, status, notes, week_number, meeting_number)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), date = VALUES(date)`,
        [studentId, subjectId, dateQuery, statusLower, a.note, parseInt(week), parseInt(meeting)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Absensi API POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
