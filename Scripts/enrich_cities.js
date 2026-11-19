const fs = require('fs');
const readline = require('readline');

async function enrichZipCodesWithCities() {
  // Read USPS ZIP codes GeoJSON
  console.log('Reading USPS ZIP codes GeoJSON...');
  const uspsPath = './USPS_Zip_Codes_enriched.geojson';
  const uspsData = JSON.parse(fs.readFileSync(uspsPath, 'utf-8'));

  // Build a ZIP -> City mapping from CSV
  console.log('Building ZIP to City mapping from CSV...');
  const zipToCityMap = {};
  
  const fileStream = fs.createReadStream('./property_value_by_zipcode.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    if (lineNumber === 1) continue; // Skip header
    
    const parts = line.split(',');
    if (parts.length < 7) continue;
    
    const regionName = parts[2];
    const regionType = parts[3];
    const city = parts[6];
    
    // Only process ZIP codes
    if (regionType === 'zip' && regionName && city) {
      const zip = regionName.trim();
      const cityName = city.trim().replace(/^"|"$/g, '');
      
      // Map ZIP to city (use first city found)
      if (!zipToCityMap[zip]) {
        zipToCityMap[zip] = cityName;
      }
    }
    
    if (lineNumber % 10000 === 0) {
      console.log(`  Processed ${lineNumber} lines, found ${Object.keys(zipToCityMap).length} unique ZIP codes...`);
    }
  }

  console.log(`Found ${Object.keys(zipToCityMap).length} ZIP codes with city mappings`);

  // Enrich the GeoJSON features
  console.log('Enriching GeoJSON features...');
  let enrichedCount = 0;
  
  for (const feature of uspsData.features) {
    const zip = feature.properties.NAME;
    if (zip && zipToCityMap[zip]) {
      feature.properties.city = zipToCityMap[zip];
      enrichedCount++;
    }
  }

  console.log(`Enriched ${enrichedCount} features with city names`);

  // Write enriched GeoJSON
  console.log('Writing enriched GeoJSON...');
  fs.writeFileSync(uspsPath, JSON.stringify(uspsData, null, 2));
  console.log(`✅ Wrote enriched GeoJSON to ${uspsPath}`);
  
  // Log some sample enrichments
  console.log('\nSample enriched ZIP codes:');
  let samples = 0;
  for (const feature of uspsData.features) {
    if (feature.properties.city && samples < 10) {
      console.log(`  ZIP ${feature.properties.NAME}: ${feature.properties.city}`);
      samples++;
    }
  }
}

enrichZipCodesWithCities().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
