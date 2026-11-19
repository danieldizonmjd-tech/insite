/**
 * InSite - Stripe Checkout Module
 *
 * Handles subscription upgrades via Stripe Payment Links (no backend needed)
 * and Stripe Checkout session redirects.
 * Depends on firebase-config.js and auth.js being loaded first.
 */

const StripeCheckout = {
  // Stripe publishable key (safe for client-side)
  // Replace with your actual publishable key from Stripe Dashboard
  publishableKey: 'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY',

  // Stripe Payment Link URLs (create these in Stripe Dashboard)
  // Replace with your actual Payment Link URLs
  paymentLinks: {
    professional_monthly: 'https://buy.stripe.com/YOUR_MONTHLY_LINK',
    professional_annual: 'https://buy.stripe.com/YOUR_ANNUAL_LINK'
  },

  // Price IDs (for Cloud Function approach, if used later)
  prices: {
    professional_monthly: 'price_YOUR_MONTHLY_PRICE_ID',
    professional_annual: 'price_YOUR_ANNUAL_PRICE_ID'
  },

  /**
   * Redirect to Stripe Payment Link for subscription.
   * This is the simplest approach - no backend needed.
   * @param {'professional_monthly'|'professional_annual'} plan
   * @param {string} [userEmail] - Pre-fill the email field
   */
  redirectToPaymentLink(plan, userEmail) {
    const linkUrl = this.paymentLinks[plan];
    if (!linkUrl || linkUrl.includes('YOUR_')) {
      console.error('Stripe Payment Link not configured for plan:', plan);
      if (typeof showToast === 'function') {
        showToast('Payment system is being configured. Please try again later.', 'warning');
      } else {
        alert('Payment system is being configured. Please try again later.');
      }
      return;
    }

    const url = new URL(linkUrl);

    // Pre-fill email
    if (userEmail) {
      url.searchParams.set('prefilled_email', userEmail);
    }

    // Pass Firebase UID so Stripe webhook can link payment to user
    const user = firebase.auth().currentUser;
    if (user) {
      url.searchParams.set('client_reference_id', user.uid);
    }

    window.location.href = url.toString();
  },

  /**
   * Handle return from Stripe Checkout.
   * Checks URL params for payment result and shows appropriate message.
   */
  handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      if (typeof showToast === 'function') {
        showToast('Payment successful! Pro features are now active.', 'success');
      }
      // Reload user profile to get updated tier
      const user = firebase.auth().currentUser;
      if (user && window.UserData) {
        UserData.getUserProfile(user.uid).then(profile => {
          if (profile) {
            window.userProfile = profile;
            if (profile.tier === 'professional' || profile.tier === 'enterprise') {
              localStorage.setItem('insitePro', 'true');
            }
          }
        });
      }
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      if (typeof showToast === 'function') {
        showToast('Payment was cancelled. You can upgrade anytime.', 'info');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  },

  /**
   * Open Stripe Customer Portal for subscription management.
   * Requires a Firebase Cloud Function backend endpoint.
   */
  async openCustomerPortal() {
    const user = firebase.auth().currentUser;
    if (!user) {
      if (typeof showToast === 'function') {
        showToast('Please sign in to manage your subscription.', 'warning');
      }
      return;
    }

    try {
      const idToken = await user.getIdToken();
      // Replace with your Cloud Function URL
      const functionUrl = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/createPortalSession';

      if (functionUrl.includes('YOUR_')) {
        if (typeof showToast === 'function') {
          showToast('Subscription portal is being configured. Please contact support.', 'warning');
        }
        return;
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + idToken
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      if (typeof showToast === 'function') {
        showToast('Unable to open subscription management. Please try again.', 'error');
      }
    }
  },

  /**
   * Check if Stripe.js is loaded and available.
   */
  isStripeLoaded() {
    return typeof Stripe !== 'undefined';
  }
};

// Export globally
window.StripeCheckout = StripeCheckout;
