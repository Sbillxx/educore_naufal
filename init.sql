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
  `status` ENUM('hadir', 'sakit', 'izin', 'alfa') NOT NULL,
  `notes` VARCHAR(255),
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


-- ========================================================
-- SEED DATA (INITIAL DEMO DATA)
-- ========================================================

-- Insert mock users (ADMIN REMOVED)
INSERT INTO `users` (`id`, `email`, `password`, `role`, `name`, `status`) VALUES
(2, 'wali@school.edu', 'password', 'wali_kelas', 'Budi Santoso', 'active'),
(3, 'guru@school.edu', 'password', 'guru_mapel', 'Siti Rahma', 'active'),
(4, 'siswa@school.edu', 'password', 'siswa', 'Julianne Davis', 'active'),
(5, 'guru_indonesia@school.edu', 'password', 'guru_mapel', 'Dewi Sartika', 'active'),
(6, 'guru_ipa@school.edu', 'password', 'guru_mapel', 'Albert Einstein', 'active'),
(7, 'guru_ips@school.edu', 'password', 'guru_mapel', 'Mohammad Hatta', 'active'),
(8, 'guru_ppkn@school.edu', 'password', 'guru_mapel', 'Ki Hajar Dewantara', 'active'),
(9, 'guru_agama@school.edu', 'password', 'guru_mapel', 'Abdurrahman Wahid', 'active'),
(10, 'guru_seni@school.edu', 'password', 'guru_mapel', 'Affandi Koesoema', 'active'),
(11, 'guru_pjok@school.edu', 'password', 'guru_mapel', 'Budi Sudarsono', 'active'),
(12, 'guru_info@school.edu', 'password', 'guru_mapel', 'Onno W. Purbo', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `name` = VALUES(`name`);

-- Insert mock classes (ADDED room_name)
INSERT INTO `classes` (`id`, `name`, `grade_level`, `room_name`) VALUES
(1, 'X-IPA-1', 10, 'Gedung A - Ruang 101'),
(2, 'XI-IPA-2', 11, 'Gedung A - Ruang 102'),
(3, 'XII-IPS-1', 12, 'Gedung B - Ruang 201')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `room_name` = VALUES(`room_name`);

-- Insert mock subjects
INSERT INTO `subjects` (`id`, `name`, `code`) VALUES
(1, 'Matematika', 'MATH101'),
(2, 'Fisika', 'PHYS101'),
(3, 'Kimia', 'CHEM101'),
(4, 'Bahasa Inggris', 'ENGL101'),
(5, 'Sejarah', 'HIST101'),
(6, 'Bahasa Indonesia', 'INDO101'),
(7, 'Ilmu Pengetahuan Alam (IPA)', 'IPA101'),
(8, 'Ilmu Pengetahuan Sosial (IPS)', 'IPS101'),
(9, 'Pendidikan Pancasila dan Kewarganegaraan (PPKn)', 'PPKN101'),
(10, 'Pendidikan Agama Islam', 'PAI101'),
(11, 'Seni Budaya', 'ARTS101'),
(12, 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', 'PJOK101'),
(13, 'Informatika', 'INFO101')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert mock teacher profile for teachers
INSERT INTO `teachers` (`id`, `user_id`, `nip`, `specialty_subject_id`) VALUES
(1, 2, '198503122010121001', 1), -- Budi Santoso teaches Matematika
(2, 3, '199008242015042002', 2), -- Siti Rahma teaches Fisika
(3, 5, '198801122012012001', 6), -- Dewi Sartika teaches Bahasa Indonesia
(4, 6, '197903141999031002', 7), -- Albert Einstein teaches IPA
(5, 7, '198208122008121003', 8), -- Mohammad Hatta teaches IPS
(6, 8, '198005022005011004', 9), -- Ki Hajar Dewantara teaches PPKn
(7, 9, '197509042001031005', 10), -- Abdurrahman Wahid teaches Agama Islam
(8, 10, '198711152014021006', 11), -- Affandi Koesoema teaches Seni Budaya
(9, 11, '198904042016041007', 12), -- Budi Sudarsono teaches PJOK
(10, 12, '198106212009031008', 13) -- Onno W. Purbo teaches Informatika
ON DUPLICATE KEY UPDATE `nip` = VALUES(`nip`);

-- Insert mock student profile for Julianne Davis (user_id = 4)
INSERT INTO `students` (`id`, `user_id`, `nisn`, `class_id`) VALUES
(1, 4, '0054321987', 1) -- Julianne Davis is in X-IPA-1
ON DUPLICATE KEY UPDATE `nisn` = VALUES(`nisn`);

-- Insert mock announcements
INSERT INTO `announcements` (`title`, `content`, `target_role`) VALUES
('Ujian Tengah Semester', 'Ujian Tengah Semester akan diselenggarakan mulai tanggal 15 Juni 2026.', 'all'),
('Rapat Evaluasi Bulanan', 'Rapat evaluasi bulanan wali kelas akan diadakan hari Jumat jam 14:00 di ruang guru.', 'wali_kelas'),
('Pengumpulan Nilai Rapor', 'Dihimbau untuk seluruh guru mapel segera mengunggah nilai tugas ke portal akademik.', 'guru_mapel'),
('Pekan Olahraga Sekolah', 'Pendaftaran Pekan Olahraga Sekolah (Classmeet) resmi dibuka minggu ini.', 'siswa');

-- Insert mock schedules
INSERT INTO `schedules` (`class_id`, `subject_id`, `teacher_id`, `day`, `start_time`, `end_time`) VALUES
(1, 1, 1, 'Senin', '07:30:00', '09:00:00'),
(1, 2, 2, 'Senin', '09:15:00', '10:45:00'),
(1, 4, 1, 'Selasa', '08:00:00', '09:30:00'),
(1, 3, 2, 'Rabu', '10:00:00', '11:30:00');

-- Insert mock attendance for Julianne Davis (ADDED subject_id)
INSERT INTO `attendances` (`student_id`, `subject_id`, `date`, `status`, `notes`) VALUES
(1, 1, '2026-05-25', 'hadir', 'Tepat waktu'),
(1, 2, '2026-05-25', 'hadir', 'Tepat waktu'),
(1, 1, '2026-05-26', 'sakit', 'Surat dokter terlampir');

-- Insert mock grades for Julianne Davis
INSERT INTO `grades` (`student_id`, `subject_id`, `exam_type`, `score`) VALUES
(1, 1, 'Tugas 1', 85.50),
(1, 1, 'UTS', 80.00),
(1, 2, 'Tugas 1', 90.00),
(1, 2, 'UTS', 88.00);
