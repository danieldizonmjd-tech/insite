/**
 * INSITE True Cost Engine
 * Calculates the REAL monthly cost of living in a neighborhood
 * by combining housing, commute, taxes, and insurance.
 *
 * This is a FREE feature - nobody else combines these into one number.
 */

class TrueCostEngine {
  constructor() {
    // Major Atlanta employment centers
    this.EMPLOYMENT_CENTERS = [
      { id: 'downtown', name: 'Downtown Atlanta', lat: 33.749, lng: -84.388, icon: 'fa-city' },
      { id: 'midtown', name: 'Midtown', lat: 33.784, lng: -84.383, icon: 'fa-building' },
      { id: 'buckhead', name: 'Buckhead', lat: 33.838, lng: -84.379, icon: 'fa-gem' },
      { id: 'perimeter', name: 'Perimeter Center', lat: 33.927, lng: -84.341, icon: 'fa-ring' },
      { id: 'airport', name: 'Hartsfield-Jackson Airport', lat: 33.641, lng: -84.428, icon: 'fa-plane' },
      { id: 'gatech', name: 'Georgia Tech / West Midtown', lat: 33.775, lng: -84.397, icon: 'fa-university' },
      { id: 'emory', name: 'Emory / CDC', lat: 33.793, lng: -84.324, icon: 'fa-hospital' },
      { id: 'marietta', name: 'Marietta / Cobb', lat: 33.952, lng: -84.549, icon: 'fa-map-marker-alt' },
      { id: 'lawrenceville', name: 'Lawrenceville / Gwinnett', lat: 33.956, lng: -83.988, icon: 'fa-map-marker-alt' },
      { id: 'alpharetta', name: 'Alpharetta / North Fulton', lat: 34.075, lng: -84.294, icon: 'fa-map-marker-alt' }
    ];

    // Georgia county millage rates (property tax per $1000 of assessed value)
    // Assessed value in GA = 40% of fair market value
    this.MILLAGE_RATES = {
      'Fulton': 34.2,
      'DeKalb': 44.1,
      'Gwinnett': 29.8,
      'Cobb': 30.5,
      'Clayton': 33.7,
      'Cherokee': 28.4,
      'Forsyth': 24.1,
      'Henry': 31.2,
      'Douglas': 32.8,
      'Fayette': 27.3,
      'Rockdale': 34.0,
      'Newton': 33.5,
      'default': 32.0
    };

    // City-to-county mapping for tax calculation
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
      'Conyers': 'Rockdale',
      'Covington': 'Newton'
    };

