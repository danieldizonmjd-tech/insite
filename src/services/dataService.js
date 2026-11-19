/**
 * Data Service
 * Universal data layer that can swap between real and mock data
 * Handles caching, fallbacks, and data source tracking
 */

import { mockDataProvider } from './mockDataProvider.js';
import { FEATURES } from '../utils/constants.js';

/**
 * Configuration for data sources
 */
const DATA_CONFIG = {
  // Metrics that have real data available
  realDataMetrics: [
    'avg_value',
    'population', 
    'median_income',
    'housing_vacancy_rate',
    'transit_score',
    'parks_score'
  ],
  
  // Enable mock data fallback
  useMockFallback: FEATURES.MOCK_DATA_ALLOWED,
  
  // Cache TTL in milliseconds
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  
  // GeoJSON data URL
  geoJsonUrl: './USPS_Zip_Codes_enriched.geojson'
};

/**
 * DataService class
 * Provides unified access to all data sources
 */
class DataService {
  constructor() {
    this.cache = new Map();
    this.geoJsonData = null;
    this.mockFeatures = new Set();
    this.listeners = new Set();
  }

  /**
   * Add event listener for data changes
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove event listener
   * @param {Function} callback - Callback function to remove
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify listeners of data changes
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notify(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('Data service listener error:', e);
      }
    });
  }

  /**
   * Load GeoJSON data from file
   * @returns {Promise<Object>} GeoJSON FeatureCollection
   */
  async loadGeoJSON() {
    if (this.geoJsonData) {
      return this.geoJsonData;
    }

    try {
      const response = await fetch(DATA_CONFIG.geoJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.geoJsonData = await response.json();
      this.notify('geojsonLoaded', this.geoJsonData);
      return this.geoJsonData;
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
      throw error;
    }
  }

  /**
   * Get all neighborhoods as array
   * @returns {Promise<Array>} Array of neighborhood objects
   */
  async getAllNeighborhoods() {
    const geoJson = await this.loadGeoJSON();
    return geoJson.features.map(feature => ({
      id: feature.properties.ZCTA5CE10,
      zipCode: feature.properties.ZCTA5CE10,
      name: feature.properties.name || `ZIP ${feature.properties.ZCTA5CE10}`,
      properties: feature.properties,
      geometry: feature.geometry,
      isMockData: false
    }));
  }

  /**
   * Get neighborhood by ID (ZIP code)
   * @param {string} id - Neighborhood ID or ZIP code
   * @returns {Promise<Object>} Neighborhood data
   */
  async getNeighborhood(id) {
    // Check cache first
    const cacheKey = `neighborhood:${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try to get from real data
      const geoJson = await this.loadGeoJSON();
      const feature = geoJson.features.find(f => 
        f.properties.ZCTA5CE10 === id || 
        f.properties.ZCTA5CE10 === String(id).padStart(5, '0')
      );

      if (feature) {
        const neighborhood = this.transformFeature(feature);
        this.setCache(cacheKey, neighborhood);
        return neighborhood;
      }

      // Fallback to mock data if enabled
      if (DATA_CONFIG.useMockFallback) {
        console.warn(`Falling back to mock data for neighborhood ${id}`);
        this.mockFeatures.add('neighborhood');
        const mockData = mockDataProvider.getNeighborhood(id);
        this.setCache(cacheKey, mockData);
        return mockData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching neighborhood ${id}:`, error);
      
      // Fallback to mock on error
      if (DATA_CONFIG.useMockFallback) {
        this.mockFeatures.add('neighborhood');
        return mockDataProvider.getNeighborhood(id);
      }
      
      throw error;
    }
  }

  /**
   * Transform GeoJSON feature to neighborhood object
   * @param {Object} feature - GeoJSON feature
   * @returns {Object} Neighborhood object
   */
  transformFeature(feature) {
    const props = feature.properties;
    
    return {
      id: props.ZCTA5CE10,
      zipCode: props.ZCTA5CE10,
      name: props.name || props.city || `ZIP ${props.ZCTA5CE10}`,
      displayName: props.name ? `${props.name} (${props.ZCTA5CE10})` : `ZIP ${props.ZCTA5CE10}`,
      city: props.city || 'Atlanta',
      state: 'GA',
      geometry: feature.geometry,
      metrics: {
        // Property values
        avg_value: props.avg_value || props.zhvi || props.median_value,
        appreciation_1y: props.appreciation_1y,
        
        // Demographics
        population: props.population || props.total_population,
        median_income: props.median_income || props.median_household_income,
        housing_vacancy_rate: props.vacancy_rate || props.housing_vacancy_rate,
        
        // Scores
        transit_score: props.transit_score,
        parks_score: props.parks_score,
        walkability: props.walkability || props.walk_score,
        
        // Safety
        crime_rate: props.crime_rate || props.crime_index,
        
        // Education
        education_bachelors: props.bachelors_degree_pct || props.education_bachelors
      },
      isMockData: false,
      dataSource: 'geojson',
      lastUpdated: props.last_updated || new Date().toISOString()
    };
  }

  /**
   * Get metric value for a neighborhood
   * @param {string} neighborhoodId - Neighborhood ID
   * @param {string} metric - Metric key
   * @returns {Promise<Object>} Metric data
   */
  async getMetric(neighborhoodId, metric) {
    // Check if we have real data for this metric
    if (DATA_CONFIG.realDataMetrics.includes(metric)) {
      const neighborhood = await this.getNeighborhood(neighborhoodId);
      if (neighborhood && neighborhood.metrics[metric] != null) {
        return {
          value: neighborhood.metrics[metric],
          metric,
          neighborhoodId,
          isMockData: false,
          dataDate: neighborhood.lastUpdated
        };
      }
    }

    // Otherwise use mock data
    this.mockFeatures.add(`metric:${metric}`);
    return mockDataProvider.getMetric(neighborhoodId, metric);
  }

  /**
   * Get trend data for a neighborhood metric
   * @param {string} neighborhoodId - Neighborhood ID
   * @param {string} metric - Metric key
   * @param {Object} options - Options (periods, etc.)
   * @returns {Promise<Array>} Trend data points
   */
  async getTrends(neighborhoodId, metric, options = {}) {
    // For now, trends are always mock data
    // In production, this would fetch from TimescaleDB
    this.mockFeatures.add('trends');
    return mockDataProvider.getTrends(neighborhoodId, metric, options);
  }

  /**
   * Search neighborhoods by query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching neighborhoods
   */
  async search(query, options = {}) {
    const { limit = 10 } = options;
    const neighborhoods = await this.getAllNeighborhoods();
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search by ZIP code or name
    const results = neighborhoods.filter(n => {
      const zipMatch = n.zipCode.includes(normalizedQuery);
      const nameMatch = n.name.toLowerCase().includes(normalizedQuery);
      return zipMatch || nameMatch;
    });

    // Sort by relevance (exact ZIP match first)
    results.sort((a, b) => {
      const aExact = a.zipCode === normalizedQuery;
      const bExact = b.zipCode === normalizedQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return results.slice(0, limit);
  }

  /**
   * Get AI-generated insights for a neighborhood
   * @param {string} neighborhoodId - Neighborhood ID
   * @returns {Promise<Array>} Insight objects
   */
  async getInsights(neighborhoodId) {
    // Insights are currently mock data
    this.mockFeatures.add('insights');
    return mockDataProvider.generateInsights(neighborhoodId);
  }

  /**
   * Check if a feature is using mock data
   * @param {string} feature - Feature name
   * @returns {boolean} True if using mock data
   */
  isMockData(feature) {
    return this.mockFeatures.has(feature);
  }

  /**
   * Get list of all features using mock data
   * @returns {Array<string>} Feature names
   */
  getMockFeatures() {
    return Array.from(this.mockFeatures);
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Time to live in ms
   */
  setCache(key, value, ttl = DATA_CONFIG.cacheTTL) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    this.geoJsonData = null;
    this.mockFeatures.clear();
  }

  /**
   * Get data source info for UI display
   * @returns {Object} Data source information
   */
  getDataSourceInfo() {
    return {
      hasRealData: this.geoJsonData !== null,
      mockFeaturesCount: this.mockFeatures.size,
      mockFeatures: this.getMockFeatures(),
      realDataMetrics: DATA_CONFIG.realDataMetrics,
      lastLoaded: this.geoJsonData ? new Date().toISOString() : null
    };
  }
}

// Create singleton instance
const dataService = new DataService();

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataService, dataService, DATA_CONFIG };
}

export { DataService, dataService, DATA_CONFIG };
export default dataService;
