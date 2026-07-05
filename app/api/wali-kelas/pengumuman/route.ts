import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Helper function to handle file upload
async function saveUploadedFile(file: File, folderName: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = join(process.cwd(), "public", "uploads", folderName);
  await mkdir(uploadDir, { recursive: true });
  
  // Clean filename to avoid issues
  const safeName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
  const filePath = join(uploadDir, safeName);
  
  await writeFile(filePath, buffer);
  return `/uploads/${folderName}/${safeName}`;
}

export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const list = await query<any[]>(
      `SELECT id, title, content, target_role as targetRole, attachment_url as attachmentUrl, image_url as imageUrl, DATE_FORMAT(created_at, '%Y-%m-%d') AS date
       FROM announcements
       ORDER BY id DESC`
    );
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Wali Kelas Pengumuman GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const targetRole = formData.get("targetRole") as string; // 'all', 'wali_kelas', 'guru_mapel', 'siswa'
    
    const attachmentFile = formData.get("attachment") as File | null;
    const imageFile = formData.get("image") as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });
    }

    let attachmentUrl: string | null = null;
    let imageUrl: string | null = null;

    if (attachmentFile && attachmentFile.size > 0 && attachmentFile.name) {
      attachmentUrl = await saveUploadedFile(attachmentFile, "docs");
    }

    if (imageFile && imageFile.size > 0 && imageFile.name) {
      imageUrl = await saveUploadedFile(imageFile, "images");
    }

    await query(
      `INSERT INTO announcements (title, content, target_role, attachment_url, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, targetRole || "all", attachmentUrl, imageUrl]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wali Kelas Pengumuman POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;

export const PUT = auth(async function PUT(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const targetRole = formData.get("targetRole") as string;
    
    const attachmentFile = formData.get("attachment") as File | null;
    const imageFile = formData.get("image") as File | null;
    
    let currentAttachmentUrl = formData.get("currentAttachmentUrl") as string | null;
    let currentImageUrl = formData.get("currentImageUrl") as string | null;

    if (!id || !title || !content) {
      return NextResponse.json({ error: "ID, Title, and Content are required" }, { status: 400 });
    }

    let attachmentUrl = currentAttachmentUrl || null;
    let imageUrl = currentImageUrl || null;

    if (attachmentFile && attachmentFile.size > 0 && attachmentFile.name) {
      attachmentUrl = await saveUploadedFile(attachmentFile, "docs");
    }

    if (imageFile && imageFile.size > 0 && imageFile.name) {
      imageUrl = await saveUploadedFile(imageFile, "images");
    }

    await query(
      `UPDATE announcements 
       SET title = ?, content = ?, target_role = ?, attachment_url = ?, image_url = ?
       WHERE id = ?`,
      [title, content, targetRole || "all", attachmentUrl, imageUrl, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wali Kelas Pengumuman PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;

export const DELETE = auth(async function DELETE(req) {
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  const userRole = req.auth.user.role;
  if (userRole !== "wali_kelas") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await query("DELETE FROM announcements WHERE id = ?", [parseInt(id, 10)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wali Kelas Pengumuman DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}) as any;
