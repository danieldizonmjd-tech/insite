/**
 * Transit Helper - Public Transportation Layer for InSite
 * Provides MARTA rail stations, bus routes, and transit accessibility scoring
 */

class TransitHelper {
  constructor() {
    this.transitLayers = {
      railStations: null,
      busStops: null,
      transitZones: null
    };
    
    // MARTA Rail Stations (Major stations in Atlanta metro)
    this.martaRailStations = [
      // Red/Gold Line (North-South)
      { name: 'North Springs', lat: 34.0206, lng: -84.3568, line: 'Red', color: '#E41E26' },
      { name: 'Sandy Springs', lat: 33.9322, lng: -84.3513, line: 'Red', color: '#E41E26' },
      { name: 'Dunwoody', lat: 33.9230, lng: -84.3356, line: 'Red', color: '#E41E26' },
      { name: 'Medical Center', lat: 33.9100, lng: -84.3511, line: 'Red', color: '#E41E26' },
      { name: 'Buckhead', lat: 33.8475, lng: -84.3675, line: 'Red', color: '#E41E26' },
      { name: 'Lindbergh Center', lat: 33.8239, lng: -84.3692, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Arts Center', lat: 33.7896, lng: -84.3871, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Midtown', lat: 33.7806, lng: -84.3862, line: 'Red/Gold', color: '#F1B434' },
      { name: 'North Avenue', lat: 33.7716, lng: -84.3872, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Civic Center', lat: 33.7662, lng: -84.3871, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Peachtree Center', lat: 33.7595, lng: -84.3875, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Five Points', lat: 33.7539, lng: -84.3916, line: 'All Lines', color: '#00A4E4' },
      { name: 'Garnett', lat: 33.7484, lng: -84.3958, line: 'Red/Gold', color: '#F1B434' },
      { name: 'West End', lat: 33.7354, lng: -84.4129, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Oakland City', lat: 33.7170, lng: -84.4248, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Lakewood/Ft. McPherson', lat: 33.7007, lng: -84.4290, line: 'Red/Gold', color: '#F1B434' },
      { name: 'East Point', lat: 33.6767, lng: -84.4393, line: 'Red/Gold', color: '#F1B434' },
      { name: 'College Park', lat: 33.6514, lng: -84.4493, line: 'Red/Gold', color: '#F1B434' },
      { name: 'Airport', lat: 33.6395, lng: -84.4442, line: 'Red/Gold', color: '#F1B434' },
      
      // Blue/Green Line (East-West)
      { name: 'Doraville', lat: 33.9022, lng: -84.2803, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Chamblee', lat: 33.8880, lng: -84.3044, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Brookhaven', lat: 33.8598, lng: -84.3387, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Lenox', lat: 33.8453, lng: -84.3577, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Georgia State', lat: 33.7493, lng: -84.3857, line: 'Blue/Green', color: '#009FDA' },
      { name: 'King Memorial', lat: 33.7496, lng: -84.3751, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Inman Park', lat: 33.7576, lng: -84.3527, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Edgewood/Candler Park', lat: 33.7615, lng: -84.3401, line: 'Blue/Green', color: '#009FDA' },
      { name: 'East Lake', lat: 33.7652, lng: -84.3125, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Decatur', lat: 33.7744, lng: -84.2969, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Avondale', lat: 33.7775, lng: -84.2813, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Kensington', lat: 33.7724, lng: -84.2524, line: 'Blue/Green', color: '#009FDA' },
      { name: 'Indian Creek', lat: 33.7692, lng: -84.2289, line: 'Blue/Green', color: '#009FDA' },
      
      // West Line
      { name: 'Hamilton E. Holmes', lat: 33.7544, lng: -84.4697, line: 'Blue/Green', color: '#00A651' },
      { name: 'West Lake', lat: 33.7531, lng: -84.4458, line: 'Blue/Green', color: '#00A651' },
      { name: 'Ashby', lat: 33.7562, lng: -84.4145, line: 'Blue/Green', color: '#00A651' },
      { name: 'Vine City', lat: 33.7566, lng: -84.4042, line: 'Blue/Green', color: '#00A651' },
      { name: 'Dome/GWCC', lat: 33.7600, lng: -84.3959, line: 'Blue/Green', color: '#00A651' }
    ];
    
    // Transit accessibility zones (0.5 mile radius around stations)
    this.transitAccessibilityRadius = 804.672; // 0.5 miles in meters
  }
  
  /**
   * Calculate transit score for a ZIP code based on proximity to MARTA stations
   * @param {number} lat - Latitude of ZIP code centroid
   * @param {number} lng - Longitude of ZIP code centroid
   * @returns {Object} Transit score and details
   */
  calculateTransitScore(lat, lng) {
    if (!lat || !lng) return { score: 0, nearestStation: null, distance: Infinity, stationsWithin1Mile: 0 };
    
    let nearestStation = null;
    let minDistance = Infinity;
    let stationsWithin1Mile = 0;
    let stationsWithinHalfMile = 0;
    
    this.martaRailStations.forEach(station => {
      const distance = this.calculateDistance(lat, lng, station.lat, station.lng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
      
      if (distance <= 1609.34) { // 1 mile in meters
        stationsWithin1Mile++;
      }
      
      if (distance <= this.transitAccessibilityRadius) {
        stationsWithinHalfMile++;
      }
    });
    
    // Calculate score (0-100)
    // 100 = within 0.25 miles of station
    // 50 = within 1 mile of station
    // 0 = more than 3 miles from station
    let score = 0;
    if (minDistance <= 402.336) { // 0.25 miles
      score = 100;
    } else if (minDistance <= 804.672) { // 0.5 miles
      score = 90;
    } else if (minDistance <= 1609.34) { // 1 mile
      score = 70 - ((minDistance - 804.672) / (1609.34 - 804.672)) * 20;
    } else if (minDistance <= 4828.03) { // 3 miles
      score = 50 - ((minDistance - 1609.34) / (4828.03 - 1609.34)) * 50;
    }
    
    return {
      score: Math.round(score),
      nearestStation: nearestStation ? nearestStation.name : 'None nearby',
      nearestStationLine: nearestStation ? nearestStation.line : null,
      distance: minDistance,
      distanceMiles: (minDistance / 1609.34).toFixed(2),
      stationsWithin1Mile,
      stationsWithinHalfMile,
      accessibility: this.getAccessibilityLabel(score)
    };
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
  
  /**
   * Get accessibility label based on transit score
   */
  getAccessibilityLabel(score) {
    if (score >= 90) return 'Excellent - Walking distance to MARTA';
    if (score >= 70) return 'Very Good - Easy access to transit';
    if (score >= 50) return 'Good - Transit accessible';
    if (score >= 25) return 'Fair - Limited transit options';
    return 'Poor - Car dependent';
  }
  
  /**
   * Get transit recommendations for a location
   */
  getTransitRecommendations(transitScore) {
    const recommendations = [];
    
    if (transitScore.score >= 80) {
      recommendations.push({
        icon: '✅',
        text: 'Excellent for car-free living',
        type: 'success'
      });
      recommendations.push({
        icon: '💰',
        text: 'Save money on transportation costs',
        type: 'success'
      });
    } else if (transitScore.score >= 50) {
      recommendations.push({
        icon: '🚗',
        text: 'Hybrid lifestyle - transit available but may need car',
        type: 'info'
      });
    } else {
      recommendations.push({
        icon: '🚙',
        text: 'Car recommended for daily commuting',
        type: 'warning'
      });
      recommendations.push({
        icon: '⚠️',
        text: 'Limited public transit access',
        type: 'warning'
      });
    }
    
    if (transitScore.nearestStation !== 'None nearby') {
      recommendations.push({
        icon: '🚇',
        text: `Nearest MARTA: ${transitScore.nearestStation} (${transitScore.distanceMiles} mi)`,
        type: 'info'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Create HTML for transit score display
   */
  createTransitScoreHTML(transitScore) {
    const scoreColor = transitScore.score >= 70 ? 'var(--success)' : 
                       transitScore.score >= 40 ? 'var(--warning)' : 'var(--danger)';
    
    return `
      <div class="stat-card" style="border-color: ${scoreColor};">
        <div class="stat-label">🚇 Transit Score</div>
        <div class="stat-value" style="color: ${scoreColor};">${transitScore.score}/100</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
          ${transitScore.accessibility}
        </div>
        ${transitScore.nearestStation !== 'None nearby' ? `
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
            ${transitScore.nearestStation} • ${transitScore.distanceMiles} mi
          </div>
        ` : ''}
      </div>
    `;
  }
   /**
   * Create detailed transit info section
   */
  createDetailedTransitInfo(transitScore) {
    const stations = this.findNearestStations(transitScore, 3);
    
    let html = `
      <div class="glass-card" style="margin-top: 1rem;">
        <h3 style="color: var(--accent); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          🚇 Public Transit Information
        </h3>
        
        <div style="display: grid; gap: 1rem;">
          <div style="background: rgba(0, 164, 228, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #00A4E4;">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
              Transit Accessibility: ${transitScore.accessibility}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
              Score: ${transitScore.score}/100
            </div>
          </div>
          
          ${transitScore.stationsWithinHalfMile > 0 ? `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px;">
              <div style="font-weight: 600; color: var(--success); margin-bottom: 0.5rem;">
                ✅ ${transitScore.stationsWithinHalfMile} MARTA station(s) within walking distance (0.5 mi)
              </div>
            </div>
          ` : ''}
          
          ${stations.length > 0 ? `
            <div>
              <h4 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.75rem; font-weight: 600;">
                Nearest MARTA Stations:
              </h4>
              ${stations.map(station => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px; margin-bottom: 0.5rem; border-left: 3px solid ${station.color};">
                  <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${station.name}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${station.line} Line</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--primary);">${station.distance}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${station.walkTime}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Find nearest stations with details
   */
  findNearestStations(transitScore, count = 3) {
    // This would be populated with actual calculation
    // For now, return based on transitScore data
    const stations = [];
    
    if (transitScore.nearestStation && transitScore.nearestStation !== 'None nearby') {
      const station = this.martaRailStations.find(s => s.name === transitScore.nearestStation);
      if (station) {
        const walkTime = Math.round(parseFloat(transitScore.distanceMiles) * 20); // ~20 min per mile
        stations.push({
          name: station.name,
          line: station.line,
          color: station.color,
          distance: `${transitScore.distanceMiles} mi`,
          walkTime: `~${walkTime} min walk`
        });
      }
    }
    
    return stations;
  }
  
  /**
   * Find top transit-accessible neighborhoods
   * @param {Object} zipData - Object containing ZIP code data
   * @param {number} limit - Number of results to return
   * @returns {Array} Top transit-accessible neighborhoods
   */
  findTopTransitAccessible(zipData, limit = 8) {
    const results = [];
    
    for (const zip in zipData) {
      const data = zipData[zip];
      
      // Get coordinates from the data structure
      let lat, lng;
      
      // Try multiple possible coordinate locations in the data
      if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
        lat = data.coordinates.lat;
        lng = data.coordinates.lng;
      } else if (data.centroid && data.centroid.lat && data.centroid.lng) {
        lat = data.centroid.lat;
        lng = data.centroid.lng;
      } else if (data.lat && data.lng) {
        lat = data.lat;
        lng = data.lng;
      } else if (data.latitude && data.longitude) {
        lat = data.latitude;
        lng = data.longitude;
      }
      
      // Skip if no coordinates found
      if (!lat || !lng) {
        console.warn(`No coordinates found for ZIP ${zip}`);
        continue;
      }
      
      // Calculate transit score
      const transitScore = this.calculateTransitScore(lat, lng);
      
      // Only include if score is > 0
      if (transitScore.score > 0) {
        results.push({
          zip,
          data,
          transitScore
        });
      }
    }
    
    // Sort by transit score (highest first) and return top results
    return results
      .sort((a, b) => b.transitScore.score - a.transitScore.score)
      .slice(0, limit);
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransitHelper;
}
