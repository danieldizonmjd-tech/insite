/**
 * INSITE Commute Intelligence
 * Multi-modal commute analysis using MARTA GTFS data, distance calculations,
 * and bike infrastructure data.
 *
 * FREE: Top 3 nearest employment centers
 * PRO: Full matrix, custom locations, commute-adjusted salary
 */

class CommuteIntelligence {
  constructor() {
    // Major Atlanta metro employment centers
    this.EMPLOYMENT_CENTERS = [
      { id: 'downtown',      name: 'Downtown Atlanta',     lat: 33.749, lng: -84.388, icon: 'fa-city',           jobs: '~80K' },
      { id: 'midtown',       name: 'Midtown',              lat: 33.784, lng: -84.383, icon: 'fa-building',       jobs: '~100K' },
      { id: 'buckhead',      name: 'Buckhead',             lat: 33.838, lng: -84.379, icon: 'fa-gem',            jobs: '~75K' },
      { id: 'perimeter',     name: 'Perimeter Center',     lat: 33.927, lng: -84.341, icon: 'fa-ring',           jobs: '~90K' },
      { id: 'airport',       name: 'Hartsfield-Jackson',   lat: 33.641, lng: -84.428, icon: 'fa-plane',          jobs: '~63K' },
      { id: 'gatech',        name: 'GA Tech / West Midtown', lat: 33.775, lng: -84.397, icon: 'fa-university',  jobs: '~30K' },
      { id: 'emory',         name: 'Emory / CDC',          lat: 33.793, lng: -84.324, icon: 'fa-hospital',       jobs: '~35K' },
      { id: 'marietta',      name: 'Marietta / Cobb',      lat: 33.952, lng: -84.549, icon: 'fa-map-marker-alt', jobs: '~50K' },
      { id: 'lawrenceville', name: 'Lawrenceville',        lat: 33.956, lng: -83.988, icon: 'fa-map-marker-alt', jobs: '~25K' },
      { id: 'alpharetta',    name: 'Alpharetta / N. Fulton', lat: 34.075, lng: -84.294, icon: 'fa-map-marker-alt', jobs: '~65K' }
    ];

    this.GAS_PRICE = 3.20;
    this.MPG = 27;
    this.PARKING_MONTHLY = 150; // downtown avg
    this.MARTA_MONTHLY = 95;
    this.WORKING_DAYS = 20;
  }

  /**
   * Haversine distance between two coordinates (miles)
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Estimate drive time considering Atlanta traffic patterns
   */
  estimateDriveTime(distanceMiles) {
    // Atlanta has notoriously bad traffic
    if (distanceMiles < 3) return Math.round(distanceMiles * 60 / 18); // city streets
    if (distanceMiles < 8) return Math.round(distanceMiles * 60 / 22); // inner city
    if (distanceMiles < 20) return Math.round(distanceMiles * 60 / 28); // mixed
    return Math.round(distanceMiles * 60 / 35); // highway-ish
  }

  /**
   * Estimate transit commute using nearest MARTA station
   */
  estimateTransit(fromLat, fromLng, toLat, toLng) {
    // Check if TransitHelper is available for station data
    if (typeof TransitHelper !== 'undefined') {
      try {
        const helper = new TransitHelper();
        const result = helper.calculateTransitScore(fromLat, fromLng);
        if (result && result.nearestStation && result.nearestStation.distance < 2.5) {
          const walkToStation = Math.round(result.nearestStation.distance * 18); // ~18 min/mile walk
          const waitTime = 8; // average MARTA headway
          // Estimate ride time based on distance
          const stationToWorkDist = this.haversineDistance(
            result.nearestStation.lat || fromLat,
            result.nearestStation.lng || fromLng,
            toLat, toLng
          );
          const rideTime = Math.round(stationToWorkDist * 60 / 25); // MARTA avg ~25mph with stops
          return {
            available: true,
            totalMinutes: walkToStation + waitTime + rideTime,
            walkToStation,
            waitTime,
            rideTime,
            station: result.nearestStation.name,
            line: result.nearestStation.line || 'MARTA',
            stationDistance: Math.round(result.nearestStation.distance * 10) / 10
          };
        }
      } catch (e) {
        // TransitHelper not fully initialized
      }
    }

    // Fallback: estimate based on distance from MARTA core
    const distToMARTA = this.haversineDistance(fromLat, fromLng, 33.749, -84.388);
    if (distToMARTA < 8) {
      // Likely near a MARTA station
      const totalDist = this.haversineDistance(fromLat, fromLng, toLat, toLng);
      return {
        available: true,
        totalMinutes: Math.round(totalDist * 60 / 18), // slower estimate
        walkToStation: 10,
        waitTime: 8,
        rideTime: Math.round(totalDist * 60 / 25),
        station: 'Nearest MARTA',
        line: 'MARTA',
        stationDistance: null
      };
    }

    return { available: false };
  }

