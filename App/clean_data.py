#!/usr/bin/env python3
import json

print("Loading GeoJSON data...")
with open('USPS_Zip_Codes_enriched.geojson', 'r') as f:
    data = json.load(f)

print(f"Loaded {len(data['features'])} ZIP codes")

# Load ZIP to place mapping
zip_to_place = {}
try:
    with open('zcta_place_rel_10.txt', 'r') as f:
        lines = f.readlines()[1:]  # Skip header
        for line in lines:
            parts = line.strip().split('\t')
            if len(parts) >= 3:
                zcta = parts[0].strip()
                place_name = parts[2].strip()
                if zcta not in zip_to_place:
                    zip_to_place[zcta] = place_name
    print(f"Loaded {len(zip_to_place)} ZIP to place name mappings")
except:
    print("Warning: Could not load zcta_place_rel_10.txt")

# Collect stats
all_incomes = []
all_populations = []
all_values = []

for f in data['features']:
    props = f['properties']
    
    income = props.get('median_income', 0)
    if income > 0 and income < 10000000:
        all_incomes.append(income)
    
    pop = props.get('population', 0)
    if pop > 0:
        all_populations.append(pop)
    
    value = props.get('avg_value', 0)
    if value > 0:
        all_values.append(value)

# Calculate reasonable maximums (99th percentile)
all_incomes.sort()
all_populations.sort()
all_values.sort()

max_income = all_incomes[int(len(all_incomes) * 0.99)] if all_incomes else 200000
max_population = all_populations[int(len(all_populations) * 0.99)] if all_populations else 100000
max_value = all_values[int(len(all_values) * 0.99)] if all_values else 1000000

print(f"\nCalculated reasonable maximums:")
print(f"  Max income: ${max_income:,.0f}")
print(f"  Max population: {max_population:,.0f}")
print(f"  Max home value: ${max_value:,.0f}")

# Clean and enrich
cleaned = 0
enriched = 0

print("\nCleaning and enriching data...")
for f in data['features']:
    props = f['properties']
    zip_code = props.get('NAME', '') or props.get('zip', '')
    
    # Fix invalid incomes
    income = props.get('median_income', 0)
    if income < 0:
        props['median_income'] = 0
        cleaned += 1
        print(f"  Fixed income for ZIP {zip_code}: was {income}")
    elif income > max_income * 2:
        props['median_income'] = max_income
        cleaned += 1
        print(f"  Capped income for ZIP {zip_code}: was ${income:,.0f}")
    
    # Fix invalid populations
    pop = props.get('population', 0)
    if pop < 0:
        props['population'] = 0
        cleaned += 1
    elif pop > max_population * 3:
        props['population'] = max_population
        cleaned += 1
        print(f"  Capped population for ZIP {zip_code}: was {pop:,.0f}")
    
    # Fix invalid home values
    value = props.get('avg_value', 0)
    if value < 0:
        props['avg_value'] = 0
        cleaned += 1
    elif value > max_value * 3:
        props['avg_value'] = max_value
        cleaned += 1
        print(f"  Capped home value for ZIP {zip_code}: was ${value:,.0f}")
    
    # Add city/neighborhood from mapping
    if zip_code in zip_to_place:
        place_name = zip_to_place[zip_code]
        if not props.get('city'):
            props['city'] = place_name
            enriched += 1
        if not props.get('neighborhood'):
            props['neighborhood'] = place_name
            enriched += 1

print(f"\nCleaned {cleaned} invalid values")
print(f"Enriched {enriched} fields with place names")

# Save
print("\nSaving to USPS_Zip_Codes_enriched_CLEAN.geojson...")
with open('USPS_Zip_Codes_enriched_CLEAN.geojson', 'w') as f:
    json.dump(data, f)

print("✅ Done! Review the file and if it looks good, run:")
print("   mv USPS_Zip_Codes_enriched_CLEAN.geojson USPS_Zip_Codes_enriched.geojson")
