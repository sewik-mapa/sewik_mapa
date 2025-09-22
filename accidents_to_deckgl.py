# Skrypt do przygotowania danych do strony opartej na Deck GL
# Script for Deck GL based website data preparation

import pandas as pd
import geopandas as gpd
import json
from datetime import datetime
from shapely.geometry import Point
import os

vehicle_types = { # RODZAJ_POJAZDU
    "IS01": "Rower",                  # Rower
    "IS02": "Motorower",              # Motorower
    "IS03": "Motocykl",               # Motocykl
    "IS04": "Samochód osobowy",       # Samochód osobowy z przyczepą 
    "IS05": "Samochód osobowy",       # Samochód osobowy bez przyczepy 
    "IS06": "Samochód osobowy",       # Samochód osobowy TAXI
    "IS07": "Autobus",                # Autobus komunikacji publicznej 
    "IS08": "Autobus",                # Autobus inny
    "IS09": "Samochód ciężarowy",     # Samochód ciężarowy do przewozu ładunków z przyczepą
    "IS10": "Samochód ciężarowy",     # Samochód ciężarowy do przewozu ładunków bez przyczepy
    "IS11": "Samochód ciężarowy",     # Samochód ciężarowy do przewozu osób 
    "IS12": "Ciągnik rolniczy",       # Ciągnik rolniczy z przyczepą
    "IS13": "Ciągnik rolniczy",       # Ciągnik rolniczy bez przyczepy 
    "IS14": "Ciągnik rolniczy",       # Pojazd wolnobieżny
    "IS15": "Tramwaj/trolejbus",      # Tramwaj
    "IS16": "Trolejbus",              # Trolejbus
    "IS17": "Pojazd zaprzęgowy",      # Pojazd zaprzęgowy
    "IS18": "Pociąg",                 # Pociąg
    "IS19": "Pojazd uprzywilejowany", # Pojazd uprzywilejowany
    "IS20": "Inny",                   # Inny pojazd
    "IS21": "Samochód osobowy",       # Samochód osobowy
    "IS22": "Ciągnik rolniczy",       # Ciągnik rolniczy
    "IS23": "Tramwaj/trolejbus",      # Tramwaj, trolejbus
    "IS25": "Nieustalony",            # Nieustalony
    "IS26": "Pojazd mat. niebezp.",   # Pojazd przewożący materiały niebezpieczne
    "IS27": "Motocykl",               # Motocykl o poj. do 125 cm3 ( do 11 kW/0,1 KW/kg) (od 11.2015) 
    "IS28": "Motocykl",               # Motocykl inny (od 11.2015)
    "IS29": "Quad",                   # Czterokołowiec lekki (od 11.2015) 
    "IS30": "Quad",                   # Czterokołowiec (od 11.2015)
    "IS31": "Samochód ciężarowy",     # Samochód ciężarowy do 3,5 T (od 11.2015)
    "IS32": "Samochód ciężarowy",     # Samochód ciężarowy powyżej 3,5 T (od 11.2015)
    "IS101": "Rower",                 # Rower (od 2015-11-01)
    "IS102": "Motorower",             # Motorower (od 2015-11-01)
    "IS107": "Autobus",               # Autobus komunikacji publicznej (od 2015-11-01)
    "IS108": "Autobus",               # Autobus inny (od 2015-11-01) 
    "IS118": "Pociąg",                # Pociąg (od 2015-11-01)
    "IS120": "Inny",                  # Inny (od 2015-11-01)
    "IS121": "Samochód osobowy",      # Samochód osobowy (od 2015-11-01) 
    "IS122": "Ciągnik rolniczy",      # Ciągnik rolniczy (od 2015-11-01) 
    "IS123": "Tramwaj/trolejbus",     # Tramwaj, trolejbus (od 2015-11-01) 
    "IS125": "Nieustalony",           # Pojazd nieustalony (od 2015-11-01)
    "IS127": "Motocykl",              # Motocykl o poj. do 125 cm3 ( do 11 kw/0,1 KW/kg) (od 2015-11-01) 
    "IS128": "Motocykl",              # Motocykl inny (od 2015-11-01)
    "IS129": "Quad",                  # Czterokołowiec lekki (od 2015.11-01) 
    "IS130": "Quad",                  # Czterokołowiec (od 2015-11-01)
    "IS131": "Samochód ciężarowy",    # Samochód ciężarowy DMC do 3,5 T (od 2015-11-01)
    "IS132": "Samochód ciężarowy",    # Samochód ciężarowy DMC powyżej 3,5 T (od 2015-11-01)
    "IS208": "Autobus",               # Autobus inny",
    "IS207": "Autobus",               # Autobus komunikacji publicznej",
    "IS222": "Ciągnik rolniczy",      # Ciągnik rolniczy",
    "IS230": "Quad",                  # Czterokołowiec",
    "IS229": "Quad",                  # Czterokołowiec lekki",
    "IS240": "Hulajnoga elektryczna", # Hulajnoga elektryczna",
    "IS220": "Inny",                  # Inny",
    "IS228": "Motocykl",              # Motocykl inny",
    "IS227": "Motocykl",              # Motocykl o poj. do 125 cm3",
    "IS202": "Motorower",             # Motorower",
    "IS218": "Pociąg",                # Pociąg",
    "IS225": "Nieustalony",           # Pojazd nieustalony",
    "IS201": "Rower",                 # Rower",
    "IS231": "Samochód ciężarowy",    # Samochód ciężarowy DMC do 3,5 T",
    "IS232": "Samochód ciężarowy",    # Samochód ciężarowy DMC powyżej 3,5 T",
    "IS241": "UTO",                   # Urządzenie transportu osobistego",
    "IS221": "Samochód osobowy",      # Samochód osobowy",
    "IS223": "Tramwaj/trolejbus",     # Tramwaj, trolejbus",
}

