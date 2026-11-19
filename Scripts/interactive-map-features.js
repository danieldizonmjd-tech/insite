// Interactive Map Features: Hover Ring & Click HUD
// This file adds circular score rings on hover and HUD cards on click

class InteractiveMapFeatures {
  constructor(map, dataLayer) {
    this.map = map;
    this.dataLayer = dataLayer;
    this.scoreRingOverlay = null;
    this.hudCard = null;
    this.currentFeature = null;
    this.isZoomedIn = false;
    this.originalZoom = 11;
    this.originalCenter = { lat: 33.75, lng: -84.39 };
    
    // Comparison mode
    this.comparisonMode = false;
    this.selectedZips = [];
    this.maxComparisons = 4;
    
    this.init();
  }

  init() {
    this.createScoreRingOverlay();
    this.createHUDCard();
    this.createSearchBar();
    this.attachEventListeners();
  }

  createScoreRingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'score-ring-overlay';
    overlay.innerHTML = `
      <div class="score-ring-container">
        <div class="score-ring-bg"></div>
        <svg class="score-ring-svg" viewBox="0 0 120 120">
          <circle class="score-ring-circle score-ring-track" cx="60" cy="60" r="52" />
          <circle class="score-ring-circle score-ring-progress" cx="60" cy="60" r="52" />
        </svg>
        <div class="score-ring-text">
          <div class="score-ring-value" id="score-ring-value">0</div>
          <div class="score-ring-label" id="score-ring-label">SCORE</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.scoreRingOverlay = overlay;
  }

  createHUDCard() {
    const hud = document.createElement('div');
    hud.id = 'zip-hud-card';
    hud.innerHTML = `
      <div class="hud-header">
        <div class="hud-title">
          <span id="hud-zip-code">ZIP 30303</span>
          <span class="hud-rating-badge" id="hud-rating-badge">⭐ 8.5</span>
        </div>
        <button class="hud-close-btn" id="hud-close-btn">×</button>
      </div>
      <div class="hud-stats-grid" id="hud-stats-grid">
        <!-- Stats will be populated dynamically -->
      </div>
      <div class="hud-actions">
        <button class="hud-action-btn" id="hud-details-btn">Full Details</button>
        <button class="hud-action-btn primary" id="hud-zoom-out-btn">Zoom Out</button>
      </div>
    `;
    document.body.appendChild(hud);
    this.hudCard = hud;

    // Close button
    document.getElementById('hud-close-btn').addEventListener('click', () => {
      this.hideHUD();
      this.zoomOut();
    });

    // Details button
    document.getElementById('hud-details-btn').addEventListener('click', () => {
      if (this.currentFeature) {
        // Trigger the existing details card
        google.maps.event.trigger(this.dataLayer, 'click', {
          feature: this.currentFeature,
          domEvent: { ctrlKey: false, metaKey: false }
        });
      }
    });

    // Zoom out button
    document.getElementById('hud-zoom-out-btn').addEventListener('click', () => {
      this.zoomOut();
    });
  }

  attachEventListeners() {
    // Hover events for score ring
    this.dataLayer.addListener('mouseover', (event) => {
      this.showScoreRing(event);
    });

    this.dataLayer.addListener('mouseout', () => {
      this.hideScoreRing();
    });

    // Click event for HUD and zoom
    this.dataLayer.addListener('click', (event) => {
      // Ctrl+click for comparison mode
      if (event.domEvent.ctrlKey || event.domEvent.metaKey) {
        this.toggleComparisonSelection(event.feature);
        return;
      }
      
      this.showHUD(event.feature);
      this.zoomToFeature(event.feature);
    });
    
    // Close HUD button
    const closeBtn = document.getElementById('hud-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideHUD();
        if (this.isZoomedIn) {
          this.zoomOut();
        }
      });
    }
    
    // Zoom out button
    const zoomOutBtn = document.getElementById('hud-zoom-out-btn');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.zoomOut();
      });
    }
  }

  toggleComparisonSelection(feature) {
    const zip = feature.getProperty('NAME') || feature.getProperty('zip');
    
    if (!zip) return;
    
    const index = this.selectedZips.findIndex(item => item.zip === zip);
    
    if (index > -1) {
      // Remove from selection
      this.selectedZips.splice(index, 1);
      this.styleFeature(feature, 'normal');
    } else {
      // Add to selection
      if (this.selectedZips.length >= this.maxComparisons) {
        this.showToast(`Maximum ${this.maxComparisons} ZIPs can be compared at once`, 'warning');
        return;
      }
      
      this.selectedZips.push({
        zip: zip,
        feature: feature,
        data: this.extractFeatureData(feature)
      });
      this.styleFeature(feature, 'selected');
    }
    
    this.updateComparisonPanel();
  }

  styleFeature(feature, style) {
    if (style === 'selected') {
      this.dataLayer.overrideStyle(feature, {
        strokeColor: '#8b5cf6',
        strokeWeight: 4,
        strokeOpacity: 1,
        fillOpacity: 0.3
      });
    } else {
      this.dataLayer.revertStyle(feature);
    }
  }

  extractFeatureData(feature) {
    return {
      zip: feature.getProperty('NAME') || feature.getProperty('zip'),
      city: feature.getProperty('city'),
      avg_value: feature.getProperty('avg_value'),
      population: feature.getProperty('population'),
      median_income: feature.getProperty('median_income'),
      crime_rate: feature.getProperty('crime_rate'),
      transit_score: feature.getProperty('transit_score'),
      parks_score: feature.getProperty('parks_score')
    };
  }

  updateComparisonPanel() {
    let panel = document.getElementById('comparison-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'comparison-panel';
      panel.className = 'glass-panel';
      document.body.appendChild(panel);
    }
    
    if (this.selectedZips.length === 0) {
      panel.style.display = 'none';
      return;
    }
    
    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="comparison-header">
        <h3>Compare ZIPs (${this.selectedZips.length}/${this.maxComparisons})</h3>
        <button class="comparison-close-btn" onclick="interactiveFeatures.clearComparison()">✕</button>
      </div>
      <div class="comparison-grid">
        ${this.selectedZips.map(item => `
          <div class="comparison-card">
            <div class="comparison-card-header">
              <span class="comparison-zip">${item.zip}</span>
              <button class="comparison-remove-btn" onclick="interactiveFeatures.removeFromComparison('${item.zip}')">✕</button>
            </div>
            <div class="comparison-metrics">
              <div class="comparison-metric">
                <span class="metric-label">Value</span>
                <span class="metric-value">${this.formatCurrency(item.data.avg_value)}</span>
              </div>
              <div class="comparison-metric">
                <span class="metric-label">Income</span>
                <span class="metric-value">${this.formatCurrency(item.data.median_income)}</span>
              </div>
              <div class="comparison-metric">
                <span class="metric-label">Crime</span>
                <span class="metric-value">${this.formatCrimeRate(item.data.crime_rate)}</span>
              </div>
              <div class="comparison-metric">
                <span class="metric-label">Transit</span>
                <span class="metric-value">${Math.round(item.data.transit_score || 0)}/100</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="comparison-actions">
        <button class="comparison-action-btn" onclick="interactiveFeatures.exportComparison()">📊 Export CSV</button>
        <button class="comparison-action-btn primary" onclick="interactiveFeatures.clearComparison()">Clear All</button>
      </div>
    `;
  }

  removeFromComparison(zip) {
    const index = this.selectedZips.findIndex(item => item.zip === zip);
    if (index > -1) {
      this.styleFeature(this.selectedZips[index].feature, 'normal');
      this.selectedZips.splice(index, 1);
      this.updateComparisonPanel();
    }
  }

  clearComparison() {
    this.selectedZips.forEach(item => {
      this.styleFeature(item.feature, 'normal');
    });
    this.selectedZips = [];
    this.updateComparisonPanel();
  }

  exportComparison() {
    if (this.selectedZips.length === 0) return;
    
    const headers = ['ZIP', 'City', 'Property Value', 'Population', 'Median Income', 'Crime Rate', 'Transit Score', 'Parks Score'];
    const rows = this.selectedZips.map(item => [
      item.zip,
      item.data.city || 'N/A',
      item.data.avg_value || 0,
      item.data.population || 0,
      item.data.median_income || 0,
      item.data.crime_rate || 0,
      item.data.transit_score || 0,
      item.data.parks_score || 0
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insite_comparison_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showToast('Comparison data exported successfully!', 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `map-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showScoreRing(event) {
    const feature = event.feature;
    
    // Calculate score (0-100 scale)
    const score = this.calculateScore(feature);
    
    // Get mouse position or feature centroid
    const position = this.getFeatureCentroid(feature);
    const pixel = this.map.getProjection().fromLatLngToPoint(position);
    const scale = Math.pow(2, this.map.getZoom());
    const worldCoordinate = new google.maps.Point(
      pixel.x * scale,
      pixel.y * scale
    );
    const pixelCoordinate = new google.maps.Point(
      worldCoordinate.x - this.map.getDiv().offsetLeft,
      worldCoordinate.y - this.map.getDiv().offsetTop
    );

    // Position the overlay at the ZIP code center
    const overlay = this.map.getProjection();
    if (overlay) {
      const point = overlay.fromLatLngToDivPixel(position);
      if (point) {
        this.scoreRingOverlay.style.left = (point.x - 60) + 'px';
        this.scoreRingOverlay.style.top = (point.y - 60) + 'px';
        this.scoreRingOverlay.style.display = 'block';

        // Update ring value and color
        const valueEl = document.getElementById('score-ring-value');
        const progressCircle = this.scoreRingOverlay.querySelector('.score-ring-progress');
        
        valueEl.textContent = Math.round(score);
        
        // Calculate ring progress
        const circumference = 2 * Math.PI * 52;
        const progress = (score / 100) * circumference;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference - progress;

        // Animate the ring drawing
        progressCircle.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Color based on score
        let color;
        if (score >= 80) {
          color = '#10b981'; // Green
          valueEl.style.color = '#10b981';
        } else if (score >= 50) {
          color = '#f59e0b'; // Yellow/Orange
          valueEl.style.color = '#f59e0b';
        } else {
          color = '#ef4444'; // Red
          valueEl.style.color = '#ef4444';
        }
        progressCircle.style.stroke = color;
      }
    }
  }

