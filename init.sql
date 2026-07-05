-- Database Initialization for Scholaria (sistem_akademik)
-- Create tables if they do not exist

CREATE DATABASE IF NOT EXISTS `sistem_akademik`;
USE `sistem_akademik`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('wali_kelas', 'guru_mapel', 'siswa') NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CLASSES TABLE
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `grade_level` INT NOT NULL,
  `room_name` VARCHAR(50),
  `homeroom_teacher_id` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE NOT NULL,
  `nip` VARCHAR(50) UNIQUE NOT NULL,
  `specialty_subject_id` INT,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`specialty_subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALTER classes to link homeroom teacher
ALTER TABLE `classes` ADD CONSTRAINT `fk_classes_homeroom_teacher` FOREIGN KEY (`homeroom_teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL;

-- 5. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE NOT NULL,
  `nisn` VARCHAR(50) UNIQUE NOT NULL,
  `class_id` INT,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `day` VARCHAR(20) NOT NULL, -- e.g. Senin, Selasa, Rabu, etc.
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ATTENDANCES TABLE
CREATE TABLE IF NOT EXISTS `attendances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `week_number` INT DEFAULT 1,
  `meeting_number` INT DEFAULT 1,
  `status` ENUM('hadir', 'sakit', 'izin', 'alfa') NOT NULL,
  `notes` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. GRADES TABLE
CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `exam_type` VARCHAR(50) NOT NULL, -- e.g. UTS, UAS, Tugas 1, dll.
  `score` DECIMAL(5, 2) NOT NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `target_role` ENUM('all', 'wali_kelas', 'guru_mapel', 'siswa') DEFAULT 'all',
  `attachment_url` VARCHAR(255) DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



