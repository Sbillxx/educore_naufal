import pandas as pd
import json

file_path = r"C:\Users\ibnus\OneDrive\Documents\vscode\js\educore_naufal\Latihan_Rumus_HLOOKUP_Super_Lengkap.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    output = {}
    
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        
        # Get basic info
        output[sheet_name] = {
            "columns": list(df.columns),
            "num_rows": len(df),
            "sample_data": df.head(3).to_dict(orient="records")
        }
        
    print(json.dumps(output, indent=2, default=str))
except Exception as e:
    print(f"Error reading excel file: {e}")
