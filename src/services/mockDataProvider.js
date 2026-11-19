/**
 * Mock Data Provider
 * Generates realistic placeholder data for development and demos
 */

import { SeededRandom, createNeighborhoodRandom } from '../utils/seededRandom.js';

// Realistic distribution configurations for Atlanta market
const METRIC_CONFIGS = {
  // Property values: Right-skewed, $150K - $2M range
  avg_value: {
    min: 150000,
    max: 2000000,
    mean: 375000,
    stdDev: 150000,
    skew: 0.5
  },

  // Population: Wide range, 1K - 100K
  population: {
    min: 1000,
    max: 100000,
    mean: 35000,
    stdDev: 20000
  },

  // Median income: $25K - $250K
  median_income: {
    min: 25000,
    max: 250000,
    mean: 72000,
    stdDev: 35000
  },

  // Crime rate: 0-100 index (lower is better)
  crime_rate: {
    min: 5,
    max: 80,
    mean: 35,
    stdDev: 15
  },

  // Vacancy rate: 2% - 30%
  housing_vacancy_rate: {
    min: 2,
    max: 30,
    mean: 8,
    stdDev: 5
  },

  // Walk score: 0-100
  walkability: {
    min: 10,
    max: 98,
    mean: 45,
    stdDev: 25
  },

  // Transit score: 0-100
  transit_score: {
    min: 0,
    max: 100,
    mean: 35,
    stdDev: 30
  },

  // Parks score: 0-100
  parks_score: {
    min: 10,
    max: 95,
    mean: 50,
    stdDev: 20
  },

  // Education: % with Bachelor's+
  education_bachelors: {
    min: 10,
    max: 80,
    mean: 35,
    stdDev: 15
  },

  // Employment rate: 85% - 99%
  employment_rate: {
    min: 85,
    max: 99,
    mean: 94,
    stdDev: 3
  },

  // Appreciation: -10% to +30% YoY
  appreciation_1y: {
    min: -10,
    max: 30,
    mean: 5,
    stdDev: 8
  },

  // 5-year appreciation: -20% to +100%
  appreciation_5y: {
    min: -20,
    max: 100,
    mean: 25,
    stdDev: 20
  }
};

// Neighborhood name components
const NEIGHBORHOOD_PREFIXES = [
  'North', 'South', 'East', 'West', 'Old', 'New',
  'Upper', 'Lower', 'Greater', 'Historic'
];

const NEIGHBORHOOD_SUFFIXES = [
  'Park', 'Heights', 'Hills', 'Village', 'Gardens',
  'Estates', 'Manor', 'Creek', 'Grove', 'Crossing',
  'Springs', 'Woods', 'Meadows', 'Ridge', 'Valley'
];

const BASE_NAMES = [
  'Midtown', 'Buckhead', 'Decatur', 'Dunwoody', 'Vinings',
  'Brookhaven', 'Roswell', 'Marietta', 'Smyrna', 'Kennesaw',
  'Peachtree', 'Ashford', 'Sandy Springs', 'Tucker', 'Chamblee',
  'Oak', 'Pine', 'Maple', 'Elm', 'Cedar', 'Magnolia', 'Dogwood'
];

/**
 * MockDataProvider class
 * Generates consistent mock data based on seeded random numbers
 */
class MockDataProvider {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Generate complete neighborhood data
   * @param {string} zipCode - ZIP code to generate data for
   * @returns {Object} Neighborhood data object
   */
  getNeighborhood(zipCode) {
    // Check cache for consistency
    if (this.cache.has(zipCode)) {
      return this.cache.get(zipCode);
    }

    const rng = createNeighborhoodRandom(zipCode);

    // Generate base metrics
    const metrics = {};
    Object.entries(METRIC_CONFIGS).forEach(([key, config]) => {
      metrics[key] = Math.round(rng.metric(config) * 100) / 100;
    });

    // Create correlations for realism
    // Higher income areas tend to have lower crime, higher values
    const incomePercentile = (metrics.median_income - 25000) / (250000 - 25000);
    metrics.crime_rate = Math.max(5, metrics.crime_rate - incomePercentile * 30);
    metrics.avg_value = Math.round(metrics.avg_value * (0.7 + incomePercentile * 0.6));
    metrics.education_bachelors = Math.min(80, metrics.education_bachelors + incomePercentile * 20);

    // Urban areas have higher transit/walk scores but potentially higher crime
    const urbanFactor = rng.float(0, 1);
    if (urbanFactor > 0.7) {
      metrics.transit_score = Math.min(100, metrics.transit_score + 30);
      metrics.walkability = Math.min(100, metrics.walkability + 25);
      metrics.crime_rate = Math.min(80, metrics.crime_rate * 1.15);
      metrics.parks_score = Math.min(100, metrics.parks_score + 15);
    }

    // Generate name
    const name = this.generateNeighborhoodName(rng);

    // Generate demographic breakdowns
    const demographics = this.generateDemographics(rng);

    // Generate coordinates
    const coordinates = this.generateCoordinates(zipCode);

    // Generate trend data
    const trends = this.generateTrendsForMetric(metrics.avg_value, {
      periods: 60,
      volatility: 0.02,
      trend: 0.004
    });

    const neighborhood = {
      id: `mock-${zipCode}`,
      zipCode,
      name,
      displayName: `${name} (${zipCode})`,
      city: 'Atlanta',
      state: 'GA',
      metrics,
      demographics,
      coordinates,
      trends: {
        propertyValue: trends
      },
      isMockData: true,
      dataSource: 'simulated',
      generatedAt: new Date().toISOString()
    };

    this.cache.set(zipCode, neighborhood);
    return neighborhood;
  }

