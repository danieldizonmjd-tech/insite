/**
 * Atlanta Metro Data Services - Comprehensive Data Integration Layer
 * Integrates: Libraries, Counties, MARTA, Schools, Bikeways, Political Districts,
 * Major Roads, Federal Opportunity Zones, Walk Score API, and MARTA Realtime API
 * 
 * Version: 2.0.0
 * Last Updated: January 2026
 */

// ============================================================================
// API CONFIGURATION - Replace with your actual API keys
// ============================================================================
const ATLANTA_API_CONFIG = {
  WALK_SCORE: {
    API_KEY: 'YOUR_WALK_SCORE_API_KEY_HERE', // TODO: Replace with actual key
    BASE_URL: 'https://api.walkscore.com/score',
    ENABLED: false // Set to true when key is configured
  },
  MARTA_REALTIME: {
    API_KEY: 'YOUR_MARTA_API_KEY_HERE', // TODO: Replace with actual key
    BASE_URL: 'https://developerservices.itsmarta.com:18096/itsmarta/railrealtimearrivals',
    ENABLED: false // Set to true when key is configured
  }
};

// ============================================================================
// DATA CACHE - Stores loaded GeoJSON data
// ============================================================================
const AtlantaDataCache = {
  libraries: null,
  counties: null,
  martaRail: null,
  martaBus: null,
  schools: null,
  bikeways: null,
  congressionalDistricts: null,
  majorRoads: null,
  opportunityZones: null,
  realtimeArrivals: null,
  walkScores: new Map(),
  lastUpdated: {}
};

