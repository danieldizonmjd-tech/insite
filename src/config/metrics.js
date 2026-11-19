/**
 * Metric Definitions
 * Complete catalog of all metrics with metadata
 */

export const METRIC_CATEGORIES = {
  housing: {
    id: 'housing',
    name: 'Housing',
    icon: 'fas fa-home',
    description: 'Property values, appreciation, and housing market indicators',
    color: '#3b82f6'
  },
  economy: {
    id: 'economy',
    name: 'Economy',
    icon: 'fas fa-briefcase',
    description: 'Income, employment, and economic indicators',
    color: '#10b981'
  },
  demographics: {
    id: 'demographics',
    name: 'Demographics',
    icon: 'fas fa-users',
    description: 'Population characteristics and composition',
    color: '#8b5cf6'
  },
  livability: {
    id: 'livability',
    name: 'Livability',
    icon: 'fas fa-heart',
    description: 'Quality of life factors',
    color: '#ef4444'
  },
  transit: {
    id: 'transit',
    name: 'Transit',
    icon: 'fas fa-subway',
    description: 'Public transportation access',
    color: '#f59e0b'
  },
  environment: {
    id: 'environment',
    name: 'Environment',
    icon: 'fas fa-leaf',
    description: 'Environmental quality and green space',
    color: '#22c55e'
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: 'fas fa-graduation-cap',
    description: 'Schools and educational attainment',
    color: '#06b6d4'
  }
};

