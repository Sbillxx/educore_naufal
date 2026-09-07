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
    const subjects = await query<any[]>(`
      SELECT 
        s.id, 
        s.name, 
        s.code,
        (SELECT COUNT(*) FROM teachers t WHERE t.specialty_subject_id = s.id) as totalTeachers
      FROM subjects s
      ORDER BY s.name ASC
    `);

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Admin GET subjects error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}) as any;
