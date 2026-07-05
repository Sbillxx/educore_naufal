import pandas as pd
import json
import re

file_path = r"C:\Users\ibnus\Downloads\1. Daftar Hadir dan Nilai Genap 2025 2026.xls"

try:
    xl = pd.ExcelFile(file_path, engine='xlrd')
    
    classes_info = {}
    teachers = set()
    has_guru_mapel = False
    
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, header=None)
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        
        kelas_name = None
        wali_kelas = None
        student_count = 0
        
        # Analyze top 10 rows for metadata
        for idx, row in df.head(15).iterrows():
            row_text = " ".join([str(x) for x in row.values if pd.notna(x)])
            
            # Find Kelas
            if 'Kelas' in row_text and not kelas_name:
                match = re.search(r'(IX\s*[A-Z]|VIII\s*[A-Z]|VII\s*[A-Z])', row_text)
                if match:
                    kelas_name = match.group(1)
            
            # Find Wali Kelas
            if 'Wali Kelas' in row_text and not wali_kelas:
                match = re.search(r'Wali Kelas\s+([A-Za-z\s\.,]+(?:S\.Pd|M\.Pd|S\.Sos|S\.Ag|S\.E|B\.A|M\.A|S\.T))', row_text)
                if match:
                    wali_kelas = match.group(1).strip()
                    teachers.add(wali_kelas)
                    
            if 'Mata Pelajaran' in row_text and not has_guru_mapel:
                if not re.search(r'\.\.\.\.', row_text):
                    has_guru_mapel = True
        
        # Count students (rows where first column is a number)
        for idx, row in df.iterrows():
            first_col = str(row.values[0]).strip()
            # sometimes the first column is numeric float
            if first_col.replace('.0', '').isdigit():
                val = int(first_col.replace('.0', ''))
                if 0 < val < 100:
                    student_count += 1
                
        if kelas_name:
            if kelas_name not in classes_info:
                classes_info[kelas_name] = {'students': student_count, 'wali_kelas': wali_kelas}
            else:
                classes_info[kelas_name]['students'] = max(classes_info[kelas_name]['students'], student_count)
                if wali_kelas and not classes_info[kelas_name]['wali_kelas']:
                    classes_info[kelas_name]['wali_kelas'] = wali_kelas

    result = {
        'total_kelas': len(classes_info),
        'kelas_detail': classes_info,
        'total_guru_wali_kelas': len(teachers),
        'daftar_guru_ditemukan': list(teachers),
        'ada_guru_mapel_spesifik': has_guru_mapel
    }
    
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
