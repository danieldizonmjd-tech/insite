/* ============================================
   INSITE MAP - UI INTEGRATION (JAN 5, 2026)
   Connects new UI with existing map functionality
   ============================================ */

(function() {
  'use strict';

  // Wait for both map and UI to be ready
  function waitForDependencies(callback) {
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps && window.MapUI) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
  }

  // ============================================
  // MAP HOVER INTEGRATION
  // ============================================
  function setupMapHoverIntegration() {
    // Listen for map mousemove events to show score ring
    document.getElementById('map').addEventListener('mousemove', (e) => {
      // Check if hovering over a polygon
      const hoveredFeature = window.currentHoveredFeature;
      
      if (hoveredFeature && hoveredFeature.properties) {
        const props = hoveredFeature.properties;
        const score = props.area_rating || props.overall_score || 0;
        const location = props.name || props.zip_code || props.city || 'Unknown';
        
        // Show score ring following cursor
        window.MapUI.showScoreRing(e.pageX, e.pageY, score, location);
      } else {
        window.MapUI.hideScoreRing();
      }
    });
    
    // Hide score ring when mouse leaves map
    document.getElementById('map').addEventListener('mouseleave', () => {
      window.MapUI.hideScoreRing();
    });
  }

  // ============================================
  // POLYGON CLICK INTEGRATION
  // ============================================
  function setupPolygonClickIntegration() {
    // Listen for polygon clicks to show info cards
    window.addEventListener('polygonClicked', (event) => {
      const data = event.detail;
      
      if (data && data.properties) {
        // Show info cards with area data
        window.MapUI.showInfoCards(data.properties);
      }
    });
  }

  // ============================================
  // FILTER INTEGRATION
  // ============================================
  function setupFilterIntegration() {
    // Listen for filter changes
    window.addEventListener('filtersChanged', (event) => {
      const filters = event.detail.filters;
      console.log('Filters changed:', filters);
      
      // Apply filters to map data
      if (window.applyMapFilters) {
        window.applyMapFilters(filters);
      }
      
      // If you have a data layer, filter it
      if (window.map && window.map.data) {
        window.map.data.forEach((feature) => {
          const props = feature.getProperty('properties') || feature.getProperty;
          let visible = true;
          
          // Check value range
          if (filters.valueMin && props.avg_value < filters.valueMin) visible = false;
          if (filters.valueMax && props.avg_value > filters.valueMax) visible = false;
          
          // Check population range
          if (filters.popMin && props.population < filters.popMin) visible = false;
          if (filters.popMax && props.population > filters.popMax) visible = false;
          
          // Check income range
          if (filters.incomeMin && props.median_income < filters.incomeMin) visible = false;
          if (filters.incomeMax && props.median_income > filters.incomeMax) visible = false;
          
          // Check minimum rating
          if (filters.minRating && props.area_rating < filters.minRating) visible = false;
          
          // Set feature visibility
          window.map.data.overrideStyle(feature, {
            visible: visible
          });
        });
      }
    });
  }

  // ============================================
  // LEGEND UPDATE INTEGRATION
  // ============================================
  function setupLegendIntegration() {
    // Listen for data layer changes
    const colorBySelect = document.getElementById('color-by-select');
    if (colorBySelect) {
      colorBySelect.addEventListener('change', (e) => {
        const selectedLayer = e.target.value;
        const legendTitle = document.getElementById('legend-title');
        
        // Update legend title based on selected layer
        if (legendTitle) {
          const layerNames = {
            'area_rating': 'Overall Rating',
            'avg_value': 'Home Value',
            'population': 'Population',
            'median_income': 'Median Income',
            'crime_rate': 'Crime Rate',
            'housing_vacancy_rate': 'Vacancy Rate',
            'climate': 'Climate Score',
            'transit_score': 'Transit Score',
            'parks_score': 'Parks Score'
          };
          
          legendTitle.textContent = layerNames[selectedLayer] || 'Data Layer';
        }
      });
    }
  }

  // ============================================
  // SEARCH INTEGRATION
  // ============================================
  function setupSearchIntegration() {
    // When search completes, show info cards
    window.addEventListener('searchCompleted', (event) => {
      const result = event.detail;
      
      if (result && result.properties) {
        window.MapUI.showInfoCards(result.properties);
      }
    });
  }

  // ============================================
  // DETAILS DRAWER INTEGRATION
  // ============================================
  function setupDetailsDrawerIntegration() {
    const detailsDrawer = document.getElementById('details-drawer');
    const detailsClose = document.getElementById('details-close');
    
    // Close button
    if (detailsClose) {
      detailsClose.addEventListener('click', () => {
        if (detailsDrawer) {
          detailsDrawer.classList.remove('open');
        }
      });
    }
    
    // Listen for area selection
    window.addEventListener('areaSelected', (event) => {
      const data = event.detail;
      
      if (detailsDrawer && data) {
        // Update details content
        updateDetailsDrawer(data);
        detailsDrawer.classList.add('open');
      }
    });
  }

  function updateDetailsDrawer(data) {
    const detailsTitle = document.getElementById('details-title');
    const detailsContent = document.getElementById('details-content');
    
    if (detailsTitle) {
      detailsTitle.textContent = data.name || data.zip_code || data.city || 'Area Details';
    }
    
    if (detailsContent && data.properties) {
      const props = data.properties;
      
      // Build details HTML
      const html = `
        <div class="details-section">
          <h3>Overview</h3>
          <div class="detail-item">
            <span class="detail-label">Overall Rating</span>
            <span class="detail-value">${props.area_rating ? props.area_rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Median Home Value</span>
            <span class="detail-value">$${props.avg_value ? formatNumber(props.avg_value) : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Population</span>
            <span class="detail-value">${props.population ? formatNumber(props.population) : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Median Income</span>
            <span class="detail-value">$${props.median_income ? formatNumber(props.median_income) : 'N/A'}</span>
          </div>
        </div>
        
        <div class="details-section">
          <h3>Quality of Life</h3>
          <div class="detail-item">
            <span class="detail-label">Crime Rate</span>
            <span class="detail-value">${props.crime_rate !== undefined ? props.crime_rate.toFixed(1) : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Transit Score</span>
            <span class="detail-value">${props.transit_score !== undefined ? props.transit_score.toFixed(0) : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Parks Score</span>
            <span class="detail-value">${props.parks_score !== undefined ? props.parks_score.toFixed(0) : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Climate Score</span>
            <span class="detail-value">${props.climate !== undefined ? props.climate.toFixed(0) : 'N/A'}</span>
          </div>
        </div>
      `;
      
      detailsContent.innerHTML = html;
    }
  }

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  // ============================================
  // INITIALIZE ALL INTEGRATIONS
  // ============================================
  function initialize() {
    console.log('Initializing UI integrations...');
    
    setupMapHoverIntegration();
    setupPolygonClickIntegration();
    setupFilterIntegration();
    setupLegendIntegration();
    setupSearchIntegration();
    setupDetailsDrawerIntegration();
    
    console.log('UI integrations ready');
  }

  // Wait for dependencies and initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForDependencies(initialize);
    });
  } else {
    waitForDependencies(initialize);
  }

})();
