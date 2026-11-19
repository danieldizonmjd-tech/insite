/**
 * Enhanced Transit Features for InSite Map
 * Provides advanced transit features including real-time tracking, journey planning, and accessibility analysis
 */

class EnhancedTransitFeatures {
  constructor(map) {
    this.map = map;
    this.transitData = {
      marta: null,
      cobbLinc: null,
      gwinnett: null,
      xpress: null
    };
    this.layers = {
      transitStops: L.layerGroup(),
      transitRoutes: L.layerGroup(),
      accessibilityZones: L.layerGroup(),
      parkAndRide: L.layerGroup()
    };
    this.transitStops = [];
    this.transitRoutes = [];
    this.parkAndRideLocations = [];
  }

  /**
   * Initialize all transit features
   */
  async initialize() {
    console.log('🚇 Initializing Enhanced Transit Features...');
    
    try {
      await this.loadTransitData();
      this.createTransitLayers();
      this.initializeTransitControls();
      console.log('✅ Transit features initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing transit features:', error);
    }
  }

  /**
   * Load GTFS transit data from multiple agencies
   */
  async loadTransitData() {
    const agencies = ['MARTA', 'CobbLinc', 'Gwinnett_County_Transit'];
    
    for (const agency of agencies) {
      try {
        const stops = await this.loadGTFSStops(agency);
        const routes = await this.loadGTFSRoutes(agency);
        
        this.transitStops.push(...stops.map(stop => ({
          ...stop,
          agency: agency
        })));
        
        this.transitRoutes.push(...routes.map(route => ({
          ...route,
          agency: agency
        })));
        
        console.log(`✅ Loaded ${stops.length} stops and ${routes.length} routes from ${agency}`);
      } catch (error) {
        console.warn(`⚠️ Could not load data from ${agency}:`, error);
      }
    }
  }