  /**
   * Generate realistic neighborhood name
   * @param {SeededRandom} rng - Random number generator
   * @returns {string} Generated neighborhood name
   */
  generateNeighborhoodName(rng) {
    const usePrefix = rng.next() > 0.6;
    const prefix = usePrefix ? rng.pick(NEIGHBORHOOD_PREFIXES) + ' ' : '';
    const baseName = rng.pick(BASE_NAMES);
    const useSuffix = rng.next() > 0.5;
    const suffix = useSuffix ? ' ' + rng.pick(NEIGHBORHOOD_SUFFIXES) : '';

    return `${prefix}${baseName}${suffix}`;
  }

  /**
   * Generate demographic breakdown
   * @param {SeededRandom} rng - Random number generator
   * @returns {Object} Demographic data
   */
  generateDemographics(rng) {
    // Age distribution (must sum to ~100%)
    const ages = {
      under18: rng.int(15, 30),
      age18to34: rng.int(15, 35),
      age35to54: rng.int(20, 35),
      age55to74: rng.int(10, 25)
    };
    ages.over75 = Math.max(0, 100 - Object.values(ages).reduce((a, b) => a + b, 0));

    // Education levels
    const education = {
      highSchool: rng.int(85, 98),
      someCollege: rng.int(50, 80),
      bachelors: rng.int(20, 60),
      graduate: rng.int(5, 30)
    };

    // Housing
    const ownerOccupied = rng.int(40, 85);
    const housing = {
      ownerOccupied,
      renterOccupied: 100 - ownerOccupied,
      medianRent: rng.int(800, 2500),
      medianMortgage: rng.int(1000, 4000)
    };

    // Race/ethnicity distribution
    const raceEthnicity = {
      white: rng.int(20, 70),
      black: rng.int(10, 50),
      hispanic: rng.int(5, 30),
      asian: rng.int(2, 20)
    };
    raceEthnicity.other = Math.max(0, 100 - Object.values(raceEthnicity).reduce((a, b) => a + b, 0));

    return { ages, education, housing, raceEthnicity };
  }

  /**
   * Generate coordinates within Atlanta metro bounds
   * @param {string} zipCode - ZIP code for seeding
   * @returns {Object} Latitude and longitude
   */
  generateCoordinates(zipCode) {
    const rng = createNeighborhoodRandom(zipCode);

    // Atlanta metro bounds
    const bounds = {
      north: 34.2,
      south: 33.4,
      east: -83.9,
      west: -84.9
    };

    return {
      lat: rng.float(bounds.south, bounds.north),
      lng: rng.float(bounds.west, bounds.east)
    };
  }

