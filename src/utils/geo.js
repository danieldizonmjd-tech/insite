/**
 * Geospatial Utility Functions
 * Calculations for distances, areas, and spatial operations
 */

// Earth's radius in miles
const EARTH_RADIUS_MILES = 3959;
const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Radians
 * @returns {number} Degrees
 */
export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @param {string} [unit='miles'] - 'miles' or 'km'
 * @returns {number} Distance in specified unit
 */
export function haversineDistance(lat1, lng1, lat2, lng2, unit = 'miles') {
  const R = unit === 'km' ? EARTH_RADIUS_KM : EARTH_RADIUS_MILES;
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculate distance between two point objects
 * @param {Object} point1 - {lat, lng} object
 * @param {Object} point2 - {lat, lng} object
 * @param {string} [unit='miles'] - 'miles' or 'km'
 * @returns {number} Distance in specified unit
 */
export function distanceBetween(point1, point2, unit = 'miles') {
  return haversineDistance(
    point1.lat, point1.lng,
    point2.lat, point2.lng,
    unit
  );
}

/**
 * Check if a point is within a bounding box
 * @param {Object} point - {lat, lng} object
 * @param {Object} bounds - {north, south, east, west} object
 * @returns {boolean} True if point is within bounds
 */
export function isPointInBounds(point, bounds) {
  return point.lat >= bounds.south &&
         point.lat <= bounds.north &&
         point.lng >= bounds.west &&
         point.lng <= bounds.east;
}

/**
 * Calculate the center point of a bounding box
 * @param {Object} bounds - {north, south, east, west} object
 * @returns {Object} {lat, lng} center point
 */
export function getBoundsCenter(bounds) {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };
}

/**
 * Calculate the center point of an array of coordinates
 * @param {Array<{lat: number, lng: number}>} points - Array of points
 * @returns {Object} {lat, lng} center point
 */
export function getCentroid(points) {
  if (!points || points.length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  const sum = points.reduce((acc, point) => ({
    lat: acc.lat + point.lat,
    lng: acc.lng + point.lng
  }), { lat: 0, lng: 0 });
  
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length
  };
}

/**
 * Calculate bounding box from array of points
 * @param {Array<{lat: number, lng: number}>} points - Array of points
 * @param {number} [padding=0] - Padding in degrees
 * @returns {Object} {north, south, east, west} bounds
 */
export function getBoundsFromPoints(points, padding = 0) {
  if (!points || points.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }
  
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  return {
    north: Math.max(...lats) + padding,
    south: Math.min(...lats) - padding,
    east: Math.max(...lngs) + padding,
    west: Math.min(...lngs) - padding
  };
}

/**
 * Find nearest point from a list
 * @param {Object} origin - {lat, lng} origin point
 * @param {Array<Object>} points - Array of {lat, lng} points
 * @returns {Object} {point, distance, index}
 */
export function findNearest(origin, points) {
  if (!points || points.length === 0) {
    return { point: null, distance: Infinity, index: -1 };
  }
  
  let nearest = { point: null, distance: Infinity, index: -1 };
  
  points.forEach((point, index) => {
    const distance = distanceBetween(origin, point);
    if (distance < nearest.distance) {
      nearest = { point, distance, index };
    }
  });
  
  return nearest;
}

/**
 * Find all points within a radius
 * @param {Object} origin - {lat, lng} origin point
 * @param {Array<Object>} points - Array of {lat, lng} points
 * @param {number} radius - Radius in miles
 * @returns {Array<Object>} Points within radius with distances
 */
export function findWithinRadius(origin, points, radius) {
  if (!points || points.length === 0) return [];
  
  return points
    .map((point, index) => ({
      point,
      distance: distanceBetween(origin, point),
      index
    }))
    .filter(item => item.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate bearing between two points
 * @param {Object} from - {lat, lng} starting point
 * @param {Object} to - {lat, lng} ending point
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(from, to) {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLng = toRadians(to.lng - from.lng);
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Get cardinal direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Cardinal direction (N, NE, E, etc.)
 */
export function getCardinalDirection(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Calculate approximate area of a polygon in square miles
 * Uses Shoelace formula for simple polygon area
 * @param {Array<{lat: number, lng: number}>} coordinates - Polygon vertices
 * @returns {number} Area in square miles (approximate)
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0;
  
  // Convert to projected coordinates (rough approximation)
  const center = getCentroid(coordinates);
  const latMilesPerDegree = 69.0;
  const lngMilesPerDegree = 69.0 * Math.cos(toRadians(center.lat));
  
  // Project to miles
  const projected = coordinates.map(c => ({
    x: (c.lng - center.lng) * lngMilesPerDegree,
    y: (c.lat - center.lat) * latMilesPerDegree
  }));
  
  // Shoelace formula
  let area = 0;
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length;
    area += projected[i].x * projected[j].y;
    area -= projected[j].x * projected[i].y;
  }
  
  return Math.abs(area) / 2;
}

/**
 * Simplify a path by removing points that are too close together
 * @param {Array<Object>} points - Array of {lat, lng} points
 * @param {number} [tolerance=0.001] - Minimum distance in degrees
 * @returns {Array<Object>} Simplified array of points
 */
export function simplifyPath(points, tolerance = 0.001) {
  if (!points || points.length <= 2) return points;
  
  const result = [points[0]];
  
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const current = points[i];
    
    const distance = Math.sqrt(
      Math.pow(current.lat - prev.lat, 2) +
      Math.pow(current.lng - prev.lng, 2)
    );
    
    if (distance >= tolerance) {
      result.push(current);
    }
  }
  
  return result;
}

/**
 * Convert GeoJSON coordinates to lat/lng objects
 * @param {Array} coordinates - GeoJSON coordinate array [lng, lat]
 * @returns {Object} {lat, lng} object
 */
export function geoJsonToLatLng(coordinates) {
  return {
    lat: coordinates[1],
    lng: coordinates[0]
  };
}

/**
 * Convert lat/lng object to GeoJSON coordinates
 * @param {Object} point - {lat, lng} object
 * @returns {Array} [lng, lat] GeoJSON format
 */
export function latLngToGeoJson(point) {
  return [point.lng, point.lat];
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toRadians,
    toDegrees,
    haversineDistance,
    distanceBetween,
    isPointInBounds,
    getBoundsCenter,
    getCentroid,
    getBoundsFromPoints,
    findNearest,
    findWithinRadius,
    calculateBearing,
    getCardinalDirection,
    calculatePolygonArea,
    simplifyPath,
    geoJsonToLatLng,
    latLngToGeoJson
  };
}
