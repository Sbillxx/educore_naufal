const mysql = require('mysql2/promise');
const fs = require('fs');
require("dotenv").config({ path: ".env.local" });

async function generateDocs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_akademik",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    const [users] = await connection.query(`
      SELECT u.role, u.name, u.email, 
             COALESCE(c_stu.name, c_teach.name, '-') as class_name
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN classes c_stu ON s.class_id = c_stu.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN classes c_teach ON t.id = c_teach.homeroom_teacher_id
      ORDER BY u.role, class_name, u.name
    `);

    let md = "# Dokumentasi Akun Pengguna (Username & Password)\n\n";
    md += "Berikut adalah daftar seluruh akun yang dapat digunakan untuk login ke dalam sistem, mencakup Guru Mapel, Wali Kelas, dan Siswa Riil.\n\n";
    md += "> [!NOTE]\n> **Password Default:** Seluruh akun di bawah ini menggunakan password default: **`password`**\n\n";
    
    // Group by Role
    const roles = {
      'wali_kelas': 'Wali Kelas',
      'guru_mapel': 'Guru Mata Pelajaran',
      'siswa': 'Siswa'
    };

    for (const [roleKey, roleName] of Object.entries(roles)) {
      md += `## ${roleName}\n\n`;
      md += "| No | Nama Lengkap | Kelas / Keterangan | Email (Username) | Password |\n";
      md += "|---|---|---|---|---|\n";
      
      const roleUsers = users.filter(u => u.role === roleKey);
      
      let count = 1;
      for (const u of roleUsers) {
        md += `| ${count++} | ${u.name} | ${u.class_name} | \`${u.email}\` | \`password\` |\n`;
      }
      md += "\n";
    }

    fs.writeFileSync('C:\\Users\\ibnus\\.gemini\\antigravity-ide\\brain\\d5851d6d-132f-4860-943f-f7dc42048a9c\\user_credentials.md', md);
    console.log("Docs generated successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

generateDocs();
