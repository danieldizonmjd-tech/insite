// Transit and Parks Data Processing for InSite
// This file loads and processes transit and parks data for the metro Atlanta region

class TransitParksManager {
  constructor() {
    this.transitStops = [];
    this.transitRoutes = [];
    this.railStations = [];
    this.parks = [];
    this.parksData = {
      atlanta: [],
      regional: [],
      counties: []
    };
    this.loaded = false;
  }

  // Load all transit and parks data
  async loadAllData() {
    try {
      console.log('Loading transit and parks data...');
      
      // Load MARTA Rail Stations
      await this.loadRailStations();
      
      // Load MARTA Bus Stops
      await this.loadBusStops();
      
      // Load Parks Data
      await this.loadParksData();
      
      this.loaded = true;
      console.log('Transit and parks data loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading transit/parks data:', error);
      return false;
    }
  }

  // Load MARTA rail stations from GeoJSON
  async loadRailStations() {
    try {
      const response = await fetch('Data/MARTA_Rail_Stations_-5376950773288451707.geojson');
      const data = await response.json();
      
      this.railStations = data.features.map(feature => ({
        name: feature.properties.STATION,
        code: feature.properties.Station_Code,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        parking: feature.properties.Parking === 'Yes',
        parkingSpaces: feature.properties.Parking_Spaces || 0,
        address: feature.properties.Street,
        city: feature.properties.City,
        zip: feature.properties.Zip,
        url: feature.properties.Web_address,
        type: 'rail'
      }));
      
      console.log(`Loaded ${this.railStations.length} rail stations`);
    } catch (error) {
      console.error('Error loading rail stations:', error);
    }
  }

