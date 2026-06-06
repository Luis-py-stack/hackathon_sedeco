import pandas as pd
from pathlib import Path

csv_path = Path("backend/data/numeralia_final.csv")
if csv_path.exists():
    df = pd.read_csv(csv_path, low_memory=False)
    
    print("Muestra de ID_BCT_O y TIPO_POSTE:")
    print(df[['ID_BCT_O', 'TIPO_POSTE']].head(10))
    
    dupes_count = df.duplicated(subset=['ID_BCT_O']).sum()
    print(f"\nTotal de registros duplicados por ID_BCT_O: {dupes_count}")
    
    print("\n¿Hay IDs nulos?")
    print(df['ID_BCT_O'].isna().sum())
    
    print("\nConteo por TIPO_POSTE antes de dedup:")
    print(df['TIPO_POSTE'].value_counts())
    
    df_dedup = df.drop_duplicates(subset=['ID_BCT_O'])
    print("\nConteo por TIPO_POSTE después de dedup:")
    print(df_dedup['TIPO_POSTE'].value_counts())
else:
    print("CSV no encontrado")
