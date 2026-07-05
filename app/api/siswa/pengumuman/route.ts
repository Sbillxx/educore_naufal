import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;

  if (userRole !== "siswa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const announcements = await query<any[]>(
      `SELECT id, title, content, attachment_url as attachmentUrl, image_url as imageUrl, DATE_FORMAT(created_at, '%Y-%m-%d') as date 
       FROM announcements 
       WHERE target_role IN ('all', 'siswa')
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ data: announcements });
  } catch (error) {
    console.error("Pengumuman API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
