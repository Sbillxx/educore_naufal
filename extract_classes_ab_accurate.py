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
        
        current_kelas = None
        current_wali = None
        
        # Iterate over all rows to catch every header block
        for idx, row in df.iterrows():
            row_text = " ".join([str(x) for x in row.values if pd.notna(x)])
            
            # Check for a new Kelas declaration in the row
            kelas_match = re.search(r'Kelas\s+(IX\s*[A-Z]|VIII\s*[A-Z]|VII\s*[A-Z])', row_text)
            if kelas_match:
                current_kelas = kelas_match.group(1).replace(' ', ' ').strip()
                # Remove extra spaces inside the class name just in case (e.g. "VII  B" -> "VII B")
                current_kelas = re.sub(r'\s+', ' ', current_kelas)
                
                if current_kelas not in classes_info:
                    classes_info[current_kelas] = {'students': 0, 'wali_kelas': None}
                    
            # Check for Wali Kelas
            wali_match = re.search(r'Wali Kelas\s+([A-Za-z\s\.,]+(?:S\.Pd|M\.Pd|S\.Sos|S\.Ag|S\.E|B\.A|M\.A|S\.T))', row_text)
            if wali_match and current_kelas:
                wali_name = wali_match.group(1).strip()
                # Update wali kelas only if it hasn't been set to prevent overwriting with nonsense
                if not classes_info[current_kelas]['wali_kelas'] or len(wali_name) > 5:
                    classes_info[current_kelas]['wali_kelas'] = wali_name
                    
            # Check if this row is a student
            row_vals = [str(x).strip() for x in row.values if pd.notna(x)]
            if len(row_vals) >= 3 and current_kelas:
                first_col = row_vals[0].replace('.0', '')
                # A student row usually starts with a number 1 to 50
                if first_col.isdigit() and 0 < int(first_col) < 60:
                    # check if the second or third column looks like a name or NISN
                    if re.search(r'\d{8}', " ".join(row_vals)) or len(row_vals[2]) > 3:
                        classes_info[current_kelas]['students'] += 1

    # Filter only A and B classes for output
    target_classes = ["VII A", "VII B", "VIII A", "VIII B", "IX A", "IX B"]
    
    filtered_info = {k: v for k, v in classes_info.items() if k in target_classes}
    print(json.dumps(filtered_info, indent=2))

except Exception as e:
    print(f"Error: {e}")
