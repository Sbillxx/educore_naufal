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
    const users = await query<any[]>(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role, 
        u.status, 
        u.created_at,
        CASE
          WHEN u.role = 'siswa' THEN (SELECT s.nisn FROM students s WHERE s.user_id = u.id LIMIT 1)
          WHEN u.role IN ('guru_mapel', 'wali_kelas') THEN (SELECT t.nip FROM teachers t WHERE t.user_id = u.id LIMIT 1)
          ELSE NULL
        END AS identity_number
      FROM users u
      ORDER BY u.id DESC
    `);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin GET users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
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
    const { name, email, password, role, nip_nisn } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Harap isi nama, email, password, dan role!" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await query<any[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
    }

    // Insert into users
    const result = await query<any>(
      "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'active')",
      [name, email, password, role]
    );

    const newUserId = result.insertId;

    // If role is guru_mapel or wali_kelas and NIP provided, add teacher entry
    if ((role === "guru_mapel" || role === "wali_kelas") && nip_nisn) {
      await query(
        "INSERT INTO teachers (user_id, nip) VALUES (?, ?) ON DUPLICATE KEY UPDATE nip = VALUES(nip)",
        [newUserId, nip_nisn]
      );
    } else if (role === "siswa" && nip_nisn) {
      await query(
        "INSERT INTO students (user_id, nisn) VALUES (?, ?) ON DUPLICATE KEY UPDATE nisn = VALUES(nisn)",
        [newUserId, nip_nisn]
      );
    }

    return NextResponse.json({ message: "Pengguna berhasil ditambahkan", userId: newUserId });
  } catch (error: any) {
    console.error("Admin POST user error:", error);
    return NextResponse.json({ error: error?.message || "Gagal menambahkan pengguna" }, { status: 500 });
  }
}) as any;

export const PUT = auth(async function PUT(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  if (req.auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, email, password, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID Pengguna tidak ditemukan" }, { status: 400 });
    }

    if (password && password.trim() !== "") {
      await query(
        "UPDATE users SET name = ?, email = ?, password = ?, role = ?, status = ? WHERE id = ?",
        [name, email, password, role, status || 'active', id]
      );
    } else {
      await query(
        "UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?",
        [name, email, role, status || 'active', id]
      );
    }

    return NextResponse.json({ message: "Data pengguna berhasil diperbarui" });
  } catch (error: any) {
    console.error("Admin PUT user error:", error);
    return NextResponse.json({ error: error?.message || "Gagal memperbarui pengguna" }, { status: 500 });
  }
}) as any;

export const DELETE = auth(async function DELETE(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  if (req.auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID Pengguna wajib diisi" }, { status: 400 });
    }

    // Prevent deleting self if same ID
    // @ts-ignore
    if (String(req.auth.user.id) === String(id)) {
      return NextResponse.json({ error: "Anda tidak dapat menghapus akun sendiri!" }, { status: 400 });
    }

    await query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error: any) {
    console.error("Admin DELETE user error:", error);
    return NextResponse.json({ error: error?.message || "Gagal menghapus pengguna" }, { status: 500 });
  }
}) as any;
