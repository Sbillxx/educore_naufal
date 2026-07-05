import pandas as pd
import json
import re

file_path = r"C:\Users\ibnus\Downloads\1. Daftar Hadir dan Nilai Genap 2025 2026.xls"

try:
    xl = pd.ExcelFile(file_path, engine='xlrd')
    
    classes_info = {}
    
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, header=None)
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        
        kelas_name = None
        wali_kelas = None
        student_count = 0
        
        # Analyze top 15 rows for metadata
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
        
        # Count actual students by looking for a row with a number AND a valid NISN format or Name
        for idx, row in df.iterrows():
            row_vals = [str(x).strip() for x in row.values if pd.notna(x)]
            if len(row_vals) >= 3:
                first_col = row_vals[0].replace('.0', '')
                if first_col.isdigit() and 0 < int(first_col) < 100:
                    if re.search(r'\d{10}', " ".join(row_vals)) or len(row_vals[2]) > 3:
                        student_count += 1
                
        if kelas_name:
            if kelas_name not in classes_info:
                classes_info[kelas_name] = {'students': student_count, 'wali_kelas': wali_kelas, 'sheets_found': 1}
            else:
                classes_info[kelas_name]['students'] = max(classes_info[kelas_name]['students'], student_count)
                classes_info[kelas_name]['sheets_found'] += 1
                if wali_kelas and not classes_info[kelas_name]['wali_kelas']:
                    classes_info[kelas_name]['wali_kelas'] = wali_kelas

    print(json.dumps(classes_info, indent=2))
except Exception as e:
    print(f"Error: {e}")
