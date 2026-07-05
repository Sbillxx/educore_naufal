import pandas as pd
from bs4 import BeautifulSoup
import re
import json

file_path = r"C:\Users\ibnus\Downloads\1. Daftar Hadir dan Nilai Genap 2025 2026.xls"

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        html_content = f.read()
        
    soup = BeautifulSoup(html_content, 'html.parser')
    tables = soup.find_all('table')
    
    classes_info = {}
    teachers = set()
    
    for idx, table in enumerate(tables):
        rows = table.find_all('tr')
        
        kelas_name = None
        wali_kelas = None
        mata_pelajaran = None
        student_count = 0
        
        for row in rows:
            cells = [c.get_text(strip=True) for c in row.find_all(['td', 'th'])]
            text_full = " ".join(cells)
            
            # Cari Kelas
            if 'Kelas' in text_full and not kelas_name:
                for i, cell in enumerate(cells):
                    if 'Kelas' in cell and i + 1 < len(cells) and cells[i+1]:
                        kelas_name = cells[i+1]
                        break
                if not kelas_name:
                    match = re.search(r'Kelas\s+(IX\s+[A-Z]|VIII\s+[A-Z]|VII\s+[A-Z])', text_full)
                    if match: kelas_name = match.group(1)
            
            # Cari Wali Kelas
            if 'Wali Kelas' in text_full and not wali_kelas:
                for i, cell in enumerate(cells):
                    if 'Wali Kelas' in cell and i + 1 < len(cells) and cells[i+1]:
                        wali_kelas = cells[i+1]
                        teachers.add(wali_kelas)
                        break
            
            # Hitung siswa (baris yang dimulai dengan angka urut, lalu ada NISN/NIS)
            if len(cells) >= 3:
                # Biasanya nomor urut di sel pertama, nama atau NISN di sel berikutnya
                if cells[0].isdigit() and int(cells[0]) > 0 and int(cells[0]) < 100:
                    student_count += 1
        
        if kelas_name:
            if kelas_name not in classes_info:
                classes_info[kelas_name] = {'students': student_count, 'wali_kelas': wali_kelas}
            else:
                classes_info[kelas_name]['students'] = max(classes_info[kelas_name]['students'], student_count)
                if wali_kelas:
                    classes_info[kelas_name]['wali_kelas'] = wali_kelas
    
    result = {
        'total_kelas': len(classes_info),
        'kelas_detail': classes_info,
        'total_guru': len(teachers),
        'daftar_guru': list(teachers)
    }
    
    print(json.dumps(result, indent=2))
    
except Exception as e:
    print(f"Error: {e}")
