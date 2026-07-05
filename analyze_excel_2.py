import pandas as pd
import sys

file_path = r"C:\Users\ibnus\Downloads\1. Daftar Hadir dan Nilai Genap 2025 2026.xls"

try:
    try:
        xl = pd.ExcelFile(file_path, engine='xlrd')
    except Exception as e1:
        try:
            xl = pd.ExcelFile(file_path)
        except Exception as e2:
            # If it's HTML saved as .xls
            df_list = pd.read_html(file_path)
            for i, df in enumerate(df_list):
                print(f"=== TABLE: {i} ===")
                df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
                print(df.head(20).to_string(index=False, na_rep=''))
                print("\n" + "-"*50 + "\n")
            sys.exit(0)
            
    for sheet_name in xl.sheet_names:
        print(f"=== SHEET: {sheet_name} ===")
        df = xl.parse(sheet_name, header=None)
        df = df.dropna(how='all', axis=0)
        df = df.dropna(how='all', axis=1)
        print(df.head(20).to_string(index=False, na_rep=''))
        print("\n" + "-"*50 + "\n")
except Exception as e:
    print(f"Error reading excel file: {e}")
