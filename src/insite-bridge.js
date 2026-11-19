/**
 * InSite Legacy Bridge
 * Connects new modular services with existing insite_main.html code
 * This allows gradual migration while maintaining backward compatibility
 */

// Since the main HTML file uses script tags (not ES modules),
// we need to expose our modules globally

(function(global) {
  'use strict';

  // ============================================
  // SEEDED RANDOM
  // ============================================
  class SeededRandom {
    constructor(seed) {
      this.seed = seed;
      this.current = seed;
    }

    next() {
      let t = this.current += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    reset() { this.current = this.seed; }

    int(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    }

    float(min, max) {
      return this.next() * (max - min) + min;
    }

    pick(array) {
      if (!array || array.length === 0) return null;
      return array[this.int(0, array.length - 1)];
    }

    gaussian(mean, stdDev) {
      const u1 = this.next();
      const u2 = this.next();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return mean + z0 * stdDev;
    }

    metric(config) {
      const { min, max, mean, stdDev, skew = 0 } = config;
      let value;
      if (stdDev) {
        value = this.gaussian(mean, stdDev);
        if (skew !== 0) {
          value = value + skew * Math.pow(value - mean, 2) / 100;
        }
      } else {
        value = this.float(min, max);
      }
      return Math.max(min, Math.min(max, value));
    }
  }

  function createNeighborhoodRandom(zipCode) {
    const seed = String(zipCode).split('').reduce((acc, char) =>
      acc + char.charCodeAt(0), 0) * 12345;
    return new SeededRandom(seed);
  }

  // ============================================
  // SCORING ENGINE
  // ============================================
  const DEFAULT_WEIGHTS = {
    livability: 20,
    economy: 20,
    housing: 15,
    demographics: 10,
    environment: 15,
    development: 10,
    transit: 5,
    parks: 5
  };

  const METRIC_MAPPINGS = {
    livability: {
      metrics: ['crime_rate', 'walkability', 'noise_level', 'air_quality'],
      inversed: ['crime_rate', 'noise_level']
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

  class ScoringEngine {
    constructor(cityData = []) {
      this.cityData = cityData;
      this.percentiles = {};
      if (cityData.length > 0) {
        this.calculatePercentiles();
      }
    }

    setData(cityData) {
      this.cityData = cityData;
      this.calculatePercentiles();
    }

    getMetricValue(neighborhood, metric) {
      if (neighborhood[metric] != null) return neighborhood[metric];
      if (neighborhood.metrics && neighborhood.metrics[metric] != null) {
        return neighborhood.metrics[metric];
      }
      if (neighborhood.properties && neighborhood.properties[metric] != null) {
        return neighborhood.properties[metric];
      }
      return null;
    }

    calculatePercentiles() {
      const allMetrics = new Set();
      Object.values(METRIC_MAPPINGS).forEach(cat => {
        cat.metrics.forEach(m => allMetrics.add(m));
      });
      ['transit_score', 'parks_score', 'overall_score'].forEach(m => allMetrics.add(m));

      allMetrics.forEach(metric => {
        const values = this.cityData
          .map(n => this.getMetricValue(n, metric))
          .filter(v => v != null && !isNaN(v))
          .sort((a, b) => a - b);

        if (values.length > 0) {
          this.percentiles[metric] = {
            min: values[0],
            max: values[values.length - 1],
            p50: values[Math.floor(values.length / 2)]
          };
        }
      });
    }

    normalizeValue(value, metric, inversed = false) {
      if (value == null || isNaN(value)) return null;
      const p = this.percentiles[metric];
      if (!p) return 50;

      let normalized;
      if (value <= p.min) normalized = 0;
      else if (value >= p.max) normalized = 100;
      else normalized = ((value - p.min) / (p.max - p.min)) * 100;

      return inversed ? 100 - normalized : normalized;
    }

    calculateCategoryScore(neighborhood, category) {
      const mapping = METRIC_MAPPINGS[category];
      if (!mapping) return null;

      let sum = 0, count = 0;
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

    calculateScores(neighborhood, weights = DEFAULT_WEIGHTS) {
      const scores = {};
      let weightedSum = 0, totalWeight = 0;

      Object.keys(METRIC_MAPPINGS).forEach(category => {
        scores[category] = this.calculateCategoryScore(neighborhood, category);
      });

      const transitScore = this.getMetricValue(neighborhood, 'transit_score');
      if (transitScore != null) scores.transit = transitScore;

      const parksScore = this.getMetricValue(neighborhood, 'parks_score');
      if (parksScore != null) scores.parks = parksScore;

      Object.entries(scores).forEach(([category, score]) => {
        if (score != null && weights[category]) {
          weightedSum += score * weights[category];
          totalWeight += weights[category];
        }
      });

      return {
        overall: totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null,
        breakdown: scores,
        calculatedAt: new Date().toISOString()
      };
    }

    static getScoreColor(score) {
      if (score == null) return '#9ca3af';
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#3b82f6';
      if (score >= 40) return '#f59e0b';
      return '#ef4444';
    }

    static getScoreClass(score) {
      if (score == null) return 'score-na';
      if (score >= 80) return 'score-excellent';
      if (score >= 60) return 'score-good';
      if (score >= 40) return 'score-fair';
      return 'score-poor';
    }

    static getGrade(score) {
      if (score == null) return 'N/A';
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B';
      if (score >= 60) return 'C';
      if (score >= 50) return 'D';
      return 'F';
    }
  }

  // ============================================
  // TREND ANALYZER
  // ============================================
  class TrendAnalyzer {
    movingAverage(data, window = 3) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        if (i < window - 1) { result.push(null); continue; }
        const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + (b || 0), 0);
        result.push(sum / window);
      }
      return result;
    }

    yoyChange(current, previous) {
      if (!previous || previous === 0) return null;
      return ((current - previous) / previous) * 100;
    }

    linearRegression(data) {
      const values = data.filter(v => v != null && !isNaN(v));
      const n = values.length;
      if (n < 2) return { slope: 0, intercept: values[0] || 0, r2: 0 };

      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      values.forEach((y, x) => {
        sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
      });

      const denom = n * sumXX - sumX * sumX;
      if (denom === 0) return { slope: 0, intercept: values[0], r2: 0 };

      const slope = (n * sumXY - sumX * sumY) / denom;
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept, r2: 0.7 }; // Simplified R2
    }

    forecast(data, periods = 12) {
      const values = data.filter(v => v != null && !isNaN(v));
      const { slope, intercept } = this.linearRegression(values);
      const startIndex = values.length;

      const predictions = [];
      for (let i = 0; i < periods; i++) {
        predictions.push({
          period: startIndex + i,
          value: Math.round((intercept + slope * (startIndex + i)) * 100) / 100,
          confidence: Math.max(0.3, 0.95 - i * 0.05)
        });
      }

      return {
        trend: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable',
        predictions
      };
    }

    analyzeTrend(timeSeries) {
      if (!timeSeries || timeSeries.length < 2) {
        return { direction: 'stable', strength: 'none', change: 0, changePercent: 0 };
      }

      const values = timeSeries.map(d => d.value).filter(v => v != null);
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const change = lastValue - firstValue;
      const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

      let direction = 'stable';
      if (changePercent > 5) direction = 'up';
      else if (changePercent < -5) direction = 'down';

      let strength = 'none';
      if (Math.abs(changePercent) > 15) strength = 'strong';
      else if (Math.abs(changePercent) > 8) strength = 'moderate';
      else if (Math.abs(changePercent) > 3) strength = 'weak';

      return {
        direction,
        strength,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 10) / 10
      };
    }
  }

  // ============================================
  // FORMATTERS
  // ============================================
  const Formatters = {
    currency(value, decimals = 0) {
      if (value == null || isNaN(value)) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    },

    compact(value, decimals = 1) {
      if (value == null || isNaN(value)) return 'N/A';
      const absValue = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (absValue >= 1e9) return sign + (absValue / 1e9).toFixed(decimals) + 'B';
      if (absValue >= 1e6) return sign + (absValue / 1e6).toFixed(decimals) + 'M';
      if (absValue >= 1e3) return sign + (absValue / 1e3).toFixed(decimals) + 'K';
      return sign + absValue.toFixed(decimals);
    },

    percent(value, decimals = 1) {
      if (value == null || isNaN(value)) return 'N/A';
      return value.toFixed(decimals) + '%';
    },

    number(value, decimals = 0) {
      if (value == null || isNaN(value)) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    },

    score(score) {
      if (score == null || isNaN(score)) {
        return { value: 'N/A', class: 'score-na', label: 'No Data' };
      }
      const value = Math.round(score);
      if (value >= 80) return { value: String(value), class: 'score-excellent', label: 'Excellent' };
      if (value >= 60) return { value: String(value), class: 'score-good', label: 'Good' };
      if (value >= 40) return { value: String(value), class: 'score-fair', label: 'Fair' };
      return { value: String(value), class: 'score-poor', label: 'Poor' };
    }
  };

  // ============================================
  // MOCK DATA PROVIDER
  // ============================================
  const METRIC_CONFIGS = {
    avg_value: { min: 150000, max: 2000000, mean: 375000, stdDev: 150000, skew: 0.5 },
    population: { min: 1000, max: 100000, mean: 35000, stdDev: 20000 },
    median_income: { min: 25000, max: 250000, mean: 72000, stdDev: 35000 },
    crime_rate: { min: 5, max: 80, mean: 35, stdDev: 15 },
    housing_vacancy_rate: { min: 2, max: 30, mean: 8, stdDev: 5 },
    walkability: { min: 10, max: 98, mean: 45, stdDev: 25 },
    transit_score: { min: 0, max: 100, mean: 35, stdDev: 30 },
    parks_score: { min: 10, max: 95, mean: 50, stdDev: 20 },
    education_bachelors: { min: 10, max: 80, mean: 35, stdDev: 15 },
    appreciation_1y: { min: -10, max: 30, mean: 5, stdDev: 8 }
  };

  class MockDataProvider {
    constructor() {
      this.cache = new Map();
    }

    getNeighborhood(zipCode) {
      if (this.cache.has(zipCode)) return this.cache.get(zipCode);

      const rng = createNeighborhoodRandom(zipCode);
      const metrics = {};
      
      Object.entries(METRIC_CONFIGS).forEach(([key, config]) => {
        metrics[key] = Math.round(rng.metric(config) * 100) / 100;
      });

      // Apply correlations
      const incomePercentile = (metrics.median_income - 25000) / (250000 - 25000);
      metrics.crime_rate = Math.max(5, metrics.crime_rate - incomePercentile * 30);
      metrics.avg_value = Math.round(metrics.avg_value * (0.7 + incomePercentile * 0.6));

      const neighborhood = {
        id: `mock-${zipCode}`,
        zipCode,
        name: `ZIP ${zipCode}`,
        metrics,
        isMockData: true
      };

      this.cache.set(zipCode, neighborhood);
      return neighborhood;
    }

    generateTrends(currentValue, options = {}) {
      const { periods = 60, volatility = 0.02, trend = 0.003 } = options;
      const rng = new SeededRandom(Math.floor(currentValue * 1000));
      const data = [];
      let value = currentValue / Math.pow(1 + trend, periods);
      const now = new Date();

      for (let i = periods; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
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
  }

  // ============================================
  // GEO UTILITIES
  // ============================================
  const GeoUtils = {
    haversineDistance(lat1, lng1, lat2, lng2, unit = 'miles') {
      const R = unit === 'km' ? 6371 : 3959;
      const toRad = deg => deg * (Math.PI / 180);
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    distanceBetween(point1, point2, unit = 'miles') {
      return this.haversineDistance(point1.lat, point1.lng, point2.lat, point2.lng, unit);
    },

    findNearest(origin, points) {
      if (!points || points.length === 0) return { point: null, distance: Infinity, index: -1 };
      let nearest = { point: null, distance: Infinity, index: -1 };
      points.forEach((point, index) => {
        const distance = this.distanceBetween(origin, point);
        if (distance < nearest.distance) {
          nearest = { point, distance, index };
        }
      });
      return nearest;
    },

    findWithinRadius(origin, points, radius) {
      if (!points || points.length === 0) return [];
      return points
        .map((point, index) => ({ point, distance: this.distanceBetween(origin, point), index }))
        .filter(item => item.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }
  };

  // ============================================
  // EXPOSE GLOBALLY
  // ============================================
  global.InSite = {
    // Version info
    VERSION: '2.0.0',
    BUILD_DATE: '2026-01-13',

    // Core classes
    SeededRandom,
    ScoringEngine,
    TrendAnalyzer,
    MockDataProvider,

    // Utilities
    Formatters,
    GeoUtils,

    // Factory functions
    createNeighborhoodRandom,
    createScoringEngine: (data) => new ScoringEngine(data),
    createTrendAnalyzer: () => new TrendAnalyzer(),
    createMockDataProvider: () => new MockDataProvider(),

    // Default weights
    DEFAULT_WEIGHTS,
    METRIC_MAPPINGS,

    // Singleton instances
    _trendAnalyzer: null,
    _mockDataProvider: null,

    get trendAnalyzer() {
      if (!this._trendAnalyzer) this._trendAnalyzer = new TrendAnalyzer();
      return this._trendAnalyzer;
    },

    get mockDataProvider() {
      if (!this._mockDataProvider) this._mockDataProvider = new MockDataProvider();
      return this._mockDataProvider;
    }
  };

  console.log(`✅ InSite v${global.InSite.VERSION} bridge loaded`);

})(typeof window !== 'undefined' ? window : global);
