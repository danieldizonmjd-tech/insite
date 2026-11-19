/**
 * INSITE Neighborhood Trajectory Classifier
 * Classifies every neighborhood into a trajectory category:
 * Rising Star, Established Premium, Stable Suburban, Value Play, Watch List, Transitioning
 *
 * FREE: Classification + basic signals
 * PRO: Gentrification risk, displacement probability, deep analysis
 */

class NeighborhoodTrajectory {
  constructor() {
    this.classifications = {
      'rising-star': { label: 'Rising Star', icon: 'fa-rocket', color: '#34d399', description: 'Rapidly improving metrics and growing demand' },
      'established-premium': { label: 'Established Premium', icon: 'fa-crown', color: '#fbbf24', description: 'Top-tier values, income, and stability' },
      'stable-suburban': { label: 'Stable Suburban', icon: 'fa-shield-alt', color: '#60a5fa', description: 'Consistent performance with low volatility' },
      'value-play': { label: 'Value Play', icon: 'fa-gem', color: '#c084fc', description: 'Undervalued with signs of emerging potential' },
      'watch-list': { label: 'Watch List', icon: 'fa-exclamation-triangle', color: '#fca5a5', description: 'Declining metrics requiring caution' },
      'transitioning': { label: 'Transitioning', icon: 'fa-exchange-alt', color: '#fdba74', description: 'Rapid demographic or economic shifts underway' }
    };

    this.cache = {};
  }

  /**
   * Get percentile rank of a value within a metric across all ZIPs
   */
  getPercentile(value, metric, higherIsBetter = true) {
    if (!allZipCodes || allZipCodes.length === 0) return 50;
    const allValues = allZipCodes
      .map(z => zipData[z][metric])
      .filter(v => v != null && !isNaN(v) && v > 0)
      .sort((a, b) => a - b);
    if (allValues.length === 0) return 50;
    const rank = allValues.filter(v => v <= value).length;
    const percentile = Math.round((rank / allValues.length) * 100);
    return higherIsBetter ? percentile : (100 - percentile);
  }

  /**
   * Calculate the metro-wide average value-to-income ratio
   */
  getMetroAvgRatio() {
    let total = 0, count = 0;
    allZipCodes.forEach(z => {
      const d = zipData[z];
      if (d.avg_value > 0 && d.median_income > 0) {
        total += d.avg_value / d.median_income;
        count++;
      }
    });
    return count > 0 ? total / count : 4.5;
  }

