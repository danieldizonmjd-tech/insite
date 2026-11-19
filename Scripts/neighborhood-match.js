/**
 * INSITE AI Neighborhood Match
 * "Dating app for neighborhoods" - matches user preferences against all ZIP codes.
 *
 * FREE: Top 5 matches with basic preset profiles
 * PRO: Full ranking, custom weighting, saved profiles, export
 */

class NeighborhoodMatch {
  constructor() {
    this.PRESETS = {
      family: {
        name: 'Family-Friendly',
        icon: 'fa-home',
        weights: { safety: 9, schools: 9, greenSpace: 7, affordability: 7, transit: 4, nightlife: 2, investment: 3, commute: 5 }
      },
      professional: {
        name: 'Young Professional',
        icon: 'fa-briefcase',
        weights: { safety: 6, schools: 2, greenSpace: 4, affordability: 6, transit: 8, nightlife: 8, investment: 5, commute: 9 }
      },
      investor: {
        name: 'Investor',
        icon: 'fa-chart-line',
        weights: { safety: 4, schools: 3, greenSpace: 2, affordability: 8, transit: 5, nightlife: 3, investment: 10, commute: 2 }
      },
      retiree: {
        name: 'Retiree',
        icon: 'fa-umbrella-beach',
        weights: { safety: 10, schools: 1, greenSpace: 9, affordability: 8, transit: 3, nightlife: 2, investment: 4, commute: 1 }
      }
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

  /**
   * Score a ZIP on a single dimension (0-100)
   */
  scoreDimension(zip, dimension) {
    const data = zipData[zip];
    if (!data) return 50;

    switch (dimension) {
      case 'safety': {
        const crimeRate = data.crime_rate || 0;
        return Math.max(0, Math.min(100, 100 - crimeRate));
      }

      case 'schools': {
        // Use school score if community helper available
        if (typeof CommunityHelper !== 'undefined' && data.lat && data.lng) {
          try {
            const ch = new CommunityHelper();
            const result = ch.calculateSchoolScore(data.lat, data.lng);
            return result.score || 50;
          } catch (e) {}
        }
        // Fallback: use education levels as proxy
        if (data.education_levels && typeof data.education_levels === 'string') {
          const match = data.education_levels.match(/(\d+)/);
          if (match) return Math.min(100, parseInt(match[1]) * 1.5);
        }
        return 50;
      }

      case 'greenSpace': {
        if (typeof ParksHelper !== 'undefined' && data.lat && data.lng) {
          try {
            const ph = new ParksHelper();
            const result = ph.calculateParksScore(data.lat, data.lng);
            return result.score || 40;
          } catch (e) {}
        }
        return 40;
      }

      case 'affordability': {
        // Inverse percentile: cheaper = higher score
        const allValues = allZipCodes.map(z => zipData[z].avg_value).filter(v => v > 0).sort((a, b) => a - b);
        if (allValues.length === 0) return 50;
        const rank = allValues.filter(v => v >= data.avg_value).length;
        return Math.round((rank / allValues.length) * 100);
      }

      case 'transit': {
        if (typeof TransitHelper !== 'undefined' && data.lat && data.lng) {
          try {
            const th = new TransitHelper();
            const result = th.calculateTransitScore(data.lat, data.lng);
            return result.score || 20;
          } catch (e) {}
        }
        return 20;
      }

      case 'nightlife': {
        // Proxy: population density + income + proximity to urban core
        const popPercentile = this.getPercentile(data.population, 'population');
        const distToCore = this.distToDowntown(data.lat, data.lng);
        const urbanProximity = Math.max(0, 100 - (distToCore * 5)); // penalize distance
        return Math.round((popPercentile * 0.4) + (urbanProximity * 0.6));
      }

      case 'investment': {
        if (typeof neighborhoodTrajectory !== 'undefined') {
          const traj = neighborhoodTrajectory.classify(zip);
          if (traj) {
            switch (traj.classification) {
              case 'rising-star': return 90;
              case 'value-play': return 80;
              case 'transitioning': return 65;
              case 'stable-suburban': return 55;
              case 'established-premium': return 50;
              case 'watch-list': return 25;
            }
          }
        }
        // Fallback: affordability + low vacancy = investment potential
        const affordScore = this.scoreDimension(zip, 'affordability');
        const vacancyScore = Math.max(0, 100 - (data.housing_vacancy_rate || 0) * 5);
        return Math.round((affordScore * 0.5) + (vacancyScore * 0.5));
      }

      case 'commute': {
        // Average commute to top 3 employment centers
        if (typeof commuteIntelligence !== 'undefined' && data.lat && data.lng) {
          try {
            const commutes = commuteIntelligence.getTopNearestCommutes(zip);
            if (commutes && commutes.length > 0) {
              const avgTime = commutes.reduce((sum, c) => sum + c.best.minutes, 0) / commutes.length;
              return Math.max(0, Math.min(100, 100 - (avgTime * 2)));
            }
          } catch (e) {}
        }
        // Fallback: distance from city center
        if (data.lat && data.lng) {
          const dist = this.distToDowntown(data.lat, data.lng);
          return Math.max(0, Math.min(100, 100 - (dist * 4)));
        }
        return 40;
      }

      default:
        return 50;
    }
  }

  /**
   * Distance to downtown Atlanta
   */
  distToDowntown(lat, lng) {
    if (!lat || !lng) return 20;
    const R = 3959;
    const dLat = (33.749 - lat) * Math.PI / 180;
    const dLng = (-84.388 - lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat * Math.PI / 180) * Math.cos(33.749 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Get percentile of a value for a metric
   */
  getPercentile(value, metric) {
    const allValues = allZipCodes.map(z => zipData[z][metric]).filter(v => v != null && v > 0).sort((a, b) => a - b);
    if (allValues.length === 0) return 50;
    const rank = allValues.filter(v => v <= value).length;
    return Math.round((rank / allValues.length) * 100);
  }

  /**
   * Find all matches against user preferences
   */
  findMatches(weights, options = {}) {
    const maxBudget = options.maxBudget || null;
    const workplace = options.workplace || null;

    const results = allZipCodes.map(zip => {
      const data = zipData[zip];
      if (!data || !data.avg_value) return null;

      // Budget filter
      if (maxBudget && data.avg_value / 17 / 12 > maxBudget) return null; // rough rent check

      let totalScore = 0;
      let totalWeight = 0;
      const breakdown = {};

      for (const [dim, weight] of Object.entries(weights)) {
        if (weight <= 0) continue;
        const score = this.scoreDimension(zip, dim);
        totalScore += score * weight;
        totalWeight += weight;
        breakdown[dim] = { score, weight };
      }

      const matchPercent = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
      const strengths = this.getStrengths(breakdown);
      const weaknesses = this.getWeaknesses(breakdown);

      return {
        zip,
        city: data.city || 'Atlanta Metro',
        neighborhood: data.neighborhood || `Area ${zip}`,
        matchPercent,
        breakdown,
        strengths,
        weaknesses,
        avgValue: data.avg_value,
        population: data.population,
        safetyScore: Math.round(100 - (data.crime_rate || 0))
      };
    }).filter(r => r !== null);

    results.sort((a, b) => b.matchPercent - a.matchPercent);
    return results;
  }

  /**
   * Quick match using a preset profile
   */
  quickMatch(presetId, options = {}) {
    const preset = this.PRESETS[presetId];
    if (!preset) return [];
    return this.findMatches(preset.weights, options);
  }

  /**
   * Get top strengths for a match
   */
  getStrengths(breakdown) {
    return Object.entries(breakdown)
      .filter(([dim, { score, weight }]) => score >= 65 && weight >= 3)
      .sort((a, b) => (b[1].score * b[1].weight) - (a[1].score * a[1].weight))
      .slice(0, 3)
      .map(([dim, { score }]) => ({
        dimension: dim,
        label: this.DIMENSIONS[dim].label,
        icon: this.DIMENSIONS[dim].icon,
        score,
        text: this.getStrengthText(dim, score)
      }));
  }

  /**
   * Get weaknesses for a match
   */
  getWeaknesses(breakdown) {
    return Object.entries(breakdown)
      .filter(([dim, { score, weight }]) => score < 40 && weight >= 5)
      .sort((a, b) => a[1].score - b[1].score)
      .slice(0, 2)
      .map(([dim, { score }]) => ({
        dimension: dim,
        label: this.DIMENSIONS[dim].label,
        score,
        text: this.getWeaknessText(dim, score)
      }));
  }

  /**
   * Generate strength text for a dimension
   */
  getStrengthText(dim, score) {
    const tier = score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : 'Good';
    const labels = {
      safety: `${tier} safety`,
      schools: `${tier} schools`,
      greenSpace: `${tier} green space`,
      affordability: `${tier} value`,
      transit: `${tier} transit`,
      nightlife: `${tier} urban vibe`,
      investment: `${tier} growth`,
      commute: `${tier} commute`
    };
    return labels[dim] || `${tier}`;
  }

  /**
   * Generate weakness text for a dimension
   */
  getWeaknessText(dim, score) {
    const labels = {
      safety: 'Safety below expectations',
      schools: 'Limited school options',
      greenSpace: 'Few parks nearby',
      affordability: 'Above budget target',
      transit: 'Limited transit access',
      nightlife: 'Quiet/suburban area',
      investment: 'Slow growth outlook',
      commute: 'Long commute expected'
    };
    return labels[dim] || 'Below target';
  }

  /**
   * Get match score for a specific ZIP against current preferences
   */
  getMatchScore(zip, weights) {
    if (!weights || !zipData[zip]) return null;
    let totalScore = 0;
    let totalWeight = 0;
    for (const [dim, weight] of Object.entries(weights)) {
      if (weight <= 0) continue;
      const score = this.scoreDimension(zip, dim);
      totalScore += score * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }
}

// Global instance
const neighborhoodMatch = new NeighborhoodMatch();

// Store user preferences in localStorage
function saveMatchPreferences(weights) {
  localStorage.setItem('insiteMatchPrefs', JSON.stringify(weights));
}

function loadMatchPreferences() {
  try {
    return JSON.parse(localStorage.getItem('insiteMatchPrefs'));
  } catch (e) {
    return null;
  }
}
