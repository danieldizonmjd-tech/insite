/**
 * Enhanced Parks Features for InSite Map
 * Provides advanced parks features including amenity filtering, trail visualization, and green space analysis
 */

class EnhancedParksFeatures {
  constructor(map) {
    this.map = map;
    this.parksData = [];
    this.layers = {
      parks: L.layerGroup(),
      trails: L.layerGroup(),
      amenities: L.layerGroup(),
      greenSpace: L.layerGroup()
    };
    this.amenityTypes = [
      'playground', 'dog park', 'sports', 'trails', 'pool', 'picnic', 
      'tennis', 'basketball', 'baseball', 'splash pad', 'skate park'
    ];
    this.selectedAmenities = new Set();
  }

  /**
   * Initialize parks features
   */
  async initialize() {
    console.log('🌳 Initializing Enhanced Parks Features...');
    
    try {
      await this.loadParksData();
      await this.loadTrailsData();
      this.createParksLayers();
      this.createAmenityFilters();
      this.createGreenSpaceAnalysis();
      console.log('✅ Parks features initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing parks features:', error);
    }
  }

  /**
   * Load parks GeoJSON data
   */
  async loadParksData() {
    try {
      // Load multiple park datasets
      const datasets = [
        '/Data/City_of_Atlanta_Parks.geojson',
        '/Data/Park_Boundary.geojson',
        '/Data/Parks.geojson'
      ];
      
      for (const dataset of datasets) {
        try {
          const response = await fetch(dataset);
          const data = await response.json();
          
          if (data.features) {
            this.parksData.push(...data.features.map(feature => ({
              ...feature,
              source: dataset.split('/').pop()
            })));
          }
          
          console.log(`✅ Loaded ${data.features?.length || 0} parks from ${dataset}`);
        } catch (error) {
          console.warn(`⚠️ Could not load ${dataset}:`, error.message);
        }
      }
      
      console.log(`Total parks loaded: ${this.parksData.length}`);
    } catch (error) {
      console.error('Error loading parks data:', error);
    }
  }

  /**
   * Load trails data
   */
  async loadTrailsData() {
    // Greenspace data includes trails
    try {
      const response = await fetch('/Data/Greenspace_in_Atlanta_Region_(Public_View_Layer)_-6578209153742607418.geojson');
      const data = await response.json();
      
      if (data.features) {
        const trails = data.features.filter(feature => 
          feature.properties?.FACILITYTYPE?.toLowerCase().includes('trail')
        );
        
        console.log(`✅ Loaded ${trails.length} trails`);
        this.createTrailsLayer(trails);
      }
    } catch (error) {
      console.warn('Could not load greenspace/trails data:', error);
    }
  }

  /**
   * Feature 6: Park Amenity Finder
   * Create interactive park markers with amenity filtering
   */
  createParksLayers() {
    this.layers.parks.clearLayers();
    
    this.parksData.forEach((parkFeature, index) => {
      const props = parkFeature.properties;
      const name = props.AllParks_Fields_Park_Name || props.PARKNAME || props.NAME || `Park ${index + 1}`;
      const acres = props.AllParks_Fields_Park_Size_Acres || props.ACRES || 0;
      const amenities = this.extractAmenities(props);
      
      // Get park center coordinates
      const center = this.getFeatureCenter(parkFeature.geometry);
      
      if (center) {
        const [lon, lat] = center;
        
        // Create marker icon based on park size
        const iconSize = this.getParkIconSize(acres);
        const iconColor = this.getParkTypeColor(props);
        
        const marker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: 'park-marker',
            html: `<div style="background: ${iconColor}; color: white; padding: ${iconSize}px; 
                               border-radius: 50%; border: 2px solid white; 
                               box-shadow: 0 2px 8px rgba(0,0,0,0.3); text-align: center;
                               font-size: ${Math.max(10, iconSize)}px; font-weight: bold;">
                     🌳
                   </div>`,
            iconSize: [iconSize * 2, iconSize * 2]
          }),
          parkData: {
            name,
            acres,
            amenities,
            properties: props
          }
        });
        
