const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('real_data.json', 'utf8'));

let sql = `-- ========================================================
-- REAL SEED DATA (MIGRATED FROM EXCEL)
-- ========================================================

-- Disable constraints temporarily to safely insert
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO \`users\` (\`id\`, \`email\`, \`password\`, \`role\`, \`name\`, \`status\`) VALUES
`;

const bcryptPassword = "password"; // Plain text because the db script might handle hashing, wait init.sql has 'password' plain text?
// In init.sql: (2, 'wali@school.edu', 'password', 'wali_kelas', 'Budi Santoso', 'active')
// It seems the app handles plain text or auth handles plain text in seed! Yes, 'password' is used.

let usersQuery = [];
let classesQuery = [];
let teachersQuery = [];
let studentsQuery = [];

let userIdCounter = 20;
let classIdCounter = 100;
let teacherIdCounter = 50;
let studentIdCounter = 1000;

// Mapping to link teachers
const teacherMap = {}; // name -> userId

// 1. Process Teachers first (Wali Kelas)
for (const className in rawData) {
    const classData = rawData[className];
    const waliName = classData.wali_kelas || `Wali ${className}`;
    
    if (!teacherMap[waliName]) {
        const uid = userIdCounter++;
        const tid = teacherIdCounter++;
        const email = waliName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) + uid + '@guru.educore.id';
        
        usersQuery.push(`(${uid}, '${email}', 'password', 'wali_kelas', '${waliName}', 'active')`);
        teachersQuery.push(`(${tid}, ${uid}, 'NIP${uid}', NULL)`);
        
        teacherMap[waliName] = { uid, tid };
    }
}

// 2. Process Classes
const classMap = {}; // name -> classId
for (const className in rawData) {
    const classData = rawData[className];
    const waliName = classData.wali_kelas || `Wali ${className}`;
    const waliTeacherId = teacherMap[waliName].tid;
    
    const cid = classIdCounter++;
    const gradeLevel = className.includes('VII') ? 7 : className.includes('VIII') ? 8 : 9;
    classesQuery.push(`(${cid}, '${className}', ${gradeLevel}, 'Ruang ${className}', ${waliTeacherId})`);
    classMap[className] = cid;
}

// 3. Process Students
for (const className in rawData) {
    const classData = rawData[className];
    const cid = classMap[className];
    
    for (const student of classData.students) {
        const uid = userIdCounter++;
        let email = student.nisn ? `${student.nisn}@siswa.educore.id` : `siswa${uid}@siswa.educore.id`;
        
        usersQuery.push(`(${uid}, '${email}', 'password', 'siswa', '${student.name.replace(/'/g, "''")}', 'active')`);
        studentsQuery.push(`(${studentIdCounter++}, ${uid}, '${student.nisn || student.nis || 'NIS'+uid}', ${cid})`);
    }
}

sql += usersQuery.join(',\n') + '\nON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `name` = VALUES(`name`);\n\n';

sql += `INSERT INTO \`classes\` (\`id\`, \`name\`, \`grade_level\`, \`room_name\`, \`homeroom_teacher_id\`) VALUES\n`;
sql += classesQuery.join(',\n') + '\nON DUPLICATE KEY UPDATE `name` = VALUES(`name`);\n\n';

sql += `INSERT INTO \`teachers\` (\`id\`, \`user_id\`, \`nip\`, \`specialty_subject_id\`) VALUES\n`;
sql += teachersQuery.join(',\n') + '\nON DUPLICATE KEY UPDATE `nip` = VALUES(`nip`);\n\n';

sql += `INSERT INTO \`students\` (\`id\`, \`user_id\`, \`nisn\`, \`class_id\`) VALUES\n`;
sql += studentsQuery.join(',\n') + '\nON DUPLICATE KEY UPDATE `nisn` = VALUES(`nisn`);\n\n';

sql += '-- Re-enable constraints\nSET FOREIGN_KEY_CHECKS = 1;\n';

fs.writeFileSync('seed-real.sql', sql);
console.log('Successfully generated seed-real.sql');
