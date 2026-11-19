/**
 * API Configuration
 * This file manages API endpoint URLs for different environments
 */

const API_CONFIG = {
  // Determine if we're in production or development
  isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',

  // Base URL for API endpoints
  get baseURL() {
    if (this.isProduction) {
      return 'https://mapsinsite.com/Map';
    } else {
      return window.location.origin;
    }
  },

  // API key endpoint (production only — dev uses window.DEV_API_KEYS)
  get apiKeyEndpoint() {
    return `${this.baseURL}/access_api_keys.php`;
  }
};

/**
 * Fetch API key from secure backend
 * @param {string} keyName - The name of the API key to fetch (e.g., 'google_maps')
 * @returns {Promise<string>} The API key
 */
async function getAPIKey(keyName) {
  // In development, read from the gitignored Scripts/dev-keys.js file
  // which sets window.DEV_API_KEYS = { google_maps: 'YOUR_KEY', ... }
  if (!API_CONFIG.isProduction && window.DEV_API_KEYS) {
    if (window.DEV_API_KEYS[keyName]) {
      return window.DEV_API_KEYS[keyName];
    }
    throw new Error(`Key '${keyName}' not found in DEV_API_KEYS. Add it to Scripts/dev-keys.js.`);
  }

  try {
    const url = `${API_CONFIG.apiKeyEndpoint}?key=${encodeURIComponent(keyName)}`;
    console.log('Fetching API key from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Error response body:', text);
      throw new Error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}`);
    }
    
    // Get the response as text first to debug
    const text = await response.text();
    console.log('Raw response text:', text);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text that failed to parse:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
    
    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }
    
    if (!data.api_key) {
      throw new Error('API key not found in response');
    }
    
    console.log('Successfully retrieved API key');
    return data.api_key;
  } catch (error) {
    console.error(`Failed to fetch API key '${keyName}':`, error);
    throw error;
  }
}

// Make functions available globally
window.API_CONFIG = API_CONFIG;
window.getAPIKey = getAPIKey;
