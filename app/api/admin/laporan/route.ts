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
    const classSummary = await query<any[]>(`
      SELECT 
        c.name as className,
        COUNT(DISTINCT s.id) as studentCount,
        ROUND(AVG(g.final_score), 2) as avgGrade,
        SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as totalHadir,
        COUNT(a.id) as totalAbsensi
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      LEFT JOIN grades g ON g.student_id = s.id
      LEFT JOIN attendances a ON a.student_id = s.id
      GROUP BY c.id, c.name
      ORDER BY c.name ASC
    `);

    return NextResponse.json({ classSummary });
  } catch (error) {
    console.error("Admin GET laporan error:", error);
    return NextResponse.json({ error: "Failed to fetch laporan" }, { status: 500 });
  }
}) as any;
