/**
 * InSite Pro Engines (Merged)
 * Contains: TrueCostEngine, NeighborhoodTrajectory, InvestmentProjector,
 *           CommuteIntelligence, NeighborhoodMatch
 *
 * Depends on: shared-utils.js (ATLANTA_EMPLOYMENT_CENTERS, haversineDistance, getPercentileRank)
 */

// ============================================================================
// TRUE COST ENGINE
// Calculates the REAL monthly cost of living by combining housing + commute + taxes
// ============================================================================

class TrueCostEngine {
  constructor() {
    this.EMPLOYMENT_CENTERS = ATLANTA_EMPLOYMENT_CENTERS;

    this.MILLAGE_RATES = {
      'Fulton': 34.2, 'DeKalb': 44.1, 'Gwinnett': 29.8, 'Cobb': 30.5,
      'Clayton': 33.7, 'Cherokee': 28.4, 'Forsyth': 24.1, 'Henry': 31.2,
      'Douglas': 32.8, 'Fayette': 27.3, 'Rockdale': 34.0, 'Newton': 33.5, 'default': 32.0
    };

    this.CITY_COUNTY = {
      'Atlanta': 'Fulton', 'Sandy Springs': 'Fulton', 'Roswell': 'Fulton',
      'Johns Creek': 'Fulton', 'Alpharetta': 'Fulton', 'Milton': 'Fulton',
      'East Point': 'Fulton', 'College Park': 'Fulton', 'Union City': 'Fulton',
      'Decatur': 'DeKalb', 'Dunwoody': 'DeKalb', 'Brookhaven': 'DeKalb',
      'Tucker': 'DeKalb', 'Stonecrest': 'DeKalb', 'Chamblee': 'DeKalb',
      'Lawrenceville': 'Gwinnett', 'Duluth': 'Gwinnett', 'Suwanee': 'Gwinnett',
      'Buford': 'Gwinnett', 'Snellville': 'Gwinnett', 'Lilburn': 'Gwinnett',
      'Norcross': 'Gwinnett', 'Peachtree Corners': 'Gwinnett',
      'Marietta': 'Cobb', 'Smyrna': 'Cobb', 'Kennesaw': 'Cobb',
      'Acworth': 'Cobb', 'Powder Springs': 'Cobb', 'Austell': 'Cobb',
      'Morrow': 'Clayton', 'Jonesboro': 'Clayton', 'Riverdale': 'Clayton',
      'Forest Park': 'Clayton', 'Lake City': 'Clayton',
      'Woodstock': 'Cherokee', 'Canton': 'Cherokee', 'Holly Springs': 'Cherokee',
      'Cumming': 'Forsyth',
      'McDonough': 'Henry', 'Hampton': 'Henry', 'Stockbridge': 'Henry',
      'Douglasville': 'Douglas', 'Lithia Springs': 'Douglas',
      'Fayetteville': 'Fayette', 'Peachtree City': 'Fayette', 'Tyrone': 'Fayette',
      'Conyers': 'Rockdale', 'Covington': 'Newton'
    };

    this.MORTGAGE_RATE = 0.068;
    this.INSURANCE_RATE = 0.004;
    this.GAS_PRICE = 3.20;
    this.MPG = 27;
    this.PARKING_MONTHLY = 150;
    this.MARTA_PASS = 95;
    this.WORKING_DAYS = 20;
  }

  getCounty(city) { return this.CITY_COUNTY[city] || null; }

  getMillageRate(city) {
    const county = this.getCounty(city);
    return this.MILLAGE_RATES[county] || this.MILLAGE_RATES['default'];
  }

  calculatePropertyTax(homeValue, city) {
    const millageRate = this.getMillageRate(city);
    const assessedValue = homeValue * 0.40;
    return (assessedValue / 1000) * millageRate / 12;
  }

  calculateMortgage(homeValue, downPaymentPct = 20) {
    const principal = homeValue * (1 - downPaymentPct / 100);
    const monthlyRate = this.MORTGAGE_RATE / 12;
    const payments = 360;
    if (principal <= 0) return 0;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
  }

  estimateRent(homeValue) {
    return Math.round(homeValue / 17 / 12);
  }

  estimateDriveTime(distanceMiles) {
    if (distanceMiles < 5) return Math.round(distanceMiles * 60 / 20);
    if (distanceMiles < 15) return Math.round(distanceMiles * 60 / 28);
    return Math.round(distanceMiles * 60 / 32);
  }

  estimateTransitTime(data, workplace) {
    if (typeof TransitHelper !== 'undefined') {
      const transitHelper = new TransitHelper();
      const score = transitHelper.calculateTransitScore(data.lat, data.lng);
      if (score && score.score >= 30) {
        const stationDistance = score.nearestStation ? score.nearestStation.distance : null;
        if (stationDistance && stationDistance < 2) {
          const walkToStation = Math.round(stationDistance * 20);
          const wpDistance = haversineDistance(
            score.nearestStation.lat || data.lat, score.nearestStation.lng || data.lng,
            workplace.lat, workplace.lng
          );
          const rideTime = Math.round(wpDistance * 60 / 25);
          const waitTime = 8;
          return { total: walkToStation + waitTime + rideTime, walkToStation, waitTime, rideTime, station: score.nearestStation.name, line: score.nearestStation.line || '' };
        }
      }
    }
    return null;
  }

