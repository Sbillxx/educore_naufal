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
    const classes = await query<any[]>(`
      SELECT 
        c.id, 
        c.name, 
        c.grade_level, 
        c.room_name, 
        COALESCE(u.name, 'Belum Ditentukan') as homeroomTeacher,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as totalStudents
      FROM classes c
      LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY c.grade_level ASC, c.name ASC
    `);

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Admin GET classes error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}) as any;
