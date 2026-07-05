"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface StudentAttendance {
  id: string;
  name: string;
  nis: string;
  subjectName?: string;
  className?: string;
  status: "HADIR" | "SAKIT" | "IZIN" | "ALPA";
  note: string;
  updatedAt?: string;
}

interface ScheduleCount {
  className: string;
  subjectName: string;
  meetingCount: number;
}

export default function GuruAbsensiPage() {
  const [allStudents, setAllStudents] = useState<StudentAttendance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentAttendance[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [scheduleCounts, setScheduleCounts] = useState<ScheduleCount[]>([]);

  const [week, setWeek] = useState(1);
  const [meeting, setMeeting] = useState(1);
  const [maxMeetings, setMaxMeetings] = useState(1);
  
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [teacherName, setTeacherName] = useState("Guru Pengampu");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/guru/absensi?week=${week}&meeting=${meeting}`);
        if (res.ok) {
          const data = await res.json();
          if (data.teacher?.name) setTeacherName(data.teacher.name);
          if (data.scheduleCounts) setScheduleCounts(data.scheduleCounts);
          if (data.attendances) {
            setAllStudents(data.attendances);
            const uniqueCombos = Array.from(new Set(data.attendances.map((a: any) => `${a.subjectName} - ${a.className}`))) as string[];
            setSubjects(uniqueCombos);
            if (uniqueCombos.length > 0 && !selectedSubject) {
              setSelectedSubject(uniqueCombos[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load attendance data", err);
      }
    }
    loadData();
  }, [week, meeting]); // Reload when week or meeting changes

  useEffect(() => {
    if (selectedSubject) {
      const [subj, cls] = selectedSubject.split(" - ");
      
      // Filter students for the selected subject and class
      let filtered = allStudents.filter(s => s.subjectName === subj && s.className === cls);
      if (search) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      }
      setFilteredStudents(filtered);

      // Determine max meetings for this class-subject combo
      const countData = scheduleCounts.find(c => c.subjectName === subj && c.className === cls);
      const maxM = countData ? countData.meetingCount : 1;
      setMaxMeetings(maxM);
      
      // If the current meeting exceeds the max meetings for this subject, cap it
      if (meeting > maxM) {
        setMeeting(1);
      }
    } else {
      setFilteredStudents([]);
      setMaxMeetings(1);
    }
  }, [selectedSubject, allStudents, search, scheduleCounts, meeting]);

  const updateStatus = (id: string, status: StudentAttendance["status"]) => {
    setAllStudents(
      allStudents.map((s) => {
        if (s.id === id) return { ...s, status };
        return s;
      })
    );
  };

  const updateNote = (id: string, note: string) => {
    setAllStudents(
      allStudents.map((s) => {
        if (s.id === id) return { ...s, note };
        return s;
      })
    );
  };

  const handleSave = async () => {
    try {
      if (!selectedSubject) return;
      const [subj, cls] = selectedSubject.split(" - ");
      
      const res = await fetch("/api/guru/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week,
          meeting,
          subjectName: subj,
          className: cls,
          attendances: filteredStudents
        })
      });
      if (res.ok) {
        setToastMessage("Data Kehadiran siswa berhasil disimpan!");
        // Reload data to get the updated_at timestamp
        const loadRes = await fetch(`/api/guru/absensi?week=${week}&meeting=${meeting}`);
        if (loadRes.ok) {
          const loadData = await loadRes.json();
          if (loadData.attendances) {
            setAllStudents(loadData.attendances);
          }
        }
      } else {
        setToastMessage("Gagal menyimpan data kehadiran.");
      }
    } catch (error) {
      console.error(error);
      setToastMessage("Terjadi kesalahan saat menyimpan data.");
    }
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <DashboardLayout role="guru" userName={teacherName}>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-xl z-[70] flex items-center gap-2 animate-bounce font-bold">
          <span className="material-symbols-outlined text-[20px] text-green-400">check_circle</span>
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Absensi Mata Pelajaran</h1>
          <p className="text-on-surface-variant mt-2">
            Catat kehadiran siswa berdasarkan jatah pertemuan mingguan di kelas Anda.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 font-label-md font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined">save</span>
          Simpan Absensi
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Dynamic Week Selector */}
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Minggu Ke-</label>
          <select
            value={week}
            onChange={(e) => setWeek(parseInt(e.target.value, 10))}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(w => (
              <option key={w} value={w}>Minggu {w}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Meeting Selector */}
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Pertemuan Ke-</label>
          <select
            value={meeting}
            onChange={(e) => setMeeting(parseInt(e.target.value, 10))}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none"
          >
            {Array.from({ length: maxMeetings }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Pertemuan {m}</option>
            ))}
          </select>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Mata Pelajaran & Kelas</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none"
          >
            {subjects.length > 0 ? (
              subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))
            ) : (
              <option value="">Belum ada jadwal</option>
            )}
          </select>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Cari Siswa</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none pl-8"
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Status Kehadiran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Keterangan Catatan</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Terakhir Disubmit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-label-md text-on-surface font-semibold">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[14px] font-mono text-on-surface-variant">{student.nis}</td>
                    
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        {[
                          { key: "HADIR", label: "H", color: "peer-checked:bg-green-600 peer-checked:border-green-600 bg-green-50 text-green-700" },
                          { key: "SAKIT", label: "S", color: "peer-checked:bg-blue-600 peer-checked:border-blue-600 bg-blue-50 text-blue-700" },
                          { key: "IZIN", label: "I", color: "peer-checked:bg-yellow-600 peer-checked:border-yellow-600 bg-yellow-50 text-yellow-700" },
                          { key: "ALPA", label: "A", color: "peer-checked:bg-error peer-checked:border-error bg-error-container/30 text-error" },
                        ].map((opt) => (
                          <label key={opt.key} className="cursor-pointer select-none">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={student.status === opt.key}
                              onChange={() => updateStatus(student.id, opt.key as StudentAttendance["status"])}
                              className="peer hidden"
                            />
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border border-transparent transition-all peer-checked:text-white ${opt.color}`}
                            >
                              {opt.label}
                            </div>
                          </label>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <input
                        type="text"
                        value={student.note}
                        onChange={(e) => updateNote(student.id, e.target.value)}
                        placeholder="Contoh: Sakit Flu / Izin keluarga..."
                        className="w-full bg-surface-container-low border border-transparent rounded-lg text-[14px] p-2 focus:bg-white focus:border-primary outline-none font-body-sm"
                      />
                    </td>

                    <td className="px-6 py-6 text-right">
                      {student.updatedAt ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[12px] font-bold text-primary bg-primary-container/30 px-2 py-1 rounded-md mb-1">Tersimpan</span>
                          <span className="text-[11px] text-on-surface-variant">{student.updatedAt}</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-outline italic">Belum disubmit</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                    Belum ada siswa terdaftar untuk kelas & mata pelajaran ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
