/**
 * InSite Urban Scoring Engine
 * Multi-dimensional scoring system for neighborhood analysis
 */

import { DEFAULT_WEIGHTS } from '../utils/constants.js';

// Metric mappings for each scoring category
const METRIC_MAPPINGS = {
  livability: {
    metrics: ['crime_rate', 'walkability', 'noise_level', 'air_quality'],
    inversed: ['crime_rate', 'noise_level'] // Lower is better
  },
  economy: {
    metrics: ['median_income', 'employment_rate', 'income_growth', 'job_density'],
    inversed: []
  },
  housing: {
    metrics: ['avg_value', 'appreciation_1y', 'housing_vacancy_rate', 'inventory_months'],
    inversed: ['housing_vacancy_rate', 'inventory_months']
  },
  demographics: {
    metrics: ['education_bachelors', 'diversity_index', 'age_median'],
    inversed: []
  },
  environment: {
    metrics: ['green_space_pct', 'flood_risk', 'tree_canopy', 'impervious_pct'],
    inversed: ['flood_risk', 'impervious_pct']
  },
  development: {
    metrics: ['permits_1y', 'new_construction', 'zoning_flexibility'],
    inversed: []
  }
};

/**
 * ScoringEngine class
 * Calculates multi-dimensional scores for neighborhoods
 */
class ScoringEngine {
  /**
   * @param {Array} cityData - Array of neighborhood objects with metrics
   */
  constructor(cityData = []) {
    this.cityData = cityData;
    this.percentiles = {};
    
    if (cityData.length > 0) {
      this.calculatePercentiles();
    }
  }

  /**
   * Update city data and recalculate percentiles
   * @param {Array} cityData - New city data array
   */
  setData(cityData) {
    this.cityData = cityData;
    this.calculatePercentiles();
  }

  /**
   * Pre-calculate percentile thresholds for all metrics
   */
  calculatePercentiles() {
    const allMetrics = new Set();
    Object.values(METRIC_MAPPINGS).forEach(cat => {
      cat.metrics.forEach(m => allMetrics.add(m));
    });

    // Also add common metrics not in mappings
    ['transit_score', 'parks_score', 'overall_score'].forEach(m => allMetrics.add(m));

    allMetrics.forEach(metric => {
      const values = this.cityData
        .map(n => this.getMetricValue(n, metric))
        .filter(v => v != null && !isNaN(v))
        .sort((a, b) => a - b);

      if (values.length > 0) {
        this.percentiles[metric] = {
          p10: this.getPercentileValue(values, 10),
          p25: this.getPercentileValue(values, 25),
          p50: this.getPercentileValue(values, 50),
          p75: this.getPercentileValue(values, 75),
          p90: this.getPercentileValue(values, 90),
          min: values[0],
          max: values[values.length - 1]
        };
      }
    });
  }

  /**
   * Get metric value from neighborhood object
   * @param {Object} neighborhood - Neighborhood object
   * @param {string} metric - Metric key
   * @returns {number|null} Metric value
   */
  getMetricValue(neighborhood, metric) {
    // Check direct property first
    if (neighborhood[metric] != null) {
      return neighborhood[metric];
    }
    // Then check metrics object
    if (neighborhood.metrics && neighborhood.metrics[metric] != null) {
      return neighborhood.metrics[metric];
    }
    // Then check properties object (for GeoJSON)
    if (neighborhood.properties && neighborhood.properties[metric] != null) {
      return neighborhood.properties[metric];
    }
    return null;
  }

  /**
   * Get value at a given percentile from sorted array
   * @param {Array} sortedArray - Sorted array of values
   * @param {number} percentile - Percentile (0-100)
   * @returns {number} Value at percentile
   */
  getPercentileValue(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    const index = Math.floor((percentile / 100) * sortedArray.length);
    return sortedArray[Math.min(index, sortedArray.length - 1)];
  }