  hideScoreRing() {
    this.scoreRingOverlay.style.display = 'none';
  }

  showHUD(feature) {
    this.currentFeature = feature;
    
    const zip = feature.getProperty('NAME') || 'N/A';
    const score = this.calculateScore(feature);
    
    // Update HUD header
    document.getElementById('hud-zip-code').textContent = `ZIP ${zip}`;
    document.getElementById('hud-rating-badge').textContent = `⭐ ${(score / 10).toFixed(1)}`;

    // Build stats grid
    const statsGrid = document.getElementById('hud-stats-grid');
    statsGrid.innerHTML = '';

    // Key metrics
    const metrics = [
      {
        label: 'Home Value',
        value: this.formatCurrency(feature.getProperty('avg_value')),
        type: this.getStatType(feature.getProperty('avg_value'), 'value')
      },
      {
        label: 'Population',
        value: this.formatNumber(feature.getProperty('population')),
        type: this.getStatType(feature.getProperty('population'), 'population')
      },
      {
        label: 'Income',
        value: this.formatCurrency(feature.getProperty('median_income')),
        type: this.getStatType(feature.getProperty('median_income'), 'income')
      },
      {
        label: 'Crime Rate',
        value: this.formatCrimeRate(feature.getProperty('crime_rate')),
        type: this.getStatType(feature.getProperty('crime_rate'), 'crime')
      },
      {
        label: 'Transit Score',
        value: Math.round(feature.getProperty('transit_score') || 0) + '/100',
        type: this.getStatType(feature.getProperty('transit_score'), 'transit')
      },
      {
        label: 'Parks Score',
        value: Math.round(feature.getProperty('parks_score') || 0) + '/100',
        type: this.getStatType(feature.getProperty('parks_score'), 'parks')
      }
    ];

    metrics.forEach((metric, index) => {
      const card = document.createElement('div');
      card.className = `hud-stat-card ${metric.type}`;
      card.style.animationDelay = `${index * 0.05}s`;
      
      const valueDiv = document.createElement('div');
      valueDiv.className = 'hud-stat-value';
      
      const labelDiv = document.createElement('div');
      labelDiv.className = 'hud-stat-label';
      labelDiv.textContent = metric.label;
      
      card.appendChild(labelDiv);
      card.appendChild(valueDiv);
      statsGrid.appendChild(card);
      
      // Animate numeric values with count-up
      const numericValue = this.extractNumericValue(metric.value);
      if (numericValue !== null) {
        this.animateValue(valueDiv, 0, numericValue, 800, metric.value);
      } else {
        valueDiv.textContent = metric.value;
      }
    });

    // Show HUD with slide-in animation
    this.hudCard.classList.add('active');
  }

