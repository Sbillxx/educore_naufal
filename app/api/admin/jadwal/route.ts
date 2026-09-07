import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  if (req.auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const schedules = await query<any[]>(`
      SELECT 
        sch.id,
        sch.day,
        sch.start_time,
        sch.end_time,
        c.name as className,
        sub.name as subjectName,
        u.name as teacherName
      FROM schedules sch
      JOIN classes c ON sch.class_id = c.id
      JOIN subjects sub ON sch.subject_id = sub.id
      JOIN teachers t ON sch.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      ORDER BY 
        FIELD(sch.day, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
        sch.start_time ASC
    `);

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Admin GET schedules error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}) as any;
