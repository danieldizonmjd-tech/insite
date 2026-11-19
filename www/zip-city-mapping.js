/**
 * ZIP Code to City Name Mapping for Atlanta Metro Area
 * 
 * This file provides city names for ZIP codes in the Atlanta metropolitan area.
 * Data sourced from USPS ZIP code database.
 * 
 * Usage:
 *   const cityName = ZIP_CITY_MAP['30301'] || 'Atlanta Metro';
 *   const zips = getZipsForCity('Alpharetta'); // Returns array of ZIP codes
 */

const ZIP_CITY_MAP = {
  // Atlanta Core
  '30301': 'Atlanta',
  '30302': 'Atlanta',
  '30303': 'Atlanta',
  '30304': 'Atlanta',
  '30305': 'Atlanta',
  '30306': 'Atlanta',
  '30307': 'Atlanta',
  '30308': 'Atlanta',
  '30309': 'Atlanta',
  '30310': 'Atlanta',
  '30311': 'Atlanta',
  '30312': 'Atlanta',
  '30313': 'Atlanta',
  '30314': 'Atlanta',
  '30315': 'Atlanta',
  '30316': 'Atlanta',
  '30317': 'Atlanta',
  '30318': 'Atlanta',
  '30319': 'Atlanta',
  '30320': 'Atlanta',
  '30321': 'Atlanta',
  '30322': 'Atlanta',
  '30324': 'Atlanta',
  '30325': 'Atlanta',
  '30326': 'Atlanta',
  '30327': 'Atlanta',
  '30328': 'Atlanta',
  '30329': 'Atlanta',
  '30330': 'Atlanta',
  '30331': 'Atlanta',
  '30332': 'Atlanta',
  '30333': 'Atlanta',
  '30334': 'Atlanta',
  '30336': 'Atlanta',
  '30337': 'Atlanta',
  '30338': 'Atlanta',
  '30339': 'Atlanta',
  '30340': 'Atlanta',
  '30341': 'Atlanta',
  '30342': 'Atlanta',
  '30343': 'Atlanta',
  '30344': 'Atlanta',
  '30345': 'Atlanta',
  '30346': 'Atlanta',
  '30348': 'Atlanta',
  '30349': 'Atlanta',
  '30350': 'Atlanta',
  '30353': 'Atlanta',
  '30354': 'Atlanta',
  '30355': 'Atlanta',
  '30356': 'Atlanta',
  '30357': 'Atlanta',
  '30358': 'Atlanta',
  '30359': 'Atlanta',
  '30360': 'Atlanta',
  '30361': 'Atlanta',
  '30362': 'Atlanta',
  '30363': 'Atlanta',
  '30364': 'Atlanta',
  '30366': 'Atlanta',
  '30368': 'Atlanta',
  '30369': 'Atlanta',
  '30370': 'Atlanta',
  '30371': 'Atlanta',
  '30374': 'Atlanta',
  '30375': 'Atlanta',
  '30377': 'Atlanta',
  '30378': 'Atlanta',
  '30380': 'Atlanta',
  '30384': 'Atlanta',
  '30385': 'Atlanta',
  '30388': 'Atlanta',
  '30392': 'Atlanta',
  '30394': 'Atlanta',
  '30396': 'Atlanta',
  '30398': 'Atlanta',
  '31106': 'Atlanta',
  '31107': 'Atlanta',
  '31119': 'Atlanta',
  '31126': 'Atlanta',
  '31131': 'Atlanta',
  '31136': 'Atlanta',
  '31139': 'Atlanta',
  '31141': 'Atlanta',
  '31145': 'Atlanta',
  '31146': 'Atlanta',
  '31150': 'Atlanta',
  '31156': 'Atlanta',
  '31192': 'Atlanta',
  '31193': 'Atlanta',
  '31195': 'Atlanta',
  '31196': 'Atlanta',
  '39901': 'Atlanta',

  // North Metro - Alpharetta, Johns Creek, Roswell, Milton
  '30004': 'Alpharetta',
  '30005': 'Alpharetta',
  '30009': 'Alpharetta',
  '30022': 'Alpharetta',
  '30023': 'Alpharetta',
  '30097': 'Johns Creek',
  '30098': 'Duluth',
  '30075': 'Roswell',
  '30076': 'Roswell',
  '30077': 'Roswell',
  '30350': 'Sandy Springs',
  '30328': 'Sandy Springs',
  '30342': 'Sandy Springs',
  '30004': 'Alpharetta',
  '30022': 'Alpharetta',
  '30024': 'Suwanee',
  '30040': 'Cumming',
  '30041': 'Cumming',
  '30028': 'Cumming',

  // East Metro - Decatur, Stone Mountain, Lithonia
  '30030': 'Decatur',
  '30031': 'Decatur',
  '30032': 'Decatur',
  '30033': 'Decatur',
  '30034': 'Decatur',
  '30035': 'Decatur',
  '30036': 'Decatur',
  '30037': 'Decatur',
  '30079': 'Scottdale',
  '30083': 'Stone Mountain',
  '30086': 'Stone Mountain',
  '30087': 'Stone Mountain',
  '30088': 'Stone Mountain',
  '30058': 'Lithonia',
  '30038': 'Lithonia',
  '30039': 'Snellville',
  '30078': 'Snellville',
  '30084': 'Tucker',
  '30085': 'Tucker',

  // Northeast - Gwinnett County
  '30002': 'Avondale Estates',
  '30011': 'Auburn',
  '30012': 'Conyers',
  '30013': 'Conyers',
  '30014': 'Covington',
  '30016': 'Covington',
  '30017': 'Grayson',
  '30019': 'Dacula',
  '30021': 'Clarkston',
  '30043': 'Lawrenceville',
  '30044': 'Lawrenceville',
  '30045': 'Lawrenceville',
  '30046': 'Lawrenceville',
  '30047': 'Lilburn',
  '30048': 'Lilburn',
  '30049': 'Lawrenceville',
  '30052': 'Loganville',
  '30071': 'Norcross',
  '30091': 'Norcross',
  '30092': 'Peachtree Corners',
  '30093': 'Norcross',
  '30094': 'Conyers',
  '30095': 'Duluth',
  '30096': 'Duluth',
  '30099': 'Duluth',
  '30515': 'Buford',
  '30517': 'Braselton',
  '30518': 'Buford',
  '30519': 'Buford',
  '30542': 'Flowery Branch',
  '30548': 'Hoschton',
  '30549': 'Jefferson',
  '30566': 'Oakwood',
  '30567': 'Pendergrass',

  // Cobb County
  '30060': 'Marietta',
  '30061': 'Marietta',
  '30062': 'Marietta',
  '30063': 'Marietta',
  '30064': 'Marietta',
  '30065': 'Marietta',
  '30066': 'Marietta',
  '30067': 'Marietta',
  '30068': 'Marietta',
  '30069': 'Marietta',
  '30080': 'Smyrna',
  '30081': 'Smyrna',
  '30082': 'Smyrna',
  '30126': 'Mableton',
  '30101': 'Acworth',
  '30102': 'Acworth',
  '30106': 'Austell',
  '30111': 'Clarkdale',
  '30127': 'Powder Springs',
  '30144': 'Kennesaw',
  '30152': 'Kennesaw',
  '30156': 'Kennesaw',
  '30168': 'Austell',

  // South Metro - Clayton, Henry, Fayette
  '30236': 'Jonesboro',
  '30237': 'Jonesboro',
  '30238': 'Jonesboro',
  '30260': 'Morrow',
  '30273': 'Rex',
  '30274': 'Riverdale',
  '30281': 'Stockbridge',
  '30287': 'Conley',
  '30288': 'Conley',
  '30291': 'Union City',
  '30294': 'Ellenwood',
  '30296': 'Fairburn',
  '30297': 'Forest Park',
  '30298': 'Forest Park',
  '30213': 'Fairburn',
  '30214': 'Fayetteville',
  '30215': 'Fayetteville',
  '30228': 'Hampton',
  '30233': 'Jackson',
  '30248': 'Locust Grove',
  '30250': 'Lovejoy',
  '30252': 'McDonough',
  '30253': 'McDonough',
  '30269': 'Peachtree City',
  '30270': 'Peachtree City',
  '30271': 'Newnan',
  '30272': 'Red Oak',
  '30276': 'Senoia',
  '30290': 'Tyrone',

  // West Metro - Douglas County
  '30122': 'Lithia Springs',
  '30134': 'Douglasville',
  '30135': 'Douglasville',
  '30154': 'Douglasville',
  '30133': 'Douglasville',
  '30187': 'Winston',
  '30180': 'Villa Rica',
  '30182': 'Waco',

  // Cherokee County
  '30107': 'Ball Ground',
  '30114': 'Canton',
  '30115': 'Canton',
  '30142': 'Holly Springs',
  '30183': 'Waleska',
  '30188': 'Woodstock',
  '30189': 'Woodstock',

  // Forsyth County
  '30028': 'Cumming',
  '30040': 'Cumming',
  '30041': 'Cumming',

  // Bartow County
  '30103': 'Adairsville',
  '30120': 'Cartersville',
  '30121': 'Cartersville',
  '30137': 'Emerson',
  '30139': 'Fairmount',
  '30145': 'Kingston',
  '30178': 'Taylorsville',
  '30184': 'White',

  // Paulding County
  '30132': 'Dallas',
  '30141': 'Hiram',
  '30157': 'Dallas',

  // Rockdale/Newton
  '30012': 'Conyers',
  '30013': 'Conyers',
  '30014': 'Covington',
  '30016': 'Covington',
  '30094': 'Conyers',

  // Walton County
  '30052': 'Loganville',
  '30025': 'Social Circle',
  '30055': 'Mansfield',
  '30056': 'Monroe',

  // Additional areas
  '30008': 'Marietta',
  '30339': 'Atlanta',
  '30080': 'Smyrna',
  '30324': 'Atlanta',
  '30346': 'Atlanta',
  '30360': 'Atlanta',

  // Dekalb
  '30002': 'Avondale Estates',
  '30021': 'Clarkston',
  '30079': 'Scottdale',
  '30083': 'Stone Mountain',
  '30084': 'Tucker',
  '30087': 'Stone Mountain',
  '30088': 'Stone Mountain',

  // Hall County
  '30501': 'Gainesville',
  '30504': 'Gainesville',
  '30506': 'Gainesville',
  '30507': 'Gainesville',

  // Barrow County
  '30620': 'Bethlehem',
  '30680': 'Winder',

  // Jackson County
  '30549': 'Jefferson',

  // Butts County
  '30233': 'Jackson',

  // Spalding County
  '30223': 'Griffin',
  '30224': 'Griffin',

  // Coweta County
  '30263': 'Newnan',
  '30265': 'Newnan',
  '30276': 'Senoia',
  '30277': 'Sharpsburg',

  // Carroll County
  '30116': 'Carrollton',
  '30117': 'Carrollton',
  '30118': 'Carrollton',

  // Additional Metro Atlanta ZIP Codes
  '30054': 'Oxford',
  '30072': 'Pine Lake',
  '30104': 'Aragon',
  '30108': 'Bowdon',
  '30110': 'Bremen',
  '30143': 'Jasper',
  '30148': 'Marble Hill',
  '30153': 'Rockmart',
  '30161': 'Rome',
  '30170': 'Roopville',
  '30171': 'Rydal',
  '30175': 'Talking Rock',
  '30177': 'Tate',
  '30179': 'Temple',
  '30185': 'Whitesburg',
  '30205': 'Brooks',
  '30220': 'Grantville',
  '30234': 'Jenkinsburg',
  '30249': 'Locust Grove',
  '30259': 'Moreland',
  '30267': 'Palmetto',
  '30268': 'Palmetto',
  '30292': 'Williamson',
  '30534': 'Dawsonville',
  '30650': 'Madison',
  '30655': 'Monroe',
  '30656': 'Monroe',
  '30662': 'Rutledge',
  '30666': 'Statham',
  '30734': 'Calhoun'
};