  calculateTrueCost(zip, workplaceId, mode = 'buy') {
    if (!zipData || !zipData[zip]) return null;
    const data = zipData[zip];
    const workplace = this.EMPLOYMENT_CENTERS.find(ec => ec.id === workplaceId) || this.EMPLOYMENT_CENTERS[0];
    const distance = haversineDistance(data.lat, data.lng, workplace.lat, workplace.lng);

    let housingMonthly = 0, mortgagePayment = 0, propertyTax = 0, insurance = 0, rentEstimate = 0;
    if (mode === 'buy') {
      mortgagePayment = this.calculateMortgage(data.avg_value);
      propertyTax = this.calculatePropertyTax(data.avg_value, data.city);
      insurance = (data.avg_value * this.INSURANCE_RATE) / 12;
      housingMonthly = mortgagePayment + propertyTax + insurance;
    } else {
      rentEstimate = this.estimateRent(data.avg_value);
      housingMonthly = rentEstimate;
    }

    const driveTime = this.estimateDriveTime(distance);
    const driveGasCostDaily = (distance * 2 / this.MPG) * this.GAS_PRICE;
    const driveMonthly = (driveGasCostDaily * this.WORKING_DAYS) + this.PARKING_MONTHLY;

    const transit = this.estimateTransitTime(data, workplace);
    const transitMonthly = this.MARTA_PASS;

    let commuteMonthly = driveMonthly, commuteMode = 'drive', commuteTime = driveTime;
    if (transit && transitMonthly < driveMonthly) {
      commuteMonthly = transitMonthly;
      commuteMode = 'transit';
      commuteTime = transit.total;
    }

    const totalMonthly = housingMonthly + commuteMonthly;
    const affordabilityRatio = data.median_income > 0 ? (totalMonthly * 12 / data.median_income) : null;

    return {
      zip, workplace: workplace.name, mode,
      housing: { total: Math.round(housingMonthly), mortgage: Math.round(mortgagePayment), propertyTax: Math.round(propertyTax), insurance: Math.round(insurance), rent: Math.round(rentEstimate) },
      commute: { total: Math.round(commuteMonthly), mode: commuteMode, time: commuteTime, distance: Math.round(distance * 10) / 10, driveMonthly: Math.round(driveMonthly), transitMonthly: transit ? transitMonthly : null, transitDetails: transit },
      totalMonthly: Math.round(totalMonthly),
      affordabilityRatio: affordabilityRatio ? Math.round(affordabilityRatio * 100) / 100 : null,
      affordabilityLabel: this.getAffordabilityLabel(affordabilityRatio)
    };
  }

  getAffordabilityLabel(ratio) {
    if (!ratio) return 'N/A';
    if (ratio <= 0.28) return 'Very Affordable';
    if (ratio <= 0.36) return 'Affordable';
    if (ratio <= 0.50) return 'Moderate';
    if (ratio <= 0.65) return 'Stretched';
    return 'Cost-Burdened';
  }

  calculateMetroAverage(workplaceId, mode = 'buy') {
    if (!allZipCodes || allZipCodes.length === 0) return null;
    let totalCost = 0, count = 0;
    allZipCodes.forEach(zip => {
      const result = this.calculateTrueCost(zip, workplaceId, mode);
      if (result && result.totalMonthly > 0 && result.totalMonthly < 20000) { totalCost += result.totalMonthly; count++; }
    });
    return count > 0 ? Math.round(totalCost / count) : null;
  }

  rankByTrueCost(workplaceId, mode = 'buy', limit = 10) {
    return allZipCodes
      .map(zip => this.calculateTrueCost(zip, workplaceId, mode))
      .filter(r => r && r.totalMonthly > 0)
      .sort((a, b) => a.totalMonthly - b.totalMonthly)
      .slice(0, limit || undefined);
  }
}


