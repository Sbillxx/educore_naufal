import pandas as pd

file_path = r"C:\Users\ibnus\OneDrive\Documents\vscode\js\educore_naufal\Latihan_Rumus_HLOOKUP_Super_Lengkap.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    
    for sheet_name in xl.sheet_names:
        print(f"=== SHEET: {sheet_name} ===")
        # Read without headers to get everything
        df = xl.parse(sheet_name, header=None)
        
        # Drop completely empty rows and columns
        df = df.dropna(how='all', axis=0)
        df = df.dropna(how='all', axis=1)
        
        # Print top 15 rows for inspection
        print(df.head(15).to_string(index=False, na_rep=''))
        print("\n" + "-"*50 + "\n")
        
except Exception as e:
    print(f"Error reading excel file: {e}")
