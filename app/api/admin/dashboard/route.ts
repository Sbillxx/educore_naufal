import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const GET = auth(async function GET(req) {
  // 1. Session verification & RBAC protection
  if (!req.auth || !req.auth.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // @ts-ignore
  if (req.auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    // 2. Fetch all academic metrics in parallel using our raw db helper
    const studentCount = await query<any[]>("SELECT COUNT(*) AS count FROM students");
    const teacherCount = await query<any[]>("SELECT COUNT(*) AS count FROM teachers");
    const classCount = await query<any[]>("SELECT COUNT(*) AS count FROM classes");
    const scheduleCount = await query<any[]>("SELECT COUNT(*) AS count FROM schedules");

    // 3. Retrieve actual user activities, mapping their roles and metadata appropriately
    const dbUsers = await query<any[]>(`
      SELECT 
        u.id, 
        u.name, 
        u.role, 
        u.email,
        CASE 
          WHEN u.role = 'siswa' THEN COALESCE((SELECT c.name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.user_id = u.id LIMIT 1), 'Belum Masuk Kelas')
          WHEN u.role = 'guru_mapel' THEN 'Staff Akademik'
          WHEN u.role = 'wali_kelas' THEN 'Wali Kelas'
          ELSE 'Kantor Admin'
        END AS classOrDept,
        'Online' AS status
      FROM users u 
      ORDER BY u.id DESC 
      LIMIT 10
    `);

    // 4. Transform DB results to align perfectly with frontend structure
    const usersList = dbUsers.map((user) => {
      const names = user.name.split(" ");
      const initials = names.map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
      
      let colorClass = "bg-primary-fixed text-primary";
      if (user.role === "wali_kelas") colorClass = "bg-secondary-fixed text-secondary";
      else if (user.role === "guru_mapel") colorClass = "bg-tertiary-fixed text-tertiary";
      else if (user.role === "siswa") colorClass = "bg-primary-fixed text-primary";
      else colorClass = "bg-surface-dim text-on-surface-variant";

      let roleLabel = "Administrator";
      if (user.role === "wali_kelas") roleLabel = "Wali Kelas";
      else if (user.role === "guru_mapel") roleLabel = "Guru Mapel";
      else if (user.role === "siswa") roleLabel = "Siswa";

      return {
        id: `#${user.id}`,
        name: user.name,
        initials,
        role: roleLabel,
        classOrDept: user.classOrDept,
        time: "Just now",
        status: user.status || "Online",
        colorClass,
      };
    });

    return NextResponse.json({
      stats: {
        totalStudents: studentCount[0]?.count || 0,
        totalTeachers: teacherCount[0]?.count || 0,
        totalClasses: classCount[0]?.count || 0,
        activeSchedules: scheduleCount[0]?.count || 0,
      },
      users: usersList,
    });
  } catch (error) {
    console.error("Failed to compile admin stats API:", error);
    return NextResponse.json({ error: "Internal Database Server Error" }, { status: 500 });
  }
}) as any;