// ============================================================================
// NEIGHBORHOOD TRAJECTORY
// Classifies neighborhoods: Rising Star, Established Premium, Value Play, etc.
// ============================================================================

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

  getMetroAvgRatio() {
    let total = 0, count = 0;
    allZipCodes.forEach(z => {
      const d = zipData[z];
      if (d.avg_value > 0 && d.median_income > 0) { total += d.avg_value / d.median_income; count++; }
    });
    return count > 0 ? total / count : 4.5;
  }

  classify(zip) {
    if (this.cache[zip]) return this.cache[zip];
    if (!zipData || !zipData[zip]) return null;
    const data = zipData[zip];
    if (!data.avg_value || !data.median_income) return null;

    const valuePercentile = getPercentileRank(data.avg_value, 'avg_value');
    const incomePercentile = getPercentileRank(data.median_income, 'median_income');
    const safetyScore = Math.max(0, Math.min(100, 100 - (data.crime_rate || 0)));
    const vacancyRate = data.housing_vacancy_rate || 0;
    const demandScore = Math.max(0, 100 - (vacancyRate * 5));

    const valueToIncome = data.avg_value / data.median_income;
    const metroAvgRatio = this.getMetroAvgRatio();
    const ratioDeviation = ((valueToIncome - metroAvgRatio) / metroAvgRatio) * 100;

    const popPercentile = getPercentileRank(data.population || 0, 'population');

    const signals = [];
    let classification = 'stable-suburban';
    let confidence = 60;
    let trajectory = 'stable';

    if (valuePercentile >= 80 && incomePercentile >= 70 && safetyScore >= 65) {
      classification = 'established-premium';
      confidence = 85 + Math.min(10, (valuePercentile - 80));
      trajectory = 'stable';
      signals.push({ text: `Top ${100 - valuePercentile}% property values`, type: 'positive' });
      signals.push({ text: `Strong income base ($${Math.round(data.median_income / 1000)}K)`, type: 'positive' });
      if (safetyScore >= 80) signals.push({ text: 'Excellent safety profile', type: 'positive' });
      if (vacancyRate < 5) signals.push({ text: 'Very low vacancy', type: 'positive' });
    } else if (demandScore >= 75 && incomePercentile >= 50 && valuePercentile >= 40 && valuePercentile <= 80 && ratioDeviation > 5) {
      classification = 'rising-star';
      confidence = 70 + Math.min(20, Math.round(ratioDeviation / 2));
      trajectory = 'up';
      signals.push({ text: 'Price-to-income ratio above metro average', type: 'positive' });
      signals.push({ text: `Strong housing demand (${Math.round(demandScore)}%)`, type: 'positive' });
      if (safetyScore >= 60) signals.push({ text: 'Solid safety metrics', type: 'positive' });
      if (popPercentile >= 60) signals.push({ text: 'High population density (urban core)', type: 'neutral' });
    } else if (valuePercentile <= 35 && (incomePercentile >= 30 || safetyScore >= 55 || demandScore >= 65)) {
      classification = 'value-play';
      confidence = 65;
      trajectory = 'up';
      signals.push({ text: `Below-average home prices ($${Math.round(data.avg_value / 1000)}K)`, type: 'positive' });
      if (incomePercentile >= 40) signals.push({ text: 'Decent income levels for the price point', type: 'positive' });
      if (demandScore >= 65) signals.push({ text: 'Housing demand outpacing supply', type: 'positive' });
      if (safetyScore < 50) signals.push({ text: `Safety below average (${Math.round(safetyScore)}/100)`, type: 'negative' });
    } else if ((vacancyRate >= 15 || safetyScore < 40) && valuePercentile <= 30) {
      classification = 'watch-list';
      confidence = 70;
      trajectory = 'down';
      if (vacancyRate >= 15) signals.push({ text: `High vacancy rate (${vacancyRate.toFixed(1)}%)`, type: 'negative' });
      if (safetyScore < 40) signals.push({ text: `Safety concerns (${Math.round(safetyScore)}/100)`, type: 'negative' });
      if (incomePercentile <= 25) signals.push({ text: 'Below-average income levels', type: 'negative' });
      if (valuePercentile <= 15) signals.push({ text: 'Very low property values', type: 'negative' });
    } else if (Math.abs(ratioDeviation) > 20 || (valuePercentile > 50 && safetyScore < 50) || (valuePercentile < 30 && incomePercentile > 60)) {
      classification = 'transitioning';
      confidence = 60;
      trajectory = ratioDeviation > 0 ? 'up' : 'down';
      signals.push({ text: 'Mixed economic signals detected', type: 'neutral' });
      if (ratioDeviation > 20) signals.push({ text: 'Prices outpacing local incomes', type: 'neutral' });
      if (ratioDeviation < -20) signals.push({ text: 'Prices lagging income potential', type: 'neutral' });
      if (valuePercentile > 50 && safetyScore < 50) signals.push({ text: 'Value-safety mismatch', type: 'negative' });
    } else {
      signals.push({ text: 'Consistent market fundamentals', type: 'positive' });
      if (safetyScore >= 60) signals.push({ text: `Good safety (${Math.round(safetyScore)}/100)`, type: 'positive' });
      if (vacancyRate < 8) signals.push({ text: 'Healthy occupancy rates', type: 'positive' });
      signals.push({ text: 'Low volatility expected', type: 'neutral' });
    }

    const result = {
      zip, classification, ...this.classifications[classification],
      confidence: Math.min(95, confidence), trajectory,
      signals: signals.slice(0, 4),
      metrics: { valuePercentile, incomePercentile, safetyScore, demandScore, vacancyRate, valueToIncome: Math.round(valueToIncome * 10) / 10, ratioDeviation: Math.round(ratioDeviation) },
      proMetrics: {
        gentrificationRisk: this.calculateGentrificationRisk(data, valuePercentile, incomePercentile, ratioDeviation),
        displacementProbability: this.calculateDisplacementProbability(data, ratioDeviation, vacancyRate),
        developmentPressure: this.calculateDevelopmentPressure(data, valuePercentile, demandScore)
      }
    };
    this.cache[zip] = result;
    return result;
  }

  calculateGentrificationRisk(data, valuePercentile, incomePercentile, ratioDeviation) {
    let risk = 0;
    if (ratioDeviation > 10) risk += 25; else if (ratioDeviation > 5) risk += 15;
    if (valuePercentile >= 30 && valuePercentile <= 60 && incomePercentile <= 40) risk += 20;
    const popPercentile = getPercentileRank(data.population, 'population');
    if (popPercentile >= 70) risk += 15;
    if (data.housing_vacancy_rate < 5) risk += 15; else if (data.housing_vacancy_rate < 8) risk += 8;
    if (data.renter_occupied && data.renter_occupied > 60) risk += 15; else if (data.renter_occupied && data.renter_occupied > 45) risk += 8;
    return Math.min(100, Math.round(risk));
  }

  calculateDisplacementProbability(data, ratioDeviation, vacancyRate) {
    let prob = 0;
    if (ratioDeviation > 15) prob += 30; else if (ratioDeviation > 5) prob += 15;
    if (vacancyRate < 3) prob += 20; else if (vacancyRate < 6) prob += 10;
    if (data.renter_occupied && data.renter_occupied > 65) prob += 25; else if (data.renter_occupied && data.renter_occupied > 50) prob += 12;
    if (data.poverty_rate && data.poverty_rate > 20) prob += 15;
    return Math.min(100, Math.round(prob));
  }

  calculateDevelopmentPressure(data, valuePercentile, demandScore) {
    let pressure = 0;
    if (demandScore >= 85) pressure += 30; else if (demandScore >= 70) pressure += 18;
    if (valuePercentile >= 60) pressure += 20; else if (valuePercentile >= 40) pressure += 10;
    if (data.population >= 40000) pressure += 15;
    if (data.median_income >= 70000) pressure += 15;
    return Math.min(100, Math.round(pressure));
  }

  classifyAll() {
    const summary = {};
    Object.keys(this.classifications).forEach(cls => { summary[cls] = { count: 0, zips: [], ...this.classifications[cls] }; });
    allZipCodes.forEach(zip => {
      const result = this.classify(zip);
      if (result && summary[result.classification]) { summary[result.classification].count++; summary[result.classification].zips.push(zip); }
    });
    return summary;
  }

  getTrajectoryArrow(trajectory) {
    if (trajectory === 'up') return '\u2191';
    if (trajectory === 'down') return '\u2193';
    return '\u2192';
  }

  clearCache() { this.cache = {}; }
}