  hideHUD() {
    this.hudCard.classList.remove('active');
    this.currentFeature = null;
  }

  zoomToFeature(feature) {
    this.isZoomedIn = true;
    
    // Get feature bounds
    const bounds = new google.maps.LatLngBounds();
    const geometry = feature.getGeometry();
    
    if (geometry.getType() === 'Polygon') {
      geometry.getAt(0).getArray().forEach(latlng => {
        bounds.extend(latlng);
      });
    }

    // Zoom to bounds with detailed road view
    this.map.fitBounds(bounds);
    
    // Wait for zoom animation, then set to detailed road view
    setTimeout(() => {
      const currentZoom = this.map.getZoom();
      if (currentZoom < 15) {
        this.map.setZoom(15); // Detailed road level
      }
      
      // Switch to road map with details
      this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      this.map.setOptions({
        styles: [] // Clear dark style to show roads and labels
      });
    }, 500);
  }

  zoomOut() {
    if (!this.isZoomedIn) return;
    
    this.isZoomedIn = false;
    this.hideHUD();
    
    // Zoom out to original view
    this.map.setZoom(this.originalZoom);
    this.map.setCenter(this.originalCenter);

    // Restore dark style
    setTimeout(() => {
      const darkStyle = [
        {elementType: 'geometry', stylers: [{color: '#0f172a'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#64748b'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#0f172a'}]},
        {featureType: 'administrative', elementType: 'geometry', stylers: [{color: '#475569'}]},
        {featureType: 'poi', stylers: [{visibility: 'off'}]},
        {featureType: 'road', elementType: 'geometry', stylers: [{color: '#1e293b'}]},
        {featureType: 'road', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
        {featureType: 'transit', stylers: [{visibility: 'off'}]},
        {featureType: 'water', elementType: 'geometry', stylers: [{color: '#020617'}]},
        {featureType: 'water', elementType: 'labels.text.fill', stylers: [{color: '#334155'}]}
      ];
      this.map.setOptions({ styles: darkStyle });
    }, 100);
  }

  calculateScore(feature) {
    // Calculate composite score 0-100
    const avgValue = feature.getProperty('avg_value') || 0;
    const medianIncome = feature.getProperty('median_income') || 0;
    const crimeRate = feature.getProperty('crime_rate') || 0;
    const population = feature.getProperty('population') || 0;
    const transitScore = feature.getProperty('transit_score') || 0;
    const parksScore = feature.getProperty('parks_score') || 0;

    let score = 0;
    let count = 0;

    // Value score (0-100)
    if (avgValue > 0) {
      score += Math.min(100, (avgValue / 500000) * 100);
      count++;
    }

    // Income score (0-100)
    if (medianIncome > 0) {
      score += Math.min(100, (medianIncome / 150000) * 100);
      count++;
    }

    // Crime score (inverse, 0-100)
    if (crimeRate >= 0) {
      score += Math.max(0, 100 - (crimeRate / 50) * 100);
      count++;
    }

    // Population score (0-100)
    if (population > 0) {
      const optimal = 50000;
      const ratio = population / optimal;
      score += ratio > 1 ? Math.max(10, 100 / Math.sqrt(ratio)) : Math.min(100, ratio * 100);
      count++;
    }

    // Transit score (already 0-100)
    if (transitScore > 0) {
      score += transitScore;
      count++;
    }

    // Parks score (already 0-100)
    if (parksScore > 0) {
      score += parksScore;
      count++;
    }

    return count > 0 ? score / count : 50;
  }

  getFeatureCentroid(feature) {
    const geometry = feature.getGeometry();
    const bounds = new google.maps.LatLngBounds();
    
    if (geometry.getType() === 'Polygon') {
      geometry.getAt(0).getArray().forEach(latlng => {
        bounds.extend(latlng);
      });
    }
    
    return bounds.getCenter();
  }

  formatCurrency(value) {
    if (!value || value <= 0) return '-';
    return '$' + (value / 1000).toFixed(0) + 'k';
  }

  formatNumber(value) {
    if (!value || value <= 0) return '-';
    return value.toLocaleString();
  }

  formatCrimeRate(value) {
    if (value == null || value < 0) return '-';
    return value.toFixed(1) + '/1k';
  }

  getStatType(value, field) {
    if (!value) return '';
    
    // Define thresholds for each field type
    const thresholds = {
      value: { excellent: 400000, good: 250000 },
      population: { excellent: 60000, good: 30000 },
      income: { excellent: 100000, good: 60000 },
      crime: { excellent: 20, good: 35 }, // Lower is better
      transit: { excellent: 70, good: 50 },
      parks: { excellent: 70, good: 50 }
    };

    const threshold = thresholds[field];
    if (!threshold) return '';

    if (field === 'crime') {
      // Inverse for crime (lower is better)
      if (value <= threshold.excellent) return 'stat-excellent';
      if (value <= threshold.good) return 'stat-good';
      return 'stat-poor';
    } else {
      // Normal for others (higher is better)
      if (value >= threshold.excellent) return 'stat-excellent';
      if (value >= threshold.good) return 'stat-good';
      return 'stat-poor';
    }
  }

  // Count-up animation for numbers
  animateValue(element, start, end, duration, originalFormat) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        element.textContent = originalFormat;
        clearInterval(timer);
      } else {
        // Format based on original value type
        if (originalFormat.includes('$')) {
          element.textContent = '$' + Math.round(current).toLocaleString();
        } else if (originalFormat.includes('/100')) {
          element.textContent = Math.round(current) + '/100';
        } else {
          element.textContent = Math.round(current).toLocaleString();
        }
      }
    }, 16);
  }