  /**
   * Load GTFS stops from agency
   */
  async loadGTFSStops(agency) {
    try {
      const response = await fetch(`/Data/${agency}/stops.txt`);
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        const stop = {};
        headers.forEach((header, i) => {
          stop[header.trim()] = values[i];
        });
        return stop;
      });
    } catch (error) {
      console.error(`Error loading stops for ${agency}:`, error);
      return [];
    }
  }

  /**
   * Load GTFS routes from agency
   */
  async loadGTFSRoutes(agency) {
    try {
      const response = await fetch(`/Data/${agency}/routes.txt`);
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        const route = {};
        headers.forEach((header, i) => {
          route[header.trim()] = values[i];
        });
        return route;
      });
    } catch (error) {
      console.error(`Error loading routes for ${agency}:`, error);
      return [];
    }
  }

  /**
   * Parse CSV line handling quoted values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  /**
   * Create transit stop markers
   */
  createTransitLayers() {
    // Clear existing layers
    this.layers.transitStops.clearLayers();
    
    // Group stops by agency
    const stopsByAgency = {
      'MARTA': [],
      'CobbLinc': [],
      'Gwinnett_County_Transit': []
    };
    
    this.transitStops.forEach(stop => {
      if (stop.stop_lat && stop.stop_lon) {
        const lat = parseFloat(stop.stop_lat);
        const lon = parseFloat(stop.stop_lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.circleMarker([lat, lon], {
            radius: 5,
            fillColor: this.getAgencyColor(stop.agency),
            color: '#fff',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.7
          });
          
          marker.bindPopup(this.createStopPopup(stop));
          marker.on('click', () => this.showScheduleForStop(stop));
          
          this.layers.transitStops.addLayer(marker);
          
          if (stopsByAgency[stop.agency]) {
            stopsByAgency[stop.agency].push(stop);
          }
        }
      }
    });
    
    console.log('Transit stops by agency:', Object.keys(stopsByAgency).map(agency => 
      `${agency}: ${stopsByAgency[agency].length}`
    ).join(', '));
  }

  /**
   * Get color for transit agency
   */
  getAgencyColor(agency) {
    const colors = {
      'MARTA': '#E41E26',
      'CobbLinc': '#0066CC',
      'Gwinnett_County_Transit': '#00A651',
      'default': '#666666'
    };
    return colors[agency] || colors.default;
  }

  /**
   * Create popup content for transit stop
   */
  createStopPopup(stop) {
    return `
      <div class="transit-stop-popup" style="min-width: 250px;">
        <h3 style="margin: 0 0 10px 0; color: ${this.getAgencyColor(stop.agency)};">
          ${stop.stop_name || 'Transit Stop'}
        </h3>
        <div style="font-size: 12px; color: #666;">
          <strong>Agency:</strong> ${stop.agency}<br>
          <strong>Stop ID:</strong> ${stop.stop_id}<br>
          ${stop.stop_code ? `<strong>Stop Code:</strong> ${stop.stop_code}<br>` : ''}
        </div>
        <button onclick="transitFeatures.showScheduleForStop('${stop.stop_id}', '${stop.agency}')" 
                style="margin-top: 10px; padding: 8px 16px; background: ${this.getAgencyColor(stop.agency)}; 
                       color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
          📅 View Schedule
        </button>
        <button onclick="transitFeatures.planJourneyFromStop('${stop.stop_id}', ${stop.stop_lat}, ${stop.stop_lon})" 
                style="margin-top: 5px; padding: 8px 16px; background: #4CAF50; 
                       color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
          🗺️ Plan Journey
        </button>
      </div>
    `;
  }

  /**
   * Feature 2: Transit Schedule Lookup
   * Show upcoming arrivals at a selected stop
   */
  async showScheduleForStop(stopId, agency) {
    console.log(`📅 Showing schedule for stop ${stopId} (${agency})`);
    
    try {
      const stopTimes = await this.loadStopTimes(agency, stopId);
      this.displayScheduleModal(stopId, agency, stopTimes);
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Unable to load schedule at this time');
    }
  }

  /**
   * Load stop times from GTFS data
   */
  async loadStopTimes(agency, stopId) {
    try {
      const response = await fetch(`/Data/${agency}/stop_times.txt`);
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      const stopTimes = lines.slice(1)
        .map(line => {
          const values = this.parseCSVLine(line);
          const stopTime = {};
          headers.forEach((header, i) => {
            stopTime[header.trim()] = values[i];
          });
          return stopTime;
        })
        .filter(st => st.stop_id === stopId)
        .slice(0, 20); // Get next 20 arrivals
      
      return stopTimes;
    } catch (error) {
      console.error('Error loading stop times:', error);
      return [];
    }
  }

  /**
   * Display schedule in modal
   */
  displayScheduleModal(stopId, agency, stopTimes) {
    const modal = document.createElement('div');
    modal.className = 'transit-schedule-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    const scheduleHTML = stopTimes.length > 0 ? stopTimes.map(st => `
      <div style="padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
        <span><strong>Trip:</strong> ${st.trip_id}</span>
        <span style="color: ${this.getAgencyColor(agency)}; font-weight: bold;">
          ${st.arrival_time}
        </span>
      </div>
    `).join('') : '<p style="text-align: center; color: #999;">No scheduled trips found</p>';
    
    modal.innerHTML = `
      <h2 style="margin-top: 0; color: ${this.getAgencyColor(agency)};">
        📅 Transit Schedule
      </h2>
      <p style="color: #666;">Stop ID: ${stopId}</p>
      <div style="margin: 20px 0;">
        ${scheduleHTML}
      </div>
      <button onclick="this.parentElement.remove()" 
              style="width: 100%; padding: 12px; background: ${this.getAgencyColor(agency)}; 
                     color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
        Close
      </button>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    `;
    backdrop.onclick = () => {
      modal.remove();
      backdrop.remove();
    };
    document.body.appendChild(backdrop);
  }

  /**
   * Feature 3: Multi-Modal Journey Planner
   */
  planJourneyFromStop(stopId, lat, lon) {
    console.log(`🗺️ Planning journey from stop ${stopId}`);
    
    const modal = document.createElement('div');
    modal.className = 'journey-planner-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 400px;
    `;
    
    modal.innerHTML = `
      <h2 style="margin-top: 0; color: #4CAF50;">
        🗺️ Plan Your Journey
      </h2>
      <p style="color: #666;">Starting from this stop</p>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Destination:</label>
        <input type="text" id="destination-search" placeholder="Enter destination address..."
               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        
        <label style="display: block; margin: 15px 0 5px 0; font-weight: bold;">Preferences:</label>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <label style="flex: 1;">
            <input type="checkbox" id="prefer-less-walking" checked> Less Walking
          </label>
          <label style="flex: 1;">
            <input type="checkbox" id="prefer-fewer-transfers" checked> Fewer Transfers
          </label>
        </div>
        
        <label style="display: block; margin: 15px 0 5px 0; font-weight: bold;">Departure Time:</label>
        <select id="departure-time" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="now">Now</option>
          <option value="15">In 15 minutes</option>
          <option value="30">In 30 minutes</option>
          <option value="60">In 1 hour</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="this.parentElement.parentElement.remove()" 
                style="flex: 1; padding: 12px; background: #ddd; 
                       color: #333; border: none; border-radius: 6px; cursor: pointer;">
          Cancel
        </button>
        <button onclick="transitFeatures.calculateJourney('${stopId}', ${lat}, ${lon})" 
                style="flex: 1; padding: 12px; background: #4CAF50; 
                       color: white; border: none; border-radius: 6px; cursor: pointer;">
          Find Routes
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Calculate multi-modal journey
   */
  calculateJourney(fromStopId, fromLat, fromLon) {
    const destination = document.getElementById('destination-search').value;
    if (!destination) {
      alert('Please enter a destination');
      return;
    }
    
    console.log(`🚀 Calculating journey from ${fromStopId} to ${destination}`);
    // This would integrate with a routing API in production
    alert(`Journey planning feature coming soon!\n\nFrom: Stop ${fromStopId}\nTo: ${destination}`);
  }

  /**
   * Feature 4: Park & Ride Finder
   */
  createParkAndRideLayer() {
    // Define Park & Ride locations (based on MARTA data with parking)
    this.parkAndRideLocations = [
      { name: 'North Springs', lat: 33.9438, lng: -84.3573, spaces: 2378, line: 'Red' },
      { name: 'Sandy Springs', lat: 33.9326, lng: -84.3532, spaces: 1050, line: 'Red' },
      { name: 'Dunwoody', lat: 33.9211, lng: -84.3445, spaces: 1091, line: 'Red' },
      { name: 'Doraville', lat: 33.9024, lng: -84.2810, spaces: 1257, line: 'Blue/Green' },
      { name: 'Chamblee', lat: 33.8874, lng: -84.3063, spaces: 1149, line: 'Blue/Green' },
      { name: 'Lindbergh Center', lat: 33.8225, lng: -84.3695, spaces: 2519, line: 'Red/Gold' },
      { name: 'Indian Creek', lat: 33.7697, lng: -84.2297, spaces: 2364, line: 'Blue/Green' },
      { name: 'Kensington', lat: 33.7726, lng: -84.2519, spaces: 1962, line: 'Blue/Green' },
      { name: 'College Park', lat: 33.6515, lng: -84.4488, spaces: 2056, line: 'Red/Gold' },
      { name: 'East Point', lat: 33.6769, lng: -84.4408, spaces: 1002, line: 'Red/Gold' }
    ];
    
    this.parkAndRideLocations.forEach(location => {
      const marker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: 'park-and-ride-marker',
          html: `<div style="background: #FF9800; color: white; padding: 4px 8px; border-radius: 12px; 
                             font-weight: bold; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                   🅿️ ${location.spaces}
                 </div>`,
          iconSize: [60, 30]
        })
      });
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #FF9800;">
            🅿️ ${location.name} Park & Ride
          </h3>
          <div style="font-size: 14px;">
            <strong>Line:</strong> ${location.line}<br>
            <strong>Parking Spaces:</strong> ${location.spaces.toLocaleString()}<br>
            <div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <strong>Availability:</strong> <span style="color: #4CAF50;">Open</span><br>
              <em style="font-size: 12px; color: #666;">Real-time data coming soon</em>
            </div>
          </div>
        </div>
      `);
      
      this.layers.parkAndRide.addLayer(marker);
    });
  }

  /**
   * Feature 5: Transit Accessibility Heatmap
   */
  createAccessibilityHeatmap() {
    console.log('🗺️ Creating transit accessibility heatmap...');
    
    const heatmapPoints = [];
    
    // Create points around each transit stop
    this.transitStops.forEach(stop => {
      if (stop.stop_lat && stop.stop_lon) {
        const lat = parseFloat(stop.stop_lat);
        const lon = parseFloat(stop.stop_lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          // Add intensity based on service frequency (mock data for now)
          heatmapPoints.push([lat, lon, 0.8]);
          
          // Add surrounding points for accessibility zones
          const radiusPoints = this.generateAccessibilityZone(lat, lon, 0.25, 8); // 0.25 mile radius, 8 points
          heatmapPoints.push(...radiusPoints);
        }
      }
    });
    
    console.log(`Generated ${heatmapPoints.length} heatmap points`);
    
    // Note: This requires the Leaflet.heat plugin
    // In production, you would add: <script src="leaflet-heat.js"></script>
    if (typeof L.heatLayer !== 'undefined') {
      const heatLayer = L.heatLayer(heatmapPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: 'blue',
          0.5: 'lime',
          1.0: 'red'
        }
      });
      
      this.layers.accessibilityZones.addLayer(heatLayer);
    } else {
      console.warn('Leaflet.heat plugin not loaded. Heatmap feature unavailable.');
    }
  }

  /**
   * Generate points around a center for accessibility visualization
   */
  generateAccessibilityZone(centerLat, centerLon, radiusMiles, numPoints) {
    const points = [];
    const radiusDegrees = radiusMiles / 69; // Approximate conversion
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      const lat = centerLat + radiusDegrees * Math.cos(angle);
      const lon = centerLon + radiusDegrees * Math.sin(angle);
      points.push([lat, lon, 0.5]); // Lower intensity for zone edges
    }
    
    return points;
  }

  /**
   * Initialize layer controls
   */
  initializeTransitControls() {
    // Add layers to map controls
    const overlays = {
      '🚇 Transit Stops': this.layers.transitStops,
      '🅿️ Park & Ride': this.layers.parkAndRide,
      '🗺️ Accessibility Zones': this.layers.accessibilityZones
    };
    
    // Add to map if L.control.layers exists
    if (this.map && typeof L.control.layers !== 'undefined') {
      L.control.layers(null, overlays, {
        collapsed: false,
        position: 'topright'
      }).addTo(this.map);
    }
    
    // Add all layers to map by default
    Object.values(this.layers).forEach(layer => {
      if (this.map) {
        layer.addTo(this.map);
      }
    });
  }
}

// Initialize when map is ready
let transitFeatures;
function initializeEnhancedTransitFeatures(map) {
  transitFeatures = new EnhancedTransitFeatures(map);
  transitFeatures.initialize();
  transitFeatures.createParkAndRideLayer();
  transitFeatures.createAccessibilityHeatmap();
}
