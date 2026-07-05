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
    const students = await query<any[]>(`
      SELECT 
        s.id, 
        u.name, 
        s.nisn, 
        COALESCE(c.name, 'Belum Masuk Kelas') as className, 
        u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY u.name ASC
    `);

    return NextResponse.json({ data: students });
  } catch (error) {
    console.error("Failed to fetch admin students API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
