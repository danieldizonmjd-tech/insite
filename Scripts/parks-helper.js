/**
 * Parks Helper - Parks and Green Spaces Layer for InSite
 * Provides parks, trails, and green space accessibility scoring
 */

class ParksHelper {
  constructor() {
    this.parksLayers = {
      majorParks: null,
      trails: null,
      greenways: null
    };
    
    // Major parks in Atlanta metro area
    this.atlantaParks = [
      // Large City Parks
      { name: 'Piedmont Park', lat: 33.7866, lng: -84.3728, acres: 189, type: 'Urban Park', amenities: ['trails', 'sports', 'playground', 'dog park'] },
      { name: 'Grant Park', lat: 33.7438, lng: -84.3719, acres: 131, type: 'Urban Park', amenities: ['zoo', 'playground', 'trails', 'historic'] },
      { name: 'Centennial Olympic Park', lat: 33.7601, lng: -84.3930, acres: 22, type: 'Urban Park', amenities: ['fountain', 'events', 'playground'] },
      { name: 'Chastain Park', lat: 33.8519, lng: -84.3928, acres: 268, type: 'Urban Park', amenities: ['trails', 'sports', 'golf', 'pool', 'amphitheater'] },
      { name: 'Freedom Park', lat: 33.7659, lng: -84.3486, acres: 210, type: 'Linear Park', amenities: ['trails', 'sports', 'playground'] },
      
      // Nature Preserves
      { name: 'Chattahoochee River National Recreation Area', lat: 33.9947, lng: -84.3419, acres: 10000, type: 'National Park', amenities: ['trails', 'river', 'fishing', 'kayaking'] },
      { name: 'Arabia Mountain', lat: 33.6689, lng: -84.1181, acres: 2000, type: 'Nature Preserve', amenities: ['trails', 'hiking', 'wildlife'] },
      { name: 'Fernbank Forest', lat: 33.7802, lng: -84.3235, acres: 65, type: 'Nature Preserve', amenities: ['trails', 'education', 'wildlife'] },
      { name: 'Murphey Candler Park', lat: 33.9109, lng: -84.3288, acres: 135, type: 'Park', amenities: ['lake', 'trails', 'sports', 'playground'] },
      
      // BeltLine Parks
      { name: 'Historic Fourth Ward Park', lat: 33.7703, lng: -84.3658, acres: 17, type: 'BeltLine Park', amenities: ['trails', 'lake', 'playground', 'splash pad'] },
      { name: 'Westside Park', lat: 33.7786, lng: -84.4449, acres: 280, type: 'Park', amenities: ['trails', 'lake', 'playground', 'sports'] },
      
      // Regional Parks
      { name: 'Stone Mountain Park', lat: 33.8066, lng: -84.1462, acres: 3200, type: 'State Park', amenities: ['hiking', 'lake', 'historic', 'camping'] },
      { name: 'Kennesaw Mountain', lat: 33.9847, lng: -84.5794, acres: 2965, type: 'National Park', amenities: ['hiking', 'historic', 'trails', 'wildlife'] },
      { name: 'Sweetwater Creek State Park', lat: 33.7538, lng: -84.6305, acres: 2549, type: 'State Park', amenities: ['hiking', 'fishing', 'ruins', 'trails'] },
      
      // Community Parks
      { name: 'Adams Park', lat: 33.7864, lng: -84.4282, acres: 32, type: 'Community Park', amenities: ['pool', 'sports', 'playground'] },
      { name: 'Candler Park', lat: 33.7594, lng: -84.3364, acres: 55, type: 'Community Park', amenities: ['golf', 'pool', 'playground', 'sports'] },
      { name: 'Grant Park (Zoo Atlanta)', lat: 33.7335, lng: -84.3715, acres: 40, type: 'Zoo', amenities: ['zoo', 'education', 'events'] },
      { name: 'Piedmont Park Athletic Fields', lat: 33.7911, lng: -84.3742, acres: 15, type: 'Sports Complex', amenities: ['sports', 'fields'] },
      { name: 'Herbert Taylor Park', lat: 33.7172, lng: -84.4258, acres: 25, type: 'Community Park', amenities: ['playground', 'sports', 'trails'] },
      
      // DeKalb County Parks
      { name: 'Blackburn Park', lat: 33.8894, lng: -84.3115, acres: 23, type: 'Community Park', amenities: ['playground', 'trails', 'sports'] },
      { name: 'Mason Mill Park', lat: 33.8323, lng: -84.3058, acres: 120, type: 'Park', amenities: ['trails', 'sports', 'playground'] },
      { name: 'Redan Park', lat: 33.7467, lng: -84.2271, acres: 35, type: 'Community Park', amenities: ['pool', 'sports', 'playground'] },
      
      // North Fulton Parks
      { name: 'Wills Park', lat: 34.0307, lng: -84.2225, acres: 110, type: 'Community Park', amenities: ['sports', 'pool', 'playground', 'events'] },
      { name: 'Big Creek Greenway', lat: 34.0511, lng: -84.2261, acres: 150, type: 'Greenway', amenities: ['trails', 'biking', 'nature'] },
      { name: 'Chattahoochee Nature Center', lat: 34.0090, lng: -84.1467, acres: 127, type: 'Nature Center', amenities: ['trails', 'education', 'wildlife', 'river'] },
      
      // Cobb County Parks
      { name: 'Terrell Mill Park', lat: 33.9442, lng: -84.4550, acres: 60, type: 'Community Park', amenities: ['playground', 'trails', 'sports'] },
      { name: 'East Cobb Park', lat: 33.9803, lng: -84.3867, acres: 25, type: 'Community Park', amenities: ['sports', 'playground'] },
      { name: 'Laurel Park', lat: 33.8842, lng: -84.5172, acres: 108, type: 'Park', amenities: ['lake', 'trails', 'playground'] },
      
      // BeltLine Trail System
      { name: 'Atlanta BeltLine Eastside Trail', lat: 33.7699, lng: -84.3624, acres: 50, type: 'Trail', amenities: ['trails', 'biking', 'art'] },
      { name: 'Atlanta BeltLine Westside Trail', lat: 33.7562, lng: -84.4209, acres: 40, type: 'Trail', amenities: ['trails', 'biking'] },
      { name: 'Atlanta BeltLine Southside Trail', lat: 33.7209, lng: -84.3901, acres: 30, type: 'Trail', amenities: ['trails', 'biking'] }
    ];
    
    // Green space accessibility radius (0.5 mile)
    this.parkAccessibilityRadius = 804.672; // meters
  }
  