export const METRICS = {
  // ============================================
  // HOUSING METRICS
  // ============================================
  avg_value: {
    key: 'avg_value',
    name: 'Median Home Value',
    shortName: 'Home Value',
    category: 'housing',
    unit: '$',
    format: 'currency',
    decimals: 0,
    higherIsBetter: null, // Depends on perspective
    source: 'Zillow ZHVI',
    updateFrequency: 'monthly',
    dataStatus: 'real',
    description: 'Zillow Home Value Index - median estimated home value'
  },

  appreciation_1y: {
    key: 'appreciation_1y',
    name: '1-Year Appreciation',
    shortName: '1Y Change',
    category: 'housing',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: true,
    source: 'Zillow',
    updateFrequency: 'monthly',
    dataStatus: 'real',
    description: 'Year-over-year change in home values'
  },

  appreciation_5y: {
    key: 'appreciation_5y',
    name: '5-Year Appreciation',
    shortName: '5Y Change',
    category: 'housing',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: true,
    source: 'Zillow',
    updateFrequency: 'monthly',
    dataStatus: 'estimated',
    description: '5-year cumulative change in home values'
  },

  housing_vacancy_rate: {
    key: 'housing_vacancy_rate',
    name: 'Vacancy Rate',
    shortName: 'Vacancy',
    category: 'housing',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: false,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'real',
    description: 'Percentage of housing units that are vacant'
  },

  median_rent: {
    key: 'median_rent',
    name: 'Median Rent',
    shortName: 'Rent',
    category: 'housing',
    unit: '$',
    format: 'currency',
    decimals: 0,
    higherIsBetter: null,
    source: 'Zillow ZORI',
    updateFrequency: 'monthly',
    dataStatus: 'missing',
    description: 'Median asking rent for available units'
  },

  // ============================================
  // ECONOMY METRICS
  // ============================================
  median_income: {
    key: 'median_income',
    name: 'Median Household Income',
    shortName: 'Income',
    category: 'economy',
    unit: '$',
    format: 'currency',
    decimals: 0,
    higherIsBetter: true,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'real',
    description: 'Median annual household income'
  },

  employment_rate: {
    key: 'employment_rate',
    name: 'Employment Rate',
    shortName: 'Employment',
    category: 'economy',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: true,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'estimated',
    description: 'Percentage of labor force that is employed'
  },

  income_growth: {
    key: 'income_growth',
    name: 'Income Growth (5Y)',
    shortName: 'Inc. Growth',
    category: 'economy',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: true,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'missing',
    description: '5-year compound annual income growth rate'
  },

  // ============================================
  // DEMOGRAPHICS METRICS
  // ============================================
  population: {
    key: 'population',
    name: 'Population',
    shortName: 'Population',
    category: 'demographics',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: null,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'real',
    description: 'Total population'
  },

  population_density: {
    key: 'population_density',
    name: 'Population Density',
    shortName: 'Density',
    category: 'demographics',
    unit: '/sq mi',
    format: 'number',
    decimals: 0,
    higherIsBetter: null,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'estimated',
    description: 'Population per square mile'
  },

  median_age: {
    key: 'median_age',
    name: 'Median Age',
    shortName: 'Med. Age',
    category: 'demographics',
    unit: 'years',
    format: 'number',
    decimals: 1,
    higherIsBetter: null,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'estimated',
    description: 'Median age of residents'
  },

  education_bachelors: {
    key: 'education_bachelors',
    name: "Bachelor's Degree+",
    shortName: 'College',
    category: 'demographics',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: true,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'estimated',
    description: 'Percentage of adults with bachelor\'s degree or higher'
  },

  // ============================================
  // LIVABILITY METRICS
  // ============================================
  crime_rate: {
    key: 'crime_rate',
    name: 'Crime Rate Index',
    shortName: 'Crime',
    category: 'livability',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: false,
    source: 'FBI UCR / Local PD',
    updateFrequency: 'yearly',
    dataStatus: 'estimated',
    description: 'Composite crime index (lower is safer)'
  },

  walkability: {
    key: 'walkability',
    name: 'Walk Score',
    shortName: 'Walk',
    category: 'livability',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: true,
    source: 'Walk Score API',
    updateFrequency: 'quarterly',
    dataStatus: 'missing',
    description: 'Walk Score walkability rating (0-100)'
  },

  noise_level: {
    key: 'noise_level',
    name: 'Noise Level',
    shortName: 'Noise',
    category: 'livability',
    unit: 'dB',
    format: 'number',
    decimals: 0,
    higherIsBetter: false,
    source: 'DOT / Estimates',
    updateFrequency: 'yearly',
    dataStatus: 'missing',
    description: 'Average ambient noise level'
  },

  // ============================================
  // TRANSIT METRICS
  // ============================================
  transit_score: {
    key: 'transit_score',
    name: 'Transit Score',
    shortName: 'Transit',
    category: 'transit',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: true,
    source: 'InSite Calculation',
    updateFrequency: 'quarterly',
    dataStatus: 'real',
    description: 'Public transit accessibility score (0-100)'
  },

  commute_time: {
    key: 'commute_time',
    name: 'Avg. Commute Time',
    shortName: 'Commute',
    category: 'transit',
    unit: 'min',
    format: 'number',
    decimals: 0,
    higherIsBetter: false,
    source: 'Census ACS',
    updateFrequency: 'yearly',
    dataStatus: 'missing',
    description: 'Average one-way commute time'
  },

  // ============================================
  // ENVIRONMENT METRICS
  // ============================================
  parks_score: {
    key: 'parks_score',
    name: 'Parks Score',
    shortName: 'Parks',
    category: 'environment',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: true,
    source: 'InSite Calculation',
    updateFrequency: 'yearly',
    dataStatus: 'real',
    description: 'Park and recreation access score (0-100)'
  },

  green_space_pct: {
    key: 'green_space_pct',
    name: 'Green Space',
    shortName: 'Green',
    category: 'environment',
    unit: '%',
    format: 'percent',
    decimals: 1,
    higherIsBetter: true,
    source: 'NLCD / Estimates',
    updateFrequency: 'yearly',
    dataStatus: 'missing',
    description: 'Percentage of land covered by vegetation'
  },

  air_quality: {
    key: 'air_quality',
    name: 'Air Quality Index',
    shortName: 'Air',
    category: 'environment',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: true,
    source: 'EPA AirNow',
    updateFrequency: 'daily',
    dataStatus: 'missing',
    description: 'Air quality index (higher is better, inverted from AQI)'
  },

  flood_risk: {
    key: 'flood_risk',
    name: 'Flood Risk',
    shortName: 'Flood',
    category: 'environment',
    unit: '',
    format: 'number',
    decimals: 0,
    higherIsBetter: false,
    source: 'FEMA NFHL',
    updateFrequency: 'yearly',
    dataStatus: 'missing',
    description: 'Flood risk index (0-100)'
  },

  // ============================================
  // EDUCATION METRICS
  // ============================================
  school_rating: {
    key: 'school_rating',
    name: 'School Rating',
    shortName: 'Schools',
    category: 'education',
    unit: '',
    format: 'number',
    decimals: 1,
    higherIsBetter: true,
    source: 'GreatSchools',
    updateFrequency: 'yearly',
    dataStatus: 'missing',
    description: 'Average GreatSchools rating (1-10)'
  }
};

/**
 * Get metrics by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Array of metrics in category
 */
export function getMetricsByCategory(categoryId) {
  return Object.values(METRICS).filter(m => m.category === categoryId);
}

/**
 * Get metrics by data status
 * @param {string} status - 'real', 'estimated', or 'missing'
 * @returns {Array} Array of metrics with status
 */
export function getMetricsByStatus(status) {
  return Object.values(METRICS).filter(m => m.dataStatus === status);
}

/**
 * Get metric by key
 * @param {string} key - Metric key
 * @returns {Object|null} Metric definition or null
 */
export function getMetric(key) {
  return METRICS[key] || null;
}

/**
 * Get all metrics as array
 * @returns {Array} Array of all metrics
 */
export function getAllMetrics() {
  return Object.values(METRICS);
}

/**
 * Get metrics available for choropleth map
 * @returns {Array} Array of mappable metrics
 */
export function getMappableMetrics() {
  // Return metrics that make sense for choropleth visualization
  return Object.values(METRICS).filter(m => 
    m.dataStatus !== 'missing' && 
    m.format !== 'text'
  );
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    METRIC_CATEGORIES,
    METRICS,
    getMetricsByCategory,
    getMetricsByStatus,
    getMetric,
    getAllMetrics,
    getMappableMetrics
  };
}
