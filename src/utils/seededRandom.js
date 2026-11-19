/**
 * Seeded Random Number Generator
 * Provides consistent "random" values for mock data generation
 * Same seed = same sequence of values
 */

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.current = seed;
  }

  /**
   * Generate next random number (Mulberry32 algorithm)
   * @returns {number} Random number between 0 and 1
   */
  next() {
    let t = this.current += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Reset to initial seed
   */
  reset() {
    this.current = this.seed;
  }

  /**
   * Generate integer in range [min, max]
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer
   */
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate float in range [min, max]
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random float
   */
  float(min, max) {
    return this.next() * (max - min) + min;
  }

  /**
   * Pick random element from array
   * @param {Array} array - Array to pick from
   * @returns {*} Random element
   */
  pick(array) {
    if (!array || array.length === 0) return null;
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Generate normally distributed value (Box-Muller transform)
   * @param {number} mean - Mean of distribution
   * @param {number} stdDev - Standard deviation
   * @returns {number} Normally distributed value
   */
  gaussian(mean, stdDev) {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Generate value following realistic distribution for a metric
   * @param {Object} config - Metric configuration
   * @param {number} config.min - Minimum value
   * @param {number} config.max - Maximum value
   * @param {number} config.mean - Mean value
   * @param {number} config.stdDev - Standard deviation
   * @param {number} [config.skew=0] - Skewness factor
   * @returns {number} Generated metric value
   */
  metric(config) {
    const { min, max, mean, stdDev, skew = 0 } = config;
    let value;

    if (stdDev) {
      // Normal distribution around mean
      value = this.gaussian(mean, stdDev);

      // Apply skew if specified
      if (skew !== 0) {
        value = value + skew * Math.pow(value - mean, 2) / 100;
      }
    } else {
      // Uniform distribution
      value = this.float(min, max);
    }

    // Clamp to valid range
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Shuffle array in place
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate boolean with given probability
   * @param {number} probability - Probability of true (0-1)
   * @returns {boolean} Random boolean
   */
  bool(probability = 0.5) {
    return this.next() < probability;
  }
}

/**
 * Create generator with seed based on ZIP code for consistency
 * @param {string} zipCode - ZIP code to seed from
 * @returns {SeededRandom} Seeded random generator
 */
function createNeighborhoodRandom(zipCode) {
  const seed = String(zipCode).split('').reduce((acc, char) =>
    acc + char.charCodeAt(0), 0) * 12345;
  return new SeededRandom(seed);
}

/**
 * Create generator with seed based on string
 * @param {string} str - String to create seed from
 * @returns {SeededRandom} Seeded random generator
 */
function createSeededRandom(str) {
  const seed = String(str).split('').reduce((acc, char, i) =>
    acc + char.charCodeAt(0) * (i + 1), 0);
  return new SeededRandom(seed);
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SeededRandom, createNeighborhoodRandom, createSeededRandom };
}

export { SeededRandom, createNeighborhoodRandom, createSeededRandom };