// ============================================================================
// INVESTMENT PROJECTOR
// Multi-scenario ROI calculator with Opportunity Zone tax benefits
// ============================================================================

class InvestmentProjector {
  constructor() {
    this.MORTGAGE_RATE = 0.068;
    this.INSURANCE_RATE = 0.004;
    this.MAINTENANCE_RATE = 0.01;
    this.VACANCY_ASSUMPTION = 0.08;
    this.MANAGEMENT_FEE = 0.10;
    this.CLOSING_COST_PCT = 0.03;
    this.SELLING_COST_PCT = 0.06;
    this.OZ_ZIPS = new Set(['30303','30310','30312','30314','30315','30316','30317','30318','30324','30331','30337','30344','30354']);
  }

  isOpportunityZone(zip) {
    if (this.OZ_ZIPS.has(zip)) return true;
    if (typeof CommunityHelper !== 'undefined') {
      const data = zipData[zip];
      if (data && data.lat && data.lng) {
        try { const ch = new CommunityHelper(); const ozResult = ch.checkOpportunityZone(data.lat, data.lng); return ozResult && ozResult.inZone; } catch (e) {}
      }
    }
    return false;
  }

  getAppreciationEstimate(zip) {
    const data = zipData[zip];
    if (!data) return 3.5;
    if (typeof neighborhoodTrajectory !== 'undefined') {
      const trajectory = neighborhoodTrajectory.classify(zip);
      if (trajectory) {
        switch (trajectory.classification) {
          case 'rising-star': return 6.5;
          case 'established-premium': return 4.0;
          case 'stable-suburban': return 3.5;
          case 'value-play': return 5.5;
          case 'transitioning': return 4.5;
          case 'watch-list': return 1.5;
          default: return 3.5;
        }
      }
    }
    const metroAvg = this.getMetroAvgValue();
    if (data.avg_value < metroAvg * 0.6) return 5.0;
    if (data.avg_value > metroAvg * 1.5) return 3.0;
    return 3.5;
  }

  getMetroAvgValue() {
    if (!allZipCodes || allZipCodes.length === 0) return 350000;
    let total = 0, count = 0;
    allZipCodes.forEach(z => { if (zipData[z].avg_value > 0) { total += zipData[z].avg_value; count++; } });
    return count > 0 ? total / count : 350000;
  }

  estimateMonthlyRent(homeValue) { return Math.round(homeValue / 17 / 12); }

  calculateMortgage(principal) {
    const rate = this.MORTGAGE_RATE / 12;
    if (principal <= 0) return 0;
    return principal * (rate * Math.pow(1 + rate, 360)) / (Math.pow(1 + rate, 360) - 1);
  }

