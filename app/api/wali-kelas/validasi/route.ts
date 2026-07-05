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
      "SELECT id FROM classes WHERE homeroom_teacher_id = ? LIMIT 1",
      [teacher.id]
    );

    if (classDetail.length === 0) {
      return NextResponse.json({ error: "No class assigned to this homeroom teacher" }, { status: 404 });
    }

    const classId = classDetail[0].id;

    const gradesData = await query<any[]>(
      `SELECT 
        g.id as id,
        u.name as studentName,
        sub.name as subject,
        g.tugas,
        g.uts,
        g.uas,
        g.final_score as score,
        g.status
      FROM grades g
      JOIN students st ON g.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON g.subject_id = sub.id
      WHERE st.class_id = ?
      ORDER BY g.status DESC, sub.name ASC, u.name ASC`,
      [classId]
    );

    return NextResponse.json({ grades: gradesData });
  } catch (error) {
    console.error("Wali Kelas Validasi API GET Error:", error);
    return NextResponse.json({ error: "Failed to load grades for validation" }, { status: 500 });
  }
}) as any;

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;

  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Homeroom teachers only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { gradeId } = body;

    if (!gradeId) {
      return NextResponse.json({ error: "gradeId is required" }, { status: 400 });
    }

    await query(
      `UPDATE grades SET status = 'VALIDATED' WHERE id = ?`, 
      [gradeId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wali Kelas Validasi API POST Error:", error);
    return NextResponse.json({ error: "Failed to validate grade" }, { status: 500 });
  }
}) as any;
