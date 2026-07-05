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
  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Homeroom teachers only" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // 1. Fetch Student Biodata
    const studentInfo = await query<any[]>(
      `SELECT s.id, s.nisn, u.name, u.email, c.name as className 
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN classes c ON s.class_id = c.id
       WHERE s.id = ? LIMIT 1`,
      [parseInt(id, 10)]
    );

    if (studentInfo.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentInfo[0];

    // 2. Fetch Attendance Summary
    const attendanceSummary = await query<any[]>(
      `SELECT status, COUNT(*) as count 
       FROM attendances 
       WHERE student_id = ?
       GROUP BY status`,
      [parseInt(id, 10)]
    );

    // 3. Fetch Grades Detail
    const gradesDetail = await query<any[]>(
      `SELECT sub.name as subjectName, g.tugas, g.uts, g.uas, g.final_score as score 
       FROM grades g
       JOIN subjects sub ON g.subject_id = sub.id
       WHERE g.student_id = ?
       ORDER BY sub.name`,
      [parseInt(id, 10)]
    );

    return NextResponse.json({
      student,
      attendance: attendanceSummary,
      grades: gradesDetail
    });
  } catch (error) {
    console.error("Wali Kelas Siswa Profile API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
