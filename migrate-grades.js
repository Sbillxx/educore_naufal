const mysql = require('mysql2/promise');

async function migrateGrades() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'sistem_akademik' // assuming this is the database based on previous logs
  });

  try {
    console.log("Starting migration for 'grades' table...");

    // 1. Drop old columns
    await connection.query(`ALTER TABLE grades DROP COLUMN exam_type, DROP COLUMN score;`);
    console.log("Dropped old 'exam_type' and 'score' columns.");

    // 2. Add new columns
    await connection.query(`
      ALTER TABLE grades 
      ADD COLUMN tugas DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN uts DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN uas DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN final_score DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN status ENUM('PENDING', 'VALIDATED') DEFAULT 'PENDING',
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);
    console.log("Added new columns: tugas, uts, uas, final_score, status, updated_at.");

    console.log("Migration completed successfully!");
  } catch (error) {
    if(error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log("Columns might have been dropped already. Error: ", error.message);
    } else {
        console.error("Migration failed:", error);
    }
  } finally {
    await connection.end();
  }
}

migrateGrades();
