/**
 * Mobility API Integration Module for InSite
 * Integrates Walk Score API and MARTA Realtime API
 * 
 * NOTE: Walk Score API doesn't support CORS for browser requests.
 * This module uses estimated scores based on location data.
 * For production, implement a server-side proxy for actual Walk Score API calls.
 */

const MobilityAPI = {
  // ========================================
  // API KEY CONFIGURATION (PLACEHOLDERS)
  // ========================================
  
  // Walk Score API - Get key at: https://www.walkscore.com/professional/api.php
  // NOTE: Walk Score API requires server-side calls (no CORS support)
  WALK_SCORE_API_KEY: 'YOUR_WALK_SCORE_API_KEY_HERE',
  
  // MARTA Realtime API - Get key at: https://www.itsmarta.com/app-developer-resources.aspx
  MARTA_API_KEY: 'YOUR_MARTA_API_KEY_HERE',
  
  // API Endpoints
  ENDPOINTS: {
    WALK_SCORE: 'https://api.walkscore.com/score',
    MARTA_RAIL_ARRIVALS: 'https://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals',
    MARTA_BUS_ARRIVALS: 'https://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus'
  },
  
  // Cache for API responses (to avoid rate limiting)
  cache: {
    walkScores: new Map(),
    martaArrivals: null,
    martaArrivalsTime: 0
  },
  
  // Cache duration (30 seconds for realtime data)
  CACHE_DURATION: 30000,
  
  // ========================================
  // WALK SCORE API INTEGRATION
  // ========================================
  
  /**
   * Get Walk Score, Transit Score, and Bike Score for a location
   * NOTE: Walk Score API doesn't support CORS, so we use estimated scores
   * based on local data (transit proximity, parks, etc.)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} address - Address string (optional but improves accuracy)
   * @returns {Promise<Object>} Walk Score data
   */
  async getWalkScore(lat, lng, address = '') {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache
    if (this.cache.walkScores.has(cacheKey)) {
      const cached = this.cache.walkScores.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }
    
    // Walk Score API doesn't support CORS for browser requests
    // Use estimated scores based on location data instead
    const result = this.getEstimatedWalkScore(lat, lng);
    
    // Cache the result
    this.cache.walkScores.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  },
  
  /**
   * Get estimated Walk Score based on local calculations
   * Uses proximity to transit, parks, and amenities
   */
  getEstimatedWalkScore(lat, lng) {
    // Use TransitHelper and ParksHelper if available
    let transitScore = 50; // Default baseline
    let parksScore = 50;   // Default baseline
    
    if (typeof TransitHelper !== 'undefined') {
      try {
        const helper = new TransitHelper();
        const result = helper.calculateTransitScore(lat, lng);
        transitScore = result.score || 50;
      } catch (e) {
        console.log('TransitHelper not available, using default');
      }
    }
    
    if (typeof ParksHelper !== 'undefined') {
      try {
        const helper = new ParksHelper();
        const result = helper.calculateParksScore(lat, lng);
        parksScore = result.score || 50;
      } catch (e) {
        console.log('ParksHelper not available, using default');
      }
    }
    
    // Check proximity to MARTA stations for better transit estimate
    const nearbyStations = this.findNearbyStations(lat, lng, 1);
    if (nearbyStations.length > 0) {
      // Boost transit score based on station proximity
      const closestStation = nearbyStations[0];
      if (closestStation.distance < 0.25) {
        transitScore = Math.max(transitScore, 85); // Very close to station
      } else if (closestStation.distance < 0.5) {
        transitScore = Math.max(transitScore, 70);
      } else if (closestStation.distance < 1) {
        transitScore = Math.max(transitScore, 55);
      }
    }
    
    // Estimate walk score based on transit and parks
    const walkScore = Math.round((transitScore * 0.5 + parksScore * 0.3 + 20)); // 20 baseline for urban area
    const bikeScore = Math.round((transitScore * 0.3 + parksScore * 0.4 + 25)); // Bikes benefit from parks
    
    return {
      walkScore: Math.min(100, Math.max(0, walkScore)),
      walkDescription: this.getWalkScoreDescription(walkScore),
      transitScore: Math.min(100, Math.max(0, transitScore)),
      transitDescription: this.getTransitScoreDescription(transitScore),
      transitSummary: nearbyStations.length > 0 
        ? `${nearbyStations.length} MARTA station${nearbyStations.length > 1 ? 's' : ''} within 1 mile`
        : 'Limited public transit nearby',
      bikeScore: Math.min(100, Math.max(0, bikeScore)),
      bikeDescription: this.getBikeScoreDescription(bikeScore),
      estimated: true,
      nearbyStations: nearbyStations.length
    };
  },
  
  getWalkScoreDescription(score) {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return "Very Walkable";
    if (score >= 50) return "Somewhat Walkable";
    if (score >= 25) return "Car-Dependent";
    return "Almost All Errands Require a Car";
  },
  
  getTransitScoreDescription(score) {
    if (score >= 90) return "Excellent Transit";
    if (score >= 70) return "Excellent Transit";
    if (score >= 50) return "Good Transit";
    if (score >= 25) return "Some Transit";
    return "Minimal Transit";
  },
  
  getBikeScoreDescription(score) {
    if (score >= 90) return "Biker's Paradise";
    if (score >= 70) return "Very Bikeable";
    if (score >= 50) return "Bikeable";
    return "Somewhat Bikeable";
  },
  
  // ========================================
  // MARTA REALTIME API INTEGRATION
  // ========================================
  
  /**
   * Get realtime MARTA rail arrivals for all stations
   * @returns {Promise<Array>} Array of arrival predictions
   */
  async getMartaRailArrivals() {
    // Check cache
    if (this.cache.martaArrivals && 
        Date.now() - this.cache.martaArrivalsTime < this.CACHE_DURATION) {
      return this.cache.martaArrivals;
    }
    
    try {
      const url = `${this.ENDPOINTS.MARTA_RAIL_ARRIVALS}?apikey=${this.MARTA_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`MARTA API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process and normalize the data
      const arrivals = data.map(arrival => ({
        station: arrival.STATION,
        destination: arrival.DESTINATION,
        direction: arrival.DIRECTION,
        line: arrival.LINE,
        nextArrival: arrival.NEXT_ARR,
        waitingTime: arrival.WAITING_TIME,
        waitingSeconds: arrival.WAITING_SECONDS,
        trainId: arrival.TRAIN_ID,
        eventTime: arrival.EVENT_TIME,
        delay: arrival.DELAY || 'T0S',
        isDelayed: this.parseDelay(arrival.DELAY) > 0
      }));
      
      // Cache the results
      this.cache.martaArrivals = arrivals;
      this.cache.martaArrivalsTime = Date.now();
      
      return arrivals;
    } catch (error) {
      console.error('MARTA Rail API error:', error);
      return [];
    }
  },
  
  /**
   * Get arrivals for a specific station
   * @param {string} stationName - Name of the station
   * @returns {Promise<Array>} Arrivals for the station
   */
  async getStationArrivals(stationName) {
    const allArrivals = await this.getMartaRailArrivals();
    const normalizedName = stationName.toUpperCase().replace(/\s+/g, ' ').trim();
    
    return allArrivals.filter(arrival => {
      const arrivalStation = arrival.station.toUpperCase().replace(/\s+/g, ' ').trim();
      return arrivalStation.includes(normalizedName) || normalizedName.includes(arrivalStation);
    });
  },
  
  /**
   * Get arrivals by line color
   * @param {string} lineColor - Line color (RED, GOLD, BLUE, GREEN)
   * @returns {Promise<Array>} Arrivals for the line
   */
  async getLineArrivals(lineColor) {
    const allArrivals = await this.getMartaRailArrivals();
    return allArrivals.filter(a => a.line.toUpperCase() === lineColor.toUpperCase());
  },
  
  /**
   * Parse delay string to seconds
   * @param {string} delayStr - Delay string like "T1M30S" or "T0S"
   * @returns {number} Delay in seconds
   */
  parseDelay(delayStr) {
    if (!delayStr || delayStr === 'T0S') return 0;
    
    let seconds = 0;
    const minuteMatch = delayStr.match(/(\d+)M/);
    const secondMatch = delayStr.match(/(\d+)S/);
    
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) seconds += parseInt(secondMatch[1]);
    
    return seconds;
  },
  
  /**
   * Format waiting time for display
   * @param {string} waitingTime - Waiting time from API
   * @returns {string} Formatted time
   */
  formatWaitingTime(waitingTime) {
    if (waitingTime === 'Arriving') return '🚇 Arriving';
    if (waitingTime === 'Boarding') return '🚇 Boarding';
    
    const mins = parseInt(waitingTime);
    if (isNaN(mins)) return waitingTime;
    
    if (mins <= 1) return '1 min';
    return `${mins} mins`;
  },
  
  /**
   * Get line color code for styling
   * @param {string} line - Line name
   * @returns {string} Hex color code
   */
  getLineColor(line) {
    const colors = {
      'RED': '#E41E26',
      'GOLD': '#F1B434',
      'BLUE': '#009FDA',
      'GREEN': '#00A651'
    };
    return colors[line.toUpperCase()] || '#6b7280';
  },
  
  // ========================================
  // MOBILITY SUMMARY GENERATOR
  // ========================================
  
  /**
   * Generate comprehensive mobility summary for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} address - Address (optional)
   * @returns {Promise<Object>} Comprehensive mobility data
   */
  async getMobilitySummary(lat, lng, address = '') {
    const [walkScoreData, nearbyStations] = await Promise.all([
      this.getWalkScore(lat, lng, address),
      this.findNearbyStations(lat, lng, 1) // 1 mile radius
    ]);
    
    // Get realtime arrivals for nearby stations
    const stationArrivals = [];
    for (const station of nearbyStations.slice(0, 3)) {
      const arrivals = await this.getStationArrivals(station.name);
      stationArrivals.push({
        station: station.name,
        distance: station.distance,
        arrivals: arrivals.slice(0, 4)
      });
    }
    
    // Calculate overall mobility score
    const mobilityScore = this.calculateMobilityScore(walkScoreData, nearbyStations);
    
    return {
      location: { lat, lng, address },
      walkScore: walkScoreData,
      nearbyStations,
      stationArrivals,
      mobilityScore,
      summary: this.generateMobilitySummaryText(walkScoreData, nearbyStations, mobilityScore),
      timestamp: Date.now()
    };
  },
  
  /**
   * Find MARTA stations near a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusMiles - Search radius in miles
   * @returns {Array} Nearby stations sorted by distance
   */
  findNearbyStations(lat, lng, radiusMiles = 1) {
    // MARTA Rail Stations
    const stations = [
      { name: 'North Springs', lat: 34.0206, lng: -84.3568, line: 'RED' },
      { name: 'Sandy Springs', lat: 33.9322, lng: -84.3513, line: 'RED' },
      { name: 'Dunwoody', lat: 33.9230, lng: -84.3356, line: 'RED' },
      { name: 'Medical Center', lat: 33.9100, lng: -84.3511, line: 'RED' },
      { name: 'Buckhead', lat: 33.8475, lng: -84.3675, line: 'RED' },
      { name: 'Lindbergh Center', lat: 33.8239, lng: -84.3692, line: 'RED/GOLD' },
      { name: 'Arts Center', lat: 33.7896, lng: -84.3871, line: 'RED/GOLD' },
      { name: 'Midtown', lat: 33.7806, lng: -84.3862, line: 'RED/GOLD' },
      { name: 'North Avenue', lat: 33.7716, lng: -84.3872, line: 'RED/GOLD' },
      { name: 'Civic Center', lat: 33.7662, lng: -84.3871, line: 'RED/GOLD' },
      { name: 'Peachtree Center', lat: 33.7595, lng: -84.3875, line: 'RED/GOLD' },
      { name: 'Five Points', lat: 33.7539, lng: -84.3916, line: 'ALL' },
      { name: 'Garnett', lat: 33.7484, lng: -84.3958, line: 'RED/GOLD' },
      { name: 'West End', lat: 33.7354, lng: -84.4129, line: 'RED/GOLD' },
      { name: 'Oakland City', lat: 33.7170, lng: -84.4248, line: 'RED/GOLD' },
      { name: 'Lakewood/Ft. McPherson', lat: 33.7007, lng: -84.4290, line: 'RED/GOLD' },
      { name: 'East Point', lat: 33.6767, lng: -84.4393, line: 'RED/GOLD' },
      { name: 'College Park', lat: 33.6514, lng: -84.4493, line: 'RED/GOLD' },
      { name: 'Airport', lat: 33.6395, lng: -84.4442, line: 'RED/GOLD' },
      { name: 'Doraville', lat: 33.9022, lng: -84.2803, line: 'GOLD' },
      { name: 'Chamblee', lat: 33.8880, lng: -84.3044, line: 'GOLD' },
      { name: 'Brookhaven', lat: 33.8598, lng: -84.3387, line: 'GOLD' },
      { name: 'Lenox', lat: 33.8453, lng: -84.3577, line: 'GOLD' },
      { name: 'Georgia State', lat: 33.7493, lng: -84.3857, line: 'BLUE/GREEN' },
      { name: 'King Memorial', lat: 33.7496, lng: -84.3751, line: 'BLUE/GREEN' },
      { name: 'Inman Park', lat: 33.7576, lng: -84.3527, line: 'BLUE/GREEN' },
      { name: 'Edgewood/Candler Park', lat: 33.7615, lng: -84.3401, line: 'BLUE/GREEN' },
      { name: 'East Lake', lat: 33.7652, lng: -84.3125, line: 'BLUE/GREEN' },
      { name: 'Decatur', lat: 33.7744, lng: -84.2969, line: 'BLUE/GREEN' },
      { name: 'Avondale', lat: 33.7775, lng: -84.2813, line: 'BLUE/GREEN' },
      { name: 'Kensington', lat: 33.7724, lng: -84.2524, line: 'BLUE/GREEN' },
      { name: 'Indian Creek', lat: 33.7692, lng: -84.2289, line: 'BLUE/GREEN' },
      { name: 'Hamilton E. Holmes', lat: 33.7544, lng: -84.4697, line: 'BLUE/GREEN' },
      { name: 'West Lake', lat: 33.7531, lng: -84.4458, line: 'BLUE/GREEN' },
      { name: 'Ashby', lat: 33.7562, lng: -84.4145, line: 'BLUE/GREEN' },
      { name: 'Vine City', lat: 33.7566, lng: -84.4042, line: 'BLUE/GREEN' },
      { name: 'Dome/GWCC', lat: 33.7600, lng: -84.3959, line: 'BLUE/GREEN' }
    ];
    
    const radiusMeters = radiusMiles * 1609.34;
    
    return stations
      .map(station => ({
        ...station,
        distance: this.calculateDistance(lat, lng, station.lat, station.lng),
        distanceMiles: (this.calculateDistance(lat, lng, station.lat, station.lng) / 1609.34).toFixed(2)
      }))
      .filter(s => s.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  },
  
  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  /**
   * Calculate overall mobility score
   */
  calculateMobilityScore(walkScoreData, nearbyStations) {
    const walkWeight = 0.35;
    const transitWeight = 0.40;
    const bikeWeight = 0.25;
    
    // Boost transit score based on number of nearby stations
    let stationBonus = Math.min(20, nearbyStations.length * 5);
    
    const score = (
      walkScoreData.walkScore * walkWeight +
      (walkScoreData.transitScore + stationBonus) * transitWeight +
      walkScoreData.bikeScore * bikeWeight
    );
    
    return Math.round(Math.min(100, score));
  },
  
  /**
   * Generate human-readable mobility summary
   */
  generateMobilitySummaryText(walkScoreData, nearbyStations, mobilityScore) {
    const parts = [];
    
    if (mobilityScore >= 80) {
      parts.push("🌟 Excellent mobility options!");
    } else if (mobilityScore >= 60) {
      parts.push("✅ Good mobility options.");
    } else if (mobilityScore >= 40) {
      parts.push("⚠️ Limited mobility options.");
    } else {
      parts.push("🚗 Car-dependent area.");
    }
    
    if (nearbyStations.length > 0) {
      const closest = nearbyStations[0];
      parts.push(`Nearest MARTA: ${closest.name} (${closest.distanceMiles} mi)`);
    }
    
    parts.push(`Walk Score: ${walkScoreData.walkScore} - ${walkScoreData.walkDescription}`);
    
    if (walkScoreData.bikeScore > 50) {
      parts.push(`Bike Score: ${walkScoreData.bikeScore} - ${walkScoreData.bikeDescription}`);
    }
    
    return parts.join(' | ');
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobilityAPI;
}

// Make available globally
window.MobilityAPI = MobilityAPI;
