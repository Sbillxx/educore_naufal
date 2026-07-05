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

  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Homeroom teachers only" }, { status: 403 });
  }

  try {
    const teacherProfile = await query<any[]>(
      `SELECT t.id FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (teacherProfile.length === 0) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const teacher = teacherProfile[0];

    const classDetail = await query<any[]>(
      "SELECT id, room_name FROM classes WHERE homeroom_teacher_id = ? LIMIT 1",
      [teacher.id]
    );

    if (classDetail.length === 0) {
      return NextResponse.json({ error: "No class assigned to this homeroom teacher" }, { status: 404 });
    }

    const classData = classDetail[0];

    const schedulesList = await query<any[]>(
      `SELECT 
        s.id, 
        sub.name AS subject, 
        s.day, 
        s.start_time, 
        s.end_time 
       FROM schedules s
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE s.class_id = ?
       ORDER BY FIELD(s.day, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'), s.start_time`,
      [classData.id]
    );

    const formattedSchedules = schedulesList.map((sch) => {
      // Convert "07:30:00" to "07:30"
      const start = sch.start_time.split(":").slice(0, 2).join(":");
      const end = sch.end_time.split(":").slice(0, 2).join(":");
      return {
        id: sch.id,
        subject: sch.subject,
        time: `${start} - ${end}`,
        room: classData.room_name,
        day: sch.day
      };
    });

    return NextResponse.json({ schedules: formattedSchedules });
  } catch (error) {
    console.error("Wali Kelas Jadwal API Error:", error);
    return NextResponse.json({ error: "Failed to load schedules" }, { status: 500 });
  }
});
