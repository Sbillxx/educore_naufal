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

  if (userRole !== "guru_mapel" && userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Teachers only" }, { status: 403 });
  }

  try {
    // 2. Fetch the teacher's profile first based on user ID or email
    const teacherProfile = await query<any[]>(
      `SELECT t.id, t.nip, u.name, s.name as specialty 
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN subjects s ON t.specialty_subject_id = s.id
       WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (teacherProfile.length === 0) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const teacher = teacherProfile[0];

    // 3. Fetch their active weekly schedules from MySQL (related to classes and subjects)
    const schedules = await query<any[]>(
      `SELECT 
        sch.id,
        sub.name AS subject,
        sub.code AS subjectCode,
        c.name AS className,
        sch.day,
        sch.start_time,
        sch.end_time
       FROM schedules sch
       JOIN subjects sub ON sch.subject_id = sub.id
       JOIN classes c ON sch.class_id = c.id
       WHERE sch.teacher_id = ?
       ORDER BY FIELD(sch.day, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'), sch.start_time`,
      [teacher.id]
    );

    // 4. Fetch targeted announcements
    const announcements = await query<any[]>(
      `SELECT id, title, content, attachment_url as attachmentUrl, image_url as imageUrl, DATE_FORMAT(created_at, '%Y-%m-%d') AS date
       FROM announcements
       WHERE target_role = 'all' OR target_role = 'guru_mapel'
       ORDER BY id DESC LIMIT 5`
    );

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        nip: teacher.nip,
        specialty: teacher.specialty || "General",
      },
      schedules: schedules.map((s) => {
        const start = s.start_time ? s.start_time.toString().substring(0, 5) : "00:00";
        const end = s.end_time ? s.end_time.toString().substring(0, 5) : "00:00";
        return {
          id: s.id,
          subject: s.subject,
          subjectCode: s.subjectCode,
          time: `${start} - ${end}`,
          class: s.className,
          room: `Ruang Kelas ${s.className}`,
          day: s.day
        };
      }),
      announcements
    });
  } catch (error) {
    console.error("Teacher Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch teacher portal data" }, { status: 500 });
  }
}) as any;