  extractNumericValue(formattedValue) {
    // Extract numeric value from formatted strings
    const match = formattedValue.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    return null;
  }

  // Create search bar overlay
  createSearchBar() {
    const searchBar = document.createElement('div');
    searchBar.id = 'map-search-bar';
    searchBar.className = 'glass-panel';
    searchBar.innerHTML = `
      <div class="search-container">
        <input 
          type="text" 
          id="map-search-input" 
          placeholder="Search ZIP, City, or Neighborhood..."
          autocomplete="off"
        />
        <button id="map-search-btn" class="search-btn">🔍</button>
        <div id="search-suggestions" class="search-suggestions"></div>
      </div>
    `;
    document.body.appendChild(searchBar);
    
    const searchInput = document.getElementById('map-search-input');
    const suggestions = document.getElementById('search-suggestions');
    
    // Autocomplete functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
      }
      
      searchTimeout = setTimeout(() => {
        const matches = this.searchZipCodes(query);
        this.showSearchSuggestions(matches, suggestions);
      }, 200);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        this.performSearch(query);
        suggestions.style.display = 'none';
      }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        suggestions.style.display = 'none';
      }
    });
  }

  searchZipCodes(query) {
    const matches = [];
    this.dataLayer.forEach((feature) => {
      const zip = feature.getProperty('NAME') || feature.getProperty('zip') || '';
      const city = (feature.getProperty('city') || '').toLowerCase();
      const neighborhood = (feature.getProperty('neighborhood') || feature.getProperty('NEIGHBORHOOD') || '').toLowerCase();
      
      if (zip.includes(query) || city.includes(query) || neighborhood.includes(query)) {
        matches.push({
          zip: zip,
          city: feature.getProperty('city') || 'Unknown',
          neighborhood: feature.getProperty('neighborhood') || feature.getProperty('NEIGHBORHOOD') || '',
          feature: feature
        });
      }
    });
    
    return matches.slice(0, 5); // Limit to 5 suggestions
  }

  showSearchSuggestions(matches, container) {
    if (matches.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    container.innerHTML = matches.map(match => `
      <div class="search-suggestion-item" data-zip="${match.zip}">
        <span class="suggestion-zip">${match.zip}</span>
        <span class="suggestion-city">${match.city}</span>
        ${match.neighborhood ? `<span class="suggestion-neighborhood">${match.neighborhood}</span>` : ''}
      </div>
    `).join('');
    
    container.style.display = 'block';
    
    // Add click handlers
    container.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const zip = item.dataset.zip;
        this.performSearch(zip);
        container.style.display = 'none';
        document.getElementById('map-search-input').value = zip;
      });
    });
  }

  performSearch(query) {
    const matches = this.searchZipCodes(query.toLowerCase());
    if (matches.length > 0) {
      const feature = matches[0].feature;
      this.showHUD(feature);
      this.zoomToFeature(feature);
    }
  }
}

// Auto-initialize when map is ready
window.InteractiveMapFeatures = InteractiveMapFeatures;