  projectROI(zip, options = {}) {
    const data = zipData[zip];
    if (!data || !data.avg_value) return null;
    const purchasePrice = options.purchasePrice || data.avg_value;
    const downPaymentPct = options.downPaymentPct || 20;
    const holdYears = options.holdYears || 5;
    const scenario = options.scenario || 'moderate';

    const downPayment = purchasePrice * (downPaymentPct / 100);
    const loanAmount = purchasePrice - downPayment;
    const closingCosts = purchasePrice * this.CLOSING_COST_PCT;
    const totalCashInvested = downPayment + closingCosts;

    const baseRate = this.getAppreciationEstimate(zip);
    const scenarioMultipliers = { conservative: 0.5, moderate: 1.0, aggressive: 1.6 };
    const appreciationRate = baseRate * (scenarioMultipliers[scenario] || 1.0);

    const monthlyMortgage = this.calculateMortgage(loanAmount);
    const annualMortgage = monthlyMortgage * 12;
    const baseMonthlyRent = this.estimateMonthlyRent(purchasePrice);
    const inOZ = this.isOpportunityZone(zip);

    const yearByYear = [];
    let cumulativeCashFlow = -totalCashInvested;
    let remainingLoan = loanAmount;

    for (let year = 1; year <= holdYears; year++) {
      const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
      const appreciation = propertyValue - purchasePrice;
      const monthlyRent = baseMonthlyRent * Math.pow(1.03, year - 1);
      const annualGrossRent = monthlyRent * 12;
      const effectiveRent = annualGrossRent * (1 - this.VACANCY_ASSUMPTION);
      const annualPropertyTax = propertyValue * 0.012;
      const annualInsurance = propertyValue * this.INSURANCE_RATE;
      const annualMaintenance = propertyValue * this.MAINTENANCE_RATE;
      const annualManagement = effectiveRent * this.MANAGEMENT_FEE;
      const NOI = effectiveRent - annualPropertyTax - annualInsurance - annualMaintenance - annualManagement;
      const annualCashFlow = NOI - annualMortgage;
      const principalPaid = annualMortgage * 0.25 * Math.min(year, 5) / 5;
      remainingLoan -= principalPaid;
      const equity = propertyValue - Math.max(0, remainingLoan);
      cumulativeCashFlow += annualCashFlow;

      yearByYear.push({
        year, propertyValue: Math.round(propertyValue), appreciation: Math.round(appreciation),
        monthlyRent: Math.round(monthlyRent), annualGrossRent: Math.round(annualGrossRent),
        NOI: Math.round(NOI), annualCashFlow: Math.round(annualCashFlow),
        cumulativeCashFlow: Math.round(cumulativeCashFlow), equity: Math.round(equity),
        totalExpenses: Math.round(annualPropertyTax + annualInsurance + annualMaintenance + annualManagement + annualMortgage)
      });
    }

    const finalYear = yearByYear[yearByYear.length - 1];
    const sellingCosts = finalYear.propertyValue * this.SELLING_COST_PCT;
    const netSaleProceeds = finalYear.propertyValue - Math.max(0, remainingLoan) - sellingCosts;
    const totalCashFlowReceived = yearByYear.reduce((sum, y) => sum + y.annualCashFlow, 0);
    const totalReturn = netSaleProceeds + totalCashFlowReceived - totalCashInvested;
    const annualizedReturn = totalCashInvested > 0 ? (Math.pow((netSaleProceeds + totalCashFlowReceived) / totalCashInvested, 1 / holdYears) - 1) * 100 : 0;
    const capRate = purchasePrice > 0 ? (yearByYear[0].NOI / purchasePrice) * 100 : 0;
    const cashOnCash = totalCashInvested > 0 ? (yearByYear[0].annualCashFlow / totalCashInvested) * 100 : 0;

    let ozBenefit = 0, ozDescription = null;
    if (inOZ) {
      if (holdYears >= 10) { ozBenefit = Math.round(finalYear.appreciation * 0.15); ozDescription = '10yr+ hold: 15% capital gains permanently excluded'; }
      else if (holdYears >= 7) { ozBenefit = Math.round(finalYear.appreciation * 0.15); ozDescription = '7yr hold: 15% step-up in basis'; }
      else if (holdYears >= 5) { ozBenefit = Math.round(finalYear.appreciation * 0.10); ozDescription = '5yr hold: 10% step-up in basis'; }
      else { ozDescription = 'Hold 5+ years to unlock OZ tax benefits'; }
    }

    return {
      zip, scenario,
      inputs: { purchasePrice, downPaymentPct, holdYears, downPayment: Math.round(downPayment), totalCashInvested: Math.round(totalCashInvested) },
      projections: {
        futureValue: finalYear.propertyValue, totalAppreciation: Math.round(finalYear.appreciation),
        appreciationRate: Math.round(appreciationRate * 10) / 10, netSaleProceeds: Math.round(netSaleProceeds),
        totalReturn: Math.round(totalReturn), annualizedReturn: Math.round(annualizedReturn * 10) / 10,
        capRate: Math.round(capRate * 10) / 10, cashOnCash: Math.round(cashOnCash * 10) / 10,
        monthlyRentEstimate: Math.round(baseMonthlyRent), year1NOI: Math.round(yearByYear[0].NOI)
      },
      opportunityZone: { inZone: inOZ, benefit: ozBenefit, description: ozDescription },
      yearByYear
    };
  }

  rankByROI(options = {}, limit = 10) {
    return allZipCodes
      .map(zip => this.projectROI(zip, { ...options, purchasePrice: zipData[zip].avg_value }))
      .filter(r => r && r.projections.annualizedReturn > 0)
      .sort((a, b) => b.projections.annualizedReturn - a.projections.annualizedReturn)
      .slice(0, limit || undefined);
  }
}


