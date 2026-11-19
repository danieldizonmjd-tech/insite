/**
 * InSite AWS S3 Storage Configuration
 * 
 * This file provides easy access to all S3-hosted data files.
 * Include this in your HTML: <script src="aws-s3-config.js"></script>
 */

const INSITE_S3_CONFIG = {
  // Base URL for all S3 storage files
  // Change this to your S3 bucket URL after setup
  BASE_URL: 'https://insite-data-storage.s3.amazonaws.com',
  
  // Alternative: Region-specific URL (faster)
  // BASE_URL: 'https://insite-data-storage.s3.us-east-1.amazonaws.com',
  
  /**
   * Get full URL for an S3 storage file
   * @param {string} path - Path relative to bucket root
   * @returns {string} Full URL
   */
  getUrl(path) {
    return `${this.BASE_URL}/${path}`;
  },
  
  // ========================================
  // ZIP CODE DATA
  // ========================================
  ZIP_CODES: {
    GEORGIA_ENRICHED: 'georgia_zipcodes_enriched.geojson',
    USPS_CLEAN: 'USPS_Zip_Codes_enriched_CLEAN.geojson'
  },
  
  // ========================================
  // PARKS & GREEN SPACE
  // ========================================
  PARKS: {
    ATLANTA: 'Data/City_of_Atlanta_Parks.geojson',
    CLAYTON_COUNTY: 'Data/Clayton_County_Parks_GIS_Data_Hub_View_-3551702834637191446.geojson',
    CANTON: 'Data/City_of_Canton_Parks_-7877689035609234937.geojson',
    BALL_GROUND: 'Data/Ball_Ground_Parks.geojson',
    PARK_BOUNDARY: 'Data/Park_Boundary.geojson',
    PARKS_LAYER: 'Data/Parks_Layer.geojson',
    PARKS_GENERAL: 'Data/Parks.geojson',
    GREENSPACE_ATLANTA: 'Data/Greenspace_in_Atlanta_Region_(Public_View_Layer)_-6578209153742607418.geojson'
  },
  
  // ========================================
  // TRANSIT DATA
  // ========================================
  TRANSIT: {
    // MARTA
    MARTA_ROUTES: 'Data/MARTA_Routes.geojson',
    MARTA_STATIONS: 'Data/MARTA_Rail_Stations_-5376950773288451707.geojson',
    
    // MARTA Bus Routes (NEW)
    MARTA_BUS_ROUTES: 'Data/MARTA_Bus_Routes.geojson',
    MARTA_BUS_STOPS: 'Data/MARTA_Bus_Stops.geojson',
    
    // MARTA GTFS
    MARTA_GTFS: {
      AGENCY: 'Data/MARTA/agency.txt',
      ROUTES: 'Data/MARTA/routes.txt',
      STOPS: 'Data/MARTA/stops.txt',
      STOP_TIMES: 'Data/MARTA/stop_times.txt',
      TRIPS: 'Data/MARTA/trips.txt',
      SHAPES: 'Data/MARTA/shapes.txt',
      CALENDAR: 'Data/MARTA/calendar.txt',
      CALENDAR_DATES: 'Data/MARTA/calendar_dates.txt',
      FEED_INFO: 'Data/MARTA/feed_info.txt'
    },
    
    // CobbLinc GTFS
    COBBLINC_GTFS: {
      AGENCY: 'Data/CobbLinc/agency.txt',
      ROUTES: 'Data/CobbLinc/routes.txt',
      STOPS: 'Data/CobbLinc/stops.txt',
      STOP_TIMES: 'Data/CobbLinc/stop_times.txt',
      TRIPS: 'Data/CobbLinc/trips.txt',
      SHAPES: 'Data/CobbLinc/shapes.txt',
      CALENDAR: 'Data/CobbLinc/calendar.txt',
      CALENDAR_DATES: 'Data/CobbLinc/calendar_dates.txt',
      FEED_INFO: 'Data/CobbLinc/feed_info.txt',
      FARE_ATTRIBUTES: 'Data/CobbLinc/fare_attributes.txt',
      FARE_RULES: 'Data/CobbLinc/fare_rules.txt',
      FREQUENCIES: 'Data/CobbLinc/frequencies.txt',
      TRANSFERS: 'Data/CobbLinc/transfers.txt'
    },
    
    // Gwinnett County Transit GTFS
    GWINNETT_GTFS: {
      AGENCY: 'Data/Gwinnett_County_Transit/agency.txt',
      ROUTES: 'Data/Gwinnett_County_Transit/routes.txt',
      STOPS: 'Data/Gwinnett_County_Transit/stops.txt',
      STOP_TIMES: 'Data/Gwinnett_County_Transit/stop_times.txt',
      TRIPS: 'Data/Gwinnett_County_Transit/trips.txt',
      SHAPES: 'Data/Gwinnett_County_Transit/shapes.txt',
      CALENDAR_DATES: 'Data/Gwinnett_County_Transit/calendar_dates.txt',
      FEED_INFO: 'Data/Gwinnett_County_Transit/feed_info.txt',
      FARE_ATTRIBUTES: 'Data/Gwinnett_County_Transit/fare_attributes.txt',
      FARE_RULES: 'Data/Gwinnett_County_Transit/fare_rules.txt',
      FREQUENCIES: 'Data/Gwinnett_County_Transit/frequencies.txt',
      TRANSFERS: 'Data/Gwinnett_County_Transit/transfers.txt'
    },
    
    // Xpress GTFS
    XPRESS_GTFS: {
      AGENCY: 'Data/Xpress/agency.txt',
      ROUTES: 'Data/Xpress/routes.txt',
      STOPS: 'Data/Xpress/stops.txt',
      STOP_TIMES: 'Data/Xpress/stop_times.txt',
      TRIPS: 'Data/Xpress/trips.txt',
      SHAPES: 'Data/Xpress/shapes.txt',
      CALENDAR: 'Data/Xpress/calendar.txt',
      CALENDAR_DATES: 'Data/Xpress/calendar_dates.txt',
      FEED_INFO: 'Data/Xpress/feed_info.txt',
      FARE_ATTRIBUTES: 'Data/Xpress/fare_attributes.txt',
      FARE_RULES: 'Data/Xpress/fare_rules.txt',
      FREQUENCIES: 'Data/Xpress/frequencies.txt',
      TRANSFERS: 'Data/Xpress/transfers.txt'
    }
  },
  
  // ========================================
  // COMMUNITY & EDUCATION DATA (NEW)
  // ========================================
  COMMUNITY: {
    // Libraries
    LIBRARIES: 'Data/Metro_Atlanta_Libraries.geojson',
    LIBRARY_BRANCHES: 'Data/Library_Branches.geojson',
    
    // Schools
    SCHOOLS: 'Data/Metro_Atlanta_Schools.geojson',
    SCHOOL_DISTRICTS: 'Data/School_Districts.geojson',
    SCHOOL_RATINGS: 'Data/School_Ratings.json',
    ELEMENTARY_SCHOOLS: 'Data/Elementary_Schools.geojson',
    MIDDLE_SCHOOLS: 'Data/Middle_Schools.geojson',
    HIGH_SCHOOLS: 'Data/High_Schools.geojson',
    CHARTER_SCHOOLS: 'Data/Charter_Schools.geojson',
    PRIVATE_SCHOOLS: 'Data/Private_Schools.geojson'
  },
  
  // ========================================
  // INFRASTRUCTURE & ROADS (NEW)
  // ========================================
  INFRASTRUCTURE: {
    // Major Roads
    MAJOR_ROADS: 'Data/Major_Roads.geojson',
    HIGHWAYS: 'Data/Highways.geojson',
    ARTERIALS: 'Data/Arterial_Roads.geojson',
    
    // Bikeways
    BIKEWAYS: 'Data/Bikeways.geojson',
    BIKE_LANES: 'Data/Bike_Lanes.geojson',
    BIKE_TRAILS: 'Data/Bike_Trails.geojson',
    ATLANTA_BELTLINE: 'Data/Atlanta_BeltLine.geojson',
    PATH_TRAILS: 'Data/PATH_Trails.geojson'
  },
  
  // ========================================
  // POLITICAL BOUNDARIES (NEW)
  // ========================================
  POLITICAL: {
    // Counties
    COUNTIES: 'Data/Metro_Atlanta_Counties.geojson',
    COUNTY_BOUNDARIES: 'Data/County_Boundaries.geojson',
    
    // Congressional Districts
    CONGRESSIONAL_DISTRICTS: 'Data/Congressional_Districts.geojson',
    STATE_HOUSE_DISTRICTS: 'Data/State_House_Districts.geojson',
    STATE_SENATE_DISTRICTS: 'Data/State_Senate_Districts.geojson',
    
    // City Limits
    CITY_LIMITS: 'Data/City_Limits.geojson',
    MUNICIPALITY_BOUNDARIES: 'Data/Municipality_Boundaries.geojson'
  },
  
  // ========================================
  // ECONOMIC & OPPORTUNITY ZONES (NEW)
  // ========================================
  ECONOMIC: {
    // Federal Opportunity Zones
    OPPORTUNITY_ZONES: 'Data/Federal_Opportunity_Zones.geojson',
    QCT_ZONES: 'Data/Qualified_Census_Tracts.geojson',
    
    // Tax Allocation Districts
    TAD_DISTRICTS: 'Data/Tax_Allocation_Districts.geojson',
    ENTERPRISE_ZONES: 'Data/Enterprise_Zones.geojson',
    
    // Business Districts
    BUSINESS_IMPROVEMENT_DISTRICTS: 'Data/Business_Improvement_Districts.geojson',
    COMMERCIAL_CORRIDORS: 'Data/Commercial_Corridors.geojson'
  },
  
  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  /**
   * Load GeoJSON data from S3
   * @param {string} path - Path to GeoJSON file
   * @returns {Promise<Object>} Parsed GeoJSON data
   */
  async loadGeoJson(path) {
    const url = this.getUrl(path);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Load text file (e.g., GTFS .txt files) from S3
   * @param {string} path - Path to text file
   * @returns {Promise<string>} File contents as text
   */
  async loadText(path) {
    const url = this.getUrl(path);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.text();
  },
  
  /**
   * Load and parse GTFS CSV file
   * @param {string} path - Path to GTFS .txt file
   * @returns {Promise<Array>} Array of objects (parsed CSV)
   */
  async loadGTFS(path) {
    const text = await this.loadText(path);
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i]?.trim() || '';
      });
      return obj;
    });
  },
  
  /**
   * Load JSON data from S3
   * @param {string} path - Path to JSON file
   * @returns {Promise<Object>} Parsed JSON data
   */
  async loadJSON(path) {
    const url = this.getUrl(path);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Batch load multiple GeoJSON files
   * @param {Array<string>} paths - Array of paths to GeoJSON files
   * @returns {Promise<Array<Object>>} Array of parsed GeoJSON data
   */
  async loadMultipleGeoJson(paths) {
    const promises = paths.map(path => this.loadGeoJson(path).catch(err => {
      console.warn(`Failed to load ${path}:`, err);
      return null;
    }));
    return Promise.all(promises);
  }
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*

// Example 1: Load ZIP codes into Google Maps
map.data.loadGeoJson(
  INSITE_S3_CONFIG.getUrl(INSITE_S3_CONFIG.ZIP_CODES.GEORGIA_ENRICHED)
);

// Example 2: Load parks data
const parksUrl = INSITE_S3_CONFIG.getUrl(INSITE_S3_CONFIG.PARKS.ATLANTA);
fetch(parksUrl)
  .then(response => response.json())
  .then(data => {
    console.log('Atlanta Parks:', data);
  });

// Example 3: Load MARTA routes
INSITE_S3_CONFIG.loadGeoJson(INSITE_S3_CONFIG.TRANSIT.MARTA_ROUTES)
  .then(routes => {
    console.log('MARTA Routes:', routes);
  });

// Example 4: Load GTFS stops data
INSITE_S3_CONFIG.loadGTFS(INSITE_S3_CONFIG.TRANSIT.MARTA_GTFS.STOPS)
  .then(stops => {
    console.log('MARTA Stops:', stops);
    // stops is an array of objects with stop_id, stop_name, stop_lat, stop_lon, etc.
  });

// Example 5: Batch load multiple files
Promise.all([
  INSITE_S3_CONFIG.loadGeoJson(INSITE_S3_CONFIG.PARKS.ATLANTA),
  INSITE_S3_CONFIG.loadGeoJson(INSITE_S3_CONFIG.TRANSIT.MARTA_ROUTES),
  INSITE_S3_CONFIG.loadGTFS(INSITE_S3_CONFIG.TRANSIT.MARTA_GTFS.STOPS)
]).then(([parks, routes, stops]) => {
  console.log('All data loaded!', { parks, routes, stops });
});

*/

// Export for use in modules (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = INSITE_S3_CONFIG;
}
