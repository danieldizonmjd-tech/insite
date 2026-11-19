/**
 * Utility functions for formatting numbers, dates, and strings
 */

/**
 * Format number as currency
 * @param {number} value - Value to format
 * @param {string} [currency='USD'] - Currency code
 * @param {number} [decimals=0] - Decimal places
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD', decimals = 0) {
  if (value == null || isNaN(value)) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} value - Value to format
 * @param {number} [decimals=1] - Decimal places
 * @returns {string} Formatted number string
 */
export function formatCompact(value, decimals = 1) {
  if (value == null || isNaN(value)) return 'N/A';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(decimals) + 'B';
  }
  if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(decimals) + 'M';
  }
  if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(decimals) + 'K';
  }
  return sign + absValue.toFixed(decimals);
}

/**
 * Format number as percentage
 * @param {number} value - Value to format (0-100 or 0-1 scale)
 * @param {number} [decimals=1] - Decimal places
 * @param {boolean} [isDecimal=false] - If true, value is 0-1 scale
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1, isDecimal = false) {
  if (value == null || isNaN(value)) return 'N/A';
  
  const pct = isDecimal ? value * 100 : value;
  return pct.toFixed(decimals) + '%';
}

/**
 * Format number with commas
 * @param {number} value - Value to format
 * @param {number} [decimals=0] - Decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} [format='medium'] - 'short', 'medium', 'long', 'full'
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'medium') {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return new Intl.DateTimeFormat('en-US', options[format] || options.medium).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  if (diffWeek > 0) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Format score with color class
 * @param {number} score - Score value (0-100)
 * @returns {{ value: string, class: string, label: string }}
 */
export function formatScore(score) {
  if (score == null || isNaN(score)) {
    return { value: 'N/A', class: 'score-na', label: 'No Data' };
  }
  
  const value = Math.round(score);
  
  if (value >= 80) {
    return { value: String(value), class: 'score-excellent', label: 'Excellent' };
  }
  if (value >= 60) {
    return { value: String(value), class: 'score-good', label: 'Good' };
  }
  if (value >= 40) {
    return { value: String(value), class: 'score-fair', label: 'Fair' };
  }
  return { value: String(value), class: 'score-poor', label: 'Poor' };
}

/**
 * Format change value with direction indicator
 * @param {number} change - Change value
 * @param {string} [type='percent'] - 'percent', 'currency', 'number'
 * @returns {{ value: string, direction: string, class: string }}
 */
export function formatChange(change, type = 'percent') {
  if (change == null || isNaN(change)) {
    return { value: 'N/A', direction: 'stable', class: 'change-stable' };
  }
  
  const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';
  const sign = change > 0 ? '+' : '';
  
  let value;
  switch (type) {
    case 'percent':
      value = sign + change.toFixed(1) + '%';
      break;
    case 'currency':
      value = sign + formatCurrency(change);
      break;
    default:
      value = sign + formatNumber(change, 1);
  }
  
  return {
    value,
    direction,
    class: `change-${direction}`
  };
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=100] - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format ZIP code (ensure 5 digits with leading zeros)
 * @param {string|number} zipCode - ZIP code to format
 * @returns {string} Formatted ZIP code
 */
export function formatZipCode(zipCode) {
  if (!zipCode) return '';
  return String(zipCode).padStart(5, '0');
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatCompact,
    formatPercent,
    formatNumber,
    formatDate,
    formatRelativeTime,
    formatScore,
    formatChange,
    truncate,
    formatZipCode,
    formatPhone
  };
}