  /**
   * Classify a single ZIP code
   */
  classify(zip) {
    if (this.cache[zip]) return this.cache[zip];
    if (!zipData || !zipData[zip]) return null;

    const data = zipData[zip];
    if (!data.avg_value || !data.median_income) return null;

    // Calculate percentiles
    const valuePercentile = this.getPercentile(data.avg_value, 'avg_value');
    const incomePercentile = this.getPercentile(data.median_income, 'median_income');
    const safetyScore = Math.max(0, Math.min(100, 100 - (data.crime_rate || 0)));
    const safetyPercentile = this.getPercentile(safetyScore, 'crime_rate', false);
    const vacancyRate = data.housing_vacancy_rate || 0;
    const demandScore = Math.max(0, 100 - (vacancyRate * 5));

    // Value-to-income ratio analysis
    const valueToIncome = data.avg_value / data.median_income;
    const metroAvgRatio = this.getMetroAvgRatio();
    const ratioDeviation = ((valueToIncome - metroAvgRatio) / metroAvgRatio) * 100;

    // Population density as urbanization indicator
    const popDensity = data.population || 0;
    const popPercentile = this.getPercentile(popDensity, 'population');

    // Build signals
    const signals = [];
    let classification = 'stable-suburban';
    let confidence = 60;
    let trajectory = 'stable';

    // --- Classification Logic ---

    // ESTABLISHED PREMIUM: High values + high income + safe
    if (valuePercentile >= 80 && incomePercentile >= 70 && safetyScore >= 65) {
      classification = 'established-premium';
      confidence = 85 + Math.min(10, (valuePercentile - 80));
      trajectory = 'stable';
      signals.push({ text: `Top ${100 - valuePercentile}% property values`, type: 'positive' });
      signals.push({ text: `Strong income base ($${Math.round(data.median_income / 1000)}K)`, type: 'positive' });
      if (safetyScore >= 80) signals.push({ text: 'Excellent safety profile', type: 'positive' });
      if (vacancyRate < 5) signals.push({ text: 'Very low vacancy', type: 'positive' });
    }
    // RISING STAR: Strong demand signals + improving fundamentals
    else if (demandScore >= 75 && incomePercentile >= 50 && valuePercentile >= 40 && valuePercentile <= 80 &&
             ratioDeviation > 5) {
      classification = 'rising-star';
      confidence = 70 + Math.min(20, Math.round(ratioDeviation / 2));
      trajectory = 'up';
      signals.push({ text: 'Price-to-income ratio above metro average', type: 'positive' });
      signals.push({ text: `Strong housing demand (${Math.round(demandScore)}%)`, type: 'positive' });
      if (safetyScore >= 60) signals.push({ text: 'Solid safety metrics', type: 'positive' });
      if (popPercentile >= 60) signals.push({ text: 'High population density (urban core)', type: 'neutral' });
    }
    // VALUE PLAY: Below-avg values but has redeeming qualities
    else if (valuePercentile <= 35 && (incomePercentile >= 30 || safetyScore >= 55 || demandScore >= 65)) {
      classification = 'value-play';
      confidence = 65;
      trajectory = 'up';
      signals.push({ text: `Below-average home prices ($${Math.round(data.avg_value / 1000)}K)`, type: 'positive' });
      if (incomePercentile >= 40) signals.push({ text: 'Decent income levels for the price point', type: 'positive' });
      if (demandScore >= 65) signals.push({ text: 'Housing demand outpacing supply', type: 'positive' });
      if (safetyScore < 50) signals.push({ text: `Safety below average (${Math.round(safetyScore)}/100)`, type: 'negative' });
    }
    // WATCH LIST: Multiple concerning signals
    else if ((vacancyRate >= 15 || safetyScore < 40) && valuePercentile <= 30) {
      classification = 'watch-list';
      confidence = 70;
      trajectory = 'down';
      if (vacancyRate >= 15) signals.push({ text: `High vacancy rate (${vacancyRate.toFixed(1)}%)`, type: 'negative' });
      if (safetyScore < 40) signals.push({ text: `Safety concerns (${Math.round(safetyScore)}/100)`, type: 'negative' });
      if (incomePercentile <= 25) signals.push({ text: 'Below-average income levels', type: 'negative' });
      if (valuePercentile <= 15) signals.push({ text: `Very low property values`, type: 'negative' });
    }
    // TRANSITIONING: Mixed signals, rapid change indicators
    else if (Math.abs(ratioDeviation) > 20 || (valuePercentile > 50 && safetyScore < 50) ||
             (valuePercentile < 30 && incomePercentile > 60)) {
      classification = 'transitioning';
      confidence = 60;
      trajectory = ratioDeviation > 0 ? 'up' : 'down';
      signals.push({ text: 'Mixed economic signals detected', type: 'neutral' });
      if (ratioDeviation > 20) signals.push({ text: 'Prices outpacing local incomes', type: 'neutral' });
      if (ratioDeviation < -20) signals.push({ text: 'Prices lagging income potential', type: 'neutral' });
      if (valuePercentile > 50 && safetyScore < 50) signals.push({ text: 'Value-safety mismatch', type: 'negative' });
    }
    // STABLE SUBURBAN: Default - moderate metrics, consistent
    else {
      classification = 'stable-suburban';
      confidence = 65;
      trajectory = 'stable';
      signals.push({ text: 'Consistent market fundamentals', type: 'positive' });
      if (safetyScore >= 60) signals.push({ text: `Good safety (${Math.round(safetyScore)}/100)`, type: 'positive' });
      if (vacancyRate < 8) signals.push({ text: 'Healthy occupancy rates', type: 'positive' });
      signals.push({ text: 'Low volatility expected', type: 'neutral' });
    }

    const result = {
      zip,
      classification,
      ...this.classifications[classification],
      confidence: Math.min(95, confidence),
      trajectory,
      signals: signals.slice(0, 4),
      metrics: {
        valuePercentile,
        incomePercentile,
        safetyScore,
        demandScore,
        vacancyRate,
        valueToIncome: Math.round(valueToIncome * 10) / 10,
        ratioDeviation: Math.round(ratioDeviation)
      },
      // PRO-only deep metrics
      proMetrics: {
        gentrificationRisk: this.calculateGentrificationRisk(data, valuePercentile, incomePercentile, ratioDeviation),
        displacementProbability: this.calculateDisplacementProbability(data, ratioDeviation, vacancyRate),
        developmentPressure: this.calculateDevelopmentPressure(data, valuePercentile, demandScore)
      }
    };

    this.cache[zip] = result;
    return result;
  }

