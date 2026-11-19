/**
 * City Configuration
 * Defines supported cities and their settings
 */

export const CITIES = {
  atlanta: {
    id: 'atlanta',
    slug: 'atlanta',
    name: 'Atlanta',
    state: 'GA',
    fullName: 'Atlanta, Georgia',
    isActive: true,
    isPrimary: true,
    
    // Map settings
    bounds: {
      north: 34.2,
      south: 33.4,
      east: -83.9,
      west: -84.9
    },
    center: {
      lat: 33.749,
      lng: -84.388
    },
    defaultZoom: 10,
    
    // Data settings
    geoJsonFile: 'USPS_Zip_Codes_enriched.geojson',
    transitSystems: ['marta', 'cobblinc', 'gwinnett', 'xpress'],
    
    // Feature flags
    features: {
      transitScoring: true,
      parksScoring: true,
      trends: true,
      insights: false
    },
    
    // Display settings
    primaryColor: '#ef4444',
    logo: '/assets/cities/atlanta-logo.png',
    
    // Metadata
    population: 6200000, // Metro population
    description: 'The capital and most populous city of Georgia',
    lastUpdated: '2026-01-13'
  },

  // Future cities - configured but not active
  charlotte: {
    id: 'charlotte',
    slug: 'charlotte',
    name: 'Charlotte',
    state: 'NC',
    fullName: 'Charlotte, North Carolina',
    isActive: false,
    isPrimary: false,
    bounds: {
      north: 35.5,
      south: 34.9,
      east: -80.5,
      west: -81.2
    },
    center: {
      lat: 35.2271,
      lng: -80.8431
    },
    defaultZoom: 10,
    geoJsonFile: null,
    transitSystems: ['cats'],
    features: {
      transitScoring: false,
      parksScoring: false,
      trends: false,
      insights: false
    }
  },

  nashville: {
    id: 'nashville',
    slug: 'nashville',
    name: 'Nashville',
    state: 'TN',
    fullName: 'Nashville, Tennessee',
    isActive: false,
    isPrimary: false,
    bounds: {
      north: 36.4,
      south: 35.9,
      east: -86.5,
      west: -87.1
    },
    center: {
      lat: 36.1627,
      lng: -86.7816
    },
    defaultZoom: 10,
    geoJsonFile: null,
    transitSystems: ['mta'],
    features: {
      transitScoring: false,
      parksScoring: false,
      trends: false,
      insights: false
    }
  },

  raleigh: {
    id: 'raleigh',
    slug: 'raleigh',
    name: 'Raleigh-Durham',
    state: 'NC',
    fullName: 'Raleigh-Durham, North Carolina',
    isActive: false,
    isPrimary: false,
    bounds: {
      north: 36.2,
      south: 35.5,
      east: -78.4,
      west: -79.2
    },
    center: {
      lat: 35.7796,
      lng: -78.6382
    },
    defaultZoom: 10,
    geoJsonFile: null,
    transitSystems: ['goraleigh', 'gotriangle'],
    features: {
      transitScoring: false,
      parksScoring: false,
      trends: false,
      insights: false
    }
  }
};

/**
 * Get all active cities
 * @returns {Array} Array of active city configs
 */
export function getActiveCities() {
  return Object.values(CITIES).filter(city => city.isActive);
}

/**
 * Get city by slug
 * @param {string} slug - City slug
 * @returns {Object|null} City config or null
 */
export function getCityBySlug(slug) {
  return CITIES[slug] || null;
}

/**
 * Get primary city
 * @returns {Object} Primary city config
 */
export function getPrimaryCity() {
  return Object.values(CITIES).find(city => city.isPrimary) || CITIES.atlanta;
}

/**
 * Check if multi-city mode is enabled
 * @returns {boolean} True if multiple cities are active
 */
export function isMultiCityEnabled() {
  return getActiveCities().length > 1;
}

/**
 * Get city selection options for UI
 * @param {boolean} includeInactive - Include inactive cities
 * @returns {Array} Array of {value, label} objects
 */
export function getCityOptions(includeInactive = false) {
  const cities = includeInactive ? Object.values(CITIES) : getActiveCities();
  return cities.map(city => ({
    value: city.slug,
    label: city.fullName,
    disabled: !city.isActive
  }));
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    CITIES, 
    getActiveCities, 
    getCityBySlug, 
    getPrimaryCity,
    isMultiCityEnabled,
    getCityOptions
  };
}
