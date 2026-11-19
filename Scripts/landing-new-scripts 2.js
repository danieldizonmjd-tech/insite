/**
 * InSite Landing Page - Interactive Functionality
 * Premium Dark Theme Edition
 */

// ============================================================================
// Global State
// ============================================================================
let currentAuthForm = 'login';
let isModalOpen = false;
let isMobileMenuOpen = false;

// ============================================================================
// DOM Elements Cache
// ============================================================================
const elements = {
  navbar: null,
  navToggle: null,
  navMenu: null,
  modal: null,
  modalBackdrop: null,
  loginTab: null,
  signupTab: null,
  loginForm: null,
  signupForm: null,
  faqItems: null
};

// ============================================================================
// Initialize on DOM Load
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  initNavigation();
  // initModal(); // DEPRECATED - now using auth.html
  initFAQ();
  initScrollAnimations();
  initSmoothScroll();
});

// ============================================================================
// Cache DOM Elements
// ============================================================================
function cacheElements() {
  elements.navbar = document.getElementById('navbar');
  elements.navToggle = document.getElementById('navToggle');
  elements.navMenu = document.getElementById('navMenu');
  elements.modal = document.getElementById('authModal');
  elements.modalBackdrop = document.querySelector('.modal__backdrop');
  elements.loginTab = document.getElementById('loginTab');
  elements.signupTab = document.getElementById('signupTab');
  elements.loginForm = document.getElementById('loginForm');
  elements.signupForm = document.getElementById('signupForm');
  elements.faqItems = document.querySelectorAll('.faq-item');
}

// ============================================================================
// Navigation
// ============================================================================
function initNavigation() {
  // Scroll effect
  window.addEventListener('scroll', handleNavScroll);
  
  // Mobile menu toggle
  if (elements.navToggle && elements.navMenu) {
    elements.navToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking a link
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMobileMenuOpen) {
        toggleMobileMenu();
      }
    });
  });
}