// ============================================================================
// COMMUTE INTELLIGENCE
// Multi-modal commute analysis using MARTA data and distance calculations
// ============================================================================

class CommuteIntelligence {
  constructor() {
    this.EMPLOYMENT_CENTERS = ATLANTA_EMPLOYMENT_CENTERS;
    this.GAS_PRICE = 3.20;
    this.MPG = 27;
    this.PARKING_MONTHLY = 150;
    this.MARTA_MONTHLY = 95;
    this.WORKING_DAYS = 20;
  }

  estimateDriveTime(distanceMiles) {
    if (distanceMiles < 3) return Math.round(distanceMiles * 60 / 18);
    if (distanceMiles < 8) return Math.round(distanceMiles * 60 / 22);
    if (distanceMiles < 20) return Math.round(distanceMiles * 60 / 28);
    return Math.round(distanceMiles * 60 / 35);
  }

  estimateTransit(fromLat, fromLng, toLat, toLng) {
    if (typeof TransitHelper !== 'undefined') {
      try {
        const helper = new TransitHelper();
        const result = helper.calculateTransitScore(fromLat, fromLng);
        if (result && result.nearestStation && result.nearestStation.distance < 2.5) {
          const walkToStation = Math.round(result.nearestStation.distance * 18);
          const waitTime = 8;
          const stationToWorkDist = haversineDistance(result.nearestStation.lat || fromLat, result.nearestStation.lng || fromLng, toLat, toLng);
          const rideTime = Math.round(stationToWorkDist * 60 / 25);
          return { available: true, totalMinutes: walkToStation + waitTime + rideTime, walkToStation, waitTime, rideTime, station: result.nearestStation.name, line: result.nearestStation.line || 'MARTA', stationDistance: Math.round(result.nearestStation.distance * 10) / 10 };
        }
      } catch (e) {}
    }
    const distToMARTA = haversineDistance(fromLat, fromLng, 33.749, -84.388);
    if (distToMARTA < 8) {
      const totalDist = haversineDistance(fromLat, fromLng, toLat, toLng);
      return { available: true, totalMinutes: Math.round(totalDist * 60 / 18), walkToStation: 10, waitTime: 8, rideTime: Math.round(totalDist * 60 / 25), station: 'Nearest MARTA', line: 'MARTA', stationDistance: null };
    }
    return { available: false };
  }

  estimateBike(distanceMiles, zip) {
    if (distanceMiles > 12) return { feasible: false, reason: 'Too far (>12 mi)' };
    let bikeScore = 30;
    if (typeof CommunityHelper !== 'undefined' && zipData[zip]) {
      try { const ch = new CommunityHelper(); bikeScore = ch.calculateBikeScore(zipData[zip].lat, zipData[zip].lng).score; } catch (e) {}
    }
    if (distanceMiles > 8 && bikeScore < 40) return { feasible: false, reason: 'Limited bike infrastructure' };
    return { feasible: true, minutes: Math.round(distanceMiles * 5), monthlyCost: 0, bikeScore };
  }

  analyzeCommute(zip, workplaceId) {
    const data = zipData[zip];
    if (!data || !data.lat || !data.lng) return null;
    const workplace = typeof workplaceId === 'object' ? workplaceId : this.EMPLOYMENT_CENTERS.find(ec => ec.id === workplaceId);
    if (!workplace) return null;

    const distance = haversineDistance(data.lat, data.lng, workplace.lat, workplace.lng);
    const driveMinutes = this.estimateDriveTime(distance);
    const dailyGasCost = (distance * 2 / this.MPG) * this.GAS_PRICE;
    const driveMonthly = Math.round(dailyGasCost * this.WORKING_DAYS + this.PARKING_MONTHLY);
    const transit = this.estimateTransit(data.lat, data.lng, workplace.lat, workplace.lng);
    const bike = this.estimateBike(distance, zip);

    let bestMode = 'drive', bestTime = driveMinutes, bestCost = driveMonthly;
    if (transit.available && this.MARTA_MONTHLY < driveMonthly) { bestMode = 'transit'; bestTime = transit.totalMinutes; bestCost = this.MARTA_MONTHLY; }
    if (bike.feasible && bike.minutes < bestTime * 1.3 && distance < 6) { bestMode = 'bike'; bestTime = bike.minutes; bestCost = 0; }

    return {
      zip, workplace: workplace.name, workplaceId: workplace.id,
      distance: Math.round(distance * 10) / 10,
      drive: { minutes: driveMinutes, monthlyCost: driveMonthly, dailyCost: Math.round(dailyGasCost * 100) / 100 },
      transit: transit.available ? { minutes: transit.totalMinutes, monthlyCost: this.MARTA_MONTHLY, station: transit.station, line: transit.line, walkToStation: transit.walkToStation, stationDistance: transit.stationDistance } : null,
      bike: bike.feasible ? { minutes: bike.minutes, monthlyCost: 0, bikeScore: bike.bikeScore } : null,
      best: { mode: bestMode, minutes: bestTime, monthlyCost: bestCost },
      annualSavings: Math.max(0, (driveMonthly - bestCost) * 12)
    };
  }

