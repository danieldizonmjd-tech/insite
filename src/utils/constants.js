/**
 * InSite Configuration Constants
 */

// Score thresholds for color coding
export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 0
};

// Score color mapping
export const SCORE_COLORS = {
  excellent: '#10b981', // Green
  good: '#3b82f6',      // Blue
  fair: '#f59e0b',      // Amber
  poor: '#ef4444'       // Red
};

// Choropleth color scale (low to high)
export const CHOROPLETH_COLORS = [
  '#ef4444', // Red (lowest)
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald (highest)
];

// Default scoring weights
export const DEFAULT_WEIGHTS = {
  livability: 20,
  economy: 20,
  housing: 15,
  demographics: 10,
  environment: 15,
  development: 10,
  transit: 5,
  parks: 5
};

// Scoring categories
export const SCORING_CATEGORIES = [
  {
    id: 'livability',
    name: 'Livability',
    icon: 'fas fa-heart',
    description: 'Quality of life factors including safety, walkability, and amenities'
  },
  {
    id: 'economy',
    name: 'Economy',
    icon: 'fas fa-briefcase',
    description: 'Economic health including income, employment, and job growth'
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: 'fas fa-home',
    description: 'Housing market conditions including values, appreciation, and inventory'
  },
  {
    id: 'demographics',
    name: 'Demographics',
    icon: 'fas fa-users',
    description: 'Population characteristics including education and diversity'
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: 'fas fa-leaf',
    description: 'Environmental quality including green space and air quality'
  },
  {
    id: 'development',
    name: 'Development',
    icon: 'fas fa-building',
    description: 'Growth and development activity including permits and construction'
  },
  {
    id: 'transit',
    name: 'Transit',
    icon: 'fas fa-subway',
    description: 'Public transportation access and commute options'
  },
  {
    id: 'parks',
    name: 'Parks',
    icon: 'fas fa-tree',
    description: 'Parks and recreational facilities access'
  }
];

// Metric definitions with metadata
export const METRIC_DEFINITIONS = {
  // Property & Housing
  avg_value: {
    name: 'Median Home Value',
    category: 'housing',
    unit: '$',
    format: 'currency',
    higherIsBetter: null, // Depends on perspective
    source: 'Zillow ZHVI'
  },
  appreciation_1y: {
    name: '1-Year Appreciation',
    category: 'housing',
    unit: '%',
    format: 'percent',
    higherIsBetter: true,
    source: 'Zillow'
  },
  appreciation_5y: {
    name: '5-Year Appreciation',
    category: 'housing',
    unit: '%',
    format: 'percent',
    higherIsBetter: true,
    source: 'Zillow'
  },
  housing_vacancy_rate: {
    name: 'Vacancy Rate',
    category: 'housing',
    unit: '%',
    format: 'percent',
    higherIsBetter: false,
    source: 'Census ACS'
  },
  
  // Demographics
  population: {
    name: 'Population',
    category: 'demographics',
    unit: '',
    format: 'number',
    higherIsBetter: null,
    source: 'Census ACS'
  },
  median_income: {
    name: 'Median Household Income',
    category: 'economy',
    unit: '$',
    format: 'currency',
    higherIsBetter: true,
    source: 'Census ACS'
  },
  education_bachelors: {
    name: "Bachelor's Degree or Higher",
    category: 'demographics',
    unit: '%',
    format: 'percent',
    higherIsBetter: true,
    source: 'Census ACS'
  },
  
  // Safety & Livability
  crime_rate: {
    name: 'Crime Rate Index',
    category: 'livability',
    unit: '',
    format: 'number',
    higherIsBetter: false,
    source: 'FBI UCR / Local PD'
  },
  walkability: {
    name: 'Walk Score',
    category: 'livability',
    unit: '',
    format: 'number',
    higherIsBetter: true,
    source: 'Walk Score API'
  },
  
  // Transit
  transit_score: {
    name: 'Transit Score',
    category: 'transit',
    unit: '',
    format: 'number',
    higherIsBetter: true,
    source: 'InSite Calculation'
  },
  
  // Parks
  parks_score: {
    name: 'Parks Score',
    category: 'parks',
    unit: '',
    format: 'number',
    higherIsBetter: true,
    source: 'InSite Calculation'
  }
};

// Map configuration
export const MAP_CONFIG = {
  defaultCenter: { lat: 33.749, lng: -84.388 }, // Atlanta
  defaultZoom: 10,
  minZoom: 8,
  maxZoom: 18,
  tileStyle: 'mapbox://styles/mapbox/light-v11'
};

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.VITE_API_URL || '/api',
  timeout: 30000,
  retries: 3
};

// Feature flags
export const FEATURES = {
  TRENDS_ENABLED: true,
  AI_INSIGHTS_ENABLED: false,
  PRO_FEATURES_ENABLED: false,
  MULTI_CITY_ENABLED: false,
  MOCK_DATA_ALLOWED: true
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'insite-theme',
  FAVORITES: 'insite-favorites',
  RECENT_SEARCHES: 'insite-recent-searches',
  USER_PREFERENCES: 'insite-preferences',
  COMPARISON_LIST: 'insite-compare'
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  'Alt+1': { action: 'tab:home', description: 'Go to Home tab' },
  'Alt+2': { action: 'tab:explore', description: 'Go to Explore tab' },
  'Alt+3': { action: 'tab:compare', description: 'Go to Compare tab' },
  'Alt+4': { action: 'tab:lifestyle', description: 'Go to Lifestyle tab' },
  'Alt+5': { action: 'tab:analytics', description: 'Go to Analytics tab' },
  'Alt+6': { action: 'tab:map', description: 'Go to Map tab' },
  'Cmd+K': { action: 'search:focus', description: 'Focus search bar' },
  'Cmd+E': { action: 'export:data', description: 'Export data' },
  'Escape': { action: 'modal:close', description: 'Close modal' }
};

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SCORE_THRESHOLDS,
    SCORE_COLORS,
    CHOROPLETH_COLORS,
    DEFAULT_WEIGHTS,
    SCORING_CATEGORIES,
    METRIC_DEFINITIONS,
    MAP_CONFIG,
    API_CONFIG,
    FEATURES,
    STORAGE_KEYS,
    KEYBOARD_SHORTCUTS
  };
}