  /**
   * Generate historical trend data for a metric
   * @param {number} currentValue - Current value
   * @param {Object} options - Generation options
   * @returns {Array} Array of trend data points
   */
  generateTrendsForMetric(currentValue, options = {}) {
    const {
      periods = 60, // 5 years of monthly data
      volatility = 0.02,
      trend = 0.003 // 0.3% monthly growth
    } = options;

    const rng = new SeededRandom(Math.floor(currentValue * 1000));
    const data = [];

    // Work backwards from current value
    let value = currentValue / Math.pow(1 + trend, periods);
    const now = new Date();

    for (let i = periods; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);

      // Add noise and trend
      const noise = rng.gaussian(0, volatility);
      value = value * (1 + trend + noise);

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        isMockData: true
      });
    }

    return data;
  }

  /**
   * Generate metric value for a specific neighborhood and metric
   * @param {string} neighborhoodId - Neighborhood ID or ZIP code
   * @param {string} metric - Metric key
   * @returns {Object} Metric data
   */
  getMetric(neighborhoodId, metric) {
    const neighborhood = this.getNeighborhood(neighborhoodId);
    const value = neighborhood.metrics[metric];

    return {
      value,
      metric,
      neighborhoodId,
      isMockData: true,
      dataDate: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Generate trends for a specific metric
   * @param {string} neighborhoodId - Neighborhood ID or ZIP code
   * @param {string} metric - Metric key
   * @param {Object} options - Generation options
   * @returns {Array} Array of trend data points
   */
  getTrends(neighborhoodId, metric, options = {}) {
    const neighborhood = this.getNeighborhood(neighborhoodId);
    const currentValue = neighborhood.metrics[metric];

    if (currentValue == null) {
      return [];
    }

    // Adjust volatility and trend based on metric type
    const metricOptions = {
      avg_value: { volatility: 0.015, trend: 0.004 },
      median_income: { volatility: 0.01, trend: 0.002 },
      population: { volatility: 0.005, trend: 0.001 },
      crime_rate: { volatility: 0.03, trend: -0.001 },
      housing_vacancy_rate: { volatility: 0.02, trend: 0 }
    };

    const finalOptions = {
      periods: options.periods || 60,
      ...metricOptions[metric] || { volatility: 0.02, trend: 0.002 }
    };

    return this.generateTrendsForMetric(currentValue, finalOptions);
  }

  /**
   * Generate AI-style insights for a neighborhood
   * @param {string} neighborhoodId - Neighborhood ID or ZIP code
   * @returns {Array} Array of insight objects
   */
  generateInsights(neighborhoodId) {
    const neighborhood = this.getNeighborhood(neighborhoodId);
    const { metrics, name } = neighborhood;
    const insights = [];

    // Generate insights based on metric values
    if (metrics.appreciation_1y > 10) {
      insights.push({
        type: 'opportunity',
        title: 'Strong Appreciation',
        content: `${name} has seen ${metrics.appreciation_1y.toFixed(1)}% appreciation in the past year, outpacing the metro average.`,
        confidence: 0.85,
        isMockData: true
      });
    }

    if (metrics.crime_rate < 25) {
      insights.push({
        type: 'strength',
        title: 'Low Crime Area',
        content: `This neighborhood has a crime rate well below the metro average, making it one of the safer areas in Atlanta.`,
        confidence: 0.9,
        isMockData: true
      });
    }

    if (metrics.transit_score > 70) {
      insights.push({
        type: 'strength',
        title: 'Excellent Transit Access',
        content: `With a transit score of ${Math.round(metrics.transit_score)}, residents have easy access to MARTA and other public transportation options.`,
        confidence: 0.88,
        isMockData: true
      });
    }

    if (metrics.housing_vacancy_rate > 15) {
      insights.push({
        type: 'risk',
        title: 'High Vacancy Rate',
        content: `The vacancy rate of ${metrics.housing_vacancy_rate.toFixed(1)}% is above average, which may indicate economic challenges or oversupply.`,
        confidence: 0.75,
        isMockData: true
      });
    }

    // Add general summary insight
    const overallScore = this.calculateQuickScore(metrics);
    insights.push({
      type: 'summary',
      title: 'Neighborhood Overview',
      content: `${name} is a ${this.getScoreLabel(overallScore)} neighborhood with ${metrics.population > 50000 ? 'a large' : 'a moderate'} population and ${metrics.median_income > 80000 ? 'above-average' : 'moderate'} household incomes.`,
      confidence: 0.8,
      isMockData: true
    });

    return insights;
  }

  /**
   * Calculate a quick overall score from metrics
   * @param {Object} metrics - Metrics object
   * @returns {number} Score 0-100
   */
  calculateQuickScore(metrics) {
    const scores = [];

    // Add normalized metrics (simplified version)
    if (metrics.walkability) scores.push(metrics.walkability);
    if (metrics.transit_score) scores.push(metrics.transit_score);
    if (metrics.parks_score) scores.push(metrics.parks_score);
    if (metrics.crime_rate) scores.push(100 - metrics.crime_rate);

    if (scores.length === 0) return 50;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Get score label from score value
   * @param {number} score - Score 0-100
   * @returns {string} Score label
   */
  getScoreLabel(score) {
    if (score >= 80) return 'highly desirable';
    if (score >= 60) return 'desirable';
    if (score >= 40) return 'moderate';
    return 'developing';
  }
}

// Create singleton instance
const mockDataProvider = new MockDataProvider();

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockDataProvider, mockDataProvider };
}

export { MockDataProvider, mockDataProvider };
export default mockDataProvider;