    // Current mortgage rate
    this.MORTGAGE_RATE = 0.068; // 6.8% - update periodically
    this.INSURANCE_RATE = 0.004; // 0.4% of home value annually
    this.GAS_PRICE = 3.20; // $/gallon
    this.MPG = 27; // average fuel economy
    this.PARKING_MONTHLY = 150; // average downtown parking
    this.MARTA_PASS = 95; // monthly MARTA pass
    this.WORKING_DAYS = 20; // per month
  }

  /**
   * Get the county for a city name
   */
  getCounty(city) {
    return this.CITY_COUNTY[city] || null;
  }

  /**
   * Get the millage rate for property tax calculation
   */
  getMillageRate(city) {
    const county = this.getCounty(city);
    return this.MILLAGE_RATES[county] || this.MILLAGE_RATES['default'];
  }

  /**
   * Calculate monthly property tax (Georgia-specific)
   * Georgia assesses at 40% of fair market value
   */
  calculatePropertyTax(homeValue, city) {
    const millageRate = this.getMillageRate(city);
    const assessedValue = homeValue * 0.40;
    const annualTax = (assessedValue / 1000) * millageRate;
    return annualTax / 12;
  }

  /**
   * Calculate monthly mortgage payment (P&I only)
   */
  calculateMortgage(homeValue, downPaymentPct = 20) {
    const principal = homeValue * (1 - downPaymentPct / 100);
    const monthlyRate = this.MORTGAGE_RATE / 12;
    const payments = 360; // 30 years
    if (principal <= 0) return 0;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
  }

  /**
   * Estimate monthly rent from home value
   * Using price-to-rent ratio (typically 15-20x in Atlanta)
   */
  estimateRent(homeValue) {
    const priceToRentRatio = 17; // Atlanta average
    return Math.round(homeValue / priceToRentRatio / 12);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimate drive time in minutes based on distance
   * Uses weighted speed: city streets ~25 mph, mixed ~35 mph for Atlanta traffic
   */
  estimateDriveTime(distanceMiles) {
    if (distanceMiles < 5) return Math.round(distanceMiles * 60 / 20); // city speed
    if (distanceMiles < 15) return Math.round(distanceMiles * 60 / 28); // mixed
    return Math.round(distanceMiles * 60 / 32); // highway-ish with ATL traffic
  }

  /**
   * Estimate transit time using nearest MARTA station data
   */
  estimateTransitTime(zipData, workplace) {
    // Check if transit helper exists and ZIP has station nearby
    if (typeof TransitHelper !== 'undefined') {
      const transitHelper = new TransitHelper();
      const score = transitHelper.calculateTransitScore(zipData.lat, zipData.lng);
      if (score && score.score >= 30) {
        const stationDistance = score.nearestStation ? score.nearestStation.distance : null;
        if (stationDistance && stationDistance < 2) {
          const walkToStation = Math.round(stationDistance * 20); // 20 min/mile walking
          // Estimate MARTA ride time: avg 30 mph + stops
          const wpDistance = this.haversineDistance(
            score.nearestStation.lat || zipData.lat,
            score.nearestStation.lng || zipData.lng,
            workplace.lat, workplace.lng
          );
          const rideTime = Math.round(wpDistance * 60 / 25); // MARTA avg speed w/ stops
          const waitTime = 8; // average wait
          return { total: walkToStation + waitTime + rideTime, walkToStation, waitTime, rideTime, station: score.nearestStation.name, line: score.nearestStation.line || '' };
        }
      }
    }
    return null;
  }

  /**
   * Calculate the TRUE monthly cost of living in a ZIP
   */
  calculateTrueCost(zip, workplaceId, mode = 'buy') {
    if (!zipData || !zipData[zip]) return null;

    const data = zipData[zip];
    const workplace = this.EMPLOYMENT_CENTERS.find(ec => ec.id === workplaceId) || this.EMPLOYMENT_CENTERS[0];
    const distance = this.haversineDistance(data.lat, data.lng, workplace.lat, workplace.lng);

    // --- Housing Cost ---
    let housingMonthly = 0;
    let mortgagePayment = 0;
    let propertyTax = 0;
    let insurance = 0;
    let rentEstimate = 0;

    if (mode === 'buy') {
      mortgagePayment = this.calculateMortgage(data.avg_value);
      propertyTax = this.calculatePropertyTax(data.avg_value, data.city);
      insurance = (data.avg_value * this.INSURANCE_RATE) / 12;
      housingMonthly = mortgagePayment + propertyTax + insurance;
    } else {
      rentEstimate = this.estimateRent(data.avg_value);
      housingMonthly = rentEstimate;
    }

    // --- Commute Cost ---
    const driveTime = this.estimateDriveTime(distance);
    const driveGasCostDaily = (distance * 2 / this.MPG) * this.GAS_PRICE;
    const driveMonthly = (driveGasCostDaily * this.WORKING_DAYS) + this.PARKING_MONTHLY;

    const transit = this.estimateTransitTime(data, workplace);
    const transitMonthly = this.MARTA_PASS;

    // Choose cheapest commute option that's available
    let commuteMonthly = driveMonthly;
    let commuteMode = 'drive';
    let commuteTime = driveTime;

    if (transit && transitMonthly < driveMonthly) {
      commuteMonthly = transitMonthly;
      commuteMode = 'transit';
      commuteTime = transit.total;
    }

    // --- Total ---
    const totalMonthly = housingMonthly + commuteMonthly;
    const affordabilityRatio = data.median_income > 0 ? (totalMonthly * 12 / data.median_income) : null;

    return {
      zip,
      workplace: workplace.name,
      mode,
      housing: {
        total: Math.round(housingMonthly),
        mortgage: Math.round(mortgagePayment),
        propertyTax: Math.round(propertyTax),
        insurance: Math.round(insurance),
        rent: Math.round(rentEstimate)
      },
      commute: {
        total: Math.round(commuteMonthly),
        mode: commuteMode,
        time: commuteTime,
        distance: Math.round(distance * 10) / 10,
        driveMonthly: Math.round(driveMonthly),
        transitMonthly: transit ? transitMonthly : null,
        transitDetails: transit
      },
      totalMonthly: Math.round(totalMonthly),
      affordabilityRatio: affordabilityRatio ? Math.round(affordabilityRatio * 100) / 100 : null,
      affordabilityLabel: this.getAffordabilityLabel(affordabilityRatio)
    };
  }

  /**
   * Get affordability label based on cost-to-income ratio
   */
  getAffordabilityLabel(ratio) {
    if (!ratio) return 'N/A';
    if (ratio <= 0.28) return 'Very Affordable';
    if (ratio <= 0.36) return 'Affordable';
    if (ratio <= 0.50) return 'Moderate';
    if (ratio <= 0.65) return 'Stretched';
    return 'Cost-Burdened';
  }

  /**
   * Calculate metro-wide average true cost for a workplace
   */
  calculateMetroAverage(workplaceId, mode = 'buy') {
    if (!allZipCodes || allZipCodes.length === 0) return null;

    let totalCost = 0;
    let count = 0;

    allZipCodes.forEach(zip => {
      const result = this.calculateTrueCost(zip, workplaceId, mode);
      if (result && result.totalMonthly > 0 && result.totalMonthly < 20000) {
        totalCost += result.totalMonthly;
        count++;
      }
    });

    return count > 0 ? Math.round(totalCost / count) : null;
  }

  /**
   * Rank all ZIPs by true cost for a given workplace
   */
  rankByTrueCost(workplaceId, mode = 'buy', limit = 10) {
    const results = allZipCodes
      .map(zip => this.calculateTrueCost(zip, workplaceId, mode))
      .filter(r => r && r.totalMonthly > 0)
      .sort((a, b) => a.totalMonthly - b.totalMonthly);

    return limit ? results.slice(0, limit) : results;
  }
}

// Global instance
const trueCostEngine = new TrueCostEngine();