  /**
   * Normalize a raw value to 0-100 scale using percentile ranking
   * @param {number} value - Raw value
   * @param {string} metric - Metric key
   * @param {boolean} inversed - If true, lower values are better
   * @returns {number|null} Normalized value (0-100)
   */
  normalizeValue(value, metric, inversed = false) {
    if (value == null || isNaN(value)) return null;

    const p = this.percentiles[metric];
    if (!p) return 50; // Default to middle if no percentile data

    let normalized;
    if (value <= p.min) normalized = 0;
    else if (value >= p.max) normalized = 100;
    else {
      normalized = ((value - p.min) / (p.max - p.min)) * 100;
    }

    return inversed ? 100 - normalized : normalized;
  }

  /**
   * Calculate category score (0-100)
   * @param {Object} neighborhood - Neighborhood object
   * @param {string} category - Category key
   * @returns {number|null} Category score
   */
  calculateCategoryScore(neighborhood, category) {
    const mapping = METRIC_MAPPINGS[category];
    if (!mapping) return null;

    let sum = 0;
    let count = 0;

    mapping.metrics.forEach(metric => {
      const value = this.getMetricValue(neighborhood, metric);
      if (value != null) {
        const inversed = mapping.inversed.includes(metric);
        const normalized = this.normalizeValue(value, metric, inversed);
        if (normalized != null) {
          sum += normalized;
          count++;
        }
      }
    });

    return count > 0 ? Math.round(sum / count) : null;
  }