user_types = {
    "K": "kierujący",
    "P": "pasażer",
    "I": "pieszy",
    "O": "UWR"
}

severity_mapping = {"RL": 1, "RC": 2, "ZC": 3, "ZM": 3}
severity_colors = {
    0 : [128, 128, 128, 160],    # Damage only
    1 : [255, 255, 0, 160],    # Slight
    2: [255, 165, 0, 160],   # Serious  
    3: [255, 0, 0, 160]       # Fatal
}

woj_mapping = {
    "DOLNOŚLĄSKIE": 2,
    "KUJAWSKO-POMORSKIE": 4,
    "LUBELSKIE": 6,
    "LUBUSKIE": 8,
    "ŁÓDZKIE": 10,
    "MAŁOPOLSKIE": 12,
    "MAZOWIECKIE": 14,
    "OPOLSKIE": 16,
    "PODKARPACKIE": 18,
    "PODLASKIE": 20,
    "POMORSKIE": 22,
    "ŚLĄSKIE": 24,
    "ŚWIĘTOKRZYSKIE": 26,
    "WARMIŃSKO-MAZURSKIE": 28,
    "WIELKOPOLSKIE": 30,
    "ZACHODNIOPOMORSKIE": 32
}

def convert_accidents_for_deckgl():
    """Convert SEWIK accidents data to deck.gl compatible GeoJSON format by year and voivodeship"""
    print("Loading accident data...")
    df = pd.read_csv('csv/sewik_accidents_v3.csv', low_memory=False)
    print(f"Loaded {len(df):,} accidents")
    
    # Filter out rows without valid coordinates and unrealistic coordinates
    # Poland's longitude range: approximately 14° to 24° E
    # Poland's latitude range: approximately 49° to 55° N
    before_filter = len(df)
    df = df.dropna(subset=['lon', 'lat'])
    print(f"Filtered to {len(df):,} accidents with valid coordinates ({before_filter - len(df):,} removed)")
    
    df["WOJ"] = df["WOJ"].map(woj_mapping)

    # Convert date columns
    df['DATA_ZDARZENIA'] = pd.to_datetime(df['DATA_ZDARZENIA'], errors='coerce')
    df['yr'] = df['DATA_ZDARZENIA'].dt.year
    df['month'] = df['DATA_ZDARZENIA'].dt.month
    df['day'] = df['DATA_ZDARZENIA'].dt.day
    df['dt'] = df["DATA_ZDARZENIA"]
    
    # Load participants
    participants_df = pd.read_csv("csv/sewik_participants.csv")
    participants_df["severity"] = participants_df['STUC_KOD'].map(severity_mapping, na_action='ignore')
    participants_df['severity'] = participants_df['severity'].fillna(0)
    participants_df['severity'] = participants_df['severity'].astype(int)

    vehicles_df = pd.read_csv("csv/sewik_vehicles.csv")
    vehicles_df['ID'] = vehicles_df['ID'].astype(int)
    participants_df = participants_df.merge(vehicles_df[["ID", "RODZAJ_POJAZDU"]], left_on="ZSPO_ID", right_on="ID", suffixes=["", "_pojazdu"], how="left")

    participants_by_severity_df = pd.DataFrame(participants_df[["ZSZD_ID", "severity", "ID"]].groupby(["ZSZD_ID", "severity"]).count())
    participants_by_severity_df = participants_by_severity_df.rename({"ID": "count"}, axis=1)
    participants_by_severity_df = participants_by_severity_df.reset_index().pivot(index="ZSZD_ID", columns="severity", values="count").fillna(0).astype(int)
    
    participants_df["POJAZD"] = participants_df["RODZAJ_POJAZDU"].map(vehicle_types)
    
    if len(participants_df.loc[participants_df["POJAZD"].isna(), "RODZAJ_POJAZDU"].unique()) > 1:
        print(Warning(f"Some vehicle types were not properly mapped: {participants_df.loc[participants_df["POJAZD"].isna(), "RODZAJ_POJAZDU"].unique().tolist()}"))

    # participants by type - ROW, MOT, PIE, UTO 
    participants_df["row"] = -1
    participants_df["mot"] = -1
    participants_df["pie"] = -1
    participants_df["uto"] = -1
    participants_df["uwr"] = -1
    
    participants_df.loc[participants_df["POJAZD"] == "Rower", "row"] = participants_df["severity"]
    participants_df.loc[participants_df["POJAZD"] == "Motocykl", "mot"] = participants_df["severity"]
    participants_df.loc[participants_df["SSRU_KOD"] == "I", "pie"] = participants_df["severity"]
    participants_df.loc[participants_df["POJAZD"] == "UTO", "uto"] = participants_df["severity"]
    participants_df.loc[participants_df["SSRU_KOD"] == "O", "UWR"] = participants_df["severity"]

    vulnerable_participants_df = participants_df[["ZSZD_ID", "row", "mot", "pie", "uto", "uwr"]].groupby(["ZSZD_ID"]).max()

    # Create severity categories based on participants
    df = df.merge(participants_by_severity_df, left_on="ID", right_index=True)
    df = df.merge(vulnerable_participants_df, left_on="ID", right_index=True)
    df["sev"] = 0
    df.loc[df[1] > 0, "sev"] = 1
    df.loc[df[2] > 0, "sev"] = 2
    df.loc[df[3] > 0, "sev"] = 3
    
    # Add color column
    df['c'] = df['sev'].map(severity_colors)
    df = df.rename({0: "dmg", 1: "sli", 2: "ser", 3: "fat"}, axis=1)

    df[["lon", "lat"]] = df[["lon", "lat"]].round(6)

    # Create output directory
    output_dir = 'deckgl_viz/data'
    os.makedirs(output_dir, exist_ok=True)
    
    # Select only essential columns for visualization
    essential_columns = [
        'ID', 'lon', 'lat', 'yr', 'dt', 'WOJ', 'sev',
        'c', 'dmg', 'sli', 'ser', 'fat',
         "row", "mot", "pie", "uto", "uwr" #'WSP_GPS_X', 'WSP_GPS_Y', 'GPS_X_GUS', 'GPS_Y_GUS',
        #'JEDNOSTKA_OPERATORA', 'JEDNOSTKA_LIKWIDUJACA', 'JEDNOSTKA_MIEJSCA',
        #'ULICA_ADRES', 'NUMER_DOMU'
        ]
    
    # Add important optional columns if they exist
    optional_columns = {
        # 'DATA_ZDARZENIA': 'date',
        # 'MIEJSCOWOSC': 'city',
        # 'LIC_ZABITYCH': 'fatalities',
        # 'LIC_RANNYCH': 'injuries'
    }
    
    # Build final column list with only available columns
    viz_columns = essential_columns.copy()
    
    for col in optional_columns.keys():
        if col in df.columns:
            viz_columns.append(col)
    
    # Create the visualization dataset
    viz_df = df[viz_columns].copy()
    
    # Get unique years and voivodeships
    years = sorted(viz_df['yr'].dropna().unique())
    voivodeships = list(woj_mapping.keys())
    
    print(f"Creating GeoJSON files for {len(years)} years and {len(voivodeships)} voivodeships...")
    
    file_index = []
    total_files = 0
    
    # Create GeoJSON for each year and voivodeship combination
    for year in years:
        year_data = viz_df[viz_df['yr'] == year]
        
        for voivodeship in voivodeships:
            subset = year_data[year_data['WOJ'] == woj_mapping[voivodeship]]
            if len(subset) == 0:
                continue
                
            # Create GeoDataFrame with Point geometries
            geometry = [Point(xy) for xy in zip(subset['lon'], subset['lat'])]
            gdf = gpd.GeoDataFrame(
                subset.drop(['lon', 'lat'], axis=1), 
                geometry=geometry, 
                crs='EPSG:4326')
            
            filename = f"accidents_{int(year)}_{voivodeship}.geojson"
            filepath = os.path.join(output_dir, filename)
            
            # Save as GeoJSON
            gdf.to_file(filepath, driver='GeoJSON')
            
            file_info = {
                'filename': filename,
                'year': int(year),
                'voivodeship': voivodeship,
                'accident_count': len(subset),
                'severity_distribution': subset['sev'].value_counts().to_dict()
            }
            file_index.append(file_info)
            total_files += 1
            
            if total_files % 50 == 0:
                print(f"Created {total_files} files...")
    
    # Create index file
    index_file = os.path.join(output_dir, 'file_index.json')
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(file_index, f, ensure_ascii=False, indent=2)
    
    # Create metadata
    metadata = {
        'total_accidents': len(viz_df),
        'total_files': total_files,
        'years': [int(y) for y in years],
        'voivodeships': woj_mapping,
        'date_range': {
            'min_year': int(viz_df['yr'].min()) if not pd.isna(viz_df['yr'].min()) else None,
            'max_year': int(viz_df['yr'].max()) if not pd.isna(viz_df['yr'].max()) else None
        },
        'coordinates_range': {
            'lon': [float(viz_df['lon'].min()), float(viz_df['lon'].max())],
            'lat': [float(viz_df['lat'].min()), float(viz_df['lat'].max())]
        },
        'severity_counts': viz_df['sev'].value_counts().to_dict(),
        'generated_at': datetime.now().isoformat(),
        'format': 'GeoJSON',
        'structure': 'year_voivodeship'
    }
    
    metadata_file = 'deckgl_viz/metadata.json'
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"\nConversion complete!")
    print(f"- Created {total_files} GeoJSON files in {output_dir}")
    print(f"- File index: {index_file}")
    print(f"- Metadata: {metadata_file}")
    print(f"\nOverall severity distribution:")
    for severity, count in viz_df['sev'].value_counts().items():
        print(f"  {severity}: {count:,}")
    print(f"\nYears: {min(years)} - {max(years)}")
    print(f"Voivodeships: {len(voivodeships)}")

if __name__ == "__main__":
    convert_accidents_for_deckgl()