  /**
   * Check if biking is feasible and estimate time
   */
  estimateBike(distanceMiles, zip) {
    if (distanceMiles > 12) return { feasible: false, reason: 'Too far (>12 mi)' };

    // Check bike infrastructure if available
    let bikeScore = 30; // default
    if (typeof CommunityHelper !== 'undefined' && zipData[zip]) {
      try {
        const ch = new CommunityHelper();
        const score = ch.calculateBikeScore(zipData[zip].lat, zipData[zip].lng);
        bikeScore = score.score;
      } catch (e) {}
    }

    if (distanceMiles > 8 && bikeScore < 40) {
      return { feasible: false, reason: 'Limited bike infrastructure' };
    }

    return {
      feasible: true,
      minutes: Math.round(distanceMiles * 5), // ~12 mph average
      monthlyCost: 0,
      bikeScore
    };
  }

  /**
   * Analyze commute from a ZIP to a workplace
   */
  analyzeCommute(zip, workplaceId) {
    const data = zipData[zip];
    if (!data || !data.lat || !data.lng) return null;

    const workplace = typeof workplaceId === 'object' ? workplaceId :
      this.EMPLOYMENT_CENTERS.find(ec => ec.id === workplaceId);
    if (!workplace) return null;

    const distance = this.haversineDistance(data.lat, data.lng, workplace.lat, workplace.lng);

    // Drive analysis
    const driveMinutes = this.estimateDriveTime(distance);
    const dailyGasCost = (distance * 2 / this.MPG) * this.GAS_PRICE;
    const driveMonthly = Math.round(dailyGasCost * this.WORKING_DAYS + this.PARKING_MONTHLY);

    // Transit analysis
    const transit = this.estimateTransit(data.lat, data.lng, workplace.lat, workplace.lng);

    // Bike analysis
    const bike = this.estimateBike(distance, zip);

    // Determine best mode
    let bestMode = 'drive';
    let bestTime = driveMinutes;
    let bestCost = driveMonthly;

    if (transit.available && this.MARTA_MONTHLY < driveMonthly) {
      bestMode = 'transit';
      bestTime = transit.totalMinutes;
      bestCost = this.MARTA_MONTHLY;
    }
    if (bike.feasible && bike.minutes < bestTime * 1.3 && distance < 6) {
      bestMode = 'bike';
      bestTime = bike.minutes;
      bestCost = 0;
    }

    const annualSavings = (driveMonthly - bestCost) * 12;

    return {
      zip,
      workplace: workplace.name,
      workplaceId: workplace.id,
      distance: Math.round(distance * 10) / 10,
      drive: {
        minutes: driveMinutes,
        monthlyCost: driveMonthly,
        dailyCost: Math.round(dailyGasCost * 100) / 100
      },
      transit: transit.available ? {
        minutes: transit.totalMinutes,
        monthlyCost: this.MARTA_MONTHLY,
        station: transit.station,
        line: transit.line,
        walkToStation: transit.walkToStation,
        stationDistance: transit.stationDistance
      } : null,
      bike: bike.feasible ? {
        minutes: bike.minutes,
        monthlyCost: 0,
        bikeScore: bike.bikeScore
      } : null,
      best: {
        mode: bestMode,
        minutes: bestTime,
        monthlyCost: bestCost
      },
      annualSavings: Math.max(0, annualSavings)
    };
  }

  /**
   * Build full commute matrix for a ZIP against all employment centers
   */
  buildCommuteMatrix(zip, limit = null) {
    const results = this.EMPLOYMENT_CENTERS.map(ec => this.analyzeCommute(zip, ec.id))
      .filter(r => r !== null)
      .sort((a, b) => a.distance - b.distance);

    return limit ? results.slice(0, limit) : results;
  }

  /**
   * Get top 3 nearest employment centers (FREE tier)
   */
  getTopNearestCommutes(zip) {
    return this.buildCommuteMatrix(zip, 3);
  }

  /**
   * Calculate commute-adjusted salary (PRO)
   */
  commuteAdjustedSalary(zip, workplaceId, annualSalary) {
    const commute = this.analyzeCommute(zip, workplaceId);
    if (!commute) return null;

    const annualCommuteCost = commute.best.monthlyCost * 12;
    const hoursCommutePerYear = (commute.best.minutes * 2 * this.WORKING_DAYS * 12) / 60;
    const hourlyRate = annualSalary / 2080; // 40hr weeks
    const timeValue = hoursCommutePerYear * hourlyRate;

    return {
      grossSalary: annualSalary,
      commuteCost: Math.round(annualCommuteCost),
      commuteTimeValue: Math.round(timeValue),
      adjustedSalary: Math.round(annualSalary - annualCommuteCost),
      effectiveHourlyRate: Math.round((annualSalary - annualCommuteCost) / 2080 * 100) / 100,
      hoursCommutingPerYear: Math.round(hoursCommutePerYear)
    };
  }

  /**
   * Rank ZIPs by commute friendliness to a specific workplace
   */
  rankByCommute(workplaceId, limit = 10) {
    return allZipCodes
      .map(zip => this.analyzeCommute(zip, workplaceId))
      .filter(r => r !== null)
      .sort((a, b) => a.best.monthlyCost - b.best.monthlyCost)
      .slice(0, limit);
  }
}

// Global instance
const commuteIntelligence = new CommuteIntelligence();