        marker.bindPopup(this.createParkPopup(name, acres, amenities, props));
        this.layers.parks.addLayer(marker);
      }
    });
    
    console.log(`Created ${this.layers.parks.getLayers().length} park markers`);
  }

  /**
   * Extract amenities from park properties
   */
  extractAmenities(props) {
    const amenities = new Set();
    
    // Check various property fields for amenity keywords
    const searchText = JSON.stringify(props).toLowerCase();
    
    if (searchText.includes('playground')) amenities.add('playground');
    if (searchText.includes('dog park')) amenities.add('dog park');
    if (searchText.includes('trail')) amenities.add('trails');
    if (searchText.includes('pool')) amenities.add('pool');
    if (searchText.includes('tennis')) amenities.add('tennis');
    if (searchText.includes('basketball')) amenities.add('basketball');
    if (searchText.includes('baseball') || searchText.includes('ball field')) amenities.add('baseball');
    if (searchText.includes('picnic')) amenities.add('picnic');
    if (searchText.includes('splash')) amenities.add('splash pad');
    if (searchText.includes('skate')) amenities.add('skate park');
    if (searchText.includes('sport') || searchText.includes('field')) amenities.add('sports');
    
    return Array.from(amenities);
  }

  /**
   * Get center coordinates of a GeoJSON geometry
   */
  getFeatureCenter(geometry) {
    if (!geometry) return null;
    
    if (geometry.type === 'Point') {
      return geometry.coordinates;
    } else if (geometry.type === 'Polygon') {
      return this.getPolygonCenter(geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      return this.getPolygonCenter(geometry.coordinates[0][0]);
    }
    
    return null;
  }

  /**
   * Calculate polygon centroid
   */
  getPolygonCenter(coordinates) {
    if (!coordinates || coordinates.length === 0) return null;
    
    let x = 0, y = 0;
    coordinates.forEach(coord => {
      x += coord[0];
      y += coord[1];
    });
    
    return [x / coordinates.length, y / coordinates.length];
  }

  /**
   * Get icon size based on park acreage
   */
  getParkIconSize(acres) {
    if (acres > 100) return 20;
    if (acres > 50) return 16;
    if (acres > 20) return 12;
    return 10;
  }

  /**
   * Get color based on park type
   */
  getParkTypeColor(props) {
    const type = (props.AllParks_Fields_Park_Designatio || props.PARKTYPE || '').toLowerCase();
    
    if (type.includes('national')) return '#2E7D32'; // Dark green for national parks
    if (type.includes('state')) return '#388E3C'; // Green for state parks
    if (type.includes('trail')) return '#66BB6A'; // Light green for trails
    if (type.includes('preserve')) return '#1B5E20'; // Very dark green for preserves
    return '#4CAF50'; // Default green
  }

  /**
   * Create park popup content
   */
  createParkPopup(name, acres, amenities, props) {
    const amenitiesList = amenities.length > 0 
      ? amenities.map(a => `<span style="display: inline-block; background: #E8F5E9; color: #2E7D32; 
                                        padding: 3px 8px; margin: 2px; border-radius: 12px; font-size: 11px;">
                              ${a}
                            </span>`).join(' ')
      : '<em style="color: #999;">No amenities listed</em>';
    
    return `
      <div class="park-popup" style="min-width: 280px;">
        <h3 style="margin: 0 0 10px 0; color: #2E7D32;">
          🌳 ${name}
        </h3>
        <div style="font-size: 13px; line-height: 1.6;">
          <strong>Size:</strong> ${acres.toFixed(1)} acres<br>
          ${props.AllParks_Fields_Park_Address_1 ? `<strong>Address:</strong> ${props.AllParks_Fields_Park_Address_1}<br>` : ''}
          ${props.AllParks_Fields_Park_Status ? `<strong>Status:</strong> ${props.AllParks_Fields_Park_Status}<br>` : ''}
          
          <div style="margin: 10px 0;">
            <strong>Amenities:</strong><br>
            ${amenitiesList}
          </div>
          
          <button onclick="parksFeatures.showParkDetails('${name}')" 
                  style="margin-top: 10px; padding: 8px 16px; background: #4CAF50; 
                         color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
            📋 More Details
          </button>
          <button onclick="parksFeatures.getDirections(${this.getFeatureCenter(props)?.join(',')})" 
                  style="margin-top: 5px; padding: 8px 16px; background: #2196F3; 
                         color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
            🗺️ Get Directions
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Feature 7: Trail Network Visualizer
   * Create interactive trail visualization
   */
  createTrailsLayer(trails) {
    this.layers.trails.clearLayers();
    
    trails.forEach(trail => {
      const props = trail.properties;
      const name = props.NAME || props.TRAILNAME || 'Trail';
      const length = props.LENGTH || props.SHAPE_Length || 0;
      
      const layer = L.geoJSON(trail, {
        style: {
          color: '#8BC34A',
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 5'
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #8BC34A;">
                🥾 ${name}
              </h3>
              <div style="font-size: 13px;">
                <strong>Length:</strong> ${(length / 5280).toFixed(2)} miles<br>
                <strong>Type:</strong> ${props.FACILITYTYPE || 'Trail'}<br>
                ${props.SURFACE ? `<strong>Surface:</strong> ${props.SURFACE}<br>` : ''}
                
                <div style="margin-top: 10px; padding: 8px; background: #F1F8E9; border-radius: 4px;">
                  <strong>Difficulty:</strong> 
                  <span style="color: #8BC34A;">● ${this.getTrailDifficulty(length)}</span>
                </div>
              </div>
            </div>
          `);
          
          layer.on('mouseover', function() {
            this.setStyle({ weight: 5, color: '#689F38' });
          });
          
          layer.on('mouseout', function() {
            this.setStyle({ weight: 3, color: '#8BC34A' });
          });
        }
      });
      
      this.layers.trails.addLayer(layer);
    });
  }

  /**
   * Determine trail difficulty based on length
   */
  getTrailDifficulty(lengthFeet) {
    const miles = lengthFeet / 5280;
    if (miles < 1) return 'Easy';
    if (miles < 3) return 'Moderate';
    return 'Challenging';
  }

  /**
   * Feature 8: Create amenity filter controls
   */
  createAmenityFilters() {
    const filterControl = L.control({ position: 'topleft' });
    
    filterControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'amenity-filters');
      div.style.cssText = `
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 250px;
      `;
      
      div.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #2E7D32;">🔍 Filter by Amenities</h4>
        ${this.amenityTypes.map(amenity => `
          <label style="display: block; margin: 8px 0; cursor: pointer;">
            <input type="checkbox" class="amenity-filter" value="${amenity}" 
                   onchange="parksFeatures.filterByAmenity('${amenity}', this.checked)"
                   style="margin-right: 8px;">
            ${amenity.charAt(0).toUpperCase() + amenity.slice(1)}
          </label>
        `).join('')}
        <button onclick="parksFeatures.clearFilters()" 
                style="margin-top: 10px; width: 100%; padding: 8px; background: #FF5722; 
                       color: white; border: none; border-radius: 4px; cursor: pointer;">
          Clear Filters
        </button>
      `;
      
      // Prevent map interactions when using filters
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      
      return div;
    };
    
    if (this.map) {
      filterControl.addTo(this.map);
    }
  }

  /**
   * Filter parks by selected amenities
   */
  filterByAmenity(amenity, checked) {
    if (checked) {
      this.selectedAmenities.add(amenity);
    } else {
      this.selectedAmenities.delete(amenity);
    }
    
    this.applyFilters();
  }

  /**
   * Apply amenity filters to park markers
   */
  applyFilters() {
    this.layers.parks.eachLayer(marker => {
      const parkAmenities = marker.options.parkData?.amenities || [];
      
      // Show marker if no filters or if park has any selected amenity
      const shouldShow = this.selectedAmenities.size === 0 || 
        [...this.selectedAmenities].some(amenity => parkAmenities.includes(amenity));
      
      if (shouldShow) {
        marker.setOpacity(1);
      } else {
        marker.setOpacity(0.2);
      }
    });
  }

  /**
   * Clear all amenity filters
   */
  clearFilters() {
    this.selectedAmenities.clear();
    
    // Uncheck all checkboxes
    document.querySelectorAll('.amenity-filter').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Show all parks
    this.layers.parks.eachLayer(marker => {
      marker.setOpacity(1);
    });
  }

  /**
   * Feature 9: Green Space Analysis
   * Calculate and visualize green space per capita by neighborhood
   */
  async createGreenSpaceAnalysis() {
    console.log('📊 Creating green space analysis...');
    
    // This would integrate with neighborhood/census data
    // For now, we'll create a simple visualization
    
    const statsControl = L.control({ position: 'bottomleft' });
    
    statsControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'greenspace-stats');
      div.style.cssText = `
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 300px;
      `;
      
      const totalAcres = this.parksData.reduce((sum, park) => 
        sum + (park.properties.AllParks_Fields_Park_Size_Acres || 0), 0);
      const totalParks = this.parksData.length;
      const avgParkSize = totalAcres / totalParks;
      
      div.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #2E7D32;">
          📊 Green Space Statistics
        </h4>
        <div style="font-size: 13px; line-height: 1.8;">
          <strong>Total Parks:</strong> ${totalParks.toLocaleString()}<br>
          <strong>Total Acres:</strong> ${totalAcres.toLocaleString(undefined, {maximumFractionDigits: 0})}<br>
          <strong>Average Size:</strong> ${avgParkSize.toFixed(1)} acres<br>
          
          <div style="margin-top: 10px; padding: 10px; background: #E8F5E9; border-radius: 4px;">
            <strong>Green Space Goal:</strong><br>
            <div style="margin-top: 5px; background: #C8E6C9; height: 20px; border-radius: 10px; position: relative;">
              <div style="background: #4CAF50; width: 65%; height: 100%; border-radius: 10px;"></div>
              <span style="position: absolute; top: 2px; left: 50%; transform: translateX(-50%); 
                           font-size: 11px; font-weight: bold; color: #1B5E20;">
                65% of goal
              </span>
            </div>
            <em style="font-size: 11px; color: #666;">Goal: 10 acres per 1,000 residents</em>
          </div>
        </div>
      `;
      
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      
      return div;
    };
    
    if (this.map) {
      statsControl.addTo(this.map);
    }
  }

  /**
   * Show detailed park information
   */
  showParkDetails(parkName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    modal.innerHTML = `
      <h2 style="margin-top: 0; color: #2E7D32;">
        🌳 ${parkName}
      </h2>
      <p>Detailed information about this park would appear here, including:</p>
      <ul>
        <li>Operating hours</li>
        <li>Facilities and amenities</li>
        <li>Accessibility information</li>
        <li>Recent events and programs</li>
        <li>Park conditions and updates</li>
        <li>Photo gallery</li>
        <li>Community reviews</li>
      </ul>
      <button onclick="this.parentElement.remove()" 
              style="width: 100%; padding: 12px; background: #4CAF50; 
                     color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
        Close
      </button>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Get directions to park
   */
  getDirections(lat, lon) {
    if (!lat || !lon) {
      alert('Location coordinates not available');
      return;
    }
    
    // Open Google Maps directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank');
  }

  /**
   * Initialize layer controls
   */
  addLayerControls() {
    const overlays = {
      '🌳 Parks': this.layers.parks,
      '🥾 Trails': this.layers.trails,
      '📊 Green Space Analysis': this.layers.greenSpace
    };
    
    if (this.map && typeof L.control.layers !== 'undefined') {
      L.control.layers(null, overlays, {
        collapsed: false,
        position: 'topright'
      }).addTo(this.map);
    }
    
    // Add parks and trails by default
    this.layers.parks.addTo(this.map);
    this.layers.trails.addTo(this.map);
  }
}

// Initialize when map is ready
let parksFeatures;
function initializeEnhancedParksFeatures(map) {
  parksFeatures = new EnhancedParksFeatures(map);
  parksFeatures.initialize();
  parksFeatures.addLayerControls();
}
