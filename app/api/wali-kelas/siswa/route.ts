import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const POST = auth(async function POST(req) {
  // Verify session and role
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden: Homeroom teachers only" }, { status: 403 });
  }

  try {
    const { name, email, nisn } = await req.json();

    if (!name || !email || !nisn) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userEmail = req.auth.user.email;
    const teacherProfile = await query<any[]>(
      `SELECT t.id FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = ? LIMIT 1`,
      [userEmail]
    );

    if (teacherProfile.length === 0) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const classDetail = await query<any[]>(
      "SELECT id FROM classes WHERE homeroom_teacher_id = ? LIMIT 1",
      [teacherProfile[0].id]
    );

    if (classDetail.length === 0) {
      return NextResponse.json({ error: "No class assigned to this homeroom teacher" }, { status: 404 });
    }

    const classId = classDetail[0].id;

    // Check if email already exists
    const existingUser = await query<any[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Check if NISN already exists
    const existingStudent = await query<any[]>("SELECT id FROM students WHERE nisn = ? LIMIT 1", [nisn]);
    if (existingStudent.length > 0) {
      return NextResponse.json({ error: "NISN sudah terdaftar" }, { status: 400 });
    }

    // 1. Insert into users table
    const userResult = await query<any>(
      "INSERT INTO users (email, password, role, name, status) VALUES (?, 'password', 'siswa', ?, 'active')",
      [email, name]
    );

    const userId = userResult.insertId;

    // 2. Insert into students table
    await query(
      "INSERT INTO students (user_id, nisn, class_id) VALUES (?, ?, ?)",
      [userId, nisn, classId]
    );

    return NextResponse.json({ success: true, message: "Siswa berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Wali Kelas Tambah Siswa API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to add student" }, { status: 500 });
  }
}) as any;