  /**
   * Calculate all scores for a neighborhood
   * @param {Object} neighborhood - Neighborhood object
   * @param {Object} [weights=DEFAULT_WEIGHTS] - Category weights
   * @returns {Object} Complete score breakdown
   */
  calculateScores(neighborhood, weights = DEFAULT_WEIGHTS) {
    const scores = {};
    let weightedSum = 0;
    let totalWeight = 0;

    // Calculate each category score
    Object.keys(METRIC_MAPPINGS).forEach(category => {
      scores[category] = this.calculateCategoryScore(neighborhood, category);
    });

    // Add transit and parks scores directly if available
    const transitScore = this.getMetricValue(neighborhood, 'transit_score');
    if (transitScore != null) {
      scores.transit = transitScore;
    }
    
    const parksScore = this.getMetricValue(neighborhood, 'parks_score');
    if (parksScore != null) {
      scores.parks = parksScore;
    }

    // Calculate weighted overall score
    Object.entries(scores).forEach(([category, score]) => {
      if (score != null && weights[category]) {
        weightedSum += score * weights[category];
        totalWeight += weights[category];
      }
    });

    const overallScore = totalWeight > 0
      ? Math.round(weightedSum / totalWeight)
      : null;

    // Calculate percentile rank within city
    const percentileRank = this.calculatePercentileRank(overallScore);

    // Determine trend direction
    const trend = this.calculateTrend(neighborhood);

    return {
      overall: overallScore,
      breakdown: scores,
      percentile: percentileRank,
      trend,
      weightsUsed: weights,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate percentile rank of overall score
   * @param {number} score - Score to rank
   * @returns {number|null} Percentile rank (0-100)
   */
  calculatePercentileRank(score) {
    if (score == null) return null;

    const allScores = this.cityData
      .map(n => this.getMetricValue(n, 'overall_score') || n.scores?.overall)
      .filter(s => s != null)
      .sort((a, b) => a - b);

    if (allScores.length === 0) return 50;

    const index = allScores.findIndex(s => s >= score);
    return Math.round((index / allScores.length) * 100);
  }

  /**
   * Calculate trend based on historical data
   * @param {Object} neighborhood - Neighborhood object
   * @returns {Object} Trend information
   */
  calculateTrend(neighborhood) {
    const history = neighborhood.history || neighborhood.scoreHistory;
    if (!history || history.length < 2) {
      return { direction: 'stable', magnitude: 0 };
    }

    const recent = history[history.length - 1].overall;
    const previous = history[0].overall;

    if (recent == null || previous == null) {
      return { direction: 'stable', magnitude: 0 };
    }

    const change = recent - previous;
    const magnitude = Math.abs(change);

    let direction;
    if (change > 2) direction = 'up';
    else if (change < -2) direction = 'down';
    else direction = 'stable';

    return { direction, magnitude: Math.round(magnitude * 10) / 10 };
  }

  /**
   * Batch calculate scores for all neighborhoods
   * @param {Object} [weights=DEFAULT_WEIGHTS] - Category weights
   * @returns {Array} Array of scored neighborhoods
   */
  calculateAllScores(weights = DEFAULT_WEIGHTS) {
    return this.cityData.map(neighborhood => ({
      id: neighborhood.id || neighborhood.properties?.ZCTA5CE10,
      zipCode: neighborhood.zipCode || neighborhood.properties?.ZCTA5CE10,
      ...this.calculateScores(neighborhood, weights)
    }));
  }

  /**
   * Find similar neighborhoods using Euclidean distance
   * @param {string} targetId - Target neighborhood ID
   * @param {number} [count=5] - Number of similar neighborhoods to find
   * @returns {Array} Array of similar neighborhoods
   */
  findSimilar(targetId, count = 5) {
    const target = this.cityData.find(n => 
      n.id === targetId || 
      n.properties?.ZCTA5CE10 === targetId ||
      n.zipCode === targetId
    );
    
    if (!target) return [];

    const targetScores = this.calculateScores(target);
    if (!targetScores.overall) return [];

    const distances = this.cityData
      .filter(n => {
        const id = n.id || n.properties?.ZCTA5CE10;
        return id !== targetId;
      })
      .map(n => {
        const scores = this.calculateScores(n);
        return {
          id: n.id || n.properties?.ZCTA5CE10,
          zipCode: n.zipCode || n.properties?.ZCTA5CE10,
          name: n.name || n.properties?.name,
          distance: this.euclideanDistance(targetScores.breakdown, scores.breakdown),
          scores
        };
      })
      .filter(d => !isNaN(d.distance))
      .sort((a, b) => a.distance - b.distance);

    return distances.slice(0, count).map(d => ({
      neighborhoodId: d.id,
      zipCode: d.zipCode,
      name: d.name,
      similarityScore: Math.round((1 - (d.distance / 100)) * 100) / 100,
      distance: d.distance,
      overallScore: d.scores.overall
    }));
  }

  /**
   * Calculate Euclidean distance between two score objects
   * @param {Object} scores1 - First score breakdown
   * @param {Object} scores2 - Second score breakdown
   * @returns {number} Euclidean distance
   */
  euclideanDistance(scores1, scores2) {
    if (!scores1 || !scores2) return Infinity;
    
    const categories = Object.keys(METRIC_MAPPINGS);
    let sumSq = 0;
    let count = 0;

    categories.forEach(cat => {
      const v1 = scores1[cat];
      const v2 = scores2[cat];
      if (v1 != null && v2 != null) {
        sumSq += Math.pow(v1 - v2, 2);
        count++;
      }
    });

    return count > 0 ? Math.sqrt(sumSq / count) : Infinity;
  }

  /**
   * Get score grade (A, B, C, D, F)
   * @param {number} score - Score value (0-100)
   * @returns {string} Letter grade
   */
  static getGrade(score) {
    if (score == null) return 'N/A';
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Get score color class
   * @param {number} score - Score value (0-100)
   * @returns {string} CSS class name
   */
  static getScoreClass(score) {
    if (score == null) return 'score-na';
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  }

  /**
   * Get score color hex value
   * @param {number} score - Score value (0-100)
   * @returns {string} Hex color code
   */
  static getScoreColor(score) {
    if (score == null) return '#9ca3af'; // Gray
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScoringEngine, METRIC_MAPPINGS };
}

export { ScoringEngine, METRIC_MAPPINGS };
export default ScoringEngine;
