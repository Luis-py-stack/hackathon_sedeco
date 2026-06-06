import pandas as pd
from pathlib import Path

csv_path = Path("backend/data/numeralia_final.csv")
if csv_path.exists():
    df = pd.read_csv(csv_path)
    print("Conteo de registros por TIPO_POSTE:")
    print(df['TIPO_POSTE'].value_counts(dropna=False))
    
    # Revisar cámaras y postes
    if 'NUMCAMS' in df.columns:
        print("\nSuma de Cámaras (NUMCAMS) por TIPO_POSTE:")
        print(df.groupby('TIPO_POSTE')['NUMCAMS'].sum())
    else:
        print("\nLa columna NUMCAMS no existe.")
else:
    print("CSV no encontrado")
