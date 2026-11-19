// filepath: /Users/ilyessmoudden/Documents/Insite/Map/landing-scripts.js
/**
 * InSite Landing Page - Interactive Functionality
 * Ultra Modern Glassmorphism Edition
 */

// ============================================
// Global State
// ============================================
let currentAuthForm = 'login';
let isModalOpen = false;

// ============================================
// Navigation Scroll Effect with Parallax
// ============================================
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  const scrollY = window.scrollY;
  
  if (scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  // Parallax effect for hero orbs
  const orbs = document.querySelectorAll('.gradient-orb');
  orbs.forEach((orb, index) => {
    const speed = 0.3 + (index * 0.1);
    orb.style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ============================================
// Auth Modal Functions
// ============================================
function showAuthModal(formType) {
  const modal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (!modal || !loginForm || !signupForm) {
    console.error('Modal elements not found');
    return;
  }
  
  // Show the modal
  modal.classList.add('active');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  isModalOpen = true;
  currentAuthForm = formType;
  
  // Show the correct form
  if (formType === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
  
  // Focus first input
  setTimeout(() => {
    const activeForm = formType === 'login' ? loginForm : signupForm;
    const firstInput = activeForm.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 300);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  
  modal.classList.remove('active');
  modal.style.display = 'none';
  document.body.style.overflow = '';
  isModalOpen = false;
  
  // Reset forms
  const forms = modal.querySelectorAll('form');
  forms.forEach(form => form.reset());
}

// ============================================
// Guest Access
// ============================================
function continueAsGuest() {
  sessionStorage.setItem('insite_guest', 'true');
  showNotification('Entering as guest...', 'info');
  
  setTimeout(() => {
    window.location.href = 'insite_main.html';
  }, 500);
}

// ============================================
// Form Handlers
// ============================================
function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.querySelector('#loginEmail').value;
  const password = form.querySelector('#loginPassword').value;
  
  // Validate
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  if (!password || password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }
  
  // Show loading
  const submitBtn = form.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing In...';
  submitBtn.disabled = true;
  
  // Simulate login
  setTimeout(() => {
    sessionStorage.setItem('insite_user', email);
    showNotification('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'insite_main.html';
    }, 1000);
  }, 1500);
}

function handleSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const firstName = form.querySelector('#signupFirstName').value;
  const lastName = form.querySelector('#signupLastName').value;
  const email = form.querySelector('#signupEmail').value;
  const password = form.querySelector('#signupPassword').value;
  const confirmPassword = form.querySelector('#signupConfirmPassword').value;
  
  // Validate
  if (!firstName || firstName.trim().length < 2) {
    showNotification('Please enter your first name', 'error');
    return;
  }
  
  if (!lastName || lastName.trim().length < 2) {
    showNotification('Please enter your last name', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  if (!password || password.length < 8) {
    showNotification('Password must be at least 8 characters', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  // Show loading
  const submitBtn = form.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating Account...';
  submitBtn.disabled = true;
  
  // Simulate signup
  setTimeout(() => {
    sessionStorage.setItem('insite_user', email);
    sessionStorage.setItem('insite_name', `${firstName} ${lastName}`);
    showNotification('Account created successfully! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'insite_main.html';
    }, 1000);
  }, 1500);
}

// ============================================
// Validation Helpers
// ============================================
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelectorAll('.notification');
  existing.forEach(n => n.remove());
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#06b6d4'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    max-width: 400px;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
    backdrop-filter: blur(10px);
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// Intersection Observer for Scroll Animations
// ============================================
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0.15
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// ============================================
// Mouse Move Glassmorphism Effect
// ============================================
document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.feature-card, .visual-card, .insight-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    }
  });
});

// Reset card transforms when mouse leaves
document.addEventListener('mouseout', (e) => {
  if (!e.relatedTarget || !e.relatedTarget.closest('.feature-card, .visual-card, .insight-card')) {
    const cards = document.querySelectorAll('.feature-card, .visual-card, .insight-card');
    cards.forEach(card => {
      card.style.transform = '';
    });
  }
});

// ============================================
// Enhanced Stats Counter with Easing
// ============================================
function animateStats() {
  const stats = document.querySelectorAll('.stat-number, .about-stat-number, .score-number');
  
  const animateValue = (element, start, end, duration, suffix = '') => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * (end - start) + start);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };
  
  stats.forEach(stat => {
    const text = stat.textContent.trim();
    const hasPlus = text.includes('+');
    const hasM = text.includes('M');
    const hasK = text.includes('K');
    
    let multiplier = 1;
    if (hasM) multiplier = 1000000;
    if (hasK) multiplier = 1000;
    
    const numberStr = text.replace(/[^\d.]/g, '');
    const number = parseFloat(numberStr);
    
    if (!isNaN(number) && number > 0) {
      const target = number;
      let suffix = '';
      if (hasM) suffix = 'M';
      if (hasK) suffix = 'K';
      if (hasPlus) suffix += '+';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateValue(stat, 0, target, 2000, suffix);
            observer.unobserve(stat);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(stat);
    }
  });
}

// ============================================
// Cursor Glow Effect
// ============================================
const createCursorGlow = () => {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
  `;
  document.body.appendChild(glow);
  
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  });
  
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
  
  const animate = () => {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(animate);
  };
  animate();
};

// ============================================
// Initialize on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize cursor glow effect
  createCursorGlow();
  
  // Animate elements on scroll
  const animatedElements = document.querySelectorAll('.feature-card, .insight-card, .visual-card, .value-item, .about-stat');
  animatedElements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(40px)';
    element.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
    fadeInObserver.observe(element);
  });
  
  // Smooth scroll for anchor links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeAuthModal();
    }
  });
  
  // Initialize stats animation
  animateStats();
  
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-ghost, .btn-large');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
  
  console.log('%c🚀 InSite Ultra Modern Landing Page Loaded', 'color: #6366f1; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);');
  console.log('%c✨ Glassmorphism effects active', 'color: #10b981; font-size: 14px;');
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