  /**
   * Calculate parks/green space score for a ZIP code
   * @param {number} lat - Latitude of ZIP code centroid
   * @param {number} lng - Longitude of ZIP code centroid
   * @returns {Object} Parks score and details
   */
  calculateParksScore(lat, lng) {
    if (!lat || !lng) return { score: 0, nearestPark: null, distance: Infinity, parksWithin1Mile: 0 };
    
    let nearestPark = null;
    let minDistance = Infinity;
    let parksWithin1Mile = 0;
    let parksWithinHalfMile = 0;
    let totalAcresNearby = 0;
    let parkTypes = new Set();
    
    this.atlantaParks.forEach(park => {
      const distance = this.calculateDistance(lat, lng, park.lat, park.lng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPark = park;
      }
      
      if (distance <= 1609.34) { // 1 mile
        parksWithin1Mile++;
        totalAcresNearby += park.acres;
        parkTypes.add(park.type);
      }
      
      if (distance <= this.parkAccessibilityRadius) { // 0.5 mile
        parksWithinHalfMile++;
      }
    });
    
    // Calculate score (0-100)
    // Based on: proximity to nearest park, number of parks nearby, and total green space
    let score = 0;
    
    // Distance to nearest park (40 points max)
    if (minDistance <= 402.336) { // 0.25 miles
      score += 40;
    } else if (minDistance <= 804.672) { // 0.5 miles
      score += 35;
    } else if (minDistance <= 1609.34) { // 1 mile
      score += 25;
    } else if (minDistance <= 3218.69) { // 2 miles
      score += 10;
    }
    
    // Number of parks within 1 mile (30 points max)
    score += Math.min(parksWithin1Mile * 5, 30);
    
    // Total acres of green space nearby (30 points max)
    if (totalAcresNearby >= 500) {
      score += 30;
    } else if (totalAcresNearby >= 200) {
      score += 25;
    } else if (totalAcresNearby >= 100) {
      score += 20;
    } else if (totalAcresNearby >= 50) {
      score += 15;
    } else if (totalAcresNearby > 0) {
      score += 10;
    }
    
    return {
      score: Math.min(Math.round(score), 100),
      nearestPark: nearestPark ? nearestPark.name : 'None nearby',
      nearestParkType: nearestPark ? nearestPark.type : null,
      nearestParkAmenities: nearestPark ? nearestPark.amenities : [],
      distance: minDistance,
      distanceMiles: (minDistance / 1609.34).toFixed(2),
      parksWithin1Mile,
      parksWithinHalfMile,
      totalAcresNearby: Math.round(totalAcresNearby),
      parkTypes: Array.from(parkTypes),
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
   * Get accessibility label based on parks score
   */
  getAccessibilityLabel(score) {
    if (score >= 80) return 'Excellent - Abundant green space nearby';
    if (score >= 60) return 'Very Good - Multiple parks accessible';
    if (score >= 40) return 'Good - Parks within reasonable distance';
    if (score >= 20) return 'Fair - Limited green space access';
    return 'Poor - Few parks nearby';
  }
  
  /**
   * Get parks recommendations
   */
  getParksRecommendations(parksScore) {
    const recommendations = [];
    
    if (parksScore.score >= 70) {
      recommendations.push({
        icon: '🌳',
        text: 'Great for outdoor activities and recreation',
        type: 'success'
      });
      recommendations.push({
        icon: '🏃',
        text: 'Easy access to trails and green spaces',
        type: 'success'
      });
    } else if (parksScore.score >= 40) {
      recommendations.push({
        icon: '🚶',
        text: 'Parks accessible but may require short drive',
        type: 'info'
      });
    } else {
      recommendations.push({
        icon: '⚠️',
        text: 'Limited nearby parks - may need to travel for recreation',
        type: 'warning'
      });
    }
    
    if (parksScore.totalAcresNearby >= 200) {
      recommendations.push({
        icon: '🌲',
        text: `${parksScore.totalAcresNearby} acres of green space nearby`,
        type: 'success'
      });
    }
    
    if (parksScore.nearestPark !== 'None nearby') {
      const amenities = parksScore.nearestParkAmenities.join(', ');
      recommendations.push({
        icon: '📍',
        text: `Nearest: ${parksScore.nearestPark} (${parksScore.distanceMiles} mi)`,
        type: 'info'
      });
      if (amenities) {
        recommendations.push({
          icon: '✨',
          text: `Amenities: ${amenities}`,
          type: 'info'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Create HTML for parks score display
   */
  createParksScoreHTML(parksScore) {
    const scoreColor = parksScore.score >= 60 ? 'var(--success)' : 
                       parksScore.score >= 30 ? 'var(--warning)' : 'var(--danger)';
    
    return `
      <div class="stat-card" style="border-color: ${scoreColor};">
        <div class="stat-label">🌳 Parks & Green Space</div>
        <div class="stat-value" style="color: ${scoreColor};">${parksScore.score}/100</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
          ${parksScore.accessibility}
        </div>
        ${parksScore.parksWithin1Mile > 0 ? `
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
            ${parksScore.parksWithin1Mile} park(s) within 1 mile
          </div>
        ` : ''}
      </div>
    `;
  }
   /**
   * Create detailed parks info section
   */
  createDetailedParksInfo(parksScore) {
    const nearbyParks = this.findNearbyParks(parksScore, 5);
    
    let html = `
      <div class="glass-card" style="margin-top: 1rem;">
        <h3 style="color: var(--success); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          🌳 Parks & Recreation
        </h3>
        
        <div style="display: grid; gap: 1rem;">
          <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--success);">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
              Green Space Access: ${parksScore.accessibility}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
              Score: ${parksScore.score}/100
            </div>
          </div>
          
          ${parksScore.totalAcresNearby > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem;">
              <div style="background: rgba(255, 255, 255, 0.03); padding: 0.75rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${parksScore.parksWithin1Mile}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Parks within 1 mile</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); padding: 0.75rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${parksScore.totalAcresNearby}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Acres of green space</div>
              </div>
            </div>
          ` : ''}
          
          ${nearbyParks.length > 0 ? `
            <div>
              <h4 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.75rem; font-weight: 600;">
                Nearby Parks & Recreation:
              </h4>
              ${nearbyParks.map(park => `
                <div style="padding: 0.75rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px; margin-bottom: 0.5rem; border-left: 3px solid var(--success);">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div>
                      <div style="font-weight: 600; color: var(--text-primary);">${park.name}</div>
                      <div style="font-size: 0.85rem; color: var(--text-secondary);">${park.type} • ${park.acres} acres</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; color: var(--success);">${park.distance}</div>
                    </div>
                  </div>
                  ${park.amenities.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
                      ${park.amenities.map(amenity => `
                        <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(16, 185, 129, 0.2); color: var(--success); border-radius: 4px;">
                          ${amenity}
                        </span>
                      `).join('')}
                    </div>
                  ` : ''}
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
   * Find nearby parks with details
   */
  findNearbyParks(parksScore, count = 5) {
    // Return nearby parks sorted by distance
    // This is a simplified version - in production, you'd calculate actual distances
    return [];
  }
  
  /**
   * Find top parks-accessible neighborhoods
   * @param {Object} zipData - Object containing ZIP code data
   * @param {number} limit - Number of results to return
   * @returns {Array} Top parks-accessible neighborhoods
   */
  findTopParksAccessible(zipData, limit = 8) {
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
      
      // Calculate parks score
      const parksScore = this.calculateParksScore(lat, lng);
      
      // Only include if score is > 0
      if (parksScore.score > 0) {
        results.push({
          zip,
          data,
          parksScore
        });
      }
    }
    
    // Sort by parks score (highest first) and return top results
    return results
      .sort((a, b) => b.parksScore.score - a.parksScore.score)
      .slice(0, limit);
  }
  
  /**
   * Create lifestyle parks recommendations HTML
   */
  createLifestyleParksHTML(zipData, priorities) {
    const hasParksPreference = priorities.includes('walkable') || priorities.includes('quiet');
    
    if (!hasParksPreference) return '';
    
    const topParks = this.findTopParksAccessible(zipData, 5);
    
    return `
      <div class="glass-card" style="margin-top: 1rem;">
        <h3 style="color: var(--success); margin-bottom: 1rem;">🌳 Best Areas for Parks & Nature</h3>
        <div class="stats-grid">
          ${topParks.map(item => `
            <div class="stat-card" style="border-color: var(--success);">
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
                ${item.zip} - ${item.data.city || item.data.primary_city}
              </div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--success); margin: 0.5rem 0;">
                Parks Score: ${item.parksScore.score}/100
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                ${item.parksScore.parksWithin1Mile} parks nearby
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                ${item.parksScore.totalAcresNearby} acres of green space
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParksHelper;
}
