/**
 * INSITE Investment Projector
 * Multi-scenario ROI calculator with Opportunity Zone tax benefits.
 * PRO FEATURE - full access requires pro subscription.
 */

class InvestmentProjector {
  constructor() {
    this.MORTGAGE_RATE = 0.068;
    this.INSURANCE_RATE = 0.004;
    this.MAINTENANCE_RATE = 0.01; // 1% of value annually
    this.VACANCY_ASSUMPTION = 0.08; // 8% vacancy
    this.MANAGEMENT_FEE = 0.10; // 10% of rent for property management
    this.CLOSING_COST_PCT = 0.03; // 3% of purchase price
    this.SELLING_COST_PCT = 0.06; // 6% of sale price

    // Known opportunity zone ZIPs (sampling - enhanced from community-helper)
    this.OZ_ZIPS = new Set([
      '30303', '30310', '30312', '30314', '30315', '30316', '30317',
      '30318', '30324', '30331', '30337', '30344', '30354'
    ]);
  }

  /**
   * Check if a ZIP is in a Federal Opportunity Zone
   */
  isOpportunityZone(zip) {
    if (this.OZ_ZIPS.has(zip)) return true;
    // Also check community helper if available
    if (typeof CommunityHelper !== 'undefined') {
      const data = zipData[zip];
      if (data && data.lat && data.lng) {
        const ch = new CommunityHelper();
        const ozResult = ch.checkOpportunityZone(data.lat, data.lng);
        return ozResult && ozResult.inZone;
      }
    }
    return false;
  }

  /**
   * Estimate annual appreciation rate based on available data
   */
  getAppreciationEstimate(zip) {
    const data = zipData[zip];
    if (!data) return 3.5; // national average

    // Use trajectory classification for more nuanced estimate
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

    // Fallback: estimate from price level relative to metro
    const metroAvg = this.getMetroAvgValue();
    if (data.avg_value < metroAvg * 0.6) return 5.0; // undervalued = higher growth
    if (data.avg_value > metroAvg * 1.5) return 3.0; // premium = slower growth
    return 3.5;
  }

  /**
   * Get metro average property value
   */
  getMetroAvgValue() {
    if (!allZipCodes || allZipCodes.length === 0) return 350000;
    let total = 0, count = 0;
    allZipCodes.forEach(z => {
      if (zipData[z].avg_value > 0) { total += zipData[z].avg_value; count++; }
    });
    return count > 0 ? total / count : 350000;
  }

  /**
   * Estimate monthly rent from home value
   */
  estimateMonthlyRent(homeValue) {
    return Math.round(homeValue / 17 / 12); // price-to-rent ratio ~17
  }

  /**
   * Calculate monthly mortgage payment
   */
  calculateMortgage(principal) {
    const rate = this.MORTGAGE_RATE / 12;
    const n = 360;
    if (principal <= 0) return 0;
    return principal * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  }

  /**
   * Project investment returns over time
   */
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

    // Annual appreciation rate by scenario
    const baseRate = this.getAppreciationEstimate(zip);
    const scenarioMultipliers = { conservative: 0.5, moderate: 1.0, aggressive: 1.6 };
    const appreciationRate = baseRate * (scenarioMultipliers[scenario] || 1.0);

    // Monthly mortgage
    const monthlyMortgage = this.calculateMortgage(loanAmount);
    const annualMortgage = monthlyMortgage * 12;

    // Monthly rent estimate
    const baseMonthlyRent = this.estimateMonthlyRent(purchasePrice);

    // Opportunity Zone check
    const inOZ = this.isOpportunityZone(zip);

    // Build year-by-year projection
    const yearByYear = [];
    let cumulativeEquity = downPayment;
    let cumulativeCashFlow = -totalCashInvested;
    let remainingLoan = loanAmount;

