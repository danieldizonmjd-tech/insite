/**
 * InSite Urban Intelligence Platform
 * Main entry point for modular services
 */

// Services
export { ScoringEngine, METRIC_MAPPINGS } from './services/scoringEngine.js';
export { TrendAnalyzer, trendAnalyzer } from './services/trendAnalyzer.js';
export { MockDataProvider, mockDataProvider } from './services/mockDataProvider.js';
export { DataService, dataService, DATA_CONFIG } from './services/dataService.js';

// Utilities
export { SeededRandom, createNeighborhoodRandom, createSeededRandom } from './utils/seededRandom.js';
export * from './utils/formatters.js';
export * from './utils/constants.js';

// Configuration
export { CITIES, getActiveCities, getCityBySlug, getPrimaryCity, isMultiCityEnabled, getCityOptions } from './config/cities.js';
export { METRIC_CATEGORIES, METRICS, getMetricsByCategory, getMetricsByStatus, getMetric, getAllMetrics, getMappableMetrics } from './config/metrics.js';

// Version info
export const VERSION = '2.0.0';
export const BUILD_DATE = '2026-01-13';