// ============================================
// REVERSE LOOKUP: City Name -> ZIP Codes
// ============================================
const CITY_TO_ZIPS = {};

// Build the reverse lookup automatically from ZIP_CITY_MAP
(function buildCityToZipsMap() {
  for (const [zip, city] of Object.entries(ZIP_CITY_MAP)) {
    const cityLower = city.toLowerCase();
    if (!CITY_TO_ZIPS[cityLower]) {
      CITY_TO_ZIPS[cityLower] = [];
    }
    if (!CITY_TO_ZIPS[cityLower].includes(zip)) {
      CITY_TO_ZIPS[cityLower].push(zip);
    }
  }
})();

/**
 * Get city name for a ZIP code
 * @param {string} zipCode - The ZIP code to look up
 * @returns {string} City name or 'Atlanta Metro' if not found
 */
function getCityName(zipCode) {
  return ZIP_CITY_MAP[zipCode] || 'Atlanta Metro';
}

/**
 * Get all ZIP codes for a city
 * @param {string} cityName - The city name to look up
 * @returns {string[]} Array of ZIP codes for the city
 */
function getZipsForCity(cityName) {
  if (!cityName) return [];
  const cityLower = cityName.toLowerCase().trim();
  return CITY_TO_ZIPS[cityLower] || [];
}

