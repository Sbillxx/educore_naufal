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

  if (userRole !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const studentQuery = await query<any[]>(
      `SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (studentQuery.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const studentId = studentQuery[0].id;

    const attendances = await query<any[]>(
      `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, status, notes FROM attendances WHERE student_id = ? ORDER BY date DESC`,
      [studentId]
    );

    return NextResponse.json({ data: attendances });
  } catch (error) {
    console.error("Absensi API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
