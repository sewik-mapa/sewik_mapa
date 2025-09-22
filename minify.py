import json
import os
from pathlib import Path

def minify_geojson_files(directory_path="deckgl_viz\\data"):
    """
    Minify all .geojson files in the specified directory by removing unnecessary whitespace.
    
    Args:
        directory_path (str): Path to the directory containing .geojson files
    """
    # Convert to Path object for easier handling
    dir_path = Path(directory_path)
    
    if not dir_path.exists():
        print(f"Directory {directory_path} does not exist!")
        return
    
    # Find all .geojson files
    geojson_files = list(dir_path.glob("*.geojson"))
    
    if not geojson_files:
        print(f"No .geojson files found in {directory_path}")
        return
    
    print(f"Found {len(geojson_files)} .geojson files to minify...")
    
    for file_path in geojson_files:
        try:
            # Read the original file
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            # Get original file size
            original_size = file_path.stat().st_size
            
            # Write minified version (no indentation, no separators with spaces)
            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, separators=(',', ':'), ensure_ascii=False)
            
            # Get new file size
            new_size = file_path.stat().st_size
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"✓ Minified {file_path.name}: {original_size:,} → {new_size:,} bytes ({reduction:.1f}% reduction)")
            
        except json.JSONDecodeError as e:
            print(f"✗ Error parsing {file_path.name}: {e}")
        except Exception as e:
            print(f"✗ Error processing {file_path.name}: {e}")

def minify_specific_file(file_path):
    """
    Minify a specific GeoJSON file.
    
    Args:
        file_path (str): Path to the specific .geojson file
    """
    file_path = Path(file_path)
    
    if not file_path.exists():
        print(f"File {file_path} does not exist!")
        return
    
    if file_path.suffix.lower() != '.geojson':
        print(f"File {file_path} is not a .geojson file!")
        return
    
    try:
        # Read the original file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Get original file size
        original_size = file_path.stat().st_size
        
        # Write minified version
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, separators=(',', ':'), ensure_ascii=False)
        
        # Get new file size
        new_size = file_path.stat().st_size
        reduction = ((original_size - new_size) / original_size) * 100
        
        print(f"✓ Minified {file_path.name}: {original_size:,} → {new_size:,} bytes ({reduction:.1f}% reduction)")
        
    except json.JSONDecodeError as e:
        print(f"✗ Error parsing {file_path.name}: {e}")
    except Exception as e:
        print(f"✗ Error processing {file_path.name}: {e}")

if __name__ == "__main__":
    # Minify all .geojson files in the default directory
    minify_geojson_files()
    
    # Or minify the specific file you mentioned
    # minify_specific_file("deckgl_viz\\data\\accidents_2022_OPOLSKIE.geojson")