function handleNavScroll() {
  const scrollY = window.scrollY;
  
  if (scrollY > 50) {
    elements.navbar?.classList.add('scrolled');
  } else {
    elements.navbar?.classList.remove('scrolled');
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen = !isMobileMenuOpen;
  elements.navMenu?.classList.toggle('active');
  elements.navToggle?.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

// ============================================================================
// Auth Modal - DEPRECATED (now using auth.html)
// ============================================================================
// Auth modal functions are no longer used - we redirect to auth.html instead
// Keeping this code commented for reference

/*
function initModal() {
  // Tab switching
  if (elements.loginTab && elements.signupTab) {
    elements.loginTab.addEventListener('click', () => switchAuthForm('login'));
    elements.signupTab.addEventListener('click', () => switchAuthForm('signup'));
  }

  // Close on backdrop click
  if (elements.modalBackdrop) {
    elements.modalBackdrop.addEventListener('click', closeAuthModal);
  }

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeAuthModal();
    }
  });

  // Form submissions
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (elements.signupForm) {
    elements.signupForm.addEventListener('submit', handleSignupSubmit);
  }
}

function showAuthModal(formType = 'login') {
  if (!elements.modal) {
    console.error('Modal not found');
    return;
  }

  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  isModalOpen = true;

  switchAuthForm(formType);
}

function closeAuthModal() {
  if (!elements.modal) return;

  elements.modal.classList.remove('active');
  document.body.style.overflow = '';
  isModalOpen = false;
}

function switchAuthForm(formType) {
  currentAuthForm = formType;

  // Update tabs
  if (formType === 'login') {
    elements.loginTab?.classList.add('active');
    elements.signupTab?.classList.remove('active');
    elements.loginForm?.classList.add('active');
    elements.signupForm?.classList.remove('active');
  } else {
    elements.signupTab?.classList.add('active');
    elements.loginTab?.classList.remove('active');
    elements.signupForm?.classList.add('active');
    elements.loginForm?.classList.remove('active');
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();

  const emailInput = e.target.querySelector('input[type="email"]').value;
  const passwordInput = e.target.querySelector('input[type="password"]').value;

  // Sanitize and validate inputs
  const email = InputSanitizer.sanitizeEmail(emailInput);
  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }

  const passwordValidation = InputSanitizer.validatePassword(passwordInput);
  if (!passwordValidation.valid) {
    alert(passwordValidation.message);
    return;
  }

  console.log('Login attempt:', { email: InputSanitizer.sanitizeHTML(email) });

  // TODO: Implement actual login logic
  alert('Login functionality coming soon!\n\nEmail: ' + InputSanitizer.sanitizeHTML(email));
}

function handleSignupSubmit(e) {
  e.preventDefault();

  const firstNameInput = document.getElementById('signupFirstName').value;
  const lastNameInput = document.getElementById('signupLastName').value;
  const emailInput = e.target.querySelector('input[type="email"]').value;
  const passwordInput = e.target.querySelector('input[type="password"]').value;

  // Sanitize and validate inputs
  const firstName = InputSanitizer.sanitizeText(firstNameInput, 50);
  const lastName = InputSanitizer.sanitizeText(lastNameInput, 50);

  if (!firstName || firstName.length < 2) {
    alert('Please enter a valid first name (at least 2 characters).');
    return;
  }

  if (!lastName || lastName.length < 2) {
    alert('Please enter a valid last name (at least 2 characters).');
    return;
  }

  const email = InputSanitizer.sanitizeEmail(emailInput);
  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }

  const passwordValidation = InputSanitizer.validatePassword(passwordInput);
  if (!passwordValidation.valid) {
    alert(passwordValidation.message);
    return;
  }

  console.log('Signup attempt:', {
    name: InputSanitizer.sanitizeHTML(firstName + ' ' + lastName),
    email: InputSanitizer.sanitizeHTML(email)
  });

  // TODO: Implement actual signup logic
  alert('Signup functionality coming soon!\n\nName: ' + firstName + ' ' + lastName + '\nEmail: ' + email);
}

// Google OAuth placeholder
function handleGoogleAuth() {
  console.log('Google OAuth initiated');
  alert('Google authentication coming soon!');
}
*/

// ============================================================================
// FAQ Accordion
// ============================================================================
function initFAQ() {
  elements.faqItems?.forEach((item, index) => {
    const question = item.querySelector('.faq-item__question');
    
    if (question) {
      question.addEventListener('click', () => toggleFAQItem(item));
    }
    
    // Open first item by default
    if (index === 0) {
      item.classList.add('active');
    }
  });
}

function toggleFAQItem(item) {
  const isActive = item.classList.contains('active');
  
  // Close all items
  elements.faqItems?.forEach(faqItem => {
    faqItem.classList.remove('active');
  });
  
  // Toggle current item
  if (!isActive) {
    item.classList.add('active');
  }
}

// ============================================================================
// FAQ Toggle Function (for HTML onclick handlers)
// ============================================================================

function toggleFaq(button) {
  const faqItem = button.closest('.faq-item');
  const wasActive = faqItem.classList.contains('active');
  
  // Close all FAQ items
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Toggle current item
  if (!wasActive) {
    faqItem.classList.add('active');
  }
}

// Make it globally available
window.toggleFaq = toggleFaq;

// ============================================================================
// Auth Form Functions - DEPRECATED (now using auth.html)
// ============================================================================
/*
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  console.log('Login attempt:', { email });
  trackEvent('login_attempt', { email });

  // TODO: Implement actual login logic
  alert('Login functionality coming soon!\n\nEmail: ' + email);
}

function handleSignup(event) {
  event.preventDefault();

  const firstName = document.getElementById('signupFirstName')?.value;
  const lastName = document.getElementById('signupLastName')?.value;
  const email = document.getElementById('signupEmail')?.value;
  const password = document.getElementById('signupPassword')?.value;

  console.log('Signup attempt:', { firstName, lastName, email });
  trackEvent('signup_attempt', { name: `${firstName} ${lastName}`, email });

  // TODO: Implement actual signup logic
  alert('Signup functionality coming soon!\n\nName: ' + firstName + ' ' + lastName + '\nEmail: ' + email);
}

// Make functions globally available
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
*/

// ============================================================================
// Smooth Scroll
// ============================================================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') {
        e.preventDefault();
        return;
      }
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        // Calculate offset for fixed navbar
        const navbarHeight = elements.navbar?.offsetHeight || 80;
        const targetPosition = target.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================================================
// Scroll Animations
// ============================================================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all animatable elements
  const animatableElements = document.querySelectorAll(`
    .feature-card,
    .step,
    .value-card,
    .source-card,
    .price-card,
    .faq-item,
    .social-proof__item
  `);
  
  animatableElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

// Debounce function for performance
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

// Track analytics events (placeholder)
function trackEvent(eventName, eventData = {}) {
  console.log('Analytics Event:', eventName, eventData);
  
  // TODO: Implement actual analytics tracking
  // Example: gtag('event', eventName, eventData);
}

// ============================================================================
// Global Functions (called from HTML)
// ============================================================================

// DEPRECATED - Auth functions now redirect to auth.html
// window.showAuthModal = showAuthModal;
// window.closeAuthModal = closeAuthModal;
// window.handleGoogleAuth = handleGoogleAuth;

// ============================================================================
// Performance Monitoring
// ============================================================================

// Log performance metrics
window.addEventListener('load', () => {
  // Get navigation timing
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  
  console.log('Page Load Time:', pageLoadTime + 'ms');
  
  // Track page view
  trackEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_load_time: pageLoadTime
  });
});

// ============================================================================
// Error Handling
// ============================================================================

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  
  // TODO: Send to error tracking service
  trackEvent('javascript_error', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno
  });
});

// ============================================================================
// Interactive Demo Enhancement
// ============================================================================

// Add click tracking to CTA buttons
document.addEventListener('click', (e) => {
  const button = e.target.closest('.btn--primary');
  
  if (button) {
    const buttonText = button.textContent.trim();
    trackEvent('cta_click', {
      button_text: buttonText,
      button_location: button.closest('section')?.className || 'unknown'
    });
  }
});

// ============================================================================
// Pricing Toggle (if needed in future)
// ============================================================================

function togglePricingPeriod(period) {
  // Placeholder for monthly/annual pricing toggle
  console.log('Pricing period changed to:', period);
  trackEvent('pricing_toggle', { period });
}

window.togglePricingPeriod = togglePricingPeriod;

// ============================================================================
// Newsletter Subscription (placeholder)
// ============================================================================

function handleNewsletterSignup(email) {
  console.log('Newsletter signup:', email);
  trackEvent('newsletter_signup', { email });
  
  // TODO: Implement actual newsletter signup
  alert('Thanks for subscribing! You\'ll hear from us soon.');
}

window.handleNewsletterSignup = handleNewsletterSignup;

// ============================================================================
// Console Welcome Message
// ============================================================================

console.log('%c👋 Welcome to InSite!', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cInterested in our tech stack? We\'re built with modern web technologies!', 'font-size: 14px; color: #9ca3af;');
console.log('%cCheck out our GitHub: https://github.com/yourusername/insite', 'font-size: 12px; color: #06b6d4;');