  // Load MARTA bus stops from GTFS data
  async loadBusStops() {
    try {
      const response = await fetch('Data/MARTA/stops.txt');
      const text = await response.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      this.transitStops = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const stop = {};
        headers.forEach((header, idx) => {
          stop[header.trim()] = values[idx]?.trim() || '';
        });
        
        if (stop.stop_lat && stop.stop_lon) {
          this.transitStops.push({
            id: stop.stop_id,
            code: stop.stop_code,
            name: stop.stop_name,
            lat: parseFloat(stop.stop_lat),
            lon: parseFloat(stop.stop_lon),
            type: 'bus'
          });
        }
      }
      
      console.log(`Loaded ${this.transitStops.length} bus stops`);
    } catch (error) {
      console.error('Error loading bus stops:', error);
    }
  }

  // Load parks data from multiple GeoJSON files
  async loadParksData() {
    try {
      // Load City of Atlanta Parks
      const atlantaResponse = await fetch('Data/City_of_Atlanta_Parks.geojson');
      const atlantaData = await atlantaResponse.json();
      
      this.parksData.atlanta = atlantaData.features.map(feature => ({
        name: feature.properties.PARK_NAME || feature.properties.NAME || 'Unnamed Park',
        type: 'City Park',
        acres: feature.properties.ACRES || feature.properties.GIS_ACRES || 0,
        address: feature.properties.ADDRESS || '',
        city: feature.properties.CITY || 'Atlanta',
        zip: feature.properties.ZIP || feature.properties.ZIPCODE || '',
        owner: feature.properties.OWNER || feature.properties.MANAGER || 'City of Atlanta',
        designation: feature.properties.DESIGNATION || '',
        access: feature.properties.ACCESS_TYP || 'Public',
        lat: feature.geometry.type === 'Point' ? 
          feature.geometry.coordinates[1] : 
          this.getCentroid(feature.geometry).lat,
        lon: feature.geometry.type === 'Point' ? 
          feature.geometry.coordinates[0] : 
          this.getCentroid(feature.geometry).lon,
        geometry: feature.geometry
      }));

      // Load Regional Greenspace
      const greenspaceResponse = await fetch('Data/Greenspace_in_Atlanta_Region_(Public_View_Layer)_-6578209153742607418.geojson');
      const greenspaceData = await greenspaceResponse.json();
      
      this.parksData.regional = greenspaceData.features.map(feature => ({
        name: feature.properties.PARK_NAME || feature.properties.NAME || 'Regional Greenspace',
        type: 'Regional Greenspace',
        acres: feature.properties.ACRES || feature.properties.GIS_ACRES || 0,
        city: feature.properties.CITY || '',
        zip: feature.properties.ZIP || '',
        lat: this.getCentroid(feature.geometry).lat,
        lon: this.getCentroid(feature.geometry).lon,
        geometry: feature.geometry
      }));

      // Combine all parks
      this.parks = [...this.parksData.atlanta, ...this.parksData.regional];
      
      console.log(`Loaded ${this.parks.length} parks (${this.parksData.atlanta.length} city, ${this.parksData.regional.length} regional)`);
    } catch (error) {
      console.error('Error loading parks data:', error);
    }
  }

  // Calculate centroid of a polygon
  getCentroid(geometry) {
    if (geometry.type === 'Point') {
      return { lat: geometry.coordinates[1], lon: geometry.coordinates[0] };
    }
    
    let coordinates = [];
    if (geometry.type === 'Polygon') {
      coordinates = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      coordinates = geometry.coordinates[0][0];
    }
    
    let latSum = 0, lonSum = 0, count = 0;
    coordinates.forEach(coord => {
      lonSum += coord[0];
      latSum += coord[1];
      count++;
    });
    
    return {
      lat: latSum / count,
      lon: lonSum / count
    };
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Find transit stops near a location (ZIP code)
  findNearbyTransit(lat, lon, radiusMiles = 2) {
    const nearby = {
      rail: [],
      bus: []
    };

    // Find nearby rail stations
    this.railStations.forEach(station => {
      const distance = this.calculateDistance(lat, lon, station.lat, station.lon);
      if (distance <= radiusMiles) {
        nearby.rail.push({
          ...station,
          distance: distance
        });
      }
    });

    // Find nearby bus stops (limit to avoid overwhelming data)
    this.transitStops.forEach(stop => {
      const distance = this.calculateDistance(lat, lon, stop.lat, stop.lon);
      if (distance <= radiusMiles) {
        nearby.bus.push({
          ...stop,
          distance: distance
        });
      }
    });

    // Sort by distance
    nearby.rail.sort((a, b) => a.distance - b.distance);
    nearby.bus.sort((a, b) => a.distance - b.distance);

    // Limit bus stops to top 20
    nearby.bus = nearby.bus.slice(0, 20);

    return nearby;
  }

  // Find parks near a location
  findNearbyParks(lat, lon, radiusMiles = 5) {
    const nearby = [];

    this.parks.forEach(park => {
      const distance = this.calculateDistance(lat, lon, park.lat, park.lon);
      if (distance <= radiusMiles) {
        nearby.push({
          ...park,
          distance: distance
        });
      }
    });

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  // Calculate transit accessibility score for a location
  calculateTransitScore(lat, lon) {
    const nearbyTransit = this.findNearbyTransit(lat, lon, 1); // Within 1 mile
    
    let score = 0;
    
    // Rail stations are worth more (30 points each, max 90)
    const railScore = Math.min(nearbyTransit.rail.length * 30, 90);
    
    // Bus stops (1 point each, max 60)
    const busScore = Math.min(nearbyTransit.bus.length * 1, 60);
    
    // Distance bonus (closer is better)
    let distanceBonus = 0;
    if (nearbyTransit.rail.length > 0) {
      const closestRail = nearbyTransit.rail[0].distance;
      if (closestRail < 0.25) distanceBonus = 20; // Within 0.25 miles
      else if (closestRail < 0.5) distanceBonus = 10; // Within 0.5 miles
    }
    
    score = Math.min(railScore + busScore + distanceBonus, 100);
    
    return {
      score: Math.round(score),
      railStations: nearbyTransit.rail.length,
      busStops: nearbyTransit.bus.length,
      closestRail: nearbyTransit.rail[0] || null,
      grade: this.getGrade(score)
    };
  }

  // Calculate parks/green space score for a location
  calculateParksScore(lat, lon) {
    const nearbyParks = this.findNearbyParks(lat, lon, 3); // Within 3 miles
    
    let score = 0;
    
    // Number of parks (5 points each, max 40)
    const countScore = Math.min(nearbyParks.length * 5, 40);
    
    // Total park acreage nearby (1 point per 10 acres, max 30)
    const totalAcres = nearbyParks.reduce((sum, park) => sum + (park.acres || 0), 0);
    const acreageScore = Math.min(totalAcres / 10, 30);
    
    // Distance to closest park (max 30 points)
    let distanceScore = 0;
    if (nearbyParks.length > 0) {
      const closestDistance = nearbyParks[0].distance;
      if (closestDistance < 0.25) distanceScore = 30;
      else if (closestDistance < 0.5) distanceScore = 25;
      else if (closestDistance < 1) distanceScore = 20;
      else if (closestDistance < 2) distanceScore = 10;
    }
    
    score = Math.min(countScore + acreageScore + distanceScore, 100);
    
    return {
      score: Math.round(score),
      parksCount: nearbyParks.length,
      totalAcres: Math.round(totalAcres),
      closestPark: nearbyParks[0] || null,
      grade: this.getGrade(score)
    };
  }

  // Convert score to letter grade
  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  // Calculate combined livability score
  calculateLivabilityScore(lat, lon) {
    const transitScore = this.calculateTransitScore(lat, lon);
    const parksScore = this.calculateParksScore(lat, lon);
    
    // Weighted average (60% transit, 40% parks)
    const combined = (transitScore.score * 0.6) + (parksScore.score * 0.4);
    
    return {
      livabilityScore: Math.round(combined),
      transitScore: transitScore,
      parksScore: parksScore,
      grade: this.getGrade(combined)
    };
  }

  // Get ZIP code coordinates (simplified - you may have actual ZIP centroids)
  getZIPCoordinates(zipCode, zipData) {
    // If you have actual coordinates in your ZIP data, use those
    // This is a placeholder that would need to be integrated with your existing ZIP data
    if (zipData && zipData[zipCode] && zipData[zipCode].lat && zipData[zipCode].lon) {
      return {
        lat: zipData[zipCode].lat,
        lon: zipData[zipCode].lon
      };
    }
    return null;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransitParksManager;
}
