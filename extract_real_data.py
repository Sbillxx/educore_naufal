import pandas as pd
import json
import re

file_path = r"C:\Users\ibnus\Downloads\1. Daftar Hadir dan Nilai Genap 2025 2026.xls"
output_path = r"C:\Users\ibnus\OneDrive\Documents\vscode\js\educore_naufal\real_data.json"

try:
    xl = pd.ExcelFile(file_path, engine='xlrd')
    classes_info = {}
    
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, header=None)
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        
        current_kelas = None
        
        for idx, row in df.iterrows():
            row_text = " ".join([str(x) for x in row.values if pd.notna(x)])
            
            # 1. Parse Class Header
            kelas_match = re.search(r'Kelas\s+(IX\s*[A-Z]|VIII\s*[A-Z]|VII\s*[A-Z])', row_text)
            if kelas_match:
                current_kelas = kelas_match.group(1).replace(' ', ' ').strip()
                current_kelas = re.sub(r'\s+', ' ', current_kelas)
                
                if current_kelas not in classes_info:
                    classes_info[current_kelas] = {
                        'wali_kelas': None,
                        'students': {} # dict by NISN to avoid duplicates
                    }
                    
            # 2. Parse Wali Kelas
            wali_match = re.search(r'Wali Kelas\s+([A-Za-z\s\.,]+(?:S\.Pd|M\.Pd|S\.Sos|S\.Ag|S\.E|B\.A|M\.A|S\.T))', row_text)
            if wali_match and current_kelas:
                wali_name = wali_match.group(1).strip()
                if not classes_info[current_kelas]['wali_kelas']:
                    classes_info[current_kelas]['wali_kelas'] = wali_name
                    
            # 3. Parse Student Rows
            # Example format: 1 | 0104111922 / 232407001 | ALFIA NUR SYAHRA | P 
            # Or separate columns for NISN and NIS
            if current_kelas:
                row_vals = [str(x).strip().replace('.0', '') for x in row.values if pd.notna(x)]
                
                if len(row_vals) >= 3 and row_vals[0].isdigit() and 0 < int(row_vals[0]) < 60:
                    # check if the 2nd column has / (NISN / NIS)
                    nisn, nis, nama, gender = None, None, None, None
                    
                    if '/' in row_vals[1]:
                        parts = row_vals[1].split('/')
                        nisn = parts[0].strip()
                        nis = parts[1].strip()
                        nama = row_vals[2]
                        if len(row_vals) > 3 and row_vals[3] in ['L', 'P']:
                            gender = row_vals[3]
                        else:
                            gender = 'L' if 'L' in " ".join(row_vals[3:]) else 'P'
                    else:
                        # Assuming col 1 is NISN, col 2 is NIS, col 3 is Nama
                        if row_vals[1].isdigit() and row_vals[2].isdigit():
                            nisn = row_vals[1]
                            nis = row_vals[2]
                            nama = row_vals[3]
                            if len(row_vals) > 4 and row_vals[4] in ['L', 'P']:
                                gender = row_vals[4]
                            else:
                                gender = 'L' if 'L' in " ".join(row_vals[4:]) else 'P'
                        else:
                            # Might just be NIS or NISN in col 1, Name in col 2
                            nisn = row_vals[1]
                            nis = row_vals[1]
                            nama = row_vals[2]
                            if len(row_vals) > 3 and row_vals[3] in ['L', 'P']:
                                gender = row_vals[3]
                            else:
                                gender = 'L' if 'L' in " ".join(row_vals[3:]) else 'P'
                    
                    # Clean up
                    if len(nisn) > 20: nisn = nisn[:10]
                    if len(nis) > 20: nis = nis[:10]
                    
                    classes_info[current_kelas]['students'][nisn] = {
                        'nisn': nisn,
                        'nis': nis,
                        'name': nama,
                        'gender': gender
                    }

    # Filter only target classes
    target_classes = ["VII A", "VII B", "VIII A", "VIII B", "IX A", "IX B"]
    filtered_info = {k: v for k, v in classes_info.items() if k in target_classes}
    
    # Convert student dict back to list for JSON export
    for k in filtered_info:
        filtered_info[k]['students'] = list(filtered_info[k]['students'].values())
        
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(filtered_info, f, indent=2, ensure_ascii=False)
        
    print(f"Data successfully extracted to {output_path}")
    print(json.dumps({k: len(v['students']) for k, v in filtered_info.items()}, indent=2))

except Exception as e:
    print(f"Error: {e}")
