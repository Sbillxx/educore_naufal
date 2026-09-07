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
    const teachers = await query<any[]>(`
      SELECT 
        t.id, 
        u.name, 
        u.email, 
        t.nip, 
        u.role,
        COALESCE(sub.name, 'Belum Ditentukan') as specialtySubject,
        COALESCE((SELECT name FROM classes WHERE homeroom_teacher_id = t.id LIMIT 1), 'Bukan Wali Kelas') as homeroomClass
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN subjects sub ON t.specialty_subject_id = sub.id
      ORDER BY u.name ASC
    `);

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("Admin GET teachers error:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}) as any;