    for (let year = 1; year <= holdYears; year++) {
      const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
      const appreciation = propertyValue - purchasePrice;

      // Rent grows ~3% per year
      const monthlyRent = baseMonthlyRent * Math.pow(1.03, year - 1);
      const annualGrossRent = monthlyRent * 12;
      const effectiveRent = annualGrossRent * (1 - this.VACANCY_ASSUMPTION);

      // Expenses
      const annualPropertyTax = propertyValue * 0.012; // ~1.2% effective rate
      const annualInsurance = propertyValue * this.INSURANCE_RATE;
      const annualMaintenance = propertyValue * this.MAINTENANCE_RATE;
      const annualManagement = effectiveRent * this.MANAGEMENT_FEE;
      const totalExpenses = annualPropertyTax + annualInsurance + annualMaintenance + annualManagement + annualMortgage;

      // Net Operating Income (before debt service)
      const NOI = effectiveRent - annualPropertyTax - annualInsurance - annualMaintenance - annualManagement;

      // Cash flow (after debt service)
      const annualCashFlow = NOI - annualMortgage;

      // Rough principal paydown estimate
      const principalPaid = annualMortgage * 0.25 * Math.min(year, 5) / 5; // simplified
      remainingLoan -= principalPaid;

      // Equity position
      const equity = propertyValue - Math.max(0, remainingLoan);

      cumulativeCashFlow += annualCashFlow;

      yearByYear.push({
        year,
        propertyValue: Math.round(propertyValue),
        appreciation: Math.round(appreciation),
        monthlyRent: Math.round(monthlyRent),
        annualGrossRent: Math.round(annualGrossRent),
        NOI: Math.round(NOI),
        annualCashFlow: Math.round(annualCashFlow),
        cumulativeCashFlow: Math.round(cumulativeCashFlow),
        equity: Math.round(equity),
        totalExpenses: Math.round(totalExpenses)
      });
    }

    // Final year metrics
    const finalYear = yearByYear[yearByYear.length - 1];
    const sellingCosts = finalYear.propertyValue * this.SELLING_COST_PCT;
    const netSaleProceeds = finalYear.propertyValue - Math.max(0, remainingLoan) - sellingCosts;

    // Calculate returns
    const totalAppreciation = finalYear.appreciation;
    const totalCashFlowReceived = yearByYear.reduce((sum, y) => sum + y.annualCashFlow, 0);
    const totalReturn = netSaleProceeds + totalCashFlowReceived - totalCashInvested;
    const annualizedReturn = totalCashInvested > 0 ?
      (Math.pow((netSaleProceeds + totalCashFlowReceived) / totalCashInvested, 1 / holdYears) - 1) * 100 : 0;

    // Cap rate (year 1)
    const year1NOI = yearByYear[0].NOI;
    const capRate = purchasePrice > 0 ? (year1NOI / purchasePrice) * 100 : 0;

    // Cash-on-cash return (year 1)
    const year1CashFlow = yearByYear[0].annualCashFlow;
    const cashOnCash = totalCashInvested > 0 ? (year1CashFlow / totalCashInvested) * 100 : 0;

    // Opportunity Zone benefits
    let ozBenefit = 0;
    let ozDescription = null;
    if (inOZ) {
      if (holdYears >= 10) {
        ozBenefit = Math.round(totalAppreciation * 0.15); // permanent exclusion
        ozDescription = '10yr+ hold: 15% capital gains permanently excluded';
      } else if (holdYears >= 7) {
        ozBenefit = Math.round(totalAppreciation * 0.15);
        ozDescription = '7yr hold: 15% step-up in basis on deferred gains';
      } else if (holdYears >= 5) {
        ozBenefit = Math.round(totalAppreciation * 0.10);
        ozDescription = '5yr hold: 10% step-up in basis on deferred gains';
      } else {
        ozDescription = 'Hold 5+ years to unlock Opportunity Zone tax benefits';
      }
    }

    return {
      zip,
      scenario,
      inputs: { purchasePrice, downPaymentPct, holdYears, downPayment: Math.round(downPayment), totalCashInvested: Math.round(totalCashInvested) },
      projections: {
        futureValue: finalYear.propertyValue,
        totalAppreciation: Math.round(totalAppreciation),
        appreciationRate: Math.round(appreciationRate * 10) / 10,
        netSaleProceeds: Math.round(netSaleProceeds),
        totalReturn: Math.round(totalReturn),
        annualizedReturn: Math.round(annualizedReturn * 10) / 10,
        capRate: Math.round(capRate * 10) / 10,
        cashOnCash: Math.round(cashOnCash * 10) / 10,
        monthlyRentEstimate: Math.round(baseMonthlyRent),
        year1NOI: Math.round(year1NOI)
      },
      opportunityZone: {
        inZone: inOZ,
        benefit: ozBenefit,
        description: ozDescription
      },
      yearByYear
    };
  }

  /**
   * Rank ZIPs by projected annualized return
   */
  rankByROI(options = {}, limit = 10) {
    const results = allZipCodes
      .map(zip => this.projectROI(zip, { ...options, purchasePrice: zipData[zip].avg_value }))
      .filter(r => r && r.projections.annualizedReturn > 0)
      .sort((a, b) => b.projections.annualizedReturn - a.projections.annualizedReturn);
    return limit ? results.slice(0, limit) : results;
  }
}

// Global instance
const investmentProjector = new InvestmentProjector();
