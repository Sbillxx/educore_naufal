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
    const announcements = await query<any[]>(`
      SELECT id, title, content, target_role, created_at
      FROM announcements
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Admin GET announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}) as any;

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  if (req.auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, content, target_role } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten pengumuman wajib diisi" }, { status: 400 });
    }

    await query(
      "INSERT INTO announcements (title, content, target_role) VALUES (?, ?, ?)",
      [title, content, target_role || 'semua']
    );

    return NextResponse.json({ message: "Pengumuman berhasil dipublikasikan" });
  } catch (error: any) {
    console.error("Admin POST announcement error:", error);
    return NextResponse.json({ error: error?.message || "Gagal membuat pengumuman" }, { status: 500 });
  }
}) as any;
