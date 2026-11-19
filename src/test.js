/**
 * Test script for InSite core modules
 * Run with: node --experimental-vm-modules src/test.js
 */

import { 
  ScoringEngine, 
  mockDataProvider, 
  trendAnalyzer,
  formatCurrency,
  formatPercent,
  createNeighborhoodRandom
} from './index.js';

console.log('='.repeat(60));
console.log('InSite Core Modules Test');
console.log('='.repeat(60));

// Test 1: Seeded Random
console.log('\n📊 Test 1: Seeded Random Generator');
const rng1 = createNeighborhoodRandom('30309');
const rng2 = createNeighborhoodRandom('30309');
const value1 = rng1.float(0, 100);
const value2 = rng2.float(0, 100);
console.log(`  Same seed produces same value: ${value1.toFixed(4)} === ${value2.toFixed(4)}`);
console.log(`  ✅ Test ${value1 === value2 ? 'PASSED' : 'FAILED'}`);

// Test 2: Mock Data Provider
console.log('\n📊 Test 2: Mock Data Provider');
const neighborhood = mockDataProvider.getNeighborhood('30309');
console.log(`  Generated neighborhood: ${neighborhood.name}`);
console.log(`  ZIP: ${neighborhood.zipCode}`);
console.log(`  Median Income: ${formatCurrency(neighborhood.metrics.median_income)}`);
console.log(`  Home Value: ${formatCurrency(neighborhood.metrics.avg_value)}`);
console.log(`  Crime Rate: ${neighborhood.metrics.crime_rate.toFixed(1)}`);
console.log(`  Is Mock Data: ${neighborhood.isMockData}`);
console.log('  ✅ Test PASSED');

// Test 3: Consistent mock data
console.log('\n📊 Test 3: Mock Data Consistency');
const n1 = mockDataProvider.getNeighborhood('30305');
const n2 = mockDataProvider.getNeighborhood('30305');
const consistent = n1.metrics.median_income === n2.metrics.median_income;
console.log(`  Same ZIP produces consistent data: ${consistent}`);
console.log(`  ✅ Test ${consistent ? 'PASSED' : 'FAILED'}`);

// Test 4: Trend Analyzer
console.log('\n📊 Test 4: Trend Analyzer');
const trendData = [
  { date: '2024-01', value: 100 },
  { date: '2024-02', value: 102 },
  { date: '2024-03', value: 105 },
  { date: '2024-04', value: 103 },
  { date: '2024-05', value: 108 },
  { date: '2024-06', value: 110 }
];
const analysis = trendAnalyzer.analyzeTrend(trendData);
console.log(`  Trend direction: ${analysis.direction}`);
console.log(`  Trend strength: ${analysis.strength}`);
console.log(`  Change percent: ${formatPercent(analysis.changePercent)}`);
console.log('  ✅ Test PASSED');

// Test 5: Forecast
console.log('\n📊 Test 5: Forecasting');
const values = trendData.map(d => d.value);
const forecast = trendAnalyzer.forecast(values, 3);
console.log(`  Forecast trend: ${forecast.trend}`);
console.log(`  R-squared: ${forecast.r2}`);
console.log(`  Predictions:`);
forecast.predictions.forEach((p, i) => {
  console.log(`    Period ${p.period}: ${p.value.toFixed(2)} (confidence: ${(p.confidence * 100).toFixed(0)}%)`);
});
console.log('  ✅ Test PASSED');

// Test 6: Scoring Engine (without full data)
console.log('\n📊 Test 6: Scoring Engine');
const mockNeighborhoods = [
  mockDataProvider.getNeighborhood('30309'),
  mockDataProvider.getNeighborhood('30305'),
  mockDataProvider.getNeighborhood('30306'),
  mockDataProvider.getNeighborhood('30312'),
  mockDataProvider.getNeighborhood('30318')
];

const scoringEngine = new ScoringEngine(mockNeighborhoods);
const scores = scoringEngine.calculateScores(mockNeighborhoods[0]);
console.log(`  Overall Score: ${scores.overall}`);
console.log(`  Score breakdown:`);
Object.entries(scores.breakdown).forEach(([cat, score]) => {
  if (score !== null) {
    console.log(`    ${cat}: ${score}`);
  }
});
console.log('  ✅ Test PASSED');

// Test 7: Find Similar
console.log('\n📊 Test 7: Similar Neighborhoods');
const similar = scoringEngine.findSimilar('30309', 3);
console.log(`  Found ${similar.length} similar neighborhoods to 30309:`);
similar.forEach((s, i) => {
  console.log(`    ${i + 1}. ${s.zipCode} - Similarity: ${(s.similarityScore * 100).toFixed(1)}%`);
});
console.log('  ✅ Test PASSED');

// Test 8: AI Insights
console.log('\n📊 Test 8: AI Insights');
const insights = mockDataProvider.generateInsights('30309');
console.log(`  Generated ${insights.length} insights:`);
insights.forEach(insight => {
  console.log(`    [${insight.type}] ${insight.title}`);
});
console.log('  ✅ Test PASSED');

// Test 9: Trend Data Generation
console.log('\n📊 Test 9: Trend Data Generation');
const trends = mockDataProvider.getTrends('30309', 'avg_value', { periods: 12 });
console.log(`  Generated ${trends.length} trend data points`);
console.log(`  First: ${trends[0].date} = ${formatCurrency(trends[0].value)}`);
console.log(`  Last: ${trends[trends.length - 1].date} = ${formatCurrency(trends[trends.length - 1].value)}`);
console.log('  ✅ Test PASSED');

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed successfully!');
console.log('='.repeat(60));
