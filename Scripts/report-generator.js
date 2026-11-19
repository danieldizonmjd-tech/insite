/**
 * InSite Professional PDF Report Generator
 * Premium feature for generating high-quality property intelligence reports
 * Version 1.0.0
 */

const ReportGenerator = {
  // Report configuration
  config: {
    brandColors: {
      primary: '#6366f1',
      secondary: '#D4AF37',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      dark: '#0f172a',
      light: '#f8fafc'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Montserrat, sans-serif'
    },
    logo: 'InSite Property Intelligence',
    version: '1.0.0'
  },

  /**
   * Generate comprehensive ZIP Code report
   */
  generateZipReport: async function(zipCode, options = {}) {
    const data = window.zipData?.[zipCode];
    if (!data) {
      console.error('No data found for ZIP:', zipCode);
      return null;
    }

    const reportData = {
      generatedAt: new Date().toISOString(),
      zipCode: zipCode,
      city: data.city || 'Unknown',
      neighborhood: data.neighborhood || '',
      metrics: this.calculateMetrics(zipCode, data),
      scores: this.calculateScores(zipCode, data),
      demographics: this.extractDemographics(data),
      marketAnalysis: this.generateMarketAnalysis(zipCode, data),
      communityData: await this.getCommunityData(zipCode, data),
      comparisons: this.generateComparisons(zipCode, data),
      insights: this.generateInsights(zipCode, data),
      recommendations: this.generateRecommendations(zipCode, data)
    };

    return this.buildPDFContent(reportData, options);
  },

  /**
   * Generate comparison report for multiple ZIP codes
   */
  generateComparisonReport: async function(zipCodes, options = {}) {
    if (!zipCodes || zipCodes.length < 2) {
      console.error('Need at least 2 ZIP codes for comparison');
      return null;
    }

    const reportData = {
      generatedAt: new Date().toISOString(),
      zipCodes: zipCodes,
      locations: zipCodes.map(z => ({
        zip: z,
        city: window.zipData?.[z]?.city || 'Unknown',
        neighborhood: window.zipData?.[z]?.neighborhood || ''
      })),
      metricsComparison: this.compareMetrics(zipCodes),
      scoresComparison: this.compareScores(zipCodes),
      rankings: this.generateRankings(zipCodes),
      analysis: this.generateComparisonAnalysis(zipCodes),
      recommendations: this.generateComparisonRecommendations(zipCodes)
    };

    return this.buildComparisonPDF(reportData, options);
  },

  /**
   * Generate market overview report
   */
  generateMarketReport: async function(options = {}) {
    const allZips = window.allZipCodes || [];
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      marketName: 'Atlanta Metropolitan Area',
      totalZipCodes: allZips.length,
      marketOverview: this.calculateMarketOverview(allZips),
      distributions: this.calculateDistributions(allZips),
      topPerformers: this.identifyTopPerformers(allZips),
      marketTrends: this.analyzeMarketTrends(allZips),
      segmentation: this.segmentMarket(allZips),
      opportunities: this.identifyOpportunities(allZips)
    };

    return this.buildMarketPDF(reportData, options);
  },

  /**
   * Calculate comprehensive metrics for a ZIP code
   */
  calculateMetrics: function(zipCode, data) {
    const allZips = window.allZipCodes || [];
    
    // Calculate percentile ranks
    const getPercentile = (value, metric, higherIsBetter = true) => {
      const values = allZips.map(z => window.zipData[z][metric]).filter(v => v > 0).sort((a, b) => a - b);
      if (values.length === 0) return 50;
      const rank = values.filter(v => v <= value).length;
      const percentile = Math.round((rank / values.length) * 100);
      return higherIsBetter ? percentile : (100 - percentile);
    };

    return {
      propertyValue: {
        value: data.avg_value || 0,
        formatted: this.formatCurrency(data.avg_value),
        percentile: getPercentile(data.avg_value, 'avg_value', true),
        vsMetroAvg: this.calculateVsMetroAvg('avg_value', data.avg_value)
      },
      medianIncome: {
        value: data.median_income || 0,
        formatted: this.formatCurrency(data.median_income),
        percentile: getPercentile(data.median_income, 'median_income', true),
        vsMetroAvg: this.calculateVsMetroAvg('median_income', data.median_income)
      },
      population: {
        value: data.population || 0,
        formatted: this.formatNumber(data.population),
        percentile: getPercentile(data.population, 'population', true),
        density: data.population_density || 'N/A'
      },
      crimeRate: {
        value: data.crime_rate || 0,
        safetyScore: Math.round(100 - (data.crime_rate || 0)),
        percentile: getPercentile(data.crime_rate, 'crime_rate', false),
        rating: this.getCrimeRating(data.crime_rate)
      },
      vacancyRate: {
        value: data.housing_vacancy_rate || 0,
        occupancyRate: Math.round(100 - (data.housing_vacancy_rate || 0)),
        percentile: getPercentile(data.housing_vacancy_rate, 'housing_vacancy_rate', false),
        marketStrength: this.getMarketStrength(data.housing_vacancy_rate)
      }
    };
  },

  /**
   * Calculate scores using the grading system
   * USES ONLY OBJECTIVE, FACTUAL DATA - no subjective scores
   */
  calculateScores: function(zipCode, data) {
    const allZips = window.allZipCodes || [];
    
    // Helper to calculate percentile from actual data distribution
    const getPercentileScore = (value, metric, higherIsBetter = true) => {
      const values = allZips.map(z => window.zipData[z]?.[metric]).filter(v => v != null && v > 0).sort((a, b) => a - b);
      if (values.length === 0 || value == null) return 50;
      const rank = values.filter(v => v <= value).length;
      const percentile = Math.round((rank / values.length) * 100);
      return higherIsBetter ? percentile : (100 - percentile);
    };

    // OBJECTIVE SCORES ONLY - derived from actual data
    const scores = {
      // Safety: Based on actual crime_rate data (crimes per 1000 residents)
      // Lower crime = higher safety score
      safety: Math.max(0, Math.min(100, Math.round(100 - (data.crime_rate || 50)))),
      
      // Occupancy: Based on actual housing_vacancy_rate data
      // Lower vacancy = higher occupancy score
      occupancy: Math.max(0, Math.min(100, Math.round(100 - (data.housing_vacancy_rate || 10)))),
      
      // Income Percentile: Where this ZIP ranks in metro for median income
      incomeRank: getPercentileScore(data.median_income, 'median_income', true),
      
      // Property Value Percentile: Where this ZIP ranks in metro for avg home value
      valueRank: getPercentileScore(data.avg_value, 'avg_value', true)
    };

    // OVERALL SCORE: Average of OBJECTIVE metrics only
    // Safety and Occupancy are direct facts, Income/Value ranks show position in market
    const overall = Math.round((scores.safety + scores.occupancy + scores.incomeRank + scores.valueRank) / 4);

    return {
      ...scores,
      // Keep these for backwards compatibility in display
      affordability: getPercentileScore(data.avg_value, 'avg_value', false),
      income: scores.incomeRank,
      investment: scores.valueRank,
      overall: overall,
      grade: this.getGrade(overall),
      breakdown: [
        { name: 'Safety Score', score: scores.safety, grade: this.getGrade(scores.safety) },
        { name: 'Occupancy Rate', score: scores.occupancy, grade: this.getGrade(scores.occupancy) },
        { name: 'Income Rank', score: scores.incomeRank, grade: this.getGrade(scores.incomeRank) },
        { name: 'Value Rank', score: scores.valueRank, grade: this.getGrade(scores.valueRank) }
      ]
    };
  },

  /**
   * Extract demographics data
   */
  extractDemographics: function(data) {
    return {
      population: {
        total: data.population || 0,
        density: data.population_density || 'N/A',
        growth: data.population_growth || 'N/A'
      },
      housing: {
        totalUnits: data.total_housing_units || 0,
        occupiedUnits: data.occupied_housing_units || 0,
        ownerOccupied: data.owner_occupied_percentage || 0,
        renterOccupied: data.renter_occupied_percentage || 0,
        medianRent: data.median_rent || 0,
        medianHomeValue: data.avg_value || 0
      },
      education: {
        levels: data.education_levels || 'N/A',
        collegeGrad: data.college_grad_percentage || 0,
        highSchoolGrad: data.high_school_grad_percentage || 0
      },
      age: {
        demographics: data.age_demographics || 'N/A',
        medianAge: data.median_age || 0,
        under18: data.under_18_percentage || 0,
        over65: data.over_65_percentage || 0
      },
      income: {
        median: data.median_income || 0,
        perCapita: data.per_capita_income || 0,
        povertyRate: data.poverty_rate || 0
      }
    };
  },

  /**
   * Generate market analysis
   */
  generateMarketAnalysis: function(zipCode, data) {
    const allZips = window.allZipCodes || [];
    const allValues = allZips.map(z => window.zipData[z].avg_value).filter(v => v > 0);
    const avgValue = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    
    const valuePosition = data.avg_value > avgValue * 1.2 ? 'premium' :
                          data.avg_value > avgValue * 0.8 ? 'mid-market' : 'value';
    
    const safetyRating = data.crime_rate < 20 ? 'excellent' :
                         data.crime_rate < 40 ? 'good' :
                         data.crime_rate < 60 ? 'moderate' : 'concerning';

    return {
      marketPosition: valuePosition,
      pricePoint: this.getPricePoint(data.avg_value),
      competitiveAnalysis: this.analyzeCompetition(zipCode, data),
      demandIndicators: {
        vacancyRate: data.housing_vacancy_rate,
        marketStrength: this.getMarketStrength(data.housing_vacancy_rate),
        demandLevel: data.housing_vacancy_rate < 5 ? 'Very High' :
                     data.housing_vacancy_rate < 10 ? 'High' :
                     data.housing_vacancy_rate < 15 ? 'Moderate' : 'Low'
      },
      safetyProfile: {
        rating: safetyRating,
        score: Math.round(100 - data.crime_rate),
        comparison: this.compareSafety(zipCode, data)
      },
      investmentPotential: this.assessInvestmentPotential(zipCode, data)
    };
  },

  /**
   * Get community data (schools, transit, etc.)
   */
  getCommunityData: async function(zipCode, data) {
    const lat = data.lat || 33.75;
    const lng = data.lng || -84.39;

    let communityScores = {
      schools: { score: 0, nearby: 0 },
      libraries: { score: 0, nearby: 0 },
      bikeways: { score: 0, nearby: 0 },
      opportunityZone: { inZone: false }
    };

    // Try to use CommunityHelper if available
    if (typeof CommunityHelper !== 'undefined') {
      try {
        communityScores.schools = CommunityHelper.calculateSchoolScore(lat, lng);
        communityScores.libraries = CommunityHelper.calculateLibraryScore(lat, lng);
        communityScores.bikeways = CommunityHelper.calculateBikeScore(lat, lng);
        communityScores.opportunityZone = CommunityHelper.checkOpportunityZone(lat, lng);
      } catch (e) {
        console.log('CommunityHelper not available:', e);
      }
    }

    // Try to get mobility data
    let mobilityScores = {
      walkScore: 50,
      transitScore: 40,
      bikeScore: 45
    };

    if (typeof MobilityAPI !== 'undefined') {
      try {
        const mobility = await MobilityAPI.getMobilitySummary(lat, lng, `${zipCode}, ${data.city}, GA`);
        mobilityScores = {
          walkScore: mobility.walkScore || 50,
          transitScore: mobility.transitScore || 40,
          bikeScore: mobility.bikeScore || 45
        };
      } catch (e) {
        console.log('MobilityAPI not available:', e);
      }
    }

    return {
      ...communityScores,
      mobility: mobilityScores,
      overallCommunityScore: Math.round(
        (communityScores.schools.score || 50) * 0.3 +
        (mobilityScores.transitScore || 40) * 0.25 +
        (mobilityScores.walkScore || 50) * 0.2 +
        (communityScores.bikeways.score || 45) * 0.15 +
        (communityScores.libraries.score || 50) * 0.1
      )
    };
  },

  /**
   * Generate comparisons with surrounding areas
   */
  generateComparisons: function(zipCode, data) {
    const allZips = window.allZipCodes || [];
    const sameCity = allZips.filter(z => window.zipData[z].city === data.city && z !== zipCode);
    
    return {
      vsMetro: this.compareToMetro(zipCode, data),
      vsCity: sameCity.length > 0 ? this.compareToCity(zipCode, data, sameCity) : null,
      vsSimilar: this.compareToSimilar(zipCode, data),
      ranking: this.getRankings(zipCode, data)
    };
  },

  /**
   * Generate insights
   */
  generateInsights: function(zipCode, data) {
    const insights = [];
    const scores = this.calculateScores(zipCode, data);

    // Overall assessment
    if (scores.overall >= 80) {
      insights.push({
        type: 'positive',
        icon: '🌟',
        title: 'Excellent Overall Profile',
        text: `${zipCode} - ${data.city} demonstrates exceptional performance across all key metrics with an overall score of ${scores.overall}/100.`
      });
    } else if (scores.overall >= 60) {
      insights.push({
        type: 'positive',
        icon: '✅',
        title: 'Strong Market Position',
        text: `This area shows solid fundamentals with an overall score of ${scores.overall}/100, making it a reliable choice for residents and investors.`
      });
    } else {
      insights.push({
        type: 'neutral',
        icon: '📊',
        title: 'Value Opportunity',
        text: `With an overall score of ${scores.overall}/100, this area may offer value opportunities for investors with appropriate risk tolerance.`
      });
    }

    // Safety insight
    if (scores.safety >= 85) {
      insights.push({
        type: 'positive',
        icon: '🛡️',
        title: 'Excellent Safety Profile',
        text: `This neighborhood ranks in the top tier for safety with a score of ${scores.safety}/100, well above the metro average.`
      });
    } else if (scores.safety < 50) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Safety Consideration',
        text: `The safety score of ${scores.safety}/100 is below average. Consider visiting at different times of day before making decisions.`
      });
    }

    // Affordability insight
    if (scores.affordability >= 80) {
      insights.push({
        type: 'positive',
        icon: '💰',
        title: 'High Affordability',
        text: `Property values are significantly below the metro median, offering excellent entry points for first-time buyers.`
      });
    } else if (scores.affordability < 30) {
      insights.push({
        type: 'neutral',
        icon: '🏆',
        title: 'Premium Market',
        text: `This is a premium-priced market with properties above the 70th percentile, reflecting high desirability.`
      });
    }

    // Investment insight
    if (scores.investment >= 75 && scores.occupancy >= 90) {
      insights.push({
        type: 'positive',
        icon: '📈',
        title: 'Strong Investment Potential',
        text: `High property values combined with excellent occupancy rates suggest strong investment fundamentals.`
      });
    }

    // Income insight
    if (scores.income >= 80) {
      insights.push({
        type: 'positive',
        icon: '💼',
        title: 'Affluent Community',
        text: `Median household income is in the top 20% of the metro area, indicating strong purchasing power.`
      });
    }

    return insights;
  },

  /**
   * Generate recommendations
   */
  generateRecommendations: function(zipCode, data) {
    const scores = this.calculateScores(zipCode, data);
    const recommendations = [];

    // For families
    if (scores.safety >= 75 && scores.affordability >= 50) {
      recommendations.push({
        audience: 'Families',
        rating: 'Recommended',
        icon: '👨‍👩‍👧‍👦',
        reason: 'Good balance of safety and affordability with family-friendly metrics.'
      });
    } else if (scores.safety >= 85) {
      recommendations.push({
        audience: 'Families',
        rating: 'Highly Recommended',
        icon: '👨‍👩‍👧‍👦',
        reason: 'Exceptional safety profile makes this ideal for families with children.'
      });
    }

    // For investors
    if (scores.investment >= 70 && scores.occupancy >= 85) {
      recommendations.push({
        audience: 'Investors',
        rating: 'Strong Buy',
        icon: '📊',
        reason: 'Strong fundamentals with high occupancy suggest reliable rental income potential.'
      });
    } else if (scores.affordability >= 80 && scores.occupancy >= 80) {
      recommendations.push({
        audience: 'Investors',
        rating: 'Value Play',
        icon: '📊',
        reason: 'Below-market pricing with solid occupancy offers value investment opportunity.'
      });
    }

    // For young professionals
    if (scores.income >= 70) {
      recommendations.push({
        audience: 'Young Professionals',
        rating: 'Recommended',
        icon: '💼',
        reason: 'High-income area suggests professional employment opportunities nearby.'
      });
    }

    // For retirees
    if (scores.safety >= 80 && scores.affordability >= 60) {
      recommendations.push({
        audience: 'Retirees',
        rating: 'Recommended',
        icon: '🏖️',
        reason: 'Safe and affordable with stable community indicators.'
      });
    }

    return recommendations;
  },

  /**
   * Build PDF content for single ZIP report
   */
  buildPDFContent: function(reportData, options) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>InSite Property Report - ${reportData.zipCode}</title>
  <style>
    ${this.getPDFStyles()}
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover-page">
    <div class="cover-content">
      <div class="logo">InSite</div>
      <div class="report-title">Property Intelligence Report</div>
      <div class="location-title">${reportData.zipCode} - ${reportData.city}</div>
      ${reportData.neighborhood ? `<div class="neighborhood">${reportData.neighborhood}</div>` : ''}
      <div class="report-date">Generated: ${new Date(reportData.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="report-badge">PREMIUM REPORT</div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="page">
    <div class="section-header">
      <h2>Executive Summary</h2>
    </div>
    
    <div class="score-overview">
      <div class="overall-score ${reportData.scores.grade.class}">
        <div class="score-number">${reportData.scores.overall}</div>
        <div class="score-grade">${reportData.scores.grade.letter}</div>
        <div class="score-label">Overall Score</div>
      </div>
      
      <div class="score-breakdown">
        ${reportData.scores.breakdown.map(s => `
          <div class="score-item">
            <div class="score-item-label">${s.name}</div>
            <div class="score-item-bar">
              <div class="score-item-fill" style="width: ${s.score}%; background: ${s.grade.color};"></div>
            </div>
            <div class="score-item-value" style="color: ${s.grade.color};">${s.score}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="key-metrics">
      <h3>Key Metrics</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">🏠</div>
          <div class="metric-value">${reportData.metrics.propertyValue.formatted}</div>
          <div class="metric-label">Avg Property Value</div>
          <div class="metric-percentile">${reportData.metrics.propertyValue.percentile}th percentile</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-value">${reportData.metrics.medianIncome.formatted}</div>
          <div class="metric-label">Median Income</div>
          <div class="metric-percentile">${reportData.metrics.medianIncome.percentile}th percentile</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-value">${reportData.metrics.population.formatted}</div>
          <div class="metric-label">Population</div>
          <div class="metric-percentile">${reportData.metrics.population.percentile}th percentile</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🛡️</div>
          <div class="metric-value">${reportData.metrics.crimeRate.safetyScore}/100</div>
          <div class="metric-label">Safety Score</div>
          <div class="metric-percentile">${reportData.metrics.crimeRate.rating}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Market Analysis -->
  <div class="page">
    <div class="section-header">
      <h2>Market Analysis</h2>
    </div>
    
    <div class="analysis-content">
      <div class="analysis-item">
        <h4>Market Position</h4>
        <p><strong>${reportData.marketAnalysis.marketPosition.toUpperCase()}</strong> - ${reportData.marketAnalysis.pricePoint}</p>
      </div>
      
      <div class="analysis-item">
        <h4>Demand Indicators</h4>
        <p>Vacancy Rate: ${reportData.marketAnalysis.demandIndicators.vacancyRate}%</p>
        <p>Market Strength: ${reportData.marketAnalysis.demandIndicators.marketStrength}</p>
        <p>Demand Level: ${reportData.marketAnalysis.demandIndicators.demandLevel}</p>
      </div>
      
      <div class="analysis-item">
        <h4>Safety Profile</h4>
        <p>Rating: ${reportData.marketAnalysis.safetyProfile.rating.toUpperCase()}</p>
        <p>Score: ${reportData.marketAnalysis.safetyProfile.score}/100</p>
      </div>
    </div>
  </div>

  <!-- Community & Mobility -->
  <div class="page">
    <div class="section-header">
      <h2>Community & Mobility</h2>
    </div>
    
    <div class="community-scores">
      <div class="community-score-card">
        <div class="community-icon">🚶</div>
        <div class="community-value">${reportData.communityData?.mobility?.walkScore || 'N/A'}</div>
        <div class="community-label">Walk Score</div>
      </div>
      <div class="community-score-card">
        <div class="community-icon">🚇</div>
        <div class="community-value">${reportData.communityData?.mobility?.transitScore || 'N/A'}</div>
        <div class="community-label">Transit Score</div>
      </div>
      <div class="community-score-card">
        <div class="community-icon">🚴</div>
        <div class="community-value">${reportData.communityData?.mobility?.bikeScore || 'N/A'}</div>
        <div class="community-label">Bike Score</div>
      </div>
      <div class="community-score-card">
        <div class="community-icon">🎓</div>
        <div class="community-value">${reportData.communityData?.schools?.score || 'N/A'}</div>
        <div class="community-label">Schools Score</div>
      </div>
    </div>
    
    ${reportData.communityData?.opportunityZone?.inOpportunityZone ? `
    <div class="opportunity-zone-badge">
      <div class="oz-icon">💰</div>
      <div class="oz-text">
        <strong>Federal Opportunity Zone</strong>
        <p>This area qualifies for Opportunity Zone tax benefits including capital gains deferral and potential exclusion.</p>
      </div>
    </div>
    ` : ''}
  </div>

  <!-- Insights & Recommendations -->
  <div class="page">
    <div class="section-header">
      <h2>Key Insights</h2>
    </div>
    
    <div class="insights-list">
      ${reportData.insights.map(i => `
        <div class="insight-card ${i.type}">
          <div class="insight-icon">${i.icon}</div>
          <div class="insight-content">
            <h4>${i.title}</h4>
            <p>${i.text}</p>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="section-header" style="margin-top: 2rem;">
      <h2>Recommendations by Audience</h2>
    </div>
    
    <div class="recommendations-grid">
      ${reportData.recommendations.map(r => `
        <div class="recommendation-card">
          <div class="rec-header">
            <span class="rec-icon">${r.icon}</span>
            <span class="rec-audience">${r.audience}</span>
            <span class="rec-rating ${r.rating.toLowerCase().replace(' ', '-')}">${r.rating}</span>
          </div>
          <p class="rec-reason">${r.reason}</p>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <p>This report was generated by InSite Property Intelligence. Data is sourced from public records and third-party providers.</p>
    <p>© ${new Date().getFullYear()} InSite. All rights reserved. Report ID: ${this.generateReportId()}</p>
  </div>
</body>
</html>`;

    return {
      html: html,
      title: `InSite Report - ${reportData.zipCode}`,
      filename: `insite-report-${reportData.zipCode}-${Date.now()}.pdf`
    };
  },

  /**
   * Get PDF styles
   */
  getPDFStyles: function() {
    return `
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { 
        font-family: 'Montserrat', -apple-system, sans-serif; 
        color: #1e293b; 
        line-height: 1.6;
        background: #fff;
      }
      
      .page { 
        page-break-after: always; 
        padding: 40px; 
        min-height: 100vh;
      }
      
      .cover-page {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .cover-content { max-width: 600px; }
      
      .logo {
        font-family: 'Playfair Display', serif;
        font-size: 64px;
        font-weight: 700;
        background: linear-gradient(135deg, #D4AF37, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
      }
      
      .report-title {
        font-size: 24px;
        color: #94a3b8;
        margin-bottom: 40px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      
      .location-title {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .neighborhood {
        font-size: 20px;
        color: #94a3b8;
        margin-bottom: 40px;
      }
      
      .report-date {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 30px;
      }
      
      .report-badge {
        display: inline-block;
        background: linear-gradient(135deg, #D4AF37, #f59e0b);
        color: #0f172a;
        padding: 8px 24px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 2px;
      }
      
      .section-header {
        border-bottom: 3px solid #6366f1;
        padding-bottom: 10px;
        margin-bottom: 30px;
      }
      
      .section-header h2 {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
        color: #1e293b;
      }
      
      .score-overview {
        display: flex;
        gap: 40px;
        margin-bottom: 40px;
        padding: 30px;
        background: #f8fafc;
        border-radius: 12px;
      }
      
      .overall-score {
        text-align: center;
        padding: 20px;
        min-width: 150px;
      }
      
      .score-number {
        font-size: 72px;
        font-weight: 800;
        line-height: 1;
      }
      
      .score-grade {
        font-size: 36px;
        font-weight: 700;
        margin-top: 5px;
      }
      
      .score-label {
        font-size: 14px;
        color: #64748b;
        margin-top: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .grade-a .score-number, .grade-a .score-grade { color: #10b981; }
      .grade-b .score-number, .grade-b .score-grade { color: #22c55e; }
      .grade-c .score-number, .grade-c .score-grade { color: #f59e0b; }
      .grade-d .score-number, .grade-d .score-grade { color: #f97316; }
      .grade-f .score-number, .grade-f .score-grade { color: #ef4444; }
      
      .score-breakdown { flex: 1; }
      
      .score-item {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 12px;
      }
      
      .score-item-label {
        width: 120px;
        font-weight: 600;
        font-size: 14px;
      }
      
      .score-item-bar {
        flex: 1;
        height: 12px;
        background: #e2e8f0;
        border-radius: 6px;
        overflow: hidden;
      }
      
      .score-item-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.3s;
      }
      
      .score-item-value {
        width: 40px;
        text-align: right;
        font-weight: 700;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      
      .metric-card {
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid #e2e8f0;
      }
      
      .metric-icon { font-size: 32px; margin-bottom: 10px; }
      .metric-value { font-size: 24px; font-weight: 700; color: #1e293b; }
      .metric-label { font-size: 12px; color: #64748b; margin-top: 5px; text-transform: uppercase; }
      .metric-percentile { font-size: 11px; color: #6366f1; margin-top: 5px; }
      
      .community-scores {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .community-score-card {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 25px;
        border-radius: 12px;
        text-align: center;
      }
      
      .community-icon { font-size: 32px; margin-bottom: 10px; }
      .community-value { font-size: 36px; font-weight: 800; }
      .community-label { font-size: 12px; opacity: 0.8; margin-top: 5px; }
      
      .opportunity-zone-badge {
        display: flex;
        align-items: center;
        gap: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 25px;
        border-radius: 12px;
      }
      
      .oz-icon { font-size: 48px; }
      .oz-text strong { font-size: 18px; display: block; margin-bottom: 5px; }
      .oz-text p { font-size: 14px; opacity: 0.9; }
      
      .insights-list { margin-bottom: 30px; }
      
      .insight-card {
        display: flex;
        gap: 20px;
        padding: 20px;
        margin-bottom: 15px;
        border-radius: 12px;
        border-left: 4px solid;
      }
      
      .insight-card.positive { background: #f0fdf4; border-color: #10b981; }
      .insight-card.warning { background: #fffbeb; border-color: #f59e0b; }
      .insight-card.neutral { background: #f8fafc; border-color: #6366f1; }
      
      .insight-icon { font-size: 24px; }
      .insight-content h4 { font-size: 16px; margin-bottom: 5px; }
      .insight-content p { font-size: 14px; color: #475569; }
      
      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
      
      .recommendation-card {
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      
      .rec-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      
      .rec-icon { font-size: 24px; }
      .rec-audience { font-weight: 700; flex: 1; }
      
      .rec-rating {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }
      
      .rec-rating.recommended { background: #dbeafe; color: #2563eb; }
      .rec-rating.highly-recommended { background: #d1fae5; color: #059669; }
      .rec-rating.strong-buy { background: #d1fae5; color: #059669; }
      .rec-rating.value-play { background: #fef3c7; color: #d97706; }
      
      .rec-reason { font-size: 14px; color: #475569; }
      
      .report-footer {
        text-align: center;
        padding: 30px;
        background: #f8fafc;
        font-size: 11px;
        color: #64748b;
      }
      
      .analysis-content { margin-bottom: 30px; }
      .analysis-item { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
      .analysis-item h4 { color: #6366f1; margin-bottom: 10px; }
      .analysis-item p { margin: 5px 0; }
      
      h3 { font-size: 18px; margin-bottom: 15px; color: #334155; }
    `;
  },

  // Utility functions
  formatCurrency: function(value) {
    if (!value) return '$0';
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return '$' + Math.round(value / 1000) + 'K';
    return '$' + value.toLocaleString();
  },

  formatNumber: function(value) {
    if (!value) return '0';
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return Math.round(value / 1000) + 'K';
    return value.toLocaleString();
  },

  formatMetricName: function(key) {
    const names = {
      affordability: 'Affordability',
      income: 'Income Level',
      safety: 'Safety',
      occupancy: 'Occupancy',
      investment: 'Investment'
    };
    return names[key] || key;
  },

  getGrade: function(score) {
    if (score >= 90) return { letter: 'A', color: '#10b981', class: 'grade-a' };
    if (score >= 80) return { letter: 'B', color: '#22c55e', class: 'grade-b' };
    if (score >= 70) return { letter: 'C', color: '#f59e0b', class: 'grade-c' };
    if (score >= 60) return { letter: 'D', color: '#f97316', class: 'grade-d' };
    return { letter: 'F', color: '#ef4444', class: 'grade-f' };
  },

  getCrimeRating: function(rate) {
    if (rate < 20) return 'Excellent';
    if (rate < 40) return 'Good';
    if (rate < 60) return 'Moderate';
    if (rate < 80) return 'Below Average';
    return 'High Risk';
  },

  getMarketStrength: function(vacancyRate) {
    if (vacancyRate < 5) return 'Very Strong';
    if (vacancyRate < 10) return 'Strong';
    if (vacancyRate < 15) return 'Moderate';
    return 'Weak';
  },

  getPricePoint: function(value) {
    if (value >= 500000) return 'Luxury ($500K+)';
    if (value >= 350000) return 'Upper Mid-Market ($350K-$500K)';
    if (value >= 250000) return 'Mid-Market ($250K-$350K)';
    if (value >= 150000) return 'Entry Level ($150K-$250K)';
    return 'Value Segment (<$150K)';
  },

  calculateVsMetroAvg: function(metric, value) {
    const allZips = window.allZipCodes || [];
    const values = allZips.map(z => window.zipData[z][metric]).filter(v => v > 0);
    if (values.length === 0) return { diff: 0, percent: '0%', direction: 'equal' };
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const diff = value - avg;
    const percent = ((diff / avg) * 100).toFixed(1);
    
    return {
      diff: diff,
      percent: (diff >= 0 ? '+' : '') + percent + '%',
      direction: diff > 0 ? 'above' : diff < 0 ? 'below' : 'equal'
    };
  },

  analyzeCompetition: function(zipCode, data) {
    // Simplified competitive analysis
    return {
      position: 'Competitive',
      strengths: ['Location', 'Safety'],
      considerations: ['Price point']
    };
  },

  assessInvestmentPotential: function(zipCode, data) {
    const occupancy = 100 - (data.housing_vacancy_rate || 0);
    const safety = 100 - (data.crime_rate || 0);
    
    if (occupancy >= 95 && safety >= 80) return { rating: 'Excellent', score: 90 };
    if (occupancy >= 90 && safety >= 70) return { rating: 'Good', score: 75 };
    if (occupancy >= 85 && safety >= 60) return { rating: 'Moderate', score: 60 };
    return { rating: 'Speculative', score: 40 };
  },

  compareToMetro: function(zipCode, data) {
    return {
      propertyValue: this.calculateVsMetroAvg('avg_value', data.avg_value),
      income: this.calculateVsMetroAvg('median_income', data.median_income),
      safety: this.calculateVsMetroAvg('crime_rate', data.crime_rate)
    };
  },

  compareToCity: function(zipCode, data, cityZips) {
    // Compare to same city ZIPs
    return { available: true, zipsCompared: cityZips.length };
  },

  compareToSimilar: function(zipCode, data) {
    // Find similar ZIPs by price range
    return { available: true };
  },

  getRankings: function(zipCode, data) {
    const allZips = window.allZipCodes || [];
    const sortedByValue = [...allZips].sort((a, b) => window.zipData[b].avg_value - window.zipData[a].avg_value);
    const sortedBySafety = [...allZips].sort((a, b) => window.zipData[a].crime_rate - window.zipData[b].crime_rate);
    
    return {
      propertyValue: sortedByValue.indexOf(zipCode) + 1,
      safety: sortedBySafety.indexOf(zipCode) + 1,
      total: allZips.length
    };
  },

  compareSafety: function(zipCode, data) {
    return { comparison: 'vs metro average' };
  },

  generateReportId: function() {
    return 'RPT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  },

  // Compare functions for comparison reports
  compareMetrics: function(zipCodes) {
    return zipCodes.map(z => ({
      zip: z,
      metrics: this.calculateMetrics(z, window.zipData[z])
    }));
  },

  compareScores: function(zipCodes) {
    return zipCodes.map(z => ({
      zip: z,
      scores: this.calculateScores(z, window.zipData[z])
    }));
  },

  generateRankings: function(zipCodes) {
    const metrics = ['avg_value', 'median_income', 'crime_rate', 'housing_vacancy_rate'];
    const rankings = {};
    
    metrics.forEach(metric => {
      const sorted = [...zipCodes].sort((a, b) => {
        const higherBetter = !['crime_rate', 'housing_vacancy_rate'].includes(metric);
        return higherBetter ? 
          window.zipData[b][metric] - window.zipData[a][metric] :
          window.zipData[a][metric] - window.zipData[b][metric];
      });
      rankings[metric] = sorted;
    });
    
    return rankings;
  },

  generateComparisonAnalysis: function(zipCodes) {
    return { summary: `Comparing ${zipCodes.length} locations` };
  },

  generateComparisonRecommendations: function(zipCodes) {
    return zipCodes.map(z => ({
      zip: z,
      recommendation: 'See individual analysis'
    }));
  },

  // Market report functions
  calculateMarketOverview: function(allZips) {
    const values = allZips.map(z => window.zipData[z].avg_value).filter(v => v > 0);
    const incomes = allZips.map(z => window.zipData[z].median_income).filter(v => v > 0);
    const populations = allZips.map(z => window.zipData[z].population).filter(v => v > 0);
    
    return {
      avgPropertyValue: values.reduce((a, b) => a + b, 0) / values.length,
      avgIncome: incomes.reduce((a, b) => a + b, 0) / incomes.length,
      totalPopulation: populations.reduce((a, b) => a + b, 0),
      zipCount: allZips.length
    };
  },

  calculateDistributions: function(allZips) {
    return { available: true };
  },

  identifyTopPerformers: function(allZips) {
    return allZips
      .map(z => ({ zip: z, value: window.zipData[z].avg_value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  },

  analyzeMarketTrends: function(allZips) {
    return { trend: 'stable' };
  },

  segmentMarket: function(allZips) {
    return { segments: ['luxury', 'mid-market', 'value'] };
  },

  identifyOpportunities: function(allZips) {
    return [];
  },

  buildComparisonPDF: function(reportData, options) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>InSite Comparison Report</title>
  <style>
    ${this.getPDFStyles()}
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover-page">
    <div class="cover-content">
      <div class="logo">InSite</div>
      <div class="report-title">Comparison Report</div>
      <div class="location-title">${reportData.zipCodes.length} Neighborhoods</div>
      <div class="neighborhood">${reportData.locations.map(l => l.zip + ' - ' + l.city).join(' vs ')}</div>
      <div class="report-date">Generated: ${new Date(reportData.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="report-badge">COMPARISON REPORT</div>
    </div>
  </div>

  <!-- Comparison Summary -->
  <div class="page">
    <div class="section-header">
      <h2>Comparison Summary</h2>
    </div>
    
    <div class="metrics-grid" style="grid-template-columns: repeat(${Math.min(reportData.zipCodes.length, 3)}, 1fr);">
      ${reportData.scoresComparison.map(item => `
        <div class="metric-card">
          <div class="metric-icon">📍</div>
          <div class="metric-value">${item.zip}</div>
          <div class="metric-label">${item.scores.grade.letter} Grade</div>
          <div class="metric-percentile">Overall: ${item.scores.overall}/100</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <p>This report was generated by InSite Property Intelligence.</p>
    <p>© ${new Date().getFullYear()} InSite. Report ID: ${this.generateReportId()}</p>
  </div>
</body>
</html>`;
    return { html: html, title: 'Comparison Report', filename: `insite-comparison-${Date.now()}.pdf` };
  },

  buildMarketPDF: function(reportData, options) {
    return { html: '', title: 'Market Report', filename: 'market.pdf' };
  },

  /**
   * Download report as PDF using html2canvas and jsPDF
   */
  downloadPDF: async function(zipCode) {
    const report = await this.generateZipReport(zipCode);
    if (!report) {
      alert('Unable to generate report');
      return;
    }

    // Show loading state
    if (typeof showToast === 'function') {
      showToast('Generating PDF... Please wait.', 'info');
    }

    // Create a hidden iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 800px; height: 1200px;';
    document.body.appendChild(iframe);
    
    iframe.contentDocument.write(report.html);
    iframe.contentDocument.close();

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Check if jsPDF is available, if not load it dynamically
      if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        await this.loadJsPDF();
      }

      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Get the data from the report
      const data = window.zipData?.[zipCode];
      const scores = this.calculateScores(zipCode, data);
      const metrics = this.calculateMetrics(zipCode, data);
      
      // Colors
      const primaryColor = [99, 102, 241]; // Indigo
      const goldColor = [212, 175, 55]; // Gold
      const darkColor = [15, 23, 42]; // Dark
      const grayColor = [100, 116, 139];
      
      // ============= COVER PAGE =============
      // Background
      pdf.setFillColor(...darkColor);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Logo
      pdf.setTextColor(...goldColor);
      pdf.setFontSize(48);
      pdf.setFont('helvetica', 'bold');
      pdf.text('InSite', pageWidth / 2, 80, { align: 'center' });
      
      // Subtitle
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Property Intelligence Report', pageWidth / 2, 95, { align: 'center' });
      
      // Location
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${zipCode} - ${data?.city || 'Atlanta Area'}`, pageWidth / 2, 130, { align: 'center' });
      
      if (data?.neighborhood) {
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(12);
        pdf.text(data.neighborhood, pageWidth / 2, 142, { align: 'center' });
      }
      
      // Date
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 170, { align: 'center' });
      
      // Badge
      pdf.setFillColor(...goldColor);
      pdf.roundedRect(pageWidth / 2 - 30, 185, 60, 10, 2, 2, 'F');
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PREMIUM REPORT', pageWidth / 2, 192, { align: 'center' });
      
      // ============= EXECUTIVE SUMMARY PAGE =============
      pdf.addPage();
      
      // Header
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Section title
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(1);
      pdf.line(margin, 25, pageWidth - margin, 25);
      
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', margin, 20);
      
      // Overall Score Box
      const scoreColor = this.getScoreColor(scores.overall);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, 35, 50, 50, 5, 5, 'F');
      
      pdf.setTextColor(...scoreColor);
      pdf.setFontSize(36);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(scores.overall), margin + 25, 60, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(scores.grade.letter, margin + 25, 75, { align: 'center' });
      
      pdf.setTextColor(...grayColor);
      pdf.setFontSize(8);
      pdf.text('OVERALL SCORE', margin + 25, 82, { align: 'center' });
      
      // Score Breakdown
      let yPos = 40;
      const barStartX = 75;
      const barWidth = 100;
      
      scores.breakdown.forEach((item, index) => {
        const itemY = yPos + (index * 12);
        
        // Label
        pdf.setTextColor(...darkColor);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.name, barStartX, itemY + 3);
        
        // Background bar
        pdf.setFillColor(226, 232, 240);
        pdf.roundedRect(barStartX, itemY + 5, barWidth, 4, 2, 2, 'F');
        
        // Score bar
        const barColor = this.getScoreColor(item.score);
        pdf.setFillColor(...barColor);
        pdf.roundedRect(barStartX, itemY + 5, (item.score / 100) * barWidth, 4, 2, 2, 'F');
        
        // Score value
        pdf.setTextColor(...barColor);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(item.score), barStartX + barWidth + 5, itemY + 8);
      });
      
      // Key Metrics Section
      yPos = 100;
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Metrics', margin, yPos);
      
      yPos += 10;
      const metricsData = [
        { icon: '🏠', label: 'Avg Property Value', value: metrics.propertyValue.formatted, sub: `${metrics.propertyValue.percentile}th percentile` },
        { icon: '💰', label: 'Median Income', value: metrics.medianIncome.formatted, sub: `${metrics.medianIncome.percentile}th percentile` },
        { icon: '👥', label: 'Population', value: metrics.population.formatted, sub: `${metrics.population.percentile}th percentile` },
        { icon: '🛡️', label: 'Safety Score', value: `${metrics.crimeRate.safetyScore}/100`, sub: metrics.crimeRate.rating }
      ];
      
      const cardWidth = (contentWidth - 15) / 2;
      metricsData.forEach((metric, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const cardX = margin + (col * (cardWidth + 5));
        const cardY = yPos + (row * 35);
        
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(cardX, cardY, cardWidth, 30, 3, 3, 'F');
        
        pdf.setFontSize(16);
        pdf.text(metric.icon, cardX + 5, cardY + 12);
        
        pdf.setTextColor(...darkColor);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(metric.value, cardX + 20, cardY + 12);
        
        pdf.setTextColor(...grayColor);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(metric.label, cardX + 20, cardY + 20);
        
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(7);
        pdf.text(metric.sub, cardX + 20, cardY + 26);
      });
      
      // ============= INSIGHTS PAGE =============
      pdf.addPage();
      
      // Header
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(1);
      pdf.line(margin, 25, pageWidth - margin, 25);
      
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights & Recommendations', margin, 20);
      
      // Generate insights
      const insights = this.generateInsights(zipCode, data);
      yPos = 35;
      
      insights.forEach((insight, index) => {
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          yPos = 30;
        }
        
        const bgColor = insight.type === 'positive' ? [240, 253, 244] : 
                        insight.type === 'warning' ? [255, 251, 235] : [248, 250, 252];
        const borderColor = insight.type === 'positive' ? [16, 185, 129] : 
                           insight.type === 'warning' ? [245, 158, 11] : [99, 102, 241];
        
        pdf.setFillColor(...bgColor);
        pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
        
        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(1);
        pdf.line(margin, yPos, margin, yPos + 25);
        
        pdf.setFontSize(12);
        pdf.text(insight.icon, margin + 5, yPos + 10);
        
        pdf.setTextColor(...darkColor);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(insight.title, margin + 15, yPos + 10);
        
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        // Word wrap the text
        const splitText = pdf.splitTextToSize(insight.text, contentWidth - 20);
        pdf.text(splitText, margin + 15, yPos + 18);
        
        yPos += 30;
      });
      
      // Recommendations
      yPos += 10;
      if (yPos > pageHeight - 80) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Audience Recommendations', margin, yPos);
      yPos += 10;
      
      const recommendations = this.generateRecommendations(zipCode, data);
      recommendations.forEach((rec, index) => {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 30;
        }
        
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
        
        pdf.setFontSize(12);
        pdf.text(rec.icon, margin + 5, yPos + 10);
        
        pdf.setTextColor(...darkColor);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(rec.audience, margin + 20, yPos + 8);
        
        // Rating badge
        const ratingColor = rec.rating.includes('Highly') || rec.rating.includes('Strong') ? [16, 185, 129] : [37, 99, 235];
        pdf.setFillColor(...ratingColor);
        pdf.roundedRect(margin + 80, yPos + 3, 30, 8, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.text(rec.rating, margin + 95, yPos + 8, { align: 'center' });
        
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(rec.reason, margin + 20, yPos + 16);
        
        yPos += 25;
      });
      
      // ============= FOOTER ON LAST PAGE =============
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      pdf.setTextColor(...grayColor);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This report was generated by InSite Property Intelligence. Data is sourced from public records.', pageWidth / 2, pageHeight - 12, { align: 'center' });
      pdf.text(`© ${new Date().getFullYear()} InSite. Report ID: ${this.generateReportId()}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
      
      // Save the PDF
      const filename = `InSite-Report-${zipCode}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      if (typeof showToast === 'function') {
        showToast(`Report downloaded: ${filename}`, 'success');
      }
      
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to print method
      this.printReport(zipCode);
    } finally {
      document.body.removeChild(iframe);
    }
  },
  
  /**
   * Get color array based on score
   */
  getScoreColor: function(score) {
    if (score >= 90) return [16, 185, 129];  // Green
    if (score >= 80) return [34, 197, 94];   // Light green
    if (score >= 70) return [245, 158, 11];  // Yellow
    if (score >= 60) return [249, 115, 22];  // Orange
    return [239, 68, 68];                     // Red
  },
  
  /**
   * Load jsPDF library dynamically
   */
  loadJsPDF: function() {
    return new Promise((resolve, reject) => {
      if (window.jspdf || window.jsPDF) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        console.log('jsPDF loaded successfully');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.head.appendChild(script);
    });
  },

  /**
   * Print/download the report (legacy method, now calls downloadPDF)
   */
  printReport: async function(zipCode) {
    // Try to download as PDF first
    try {
      await this.downloadPDF(zipCode);
    } catch (error) {
      console.error('PDF download failed, falling back to print:', error);
      
      // Fallback to print window
      const report = await this.generateZipReport(zipCode);
      if (!report) {
        alert('Unable to generate report');
        return;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(report.html);
      printWindow.document.close();
      
      printWindow.onload = function() {
        printWindow.print();
      };
    }
  }
};

// Make available globally
window.ReportGenerator = ReportGenerator;