  buildCommuteMatrix(zip, limit = null) {
    const results = this.EMPLOYMENT_CENTERS.map(ec => this.analyzeCommute(zip, ec.id)).filter(r => r !== null).sort((a, b) => a.distance - b.distance);
    return limit ? results.slice(0, limit) : results;
  }

  getTopNearestCommutes(zip) { return this.buildCommuteMatrix(zip, 3); }

  commuteAdjustedSalary(zip, workplaceId, annualSalary) {
    const commute = this.analyzeCommute(zip, workplaceId);
    if (!commute) return null;
    const annualCommuteCost = commute.best.monthlyCost * 12;
    const hoursCommutePerYear = (commute.best.minutes * 2 * this.WORKING_DAYS * 12) / 60;
    return {
      grossSalary: annualSalary, commuteCost: Math.round(annualCommuteCost),
      commuteTimeValue: Math.round(hoursCommutePerYear * (annualSalary / 2080)),
      adjustedSalary: Math.round(annualSalary - annualCommuteCost),
      effectiveHourlyRate: Math.round((annualSalary - annualCommuteCost) / 2080 * 100) / 100,
      hoursCommutingPerYear: Math.round(hoursCommutePerYear)
    };
  }

  rankByCommute(workplaceId, limit = 10) {
    return allZipCodes.map(zip => this.analyzeCommute(zip, workplaceId)).filter(r => r !== null).sort((a, b) => a.best.monthlyCost - b.best.monthlyCost).slice(0, limit);
  }
}


// ============================================================================
// NEIGHBORHOOD MATCH
// "Dating app for neighborhoods" - matches user preferences against all ZIPs
// ============================================================================

class NeighborhoodMatch {
  constructor() {
    this.PRESETS = {
      family: { name: 'Family-Friendly', icon: 'fa-home', weights: { safety: 9, schools: 9, greenSpace: 7, affordability: 7, transit: 4, nightlife: 2, investment: 3, commute: 5 } },
      professional: { name: 'Young Professional', icon: 'fa-briefcase', weights: { safety: 6, schools: 2, greenSpace: 4, affordability: 6, transit: 8, nightlife: 8, investment: 5, commute: 9 } },
      investor: { name: 'Investor', icon: 'fa-chart-line', weights: { safety: 4, schools: 3, greenSpace: 2, affordability: 8, transit: 5, nightlife: 3, investment: 10, commute: 2 } },
      retiree: { name: 'Retiree', icon: 'fa-umbrella-beach', weights: { safety: 10, schools: 1, greenSpace: 9, affordability: 8, transit: 3, nightlife: 2, investment: 4, commute: 1 } }
    };
    this.DIMENSIONS = {
      safety: { label: 'Safety', icon: 'fa-shield-alt', description: 'Low crime, safe neighborhoods' },
      schools: { label: 'Schools', icon: 'fa-graduation-cap', description: 'Quality schools nearby' },
      greenSpace: { label: 'Green Space', icon: 'fa-tree', description: 'Parks and nature access' },
      affordability: { label: 'Affordability', icon: 'fa-dollar-sign', description: 'Lower cost of living' },
      transit: { label: 'Transit', icon: 'fa-subway', description: 'Public transportation access' },
      nightlife: { label: 'Urban Vibe', icon: 'fa-cocktail', description: 'Dining, entertainment, walkability' },
      investment: { label: 'Growth', icon: 'fa-rocket', description: 'Property value appreciation potential' },
      commute: { label: 'Commute', icon: 'fa-car', description: 'Short commute to work centers' }
    };
    this.cache = {};
  }

  scoreDimension(zip, dimension) {
    const data = zipData[zip];
    if (!data) return 50;
    switch (dimension) {
      case 'safety': return Math.max(0, Math.min(100, 100 - (data.crime_rate || 0)));
      case 'schools': {
        if (typeof CommunityHelper !== 'undefined' && data.lat && data.lng) { try { return new CommunityHelper().calculateSchoolScore(data.lat, data.lng).score || 50; } catch (e) {} }
        if (data.education_levels && typeof data.education_levels === 'string') { const m = data.education_levels.match(/(\d+)/); if (m) return Math.min(100, parseInt(m[1]) * 1.5); }
        return 50;
      }
      case 'greenSpace': {
        if (typeof ParksHelper !== 'undefined' && data.lat && data.lng) { try { return new ParksHelper().calculateParksScore(data.lat, data.lng).score || 40; } catch (e) {} }
        return 40;
      }
      case 'affordability': {
        const allValues = allZipCodes.map(z => zipData[z].avg_value).filter(v => v > 0).sort((a, b) => a - b);
        if (allValues.length === 0) return 50;
        return Math.round((allValues.filter(v => v >= data.avg_value).length / allValues.length) * 100);
      }
      case 'transit': {
        if (typeof TransitHelper !== 'undefined' && data.lat && data.lng) { try { return new TransitHelper().calculateTransitScore(data.lat, data.lng).score || 20; } catch (e) {} }
        return 20;
      }
      case 'nightlife': {
        const popPercentile = getPercentileRank(data.population, 'population');
        const distToCore = haversineDistance(data.lat || 33.749, data.lng || -84.388, 33.749, -84.388);
        const urbanProximity = Math.max(0, 100 - (distToCore * 5));
        return Math.round((popPercentile * 0.4) + (urbanProximity * 0.6));
      }
      case 'investment': {
        if (typeof neighborhoodTrajectory !== 'undefined') {
          const traj = neighborhoodTrajectory.classify(zip);
          if (traj) {
            switch (traj.classification) {
              case 'rising-star': return 90; case 'value-play': return 80; case 'transitioning': return 65;
              case 'stable-suburban': return 55; case 'established-premium': return 50; case 'watch-list': return 25;
            }
          }
        }
        const affordScore = this.scoreDimension(zip, 'affordability');
        const vacancyScore = Math.max(0, 100 - (data.housing_vacancy_rate || 0) * 5);
        return Math.round((affordScore * 0.5) + (vacancyScore * 0.5));
      }
      case 'commute': {
        if (typeof commuteIntelligence !== 'undefined' && data.lat && data.lng) {
          try {
            const commutes = commuteIntelligence.getTopNearestCommutes(zip);
            if (commutes && commutes.length > 0) { const avgTime = commutes.reduce((sum, c) => sum + c.best.minutes, 0) / commutes.length; return Math.max(0, Math.min(100, 100 - (avgTime * 2))); }
          } catch (e) {}
        }
        if (data.lat && data.lng) { return Math.max(0, Math.min(100, 100 - (haversineDistance(data.lat, data.lng, 33.749, -84.388) * 4))); }
        return 40;
      }
      default: return 50;
    }
  }

