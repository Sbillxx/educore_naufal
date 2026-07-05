# Activity Diagram - Siswa: View Portal

```mermaid
stateDiagram-v2
    [*] --> LoginSiswa
    LoginSiswa --> RenderDashboardSiswa : "Bento Grid 3 Kartu"
    
    state RenderDashboardSiswa {
        [*] --> CekRerataRapor
        [*] --> CekKelasAktif
        [*] --> CekTugasAktif
    }

    RenderDashboardSiswa --> PilihNavigasi
    state PilihNavigasi {
        JadwalMenu --> LihatJadwal
        NilaiMenu --> LihatNilaiLengkap
        PengumumanMenu --> LihatPengumumanBuku
    }
    LihatJadwal & LihatNilaiLengkap & LihatPengumumanBuku --> [*]
```
