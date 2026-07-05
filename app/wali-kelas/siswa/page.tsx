"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface StudentItem {
  id: number;
  name: string;
  initials: string;
  nis: string;
  gender: string;
  avgGrade: string;
  latestAttendance: string;
}

interface ProfileData {
  student: {
    id: number;
    nisn: string;
    name: string;
    email: string;
    className: string;
  };
  attendance: Array<{ status: string; count: number }>;
  grades: Array<{ subjectName: string; examType: string; score: string }>;
}

export default function WaliKelasSiswaPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teacherName, setTeacherName] = useState("Wali Kelas");
  const [className, setClassName] = useState("Kelas Binaan");
  const [loading, setLoading] = useState(true);

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Add Student modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNisn, setNewNisn] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);
  const [addError, setAddError] = useState("");

  async function loadData() {
    try {
      const res = await fetch("/api/wali-kelas/dashboard");
      if (res.ok) {
        const data = await res.json();
        if (data.students) setStudents(data.students);
        if (data.teacher?.name) setTeacherName(data.teacher.name);
        if (data.teacher?.className) setClassName(data.teacher.className);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setNewName("");
    setNewEmail("");
    setNewNisn("");
    setAddError("");
    setShowAddModal(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newNisn) {
      setAddError("Semua field harus diisi");
      return;
    }

    setSavingStudent(true);
    setAddError("");

    try {
      const res = await fetch("/api/wali-kelas/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, nisn: newNisn })
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        loadData();
      } else {
        setAddError(data.error || "Gagal menambahkan siswa");
      }
    } catch (err) {
      setAddError("Terjadi kesalahan koneksi");
      console.error(err);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleOpenProfile = async (studentId: number) => {
    setLoadingProfile(true);
    setSelectedStudentProfile(null);
    setShowProfileModal(true);

    try {
      const res = await fetch(`/api/wali-kelas/siswa-profile?id=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudentProfile(data);
      }
    } catch (err) {
      console.error("Failed to load student profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Helper to calculate attendance rate and count details
  const getAttendanceStats = (profile: ProfileData) => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alfa = 0;

    profile.attendance.forEach((item) => {
      const status = item.status.toLowerCase();
      if (status === "hadir") hadir = item.count;
      else if (status === "sakit") sakit = item.count;
      else if (status === "izin") izin = item.count;
      else if (status === "alpa") alfa = item.count;
    });

    const total = hadir + sakit + izin + alfa;
    const rate = total > 0 ? `${Math.round((hadir / total) * 100)}%` : "100%";

    return { hadir, sakit, izin, alfa, total, rate };
  };

  // Group grades by subject for clean table list display
  const getGroupedGrades = (profile: ProfileData) => {
    const grouped: Record<string, Array<{ type: string; score: string }>> = {};
    profile.grades.forEach((grade) => {
      if (!grouped[grade.subjectName]) {
        grouped[grade.subjectName] = [];
      }
      grouped[grade.subjectName].push({
        type: grade.examType,
        score: parseFloat(grade.score).toFixed(0)
      });
    });
    return grouped;
  };

  return (
    <DashboardLayout role="wali-kelas" userName={teacherName}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Data Siswa Binaan</h1>
          <p className="text-on-surface-variant mt-2">Kelola data murid terdaftar, profil personal, dan status akademik kelas binaan **{className}**.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined">person_add</span>
          Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Siswa</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">NISN</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Jenis Kelamin</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Rata-rata Nilai</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="px-6 py-6"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                        {student.initials}
                      </div>
                      <span className="font-bold text-on-surface">{student.name}</span>
                    </td>
                    <td className="px-6 py-6 text-[14px] text-on-surface-variant font-mono">{student.nis}</td>
                    <td className="px-6 py-6 text-[14px] text-on-surface-variant">{student.gender}</td>
                    <td className="px-6 py-6 text-[14px] font-bold text-primary">{student.avgGrade}</td>
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={() => handleOpenProfile(student.id)}
                        className="px-4 py-2 bg-surface-container text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        Lihat Profil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                    Belum ada data siswa terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">contact_page</span>
                <h3 className="font-headline-md text-[20px] text-on-surface font-extrabold">Profil Detil Siswa</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[14px] text-on-surface-variant font-semibold">Memuat profil lengkap siswa...</span>
                </div>
              ) : selectedStudentProfile ? (
                <div className="space-y-6">
                  {/* Student Card Summary */}
                  <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl uppercase shadow-md shrink-0">
                      {selectedStudentProfile.student.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-headline-sm text-[20px] text-on-surface font-extrabold">{selectedStudentProfile.student.name}</h4>
                      <p className="text-[14px] text-on-surface-variant">
                        NISN: <span className="font-mono font-bold text-primary">{selectedStudentProfile.student.nisn}</span> • Kelas: <span className="font-bold text-secondary">{selectedStudentProfile.student.className}</span>
                      </p>
                      <p className="text-xs text-outline font-semibold">Email: {selectedStudentProfile.student.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Attendance Stats */}
                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
                      <div className="border-b border-outline-variant/20 pb-3 flex justify-between items-center">
                        <h4 className="font-bold text-on-surface text-[15px]">Rekap Kehadiran</h4>
                        <span className="text-[14px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          {getAttendanceStats(selectedStudentProfile).rate} Hadir
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-on-surface-variant">Total Presensi</span>
                          <span className="font-bold font-mono text-on-surface">{getAttendanceStats(selectedStudentProfile).total} Hari</span>
                        </div>
                        <hr className="border-outline-variant/10" />
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-on-surface-variant flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Hadir</span>
                          <span className="font-bold font-mono text-green-600">{getAttendanceStats(selectedStudentProfile).hadir} Hari</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-on-surface-variant flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Sakit</span>
                          <span className="font-bold font-mono text-yellow-600">{getAttendanceStats(selectedStudentProfile).sakit} Hari</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-on-surface-variant flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Izin</span>
                          <span className="font-bold font-mono text-blue-600">{getAttendanceStats(selectedStudentProfile).izin} Hari</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-on-surface-variant flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Alpa (Alpha)</span>
                          <span className="font-bold font-mono text-red-600">{getAttendanceStats(selectedStudentProfile).alfa} Hari</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Grades Table */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
                      <h4 className="font-bold text-on-surface text-[15px] border-b border-outline-variant/20 pb-3">Rincian Nilai Rapor & Tugas</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                          <thead>
                            <tr className="bg-surface-container-low/40">
                              <th className="px-4 py-2 font-bold text-on-surface-variant">Mata Pelajaran</th>
                              <th className="px-4 py-2 font-bold text-on-surface-variant text-center">Nilai Ujian / Tugas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20">
                            {Object.keys(getGroupedGrades(selectedStudentProfile)).length > 0 ? (
                              Object.entries(getGroupedGrades(selectedStudentProfile)).map(([subjectName, scores]) => (
                                <tr key={subjectName} className="hover:bg-surface-container-lowest transition-colors">
                                  <td className="px-4 py-3 font-semibold text-on-surface">{subjectName}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex justify-center gap-3">
                                      {scores.map((scoreItem, sIdx) => (
                                        <span
                                          key={sIdx}
                                          className="inline-flex flex-col items-center bg-surface-container px-2.5 py-1 rounded border border-outline-variant/10 text-center"
                                        >
                                          <span className="text-[9px] text-outline uppercase font-bold">{scoreItem.type}</span>
                                          <span className="text-[13px] font-extrabold text-primary">{scoreItem.score}</span>
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="px-4 py-6 text-center text-on-surface-variant italic">
                                  Belum ada rincian nilai tugas atau ujian terdaftar.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-on-surface-variant italic">Gagal memuat profil siswa.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tambah Siswa Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">person_add</span>
                <h3 className="font-headline-md text-[20px] text-on-surface font-extrabold">Tambah Siswa Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-error-container/20 text-error text-xs rounded-lg font-semibold border border-error/10">
                  {addError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Gunawan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-outline-variant/30 rounded-xl text-[14px] p-3 focus:ring-primary focus:border-primary outline-none shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: budi@school.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white border border-outline-variant/30 rounded-xl text-[14px] p-3 focus:ring-primary focus:border-primary outline-none shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">NISN (10 Digit)</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Contoh: 0054321999"
                  value={newNisn}
                  onChange={(e) => setNewNisn(e.target.value)}
                  className="w-full bg-white border border-outline-variant/30 rounded-xl text-[14px] p-3 focus:ring-primary focus:border-primary outline-none shadow-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold rounded-xl transition-all text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all text-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savingStudent ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Siswa"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