/**
 * Check if a string is a city name (vs a ZIP code)
 * @param {string} input - The input to check
 * @returns {boolean} True if it's a known city name
 */
function isCityName(input) {
  if (!input) return false;
  const inputLower = input.toLowerCase().trim();
  return CITY_TO_ZIPS.hasOwnProperty(inputLower);
}

/**
 * Search for cities matching partial input
 * @param {string} partial - Partial city name
 * @returns {string[]} Array of matching city names
 */
function searchCities(partial) {
  if (!partial) return [];
  const partialLower = partial.toLowerCase().trim();
  const matches = [];
  const seen = new Set();
  
  for (const city of Object.keys(CITY_TO_ZIPS)) {
    if (city.includes(partialLower) && !seen.has(city)) {
      // Return properly capitalized city name
      const properCity = ZIP_CITY_MAP[CITY_TO_ZIPS[city][0]];
      matches.push(properCity);
      seen.add(city);
    }
  }
  
  return matches.sort();
}

/**
 * Get all unique city names
 * @returns {string[]} Array of all unique city names
 */
function getAllCities() {
  const seen = new Set();
  const cities = [];
  
  for (const city of Object.values(ZIP_CITY_MAP)) {
    if (!seen.has(city.toLowerCase())) {
      cities.push(city);
      seen.add(city.toLowerCase());
    }
  }
  
  return cities.sort();
}

