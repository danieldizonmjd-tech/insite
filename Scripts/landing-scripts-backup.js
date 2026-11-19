/**
 * InSite Landing Page - Interactive Functionality
 * Handles authentication, navigation, and UI interactions
 */

// ============================================
// State Management
// ============================================

const state = {
  currentAuthTab: 'login',
  isModalOpen: false,
  hasScrolled: false
};

// ============================================
// DOM Elements
// ============================================

const elements = {
  nav: null,
  modal: null,
  modalOverlay: null,
  authTabs: null,
  authForms: null,
  closeButtons: null,
  loginForm: null,
  signupForm: null,
  guestButton: null,
  navSignIn: null,
  navGetStarted: null,
  heroGetStarted: null,
  heroGuest: null
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  attachEventListeners();
  initializeAnimations();
  console.log('InSite landing page initialized');
});

/**
 * Initialize all DOM element references
 */
function initializeElements() {
  elements.nav = document.querySelector('.nav');
  elements.modal = document.getElementById('authModal');
  elements.modalOverlay = document.querySelector('.modal-overlay');
  elements.authTabs = document.querySelectorAll('.auth-tab');
  elements.authForms = document.querySelectorAll('.auth-form');
  elements.closeButtons = document.querySelectorAll('.modal-close');
  elements.loginForm = document.getElementById('loginForm');
  elements.signupForm = document.getElementById('signupForm');
  elements.guestButton = document.getElementById('guestBtn');
  elements.navSignIn = document.getElementById('navSignIn');
  elements.navGetStarted = document.getElementById('navGetStarted');
  elements.heroGetStarted = document.getElementById('heroGetStarted');
  elements.heroGuest = document.getElementById('heroGuest');
}

// ============================================
// Event Listeners
// ============================================

/**
 * Attach all event listeners
 */
function attachEventListeners() {
  // Navigation scroll effect
  window.addEventListener('scroll', handleScroll);
  
  // Modal triggers
  if (elements.navSignIn) {
    elements.navSignIn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('login');
    });
  }
  
  if (elements.navGetStarted) {
    elements.navGetStarted.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('signup');
    });
  }
  
  if (elements.heroGetStarted) {
    elements.heroGetStarted.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('signup');
    });
  }
  
  // Guest access
  if (elements.heroGuest) {
    elements.heroGuest.addEventListener('click', handleGuestAccess);
  }
  
  if (elements.guestButton) {
    elements.guestButton.addEventListener('click', handleGuestAccess);
  }
  
  // Modal close
  elements.closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  // Close modal on overlay click
  if (elements.modalOverlay) {
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) {
        closeModal();
      }
    });
  }
  
  // Auth tabs
  elements.authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.dataset.tab;
      switchAuthTab(tabType);
    });
  });
  
  // Form submissions
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', handleLogin);
  }
  
  if (elements.signupForm) {
    elements.signupForm.addEventListener('submit', handleSignup);
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
  
  // Keyboard accessibility for modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isModalOpen) {
      closeModal();
    }
  });
}

// ============================================
// Navigation
// ============================================

/**
 * Handle scroll event for navigation styling
 */
function handleScroll() {
  const scrolled = window.scrollY > 50;
  
  if (scrolled !== state.hasScrolled) {
    state.hasScrolled = scrolled;
    
    if (elements.nav) {
      if (scrolled) {
        elements.nav.classList.add('scrolled');
      } else {
        elements.nav.classList.remove('scrolled');
      }
    }
  }
}

// ============================================
// Modal Management
// ============================================

/**
 * Open authentication modal
 * @param {string} tab - 'login' or 'signup'
 */
function openModal(tab = 'login') {
  if (elements.modalOverlay) {
    elements.modalOverlay.classList.add('active');
    state.isModalOpen = true;
    document.body.style.overflow = 'hidden';
    
    switchAuthTab(tab);
    
    // Focus first input
    setTimeout(() => {
      const activeForm = document.querySelector('.auth-form.active');
      if (activeForm) {
        const firstInput = activeForm.querySelector('input');
        if (firstInput) firstInput.focus();
      }
    }, 300);
  }
}

/**
 * Close authentication modal
 */
function closeModal() {
  if (elements.modalOverlay) {
    elements.modalOverlay.classList.remove('active');
    state.isModalOpen = false;
    document.body.style.overflow = '';
    
    // Reset forms
    if (elements.loginForm) elements.loginForm.reset();
    if (elements.signupForm) elements.signupForm.reset();
  }
}

/**
 * Switch between login and signup tabs
 * @param {string} tabType - 'login' or 'signup'
 */