  findMatches(weights, options = {}) {
    const maxBudget = options.maxBudget || null;
    const results = allZipCodes.map(zip => {
      const data = zipData[zip];
      if (!data || !data.avg_value) return null;
      if (maxBudget && data.avg_value / 17 / 12 > maxBudget) return null;
      let totalScore = 0, totalWeight = 0;
      const breakdown = {};
      for (const [dim, weight] of Object.entries(weights)) {
        if (weight <= 0) continue;
        const score = this.scoreDimension(zip, dim);
        totalScore += score * weight;
        totalWeight += weight;
        breakdown[dim] = { score, weight };
      }
      const matchPercent = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
      return {
        zip, city: data.city || 'Atlanta Metro', neighborhood: data.neighborhood || `Area ${zip}`,
        matchPercent, breakdown,
        strengths: this.getStrengths(breakdown), weaknesses: this.getWeaknesses(breakdown),
        avgValue: data.avg_value, population: data.population, safetyScore: Math.round(100 - (data.crime_rate || 0))
      };
    }).filter(r => r !== null);
    results.sort((a, b) => b.matchPercent - a.matchPercent);
    return results;
  }

  quickMatch(presetId, options = {}) {
    const preset = this.PRESETS[presetId];
    if (!preset) return [];
    return this.findMatches(preset.weights, options);
  }

  getStrengths(breakdown) {
    return Object.entries(breakdown).filter(([, { score, weight }]) => score >= 65 && weight >= 3)
      .sort((a, b) => (b[1].score * b[1].weight) - (a[1].score * a[1].weight)).slice(0, 3)
      .map(([dim, { score }]) => ({ dimension: dim, label: this.DIMENSIONS[dim].label, icon: this.DIMENSIONS[dim].icon, score, text: this.getStrengthText(dim, score) }));
  }

  getWeaknesses(breakdown) {
    return Object.entries(breakdown).filter(([, { score, weight }]) => score < 40 && weight >= 5)
      .sort((a, b) => a[1].score - b[1].score).slice(0, 2)
      .map(([dim, { score }]) => ({ dimension: dim, label: this.DIMENSIONS[dim].label, score, text: this.getWeaknessText(dim, score) }));
  }

  getStrengthText(dim, score) {
    const tier = score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : 'Good';
    return { safety: `${tier} safety`, schools: `${tier} schools`, greenSpace: `${tier} green space`, affordability: `${tier} value`, transit: `${tier} transit`, nightlife: `${tier} urban vibe`, investment: `${tier} growth`, commute: `${tier} commute` }[dim] || tier;
  }

  getWeaknessText(dim) {
    return { safety: 'Safety below expectations', schools: 'Limited school options', greenSpace: 'Few parks nearby', affordability: 'Above budget target', transit: 'Limited transit access', nightlife: 'Quiet/suburban area', investment: 'Slow growth outlook', commute: 'Long commute expected' }[dim] || 'Below target';
  }

  getMatchScore(zip, weights) {
    if (!weights || !zipData[zip]) return null;
    let totalScore = 0, totalWeight = 0;
    for (const [dim, weight] of Object.entries(weights)) {
      if (weight <= 0) continue;
      totalScore += this.scoreDimension(zip, dim) * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }
}


// ============================================================================
// GLOBAL INSTANCES
// ============================================================================

const trueCostEngine = new TrueCostEngine();
const neighborhoodTrajectory = new NeighborhoodTrajectory();
const investmentProjector = new InvestmentProjector();
const commuteIntelligence = new CommuteIntelligence();
const neighborhoodMatch = new NeighborhoodMatch();

function saveMatchPreferences(weights) { localStorage.setItem('insiteMatchPrefs', JSON.stringify(weights)); }
function loadMatchPreferences() { try { return JSON.parse(localStorage.getItem('insiteMatchPrefs')); } catch (e) { return null; } }
