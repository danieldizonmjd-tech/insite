/**
 * Trend Analysis Service
 * Analyzes historical data for patterns and predictions
 */

/**
 * TrendAnalyzer class
 * Provides statistical analysis and forecasting for time-series data
 */
class TrendAnalyzer {
  /**
   * Calculate moving average
   * @param {Array<number>} data - Array of numeric values
   * @param {number} [window=3] - Window size for moving average
   * @returns {Array<number|null>} Moving average values
   */
  movingAverage(data, window = 3) {
    if (!data || data.length === 0) return [];
    
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(null);
        continue;
      }
      const windowData = data.slice(i - window + 1, i + 1);
      const sum = windowData.reduce((a, b) => a + (b || 0), 0);
      result.push(sum / window);
    }
    return result;
  }

  /**
   * Calculate year-over-year change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number|null} Percentage change
   */
  yoyChange(current, previous) {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate period-over-period change
   * @param {Array<{value: number}>} data - Time-series data
   * @param {number} [periodsBack=12] - Number of periods to compare
   * @returns {number|null} Percentage change
   */
  periodChange(data, periodsBack = 12) {
    if (!data || data.length < periodsBack + 1) return null;
    
    const current = data[data.length - 1].value;
    const previous = data[data.length - 1 - periodsBack].value;
    
    return this.yoyChange(current, previous);
  }

  /**
   * Detect anomalies using standard deviation
   * @param {Array<number>} data - Array of numeric values
   * @param {number} [threshold=2] - Standard deviation threshold
   * @returns {Array<Object>} Array of anomaly objects
   */
  detectAnomalies(data, threshold = 2) {
    if (!data || data.length < 3) return [];
    
    const values = data.filter(v => v != null && !isNaN(v));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return [];

    return data.map((value, index) => ({
      index,
      value,
      isAnomaly: value != null && Math.abs(value - mean) > threshold * stdDev,
      zScore: value != null ? (value - mean) / stdDev : null
    })).filter(item => item.isAnomaly);
  }

  /**
   * Simple linear regression for forecasting
   * @param {Array<number>} data - Array of numeric values
   * @returns {Object} Regression coefficients
   */
  linearRegression(data) {
    const values = data.filter(v => v != null && !isNaN(v));
    const n = values.length;
    
    if (n < 2) return { slope: 0, intercept: values[0] || 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    });

    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return { slope: 0, intercept: values[0], r2: 0 };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    const ssTotal = sumYY - n * meanY * meanY;
    const ssResidual = values.reduce((acc, y, x) => {
      const predicted = intercept + slope * x;
      return acc + Math.pow(y - predicted, 2);
    }, 0);
    const r2 = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

    return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
  }

  /**
   * Generate forecast points
   * @param {Array<number>} data - Historical data
   * @param {number} [periods=12] - Number of periods to forecast
   * @returns {Object} Forecast object with predictions
   */
  forecast(data, periods = 12) {
    const values = data.filter(v => v != null && !isNaN(v));
    const { slope, intercept, r2 } = this.linearRegression(values);
    const startIndex = values.length;

    const predictions = [];
    for (let i = 0; i < periods; i++) {
      const predictedValue = intercept + slope * (startIndex + i);
      predictions.push({
        period: startIndex + i,
        value: Math.round(predictedValue * 100) / 100,
        confidence: Math.max(0.3, r2 * (0.95 - i * 0.05)) // Decreasing confidence
      });
    }

    let trend;
    const percentChange = values.length > 0 ? (slope / values[values.length - 1]) * 100 : 0;
    if (percentChange > 0.5) trend = 'up';
    else if (percentChange < -0.5) trend = 'down';
    else trend = 'stable';

    return {
      trend,
      slopePerPeriod: Math.round(slope * 100) / 100,
      r2: Math.round(r2 * 100) / 100,
      predictions
    };
  }

  /**
   * Calculate compound annual growth rate
   * @param {number} startValue - Beginning value
   * @param {number} endValue - Ending value
   * @param {number} years - Number of years
   * @returns {number} CAGR as percentage
   */
  cagr(startValue, endValue, years) {
    if (!startValue || startValue === 0 || years === 0) return 0;
    const rate = Math.pow(endValue / startValue, 1 / years) - 1;
    return Math.round(rate * 10000) / 100; // Return as percentage
  }

  /**
   * Analyze trend direction and strength
   * @param {Array<{date: string, value: number}>} timeSeries - Time-series data
   * @returns {Object} Trend analysis results
   */
  analyzeTrend(timeSeries) {
    if (!timeSeries || timeSeries.length < 2) {
      return {
        direction: 'stable',
        strength: 'none',
        change: 0,
        changePercent: 0
      };
    }

    const values = timeSeries.map(d => d.value).filter(v => v != null);
    const { slope, r2 } = this.linearRegression(values);

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

    // Determine direction
    let direction;
    if (changePercent > 5) direction = 'up';
    else if (changePercent < -5) direction = 'down';
    else direction = 'stable';

    // Determine strength based on R² and magnitude
    let strength;
    if (r2 > 0.7 && Math.abs(changePercent) > 15) strength = 'strong';
    else if (r2 > 0.4 && Math.abs(changePercent) > 8) strength = 'moderate';
    else if (Math.abs(changePercent) > 3) strength = 'weak';
    else strength = 'none';

    return {
      direction,
      strength,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 10) / 10,
      r2: Math.round(r2 * 100) / 100,
      slopePerPeriod: Math.round(slope * 100) / 100
    };
  }

  /**
   * Calculate seasonality pattern
   * @param {Array<{date: string, value: number}>} timeSeries - Time-series data
   * @returns {Object} Seasonality analysis
   */
  analyzeSeasonality(timeSeries) {
    if (!timeSeries || timeSeries.length < 24) {
      return { hasSeasonality: false, pattern: null };
    }

    // Group by month
    const monthlyAverages = {};
    timeSeries.forEach(point => {
      const month = new Date(point.date).getMonth();
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = { sum: 0, count: 0 };
      }
      monthlyAverages[month].sum += point.value;
      monthlyAverages[month].count++;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const pattern = Object.entries(monthlyAverages).map(([month, data]) => ({
      month: monthNames[parseInt(month)],
      average: Math.round((data.sum / data.count) * 100) / 100
    }));

    // Check for significant seasonality
    const values = pattern.map(p => p.average);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const cv = mean !== 0 ? Math.sqrt(variance) / mean : 0; // Coefficient of variation

    return {
      hasSeasonality: cv > 0.1,
      strength: cv > 0.2 ? 'strong' : cv > 0.1 ? 'moderate' : 'weak',
      pattern,
      coefficientOfVariation: Math.round(cv * 100) / 100
    };
  }

  /**
   * Compare two neighborhoods' trends
   * @param {Array} trend1 - First neighborhood's time-series
   * @param {Array} trend2 - Second neighborhood's time-series
   * @returns {Object} Comparison results
   */
  compareTrends(trend1, trend2) {
    const analysis1 = this.analyzeTrend(trend1);
    const analysis2 = this.analyzeTrend(trend2);

    const correlation = this.calculateCorrelation(
      trend1.map(d => d.value),
      trend2.map(d => d.value)
    );

    return {
      neighborhood1: analysis1,
      neighborhood2: analysis2,
      correlation: Math.round(correlation * 100) / 100,
      diverging: correlation < 0.5 && 
                 ((analysis1.direction === 'up' && analysis2.direction === 'down') ||
                  (analysis1.direction === 'down' && analysis2.direction === 'up'))
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   * @param {Array<number>} x - First array
   * @param {Array<number>} y - Second array
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  calculateCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);

    const xMean = xSlice.reduce((a, b) => a + b, 0) / n;
    const yMean = ySlice.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = xSlice[i] - xMean;
      const yDiff = ySlice[i] - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }

    const denominator = Math.sqrt(xDenominator * yDenominator);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get trend summary text
   * @param {Object} trendAnalysis - Result from analyzeTrend
   * @param {string} metricName - Name of the metric
   * @returns {string} Human-readable trend summary
   */
  getTrendSummary(trendAnalysis, metricName = 'value') {
    const { direction, strength, changePercent } = trendAnalysis;

    if (direction === 'stable') {
      return `${metricName} has remained relatively stable.`;
    }

    const directionWord = direction === 'up' ? 'increased' : 'decreased';
    const strengthWord = strength === 'strong' ? 'significantly' : 
                         strength === 'moderate' ? 'moderately' : 'slightly';

    return `${metricName} has ${strengthWord} ${directionWord} by ${Math.abs(changePercent)}%.`;
  }
}

// Create singleton instance
const trendAnalyzer = new TrendAnalyzer();

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TrendAnalyzer, trendAnalyzer };
}

export { TrendAnalyzer, trendAnalyzer };
export default trendAnalyzer;