// ============================================================================
// MARTA REALTIME SERVICE
// ============================================================================
const MartaRealtimeService = {
  /**
   * Fetch real-time train arrivals from MARTA API
   * @param {string} station - Optional station filter
   * @returns {Promise<Array>} Array of arrival objects
   */
  async getRealtimeArrivals(station = null) {
    if (!ATLANTA_API_CONFIG.MARTA_REALTIME.ENABLED) {
      console.log('[MARTA] API not configured, using mock data');
      return this.getMockArrivals(station);
    }

    try {
      const url = `${ATLANTA_API_CONFIG.MARTA_REALTIME.BASE_URL}?apiKey=${ATLANTA_API_CONFIG.MARTA_REALTIME.API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('MARTA API request failed');
      
      let arrivals = await response.json();
      
      // Filter by station if specified
      if (station) {
        arrivals = arrivals.filter(a => 
          a.STATION.toLowerCase().includes(station.toLowerCase())
        );
      }
      
      // Cache the results
      AtlantaDataCache.realtimeArrivals = arrivals;
      AtlantaDataCache.lastUpdated.martaRealtime = new Date();
      
      return arrivals;
    } catch (error) {
      console.error('[MARTA] Error fetching realtime data:', error);
      return this.getMockArrivals(station);
    }
  },

  /**
   * Get mock MARTA arrivals for demo/fallback
   */
  getMockArrivals(station = null) {
    const mockData = [
      { DESTINATION: "Airport", DIRECTION: "S", LINE: "RED", STATION: "FIVE POINTS STATION", NEXT_ARR: "2 min", WAITING_TIME: "2 min", TRAIN_ID: "401", IS_REALTIME: "true" },
      { DESTINATION: "North Springs", DIRECTION: "N", LINE: "RED", STATION: "FIVE POINTS STATION", NEXT_ARR: "4 min", WAITING_TIME: "4 min", TRAIN_ID: "302", IS_REALTIME: "true" },
      { DESTINATION: "Doraville", DIRECTION: "E", LINE: "GOLD", STATION: "FIVE POINTS STATION", NEXT_ARR: "3 min", WAITING_TIME: "3 min", TRAIN_ID: "501", IS_REALTIME: "true" },
      { DESTINATION: "Hamilton E Holmes", DIRECTION: "W", LINE: "BLUE", STATION: "FIVE POINTS STATION", NEXT_ARR: "5 min", WAITING_TIME: "5 min", TRAIN_ID: "601", IS_REALTIME: "true" },
      { DESTINATION: "Indian Creek", DIRECTION: "E", LINE: "BLUE", STATION: "FIVE POINTS STATION", NEXT_ARR: "6 min", WAITING_TIME: "6 min", TRAIN_ID: "602", IS_REALTIME: "true" },
      { DESTINATION: "Airport", DIRECTION: "S", LINE: "GOLD", STATION: "FIVE POINTS STATION", NEXT_ARR: "7 min", WAITING_TIME: "7 min", TRAIN_ID: "502", IS_REALTIME: "true" },
      { DESTINATION: "Bankhead", DIRECTION: "W", LINE: "GREEN", STATION: "FIVE POINTS STATION", NEXT_ARR: "8 min", WAITING_TIME: "8 min", TRAIN_ID: "701", IS_REALTIME: "true" },
      { DESTINATION: "Edgewood/Candler Park", DIRECTION: "E", LINE: "GREEN", STATION: "FIVE POINTS STATION", NEXT_ARR: "9 min", WAITING_TIME: "9 min", TRAIN_ID: "702", IS_REALTIME: "true" }
    ];

    if (station) {
      return mockData.filter(a => a.STATION.toLowerCase().includes(station.toLowerCase()));
    }
    return mockData;
  },

  /**
   * Get line color for MARTA lines
   */
  getLineColor(line) {
    const colors = {
      'RED': '#CE2029',
      'GOLD': '#D4AF37',
      'BLUE': '#0039A6',
      'GREEN': '#00703C'
    };
    return colors[line.toUpperCase()] || '#666666';
  },

  /**
   * Find nearest MARTA station to coordinates
   */
  async findNearestStation(lat, lng, maxDistance = 2) {
    const stations = await this.getStations();
    let nearest = null;
    let minDist = Infinity;

    stations.forEach(station => {
      const dist = this.calculateDistance(lat, lng, station.lat, station.lng);
      if (dist < minDist && dist <= maxDistance) {
        minDist = dist;
        nearest = { ...station, distance: dist };
      }
    });

    return nearest;
  },

  /**
   * Get all MARTA stations (from cache or S3)
   */
  async getStations() {
    // Return cached data if available
    if (AtlantaDataCache.martaRail?.stations) {
      return AtlantaDataCache.martaRail.stations;
    }

    // Major MARTA stations with coordinates
    return [
      { name: "Five Points", lat: 33.7539, lng: -84.3916, lines: ["RED", "GOLD", "BLUE", "GREEN"] },
      { name: "Airport", lat: 33.6407, lng: -84.4464, lines: ["RED", "GOLD"] },
      { name: "North Springs", lat: 33.9454, lng: -84.3575, lines: ["RED"] },
      { name: "Doraville", lat: 33.9027, lng: -84.2803, lines: ["GOLD"] },
      { name: "Hamilton E Holmes", lat: 33.7545, lng: -84.4693, lines: ["BLUE"] },
      { name: "Indian Creek", lat: 33.7695, lng: -84.2292, lines: ["BLUE"] },
      { name: "Bankhead", lat: 33.7723, lng: -84.4286, lines: ["GREEN"] },
      { name: "Edgewood/Candler Park", lat: 33.7615, lng: -84.3396, lines: ["GREEN"] },
      { name: "Midtown", lat: 33.7808, lng: -84.3864, lines: ["RED", "GOLD"] },
      { name: "Arts Center", lat: 33.7893, lng: -84.3875, lines: ["RED", "GOLD"] },
      { name: "Buckhead", lat: 33.8478, lng: -84.3675, lines: ["RED"] },
      { name: "Lenox", lat: 33.8459, lng: -84.3576, lines: ["GOLD"] },
      { name: "Lindbergh Center", lat: 33.8230, lng: -84.3692, lines: ["RED", "GOLD"] },
      { name: "Peachtree Center", lat: 33.7593, lng: -84.3874, lines: ["RED", "GOLD"] },
      { name: "Civic Center", lat: 33.7664, lng: -84.3873, lines: ["RED", "GOLD"] },
      { name: "Georgia State", lat: 33.7495, lng: -84.3856, lines: ["BLUE", "GREEN"] },
      { name: "King Memorial", lat: 33.7491, lng: -84.3761, lines: ["BLUE", "GREEN"] },
      { name: "Inman Park/Reynoldstown", lat: 33.7573, lng: -84.3526, lines: ["BLUE", "GREEN"] },
      { name: "East Lake", lat: 33.7651, lng: -84.3127, lines: ["BLUE"] },
      { name: "Decatur", lat: 33.7748, lng: -84.2972, lines: ["BLUE"] },
      { name: "Avondale", lat: 33.7753, lng: -84.2802, lines: ["BLUE"] },
      { name: "Kensington", lat: 33.7721, lng: -84.2524, lines: ["BLUE"] },
      { name: "West End", lat: 33.7358, lng: -84.4128, lines: ["RED", "GOLD"] },
      { name: "Oakland City", lat: 33.7173, lng: -84.4252, lines: ["RED", "GOLD"] },
      { name: "Lakewood/Ft. McPherson", lat: 33.7003, lng: -84.4286, lines: ["RED", "GOLD"] },
      { name: "East Point", lat: 33.6769, lng: -84.4403, lines: ["RED", "GOLD"] },
      { name: "College Park", lat: 33.6514, lng: -84.4485, lines: ["RED", "GOLD"] },
      { name: "Ashby", lat: 33.7561, lng: -84.4170, lines: ["GREEN"] },
      { name: "Vine City", lat: 33.7565, lng: -84.4044, lines: ["GREEN"] },
      { name: "Dome/GWCC/Philips Arena/CNN", lat: 33.7579, lng: -84.3962, lines: ["GREEN"] },
      { name: "Georgia Dome", lat: 33.7579, lng: -84.3962, lines: ["BLUE"] },
      { name: "Garnett", lat: 33.7481, lng: -84.3953, lines: ["RED", "GOLD"] },
      { name: "Sandy Springs", lat: 33.9320, lng: -84.3518, lines: ["RED"] },
      { name: "Dunwoody", lat: 33.9216, lng: -84.3446, lines: ["RED"] },
      { name: "Medical Center", lat: 33.9106, lng: -84.3512, lines: ["RED"] },
      { name: "Chamblee", lat: 33.8879, lng: -84.3068, lines: ["GOLD"] },
      { name: "Brookhaven/Oglethorpe", lat: 33.8599, lng: -84.3393, lines: ["GOLD"] }
    ];
  },

  /**
   * Calculate distance between two coordinates (miles)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

// ============================================================================
// WALK SCORE SERVICE
// ============================================================================
const WalkScoreService = {
  /**
   * Get Walk Score for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude  
   * @param {string} address - Address string
   * @returns {Promise<Object>} Walk Score data
   */
  async getWalkScore(lat, lng, address = '') {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    if (AtlantaDataCache.walkScores.has(cacheKey)) {
      return AtlantaDataCache.walkScores.get(cacheKey);
    }

    if (!ATLANTA_API_CONFIG.WALK_SCORE.ENABLED) {
      console.log('[WalkScore] API not configured, using estimated score');
      return this.estimateWalkScore(lat, lng);
    }

    try {
      const params = new URLSearchParams({
        format: 'json',
        lat: lat,
        lon: lng,
        address: encodeURIComponent(address),
        wsapikey: ATLANTA_API_CONFIG.WALK_SCORE.API_KEY,
        transit: 1,
        bike: 1
      });

      const response = await fetch(`${ATLANTA_API_CONFIG.WALK_SCORE.BASE_URL}?${params}`);
      
      if (!response.ok) throw new Error('Walk Score API request failed');
      
      const data = await response.json();
      
      const result = {
        walkScore: data.walkscore || 0,
        walkDescription: data.description || 'N/A',
        transitScore: data.transit?.score || 0,
        transitDescription: data.transit?.description || 'N/A',
        bikeScore: data.bike?.score || 0,
        bikeDescription: data.bike?.description || 'N/A',
        isEstimated: false
      };

      // Cache the result
      AtlantaDataCache.walkScores.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('[WalkScore] Error fetching data:', error);
      return this.estimateWalkScore(lat, lng);
    }
  },

  /**
   * Estimate Walk Score based on location data
   * Uses proximity to amenities, transit, and urban density
   */
  async estimateWalkScore(lat, lng) {
    // Base score starts at 50
    let walkScore = 50;
    let transitScore = 30;
    let bikeScore = 40;

    // Check proximity to MARTA
    const nearestStation = await MartaRealtimeService.findNearestStation(lat, lng, 5);
    if (nearestStation) {
      const distMiles = nearestStation.distance;
      if (distMiles < 0.25) {
        transitScore += 50;
        walkScore += 15;
      } else if (distMiles < 0.5) {
        transitScore += 40;
        walkScore += 10;
      } else if (distMiles < 1) {
        transitScore += 25;
        walkScore += 5;
      } else if (distMiles < 2) {
        transitScore += 10;
      }
    }

    // Urban core bonus (within 285 perimeter, closer to downtown)
    const distFromDowntown = MartaRealtimeService.calculateDistance(lat, lng, 33.7490, -84.3880);
    if (distFromDowntown < 2) {
      walkScore += 30;
      bikeScore += 20;
    } else if (distFromDowntown < 5) {
      walkScore += 20;
      bikeScore += 15;
    } else if (distFromDowntown < 10) {
      walkScore += 10;
      bikeScore += 10;
    }

    // Cap scores at 100
    walkScore = Math.min(100, Math.max(0, walkScore));
    transitScore = Math.min(100, Math.max(0, transitScore));
    bikeScore = Math.min(100, Math.max(0, bikeScore));

    return {
      walkScore,
      walkDescription: this.getScoreDescription(walkScore, 'walk'),
      transitScore,
      transitDescription: this.getScoreDescription(transitScore, 'transit'),
      bikeScore,
      bikeDescription: this.getScoreDescription(bikeScore, 'bike'),
      isEstimated: true
    };
  },

  /**
   * Get human-readable description for score
   */
  getScoreDescription(score, type) {
    const descriptions = {
      walk: {
        90: "Walker's Paradise",
        70: "Very Walkable",
        50: "Somewhat Walkable",
        25: "Car-Dependent",
        0: "Almost All Errands Require a Car"
      },
      transit: {
        90: "Excellent Transit",
        70: "Excellent Transit",
        50: "Good Transit",
        25: "Some Transit",
        0: "Minimal Transit"
      },
      bike: {
        90: "Biker's Paradise",
        70: "Very Bikeable",
        50: "Bikeable",
        25: "Somewhat Bikeable",
        0: "Minimal Bike Infrastructure"
      }
    };

    const thresholds = [90, 70, 50, 25, 0];
    for (const threshold of thresholds) {
      if (score >= threshold) {
        return descriptions[type][threshold];
      }
    }
    return descriptions[type][0];
  },

  /**
   * Get color for score visualization
   */
  getScoreColor(score) {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#f97316';
    return '#ef4444';
  }
};

// ============================================================================
// SCHOOLS SERVICE
// ============================================================================
const SchoolsService = {
  /**
   * Find schools near a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusMiles - Search radius in miles
   * @param {string} type - School type filter (elementary, middle, high, all)
   * @returns {Promise<Array>} Array of nearby schools
   */
  async findNearbySchools(lat, lng, radiusMiles = 3, type = 'all') {
    const schools = await this.loadSchoolsData();
    
    return schools
      .map(school => ({
        ...school,
        distance: MartaRealtimeService.calculateDistance(lat, lng, school.lat, school.lng)
      }))
      .filter(school => {
        if (school.distance > radiusMiles) return false;
        if (type === 'all') return true;
        return school.type?.toLowerCase().includes(type.toLowerCase());
      })
      .sort((a, b) => a.distance - b.distance);
  },

  /**
   * Calculate school quality score for an area
   */
  async getAreaSchoolScore(lat, lng) {
    const nearbySchools = await this.findNearbySchools(lat, lng, 5);
    
    if (nearbySchools.length === 0) {
      return { score: 50, grade: 'C', schoolCount: 0, description: 'Limited school data available' };
    }

    // Weight schools by distance and rating
    let totalScore = 0;
    let totalWeight = 0;

    nearbySchools.forEach(school => {
      const distanceWeight = Math.max(0, 1 - (school.distance / 5)); // Closer = higher weight
      const rating = school.rating || 5; // Default to 5/10 if no rating
      totalScore += rating * distanceWeight;
      totalWeight += distanceWeight;
    });

    const avgScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 50;
    const normalizedScore = Math.round(Math.min(100, Math.max(0, avgScore)));

    return {
      score: normalizedScore,
      grade: this.getGradeFromScore(normalizedScore),
      schoolCount: nearbySchools.length,
      topSchools: nearbySchools.slice(0, 3),
      description: this.getSchoolDescription(normalizedScore, nearbySchools.length)
    };
  },

  getGradeFromScore(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  },

  getSchoolDescription(score, count) {
    if (score >= 80 && count >= 5) return 'Excellent schools nearby';
    if (score >= 70) return 'Good school options';
    if (score >= 50) return 'Average school quality';
    return 'Limited school options';
  },

  async loadSchoolsData() {
    if (AtlantaDataCache.schools) {
      return AtlantaDataCache.schools;
    }

    // Try to load from S3
    if (typeof INSITE_S3_CONFIG !== 'undefined') {
      try {
        const data = await INSITE_S3_CONFIG.loadGeoJson('atlanta/schools.geojson');
        AtlantaDataCache.schools = data.features.map(f => ({
          name: f.properties.name || f.properties.NAME,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          type: f.properties.type || f.properties.SCHOOLTYPE,
          rating: f.properties.rating || f.properties.RATING,
          district: f.properties.district || f.properties.DISTRICT,
          grades: f.properties.grades || f.properties.GRADES
        }));
        return AtlantaDataCache.schools;
      } catch (e) {
        console.log('[Schools] S3 load failed, using defaults');
      }
    }

    // Return sample data
    return [];
  }
};

// ============================================================================
// LIBRARIES SERVICE
// ============================================================================
const LibrariesService = {
  async findNearbyLibraries(lat, lng, radiusMiles = 5) {
    const libraries = await this.loadLibrariesData();
    
    return libraries
      .map(lib => ({
        ...lib,
        distance: MartaRealtimeService.calculateDistance(lat, lng, lib.lat, lib.lng)
      }))
      .filter(lib => lib.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  },

  async loadLibrariesData() {
    if (AtlantaDataCache.libraries) {
      return AtlantaDataCache.libraries;
    }

    if (typeof INSITE_S3_CONFIG !== 'undefined') {
      try {
        const data = await INSITE_S3_CONFIG.loadGeoJson('atlanta/libraries.geojson');
        AtlantaDataCache.libraries = data.features.map(f => ({
          name: f.properties.name || f.properties.NAME,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          address: f.properties.address || f.properties.ADDRESS,
          phone: f.properties.phone || f.properties.PHONE,
          hours: f.properties.hours || f.properties.HOURS,
          system: f.properties.system || 'Atlanta-Fulton County'
        }));
        return AtlantaDataCache.libraries;
      } catch (e) {
        console.log('[Libraries] S3 load failed');
      }
    }

    return [];
  }
};

// ============================================================================
// OPPORTUNITY ZONES SERVICE
// ============================================================================
const OpportunityZonesService = {
  /**
   * Check if a location is within a Federal Opportunity Zone
   */
  async checkOpportunityZone(lat, lng, zipCode = null) {
    const zones = await this.loadOpportunityZonesData();
    
    // Simple point-in-polygon check would go here
    // For now, check if ZIP is in known OZ list
    if (zipCode) {
      const ozZone = zones.find(z => z.zipCodes?.includes(zipCode));
      if (ozZone) {
        return {
          inOpportunityZone: true,
          zoneName: ozZone.name,
          tractId: ozZone.tractId,
          designation: ozZone.designation || 'Low-Income Community',
          benefits: [
            'Tax deferral on capital gains',
            'Step-up in basis after 5 years',
            'Exclusion of gains after 10 years',
            'Priority for federal programs'
          ]
        };
      }
    }

    return {
      inOpportunityZone: false,
      zoneName: null,
      benefits: []
    };
  },

  async loadOpportunityZonesData() {
    if (AtlantaDataCache.opportunityZones) {
      return AtlantaDataCache.opportunityZones;
    }

    if (typeof INSITE_S3_CONFIG !== 'undefined') {
      try {
        const data = await INSITE_S3_CONFIG.loadGeoJson('atlanta/opportunity_zones.geojson');
        AtlantaDataCache.opportunityZones = data.features.map(f => ({
          name: f.properties.name || f.properties.NAME,
          tractId: f.properties.GEOID || f.properties.tractId,
          designation: f.properties.designation,
          geometry: f.geometry,
          zipCodes: f.properties.zipCodes || []
        }));
        return AtlantaDataCache.opportunityZones;
      } catch (e) {
        console.log('[OpportunityZones] S3 load failed');
      }
    }

    return [];
  }
};

// ============================================================================
// COUNTIES SERVICE
// ============================================================================
const CountiesService = {
  /**
   * Get county information for coordinates or ZIP
   */
  async getCountyInfo(lat, lng, zipCode = null) {
    const counties = await this.loadCountiesData();
    
    // Find county containing the point
    // Simplified - in production use proper point-in-polygon
    const county = counties.find(c => {
      if (c.zipCodes && zipCode && c.zipCodes.includes(zipCode)) return true;
      // Rough bounding box check
      if (c.bounds) {
        return lat >= c.bounds.south && lat <= c.bounds.north &&
               lng >= c.bounds.west && lng <= c.bounds.east;
      }
      return false;
    });

    return county || this.getDefaultCounty();
  },

  getDefaultCounty() {
    return {
      name: 'Fulton County',
      state: 'Georgia',
      population: 1066710,
      medianIncome: 68246,
      website: 'https://www.fultoncountyga.gov'
    };
  },

  async loadCountiesData() {
    if (AtlantaDataCache.counties) {
      return AtlantaDataCache.counties;
    }

    // Metro Atlanta counties
    AtlantaDataCache.counties = [
      { name: 'Fulton', population: 1066710, medianIncome: 68246, color: '#6366f1' },
      { name: 'DeKalb', population: 764382, medianIncome: 58856, color: '#ec4899' },
      { name: 'Gwinnett', population: 957062, medianIncome: 72046, color: '#10b981' },
      { name: 'Cobb', population: 766149, medianIncome: 78510, color: '#f59e0b' },
      { name: 'Clayton', population: 297595, medianIncome: 45785, color: '#ef4444' },
      { name: 'Cherokee', population: 266620, medianIncome: 86234, color: '#8b5cf6' },
      { name: 'Forsyth', population: 251283, medianIncome: 106234, color: '#06b6d4' },
      { name: 'Henry', population: 240712, medianIncome: 68524, color: '#22c55e' },
      { name: 'Douglas', population: 146343, medianIncome: 58762, color: '#f97316' },
      { name: 'Fayette', population: 119194, medianIncome: 89456, color: '#a855f7' },
      { name: 'Rockdale', population: 93570, medianIncome: 56234, color: '#14b8a6' },
      { name: 'Newton', population: 112483, medianIncome: 52678, color: '#f43f5e' }
    ];

    return AtlantaDataCache.counties;
  }
};

// ============================================================================
// BIKEWAYS SERVICE
// ============================================================================
const BikewaysService = {
  async findNearbyBikeways(lat, lng, radiusMiles = 2) {
    const bikeways = await this.loadBikewaysData();
    
    // Find bikeways within radius
    return bikeways
      .map(bikeway => {
        // Calculate distance to nearest point on bikeway
        const minDist = this.distanceToLine(lat, lng, bikeway.coordinates);
        return { ...bikeway, distance: minDist };
      })
      .filter(b => b.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  },

  distanceToLine(lat, lng, coordinates) {
    if (!coordinates || coordinates.length === 0) return Infinity;
    
    let minDist = Infinity;
    coordinates.forEach(coord => {
      const dist = MartaRealtimeService.calculateDistance(lat, lng, coord[1], coord[0]);
      if (dist < minDist) minDist = dist;
    });
    return minDist;
  },

  async getBikeabilityScore(lat, lng) {
    const nearbyBikeways = await this.findNearbyBikeways(lat, lng, 3);
    
    let score = 30; // Base score
    
    if (nearbyBikeways.length > 0) {
      // Add points for nearby bike infrastructure
      nearbyBikeways.forEach(bikeway => {
        const distBonus = Math.max(0, 20 - (bikeway.distance * 10));
        const typeBonus = bikeway.type === 'protected' ? 10 : 
                         bikeway.type === 'dedicated' ? 7 : 3;
        score += distBonus + typeBonus;
      });
    }

    return Math.min(100, score);
  },

  async loadBikewaysData() {
    if (AtlantaDataCache.bikeways) {
      return AtlantaDataCache.bikeways;
    }

    if (typeof INSITE_S3_CONFIG !== 'undefined') {
      try {
        const data = await INSITE_S3_CONFIG.loadGeoJson('atlanta/bikeways.geojson');
        AtlantaDataCache.bikeways = data.features.map(f => ({
          name: f.properties.name || f.properties.NAME,
          type: f.properties.type || 'shared',
          length: f.properties.length,
          coordinates: f.geometry.type === 'LineString' ? f.geometry.coordinates :
                       f.geometry.type === 'MultiLineString' ? f.geometry.coordinates.flat() : []
        }));
        return AtlantaDataCache.bikeways;
      } catch (e) {
        console.log('[Bikeways] S3 load failed');
      }
    }

    return [];
  }
};

// ============================================================================
// CONGRESSIONAL DISTRICTS SERVICE
// ============================================================================
const CongressionalDistrictsService = {
  async getDistrictInfo(lat, lng, zipCode = null) {
    const districts = await this.loadDistrictsData();
    
    // Find district - simplified
    const district = districts.find(d => {
      if (d.zipCodes && zipCode && d.zipCodes.includes(zipCode)) return true;
      return false;
    });

    return district || {
      number: 'Unknown',
      representative: 'Unknown',
      party: 'Unknown'
    };
  },

  async loadDistrictsData() {
    if (AtlantaDataCache.congressionalDistricts) {
      return AtlantaDataCache.congressionalDistricts;
    }

    // Metro Atlanta Congressional Districts (2024)
    AtlantaDataCache.congressionalDistricts = [
      { number: 4, representative: 'Hank Johnson', party: 'D', color: '#3b82f6' },
      { number: 5, representative: 'Nikema Williams', party: 'D', color: '#3b82f6' },
      { number: 6, representative: 'Rich McCormick', party: 'R', color: '#ef4444' },
      { number: 7, representative: 'Lucy McBath', party: 'D', color: '#3b82f6' },
      { number: 11, representative: 'Barry Loudermilk', party: 'R', color: '#ef4444' },
      { number: 13, representative: 'David Scott', party: 'D', color: '#3b82f6' }
    ];

    return AtlantaDataCache.congressionalDistricts;
  }
};

// ============================================================================
// COMPREHENSIVE LOCATION INTELLIGENCE
// ============================================================================
const LocationIntelligence = {
  /**
   * Get comprehensive location analysis
   * Combines all data sources for complete picture
   */
  async getFullAnalysis(lat, lng, zipCode = null, address = '') {
    console.log('[LocationIntelligence] Starting full analysis...');
    
    const [
      walkScore,
      nearestStation,
      schoolScore,
      nearbyLibraries,
      opportunityZone,
      countyInfo,
      bikeScore,
      nearbyBikeways
    ] = await Promise.all([
      WalkScoreService.getWalkScore(lat, lng, address),
      MartaRealtimeService.findNearestStation(lat, lng),
      SchoolsService.getAreaSchoolScore(lat, lng),
      LibrariesService.findNearbyLibraries(lat, lng, 3),
      OpportunityZonesService.checkOpportunityZone(lat, lng, zipCode),
      CountiesService.getCountyInfo(lat, lng, zipCode),
      BikewaysService.getBikeabilityScore(lat, lng),
      BikewaysService.findNearbyBikeways(lat, lng, 2)
    ]);

    // Calculate composite livability score
    const livabilityScore = this.calculateLivabilityScore({
      walkScore: walkScore.walkScore,
      transitScore: walkScore.transitScore,
      bikeScore: bikeScore,
      schoolScore: schoolScore.score,
      libraryAccess: nearbyLibraries.length > 0 ? 80 : 40,
      opportunityZoneBonus: opportunityZone.inOpportunityZone ? 10 : 0
    });

    return {
      coordinates: { lat, lng },
      zipCode,
      
      // Mobility Scores
      mobility: {
        walkScore: walkScore.walkScore,
        walkDescription: walkScore.walkDescription,
        transitScore: walkScore.transitScore,
        transitDescription: walkScore.transitDescription,
        bikeScore: bikeScore,
        bikeDescription: WalkScoreService.getScoreDescription(bikeScore, 'bike'),
        isEstimated: walkScore.isEstimated
      },

      // Transit Access
      transit: {
        nearestStation,
        hasRailAccess: nearestStation !== null,
        distanceToRail: nearestStation?.distance || null
      },

      // Education
      education: {
        score: schoolScore.score,
        grade: schoolScore.grade,
        schoolCount: schoolScore.schoolCount,
        topSchools: schoolScore.topSchools,
        description: schoolScore.description
      },

      // Community Resources
      community: {
        libraries: nearbyLibraries.slice(0, 3),
        libraryCount: nearbyLibraries.length,
        bikeways: nearbyBikeways.slice(0, 3),
        bikewayCount: nearbyBikeways.length
      },

      // Investment
      investment: {
        opportunityZone: opportunityZone,
        isOpportunityZone: opportunityZone.inOpportunityZone
      },

      // Government
      government: {
        county: countyInfo
      },

      // Overall Score
      livabilityScore,
      livabilityGrade: this.getLivabilityGrade(livabilityScore)
    };
  },

  calculateLivabilityScore(factors) {
    const weights = {
      walkScore: 0.20,
      transitScore: 0.20,
      bikeScore: 0.10,
      schoolScore: 0.25,
      libraryAccess: 0.10,
      opportunityZoneBonus: 0.15
    };

    let score = 0;
    Object.keys(weights).forEach(key => {
      score += (factors[key] || 0) * weights[key];
    });

    return Math.round(score);
  },

  getLivabilityGrade(score) {
    if (score >= 90) return { letter: 'A+', color: '#10b981' };
    if (score >= 85) return { letter: 'A', color: '#10b981' };
    if (score >= 80) return { letter: 'A-', color: '#22c55e' };
    if (score >= 75) return { letter: 'B+', color: '#22c55e' };
    if (score >= 70) return { letter: 'B', color: '#84cc16' };
    if (score >= 65) return { letter: 'B-', color: '#84cc16' };
    if (score >= 60) return { letter: 'C+', color: '#f59e0b' };
    if (score >= 55) return { letter: 'C', color: '#f59e0b' };
    if (score >= 50) return { letter: 'C-', color: '#f97316' };
    if (score >= 45) return { letter: 'D+', color: '#f97316' };
    if (score >= 40) return { letter: 'D', color: '#ef4444' };
    return { letter: 'F', color: '#ef4444' };
  }
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================
window.AtlantaDataServices = {
  MartaRealtime: MartaRealtimeService,
  WalkScore: WalkScoreService,
  Schools: SchoolsService,
  Libraries: LibrariesService,
  OpportunityZones: OpportunityZonesService,
  Counties: CountiesService,
  Bikeways: BikewaysService,
  CongressionalDistricts: CongressionalDistrictsService,
  LocationIntelligence: LocationIntelligence,
  Cache: AtlantaDataCache,
  Config: ATLANTA_API_CONFIG
};

console.log('[AtlantaDataServices] All services loaded successfully');