  /**
   * PRO: Calculate gentrification risk score (0-100)
   */
  calculateGentrificationRisk(data, valuePercentile, incomePercentile, ratioDeviation) {
    let risk = 0;

    // Prices rising faster than income = gentrification signal
    if (ratioDeviation > 10) risk += 25;
    else if (ratioDeviation > 5) risk += 15;

    // Mid-range values in formerly low-value area (gap indicator)
    if (valuePercentile >= 30 && valuePercentile <= 60 && incomePercentile <= 40) risk += 20;

    // High population density (urban area more susceptible)
    const popPercentile = this.getPercentile(data.population, 'population');
    if (popPercentile >= 70) risk += 15;

    // Low vacancy = high demand pressure
    if (data.housing_vacancy_rate < 5) risk += 15;
    else if (data.housing_vacancy_rate < 8) risk += 8;

    // High renter percentage (more vulnerable to displacement)
    if (data.renter_occupied && data.renter_occupied > 60) risk += 15;
    else if (data.renter_occupied && data.renter_occupied > 45) risk += 8;

    return Math.min(100, Math.round(risk));
  }

  /**
   * PRO: Calculate displacement probability
   */
  calculateDisplacementProbability(data, ratioDeviation, vacancyRate) {
    let prob = 0;

    if (ratioDeviation > 15) prob += 30;
    else if (ratioDeviation > 5) prob += 15;

    if (vacancyRate < 3) prob += 20;
    else if (vacancyRate < 6) prob += 10;

    if (data.renter_occupied && data.renter_occupied > 65) prob += 25;
    else if (data.renter_occupied && data.renter_occupied > 50) prob += 12;

    if (data.poverty_rate && data.poverty_rate > 20) prob += 15;

    return Math.min(100, Math.round(prob));
  }

  /**
   * PRO: Calculate development pressure index
   */
  calculateDevelopmentPressure(data, valuePercentile, demandScore) {
    let pressure = 0;

    if (demandScore >= 85) pressure += 30;
    else if (demandScore >= 70) pressure += 18;

    if (valuePercentile >= 60) pressure += 20;
    else if (valuePercentile >= 40) pressure += 10;

    if (data.population >= 40000) pressure += 15;
    if (data.median_income >= 70000) pressure += 15;

    return Math.min(100, Math.round(pressure));
  }

  /**
   * Classify ALL zip codes and return summary
   */
  classifyAll() {
    const summary = {};
    Object.keys(this.classifications).forEach(cls => {
      summary[cls] = { count: 0, zips: [], ...this.classifications[cls] };
    });

    allZipCodes.forEach(zip => {
      const result = this.classify(zip);
      if (result && summary[result.classification]) {
        summary[result.classification].count++;
        summary[result.classification].zips.push(zip);
      }
    });

    return summary;
  }

  /**
   * Get trajectory arrow symbol
   */
  getTrajectoryArrow(trajectory) {
    if (trajectory === 'up') return '↑';
    if (trajectory === 'down') return '↓';
    return '→';
  }

  /**
   * Clear cache (call when data changes)
   */
  clearCache() {
    this.cache = {};
  }
}

// Global instance
const neighborhoodTrajectory = new NeighborhoodTrajectory();