function switchAuthTab(tabType) {
  state.currentAuthTab = tabType;
  
  // Update tabs
  elements.authTabs.forEach(tab => {
    if (tab.dataset.tab === tabType) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update forms
  elements.authForms.forEach(form => {
    if (form.id === `${tabType}Form`) {
      form.classList.add('active');
    } else {
      form.classList.remove('active');
    }
  });
  
  // Update modal title
  const modalTitle = document.querySelector('.modal-title');
  if (modalTitle) {
    modalTitle.textContent = tabType === 'login' ? 'Welcome Back' : 'Create Account';
  }
}

// ============================================
// Authentication Handlers
// ============================================

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember');
  
  // Validate inputs
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  if (!password || password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = e.target.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing In...';
  submitBtn.disabled = true;
  
  // Simulate API call (replace with actual authentication)
  setTimeout(() => {
    // For demo purposes, accept any valid email/password
    console.log('Login attempt:', { email, password, remember });
    
    // Store session (for demo)
    if (remember) {
      localStorage.setItem('insite_user', email);
    } else {
      sessionStorage.setItem('insite_user', email);
    }
    
    showNotification('Login successful! Redirecting...', 'success');
    
    // Redirect to main application
    setTimeout(() => {
      window.location.href = 'insite_main.html';
    }, 1000);
  }, 1500);
}

/**
 * Handle signup form submission
 * @param {Event} e - Form submit event
 */
function handleSignup(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');
  const terms = formData.get('terms');
  
  // Validate inputs
  if (!name || name.trim().length < 2) {
    showNotification('Please enter your full name', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  if (!password || password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  if (!terms) {
    showNotification('Please accept the Terms of Service', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = e.target.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating Account...';
  submitBtn.disabled = true;
  
  // Simulate API call (replace with actual registration)
  setTimeout(() => {
    console.log('Signup attempt:', { name, email, password });
    
    // Store session (for demo)
    sessionStorage.setItem('insite_user', email);
    
    showNotification('Account created successfully! Redirecting...', 'success');
    
    // Redirect to main application
    setTimeout(() => {
      window.location.href = 'insite_main.html';
    }, 1000);
  }, 1500);
}

/**
 * Handle guest access
 * @param {Event} e - Click event
 */
function handleGuestAccess(e) {
  e.preventDefault();
  
  // Set guest session
  sessionStorage.setItem('insite_guest', 'true');
  
  showNotification('Entering as guest...', 'info');
  
  // Redirect to main application
  setTimeout(() => {
    window.location.href = 'insite_main.html';
  }, 500);
}

// ============================================
// Social Authentication (Placeholder)
// ============================================

/**
 * Initialize social authentication buttons
 */
function initializeSocialAuth() {
  const socialButtons = document.querySelectorAll('.btn-social');
  
  socialButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const provider = button.textContent.trim().split(' ')[0];
      handleSocialAuth(provider);
    });
  });
}

/**
 * Handle social authentication
 * @param {string} provider - 'Google' or 'GitHub'
 */
function handleSocialAuth(provider) {
  showNotification(`${provider} authentication coming soon!`, 'info');
  
  // In production, implement OAuth flow:
  // - Redirect to provider's OAuth endpoint
  // - Handle callback with authorization code
  // - Exchange code for access token
  // - Create or update user session
  
  console.log(`Social auth with ${provider} - Not implemented yet`);
}

// Initialize after DOM is ready
setTimeout(initializeSocialAuth, 100);

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether email is valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// Notifications
// ============================================

/**
 * Show notification toast
 * @param {string} message - Notification message
 * @param {string} type - 'success', 'error', or 'info'
 */
function showNotification(message, type = 'info') {
  // Check if toast container exists in insite_main.html
  let toastContainer = document.getElementById('toastContainer');
  
  // Create simple notification if toast system not available
  if (!toastContainer) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      z-index: 9999;
      animation: slideInRight 0.3s ease;
      max-width: 400px;
      font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// ============================================
// Animations
// ============================================

/**
 * Initialize scroll-based animations
 */
function initializeAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for fade-in animation
  const animatedElements = document.querySelectorAll('.feature-card, .insight-card, .visual-card');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

/**
 * Animate statistics counter
 * @param {Element} element - Counter element
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= target) {
      element.textContent = formatNumber(target);
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.floor(current));
    }
  }, 16);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Animate hero stats on load
window.addEventListener('load', () => {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const text = stat.textContent;
    const number = parseInt(text.replace(/\D/g, ''));
    const suffix = text.replace(/[\d,]/g, '');
    
    animateCounter(stat, number, 1500);
    
    // Add suffix back after animation
    setTimeout(() => {
      stat.textContent = formatNumber(number) + suffix;
    }, 1500);
  });
});

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimize scroll handler with throttle
window.addEventListener('scroll', throttle(handleScroll, 100));

// ============================================
// Development Helpers
// ============================================

// Log to console in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('%c🚀 InSite Landing Page', 'color: #6366f1; font-size: 24px; font-weight: bold;');
  console.log('%cDevelopment Mode Active', 'color: #10b981; font-size: 14px;');
  
  // Expose state for debugging
  window.insiteDebug = {
    state,
    elements,
    openModal,
    closeModal,
    switchAuthTab
  };
}

// ============================================
// Export for potential module usage
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openModal,
    closeModal,
    handleLogin,
    handleSignup,
    handleGuestAccess
  };
}