/**
 * Format display string: "ZIP - City" or "City (X ZIP codes)"
 * @param {string} zipOrCity - ZIP code or city name
 * @returns {string} Formatted display string
 */
function formatLocationDisplay(zipOrCity) {
  if (!zipOrCity) return '';
  
  // If it's a ZIP code
  if (/^\d{5}$/.test(zipOrCity)) {
    const city = getCityName(zipOrCity);
    return `${zipOrCity} - ${city}`;
  }
  
  // If it's a city name
  if (isCityName(zipOrCity)) {
    const zips = getZipsForCity(zipOrCity);
    if (zips.length === 1) {
      return `${zipOrCity} (${zips[0]})`;
    }
    return `${zipOrCity} (${zips.length} ZIP codes)`;
  }
  
  return zipOrCity;
}

/**
 * Get neighborhood/area name for a ZIP code
 * Falls back to city name if no specific neighborhood
 * @param {string} zipCode - The ZIP code to look up
 * @returns {string} Neighborhood or city name
 */
function getNeighborhoodName(zipCode) {
  // For now, return city name as neighborhood
  // This can be expanded with more specific neighborhood data
  return ZIP_CITY_MAP[zipCode] || `Area ${zipCode}`;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ZIP_CITY_MAP, 
    CITY_TO_ZIPS,
    getCityName, 
    getZipsForCity,
    isCityName,
    searchCities,
    getAllCities,
    formatLocationDisplay,
    getNeighborhoodName 
  };
}
