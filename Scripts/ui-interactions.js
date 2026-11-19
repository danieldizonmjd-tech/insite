/* ============================================
   INSITE MAP - UI INTERACTIONS (JAN 5, 2026)
   Handles all UI panel toggles and interactions
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // STATE
  // ============================================
  const uiState = {
    filtersVisible: false,
    infoCardsVisible: false,
    quickStatsVisible: false,
    scoreRingVisible: false,
    detailsDrawerOpen: false
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const elements = {
    // Buttons
    filtersToggle: document.getElementById('filters-toggle'),
    filtersClose: document.getElementById('filters-close'),
    infoCardsClose: document.getElementById('info-cards-close'),
    filtersReset: document.getElementById('filters-reset'),
    
    // Panels
    filtersPanel: document.getElementById('filters-panel'),
    infoCardsPanel: document.getElementById('info-cards-panel'),
    quickStatsPanel: document.getElementById('quick-stats-panel'),
    detailsDrawer: document.getElementById('details-drawer'),
    scoreRingOverlay: document.getElementById('score-ring-overlay'),
    
    // Filter inputs
    valueMin: document.getElementById('value-min'),
    valueMax: document.getElementById('value-max'),
    popMin: document.getElementById('pop-min'),
    popMax: document.getElementById('pop-max'),
    incomeMin: document.getElementById('income-min'),
    incomeMax: document.getElementById('income-max'),
    ratingFilter: document.getElementById('rating-filter'),
    
    // Score ring
    scoreRingValue: document.getElementById('score-ring-value'),
    scoreRingLabel: document.getElementById('score-ring-label'),
    scoreRingLocation: document.getElementById('score-ring-location'),
    scoreRingProgress: document.querySelector('.score-ring-progress')
  };

  // ============================================
  // FILTERS PANEL
  // ============================================
  function toggleFiltersPanel() {
    uiState.filtersVisible = !uiState.filtersVisible;
    if (uiState.filtersVisible) {
      elements.filtersPanel.classList.add('visible');
    } else {
      elements.filtersPanel.classList.remove('visible');
    }
  }

  function closeFiltersPanel() {
    uiState.filtersVisible = false;
    elements.filtersPanel.classList.remove('visible');
  }

  function resetFilters() {
    elements.valueMin.value = '';
    elements.valueMax.value = '';
    elements.popMin.value = '';
    elements.popMax.value = '';
    elements.incomeMin.value = '';
    elements.incomeMax.value = '';
    elements.ratingFilter.value = '0';
    
    console.log('Filters reset');
    // Trigger filter change event
    window.dispatchEvent(new CustomEvent('filtersChanged', {
      detail: { filters: getActiveFilters() }
    }));
  }

  function getActiveFilters() {
    return {
      valueMin: elements.valueMin.value ? parseFloat(elements.valueMin.value) : null,
      valueMax: elements.valueMax.value ? parseFloat(elements.valueMax.value) : null,
      popMin: elements.popMin.value ? parseFloat(elements.popMin.value) : null,
      popMax: elements.popMax.value ? parseFloat(elements.popMax.value) : null,
      incomeMin: elements.incomeMin.value ? parseFloat(elements.incomeMin.value) : null,
      incomeMax: elements.incomeMax.value ? parseFloat(elements.incomeMax.value) : null,
      minRating: elements.ratingFilter.value ? parseFloat(elements.ratingFilter.value) : 0
    };
  }

  // ============================================
  // INFO CARDS PANEL
  // ============================================
  function showInfoCards(data) {
    if (!data) return;
    
    // Update card values
    const cards = {
      value: document.querySelector('.info-card[data-metric="value"] .info-card-value'),
      population: document.querySelector('.info-card[data-metric="population"] .info-card-value'),
      income: document.querySelector('.info-card[data-metric="income"] .info-card-value'),
      crime: document.querySelector('.info-card[data-metric="crime"] .info-card-value'),
      transit: document.querySelector('.info-card[data-metric="transit"] .info-card-value'),
      parks: document.querySelector('.info-card[data-metric="parks"] .info-card-value')
    };

    // Format and set values
    if (cards.value && data.avg_value) {
      cards.value.textContent = '$' + formatNumber(data.avg_value);
      setCardColorClass(cards.value.closest('.info-card'), data.avg_value, 'value');
    }
    if (cards.population && data.population) {
      cards.population.textContent = formatNumber(data.population);
      setCardColorClass(cards.population.closest('.info-card'), data.population, 'population');
    }
    if (cards.income && data.median_income) {
      cards.income.textContent = '$' + formatNumber(data.median_income);
      setCardColorClass(cards.income.closest('.info-card'), data.median_income, 'income');
    }
    if (cards.crime && data.crime_rate !== undefined) {
      cards.crime.textContent = data.crime_rate.toFixed(1);
      setCardColorClass(cards.crime.closest('.info-card'), 100 - data.crime_rate, 'crime');
    }
    if (cards.transit && data.transit_score !== undefined) {
      cards.transit.textContent = data.transit_score.toFixed(0);
      setCardColorClass(cards.transit.closest('.info-card'), data.transit_score, 'transit');
    }
    if (cards.parks && data.parks_score !== undefined) {
      cards.parks.textContent = data.parks_score.toFixed(0);
      setCardColorClass(cards.parks.closest('.info-card'), data.parks_score, 'parks');
    }

    // Show panel
    uiState.infoCardsVisible = true;
    elements.infoCardsPanel.classList.add('visible');
  }

  function hideInfoCards() {
    uiState.infoCardsVisible = false;
    elements.infoCardsPanel.classList.remove('visible');
  }

  function setCardColorClass(card, value, metric) {
    // Remove all color classes
    card.classList.remove('excellent', 'good', 'average', 'fair', 'poor');
    
    // Add appropriate class based on value
    if (value >= 80) {
      card.classList.add('excellent');
    } else if (value >= 70) {
      card.classList.add('good');
    } else if (value >= 50) {
      card.classList.add('average');
    } else if (value >= 30) {
      card.classList.add('fair');
    } else {
      card.classList.add('poor');
    }
  }

  // ============================================
  // SCORE RING - CURSOR FOLLOWER
  // ============================================
  function showScoreRing(x, y, score, location) {
    if (!elements.scoreRingOverlay) return;
    
    elements.scoreRingOverlay.style.left = x + 'px';
    elements.scoreRingOverlay.style.top = y + 'px';
    
    // Update score value
    if (elements.scoreRingValue) {
      elements.scoreRingValue.textContent = Math.round(score);
    }
    
    // Update location
    if (elements.scoreRingLocation && location) {
      elements.scoreRingLocation.textContent = location;
    }
    
    // Update ring progress
    if (elements.scoreRingProgress) {
      const circumference = 2 * Math.PI * 25; // radius = 25
      const progress = (score / 100) * circumference;
      elements.scoreRingProgress.style.strokeDasharray = `${circumference}`;
      elements.scoreRingProgress.style.strokeDashoffset = `${circumference - progress}`;
      
      // Color based on score
      let color = '#ef4444'; // poor
      if (score >= 80) color = '#10b981'; // excellent
      else if (score >= 70) color = '#84cc16'; // good
      else if (score >= 50) color = '#fde047'; // average
      else if (score >= 30) color = '#f59e0b'; // fair
      
      elements.scoreRingProgress.style.stroke = color;
    }
    
    uiState.scoreRingVisible = true;
    elements.scoreRingOverlay.classList.add('visible');
  }

  function hideScoreRing() {
    uiState.scoreRingVisible = false;
    if (elements.scoreRingOverlay) {
      elements.scoreRingOverlay.classList.remove('visible');
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function initializeEventListeners() {
    // Filters toggle
    if (elements.filtersToggle) {
      elements.filtersToggle.addEventListener('click', toggleFiltersPanel);
    }
    
    if (elements.filtersClose) {
      elements.filtersClose.addEventListener('click', closeFiltersPanel);
    }
    
    if (elements.filtersReset) {
      elements.filtersReset.addEventListener('click', resetFilters);
    }
    
    // Info cards close
    if (elements.infoCardsClose) {
      elements.infoCardsClose.addEventListener('click', hideInfoCards);
    }
    
    // Filter inputs - trigger filter change on input
    const filterInputs = [
      elements.valueMin, elements.valueMax,
      elements.popMin, elements.popMax,
      elements.incomeMin, elements.incomeMax,
      elements.ratingFilter
    ];
    
    filterInputs.forEach(input => {
      if (input) {
        input.addEventListener('change', () => {
          window.dispatchEvent(new CustomEvent('filtersChanged', {
            detail: { filters: getActiveFilters() }
          }));
        });
      }
    });
  }

  // ============================================
  // PUBLIC API
  // ============================================
  window.MapUI = {
    // Filters
    toggleFilters: toggleFiltersPanel,
    closeFilters: closeFiltersPanel,
    resetFilters: resetFilters,
    getFilters: getActiveFilters,
    
    // Info Cards
    showInfoCards: showInfoCards,
    hideInfoCards: hideInfoCards,
    
    // Score Ring
    showScoreRing: showScoreRing,
    hideScoreRing: hideScoreRing,
    
    // State
    getState: () => ({ ...uiState })
  };

  // ============================================
  // INITIALIZE
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    console.log('UI Interactions initialized');
    initializeEventListeners();
  });

})();
