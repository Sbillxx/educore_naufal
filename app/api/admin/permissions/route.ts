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
    const permissions = await query<any[]>(`
      SELECT id, role, module, permission_key, is_allowed, updated_at
      FROM role_permissions
      ORDER BY role ASC, module ASC, permission_key ASC
    `);

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Admin GET permissions error:", error);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
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
    const { role, module, permission_key, is_allowed } = body;

    if (!role || !module || !permission_key) {
      return NextResponse.json({ error: "Role, module, dan permission_key wajib diisi" }, { status: 400 });
    }

    await query(`
      INSERT INTO role_permissions (role, module, permission_key, is_allowed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE is_allowed = VALUES(is_allowed)
    `, [role, module, permission_key, is_allowed ? 1 : 0]);

    return NextResponse.json({ message: "Hak akses berhasil diperbarui" });
  } catch (error: any) {
    console.error("Admin POST permission error:", error);
    return NextResponse.json({ error: error?.message || "Gagal memperbarui hak akses" }, { status: 500 });
  }
}) as any;
