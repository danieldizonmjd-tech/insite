/**
 * InSite - Auth Helper Module
 *
 * Shared authentication logic used across all pages.
 * Depends on firebase-config.js being loaded first.
 */

const InsiteAuth = {
  _readyCallbacks: [],
  _initialized: false,
  _currentUser: null,
  _authResolved: false,

  /**
   * Initialize auth state listener. Called automatically.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    firebase.auth().onAuthStateChanged((user) => {
      this._currentUser = user;
      this._authResolved = true;
      // Fire all queued callbacks
      const callbacks = this._readyCallbacks.slice();
      this._readyCallbacks = [];
      callbacks.forEach(cb => {
        try { cb(user); } catch (e) { console.error('Auth ready callback error:', e); }
      });
    });
  },

  /**
   * Register a callback for when auth state is first determined.
   * If auth is already resolved, fires immediately.
   */
  onAuthReady(callback) {
    if (!this._initialized) this.init();

    if (this._authResolved) {
      // Auth state already determined, fire immediately
      try { callback(this._currentUser); } catch (e) { console.error('Auth ready callback error:', e); }
    } else {
      // Queue for when auth state resolves
      this._readyCallbacks.push(callback);
    }
  },

  /**
   * Sign in with email and password.
   */
  async signInWithEmail(email, password) {
    try {
      const result = await firebase.auth().signInWithEmailAndPassword(email, password);
      // Update last login
      if (result.user) {
        await this._updateLastLogin(result.user.uid);
      }
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Create a new account with email and password.
   */
  async signUpWithEmail(email, password, firstName, lastName) {
    try {
      const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const displayName = (firstName + ' ' + lastName).trim();

      // Set display name
      if (displayName) {
        await result.user.updateProfile({ displayName });
      }

      // Create Firestore user document
      if (window.UserData) {
        await UserData.createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName,
          firstName,
          lastName,
          photoURL: result.user.photoURL || ''
        });
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Sign in with an OAuth provider (popup).
   * @param {'google'|'microsoft'|'github'|'apple'} providerName
   */
  async signInWithProvider(providerName) {
    let provider;

    switch (providerName) {
      case 'google':
        provider = new firebase.auth.GoogleAuthProvider();
        break;
      case 'microsoft':
        provider = new firebase.auth.OAuthProvider('microsoft.com');
        break;
      case 'github':
        provider = new firebase.auth.GithubAuthProvider();
        break;
      case 'apple':
        provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        break;
      default:
        return { success: false, error: 'Unknown provider: ' + providerName };
    }

    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
      const isNewUser = result.additionalUserInfo?.isNewUser;

      // Create Firestore doc for new OAuth users
      if (isNewUser && window.UserData) {
        const nameParts = (user.displayName || '').split(' ');
        await UserData.createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          photoURL: user.photoURL || ''
        });
      } else {
        await this._updateLastLogin(user.uid);
      }

      return { success: true, user };
    } catch (error) {
      // Handle account-exists-with-different-credential
      if (error.code === 'auth/account-exists-with-different-credential') {
        return {
          success: false,
          error: 'An account already exists with this email address using a different sign-in method. Please sign in with your original method.'
        };
      }
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Send a password reset email.
   */
  async sendPasswordReset(email) {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Sign out and redirect to auth page.
   */
  async signOut(redirectUrl) {
    try {
      await firebase.auth().signOut();
      sessionStorage.removeItem('insiteGuestMode');
      localStorage.removeItem('insitePro');
      window.currentUser = null;
      window.userProfile = null;
      window.isGuestUser = true;
      if (redirectUrl !== false) {
        const authPage = window.location.pathname.includes('/App/') ? '../auth.html' : 'auth.html';
        window.location.href = redirectUrl || authPage;
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  /**
   * Change password for email/password users.
   * Requires reauthentication first.
   */
  async changePassword(currentPassword, newPassword) {
    const user = firebase.auth().currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No user is signed in.' };
    }

    try {
      // Reauthenticate
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      // Update password
      await user.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Update user display name.
   */
  async updateDisplayName(newName) {
    const user = firebase.auth().currentUser;
    if (!user) return { success: false, error: 'No user is signed in.' };

    try {
      await user.updateProfile({ displayName: newName });
      if (window.UserData) {
        const nameParts = newName.split(' ');
        await UserData.updateUserProfile(user.uid, {
          displayName: newName,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Delete the current user's account entirely.
   */
  async deleteAccount(password) {
    const user = firebase.auth().currentUser;
    if (!user) return { success: false, error: 'No user is signed in.' };

    try {
      // Reauthenticate if email/password user
      if (password && user.providerData[0]?.providerId === 'password') {
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);
      }

      // Delete Firestore data first
      if (window.UserData) {
        await UserData.deleteUserData(user.uid);
      }

      // Delete Firebase Auth account
      await user.delete();

      // Clean up local state
      sessionStorage.removeItem('insiteGuestMode');
      localStorage.removeItem('insitePro');
      localStorage.removeItem('insiteFavorites');
      localStorage.removeItem('insite_favorites');
      localStorage.removeItem('insiteSearchHistory');

      return { success: true };
    } catch (error) {
      return { success: false, error: this._getErrorMessage(error) };
    }
  },

  /**
   * Auth guard: ensures user is logged in or in guest mode.
   * If neither, redirects to auth page.
   */
  requireAuth(redirectTarget) {
    const isGuestMode = sessionStorage.getItem('insiteGuestMode') === 'true';
    if (isGuestMode) {
      window.currentUser = null;
      window.isGuestUser = true;
      return;
    }

    this.onAuthReady((user) => {
      if (!user && !isGuestMode) {
        const authPage = window.location.pathname.includes('/App/') ? '../auth.html' : 'auth.html';
        const currentPath = redirectTarget || window.location.pathname + window.location.search;
        window.location.href = authPage + '?redirect=' + encodeURIComponent(currentPath);
      }
    });
  },

  /**
   * Check if current session is guest mode.
   */
  isGuest() {
    return !firebase.auth().currentUser;
  },

  /**
   * Get the auth provider type for the current user.
   */
  getProviderType() {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    return user.providerData[0]?.providerId || null;
  },

  // --- Private helpers ---

  async _updateLastLogin(uid) {
    if (window.UserData) {
      try {
        await UserData.updateUserProfile(uid, {
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        // Non-critical, don't block sign-in
        console.warn('Failed to update lastLogin:', e);
      }
    }
  },

  _getErrorMessage(error) {
    const messages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 8 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
      'auth/requires-recent-login': 'Please sign in again to perform this action.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    return messages[error.code] || error.message || 'An unexpected error occurred.';
  }
};

// Auto-initialize
InsiteAuth.init();

// Convenience function (global)
function onAuthReady(callback) {
  InsiteAuth.onAuthReady(callback);
}

// Export globally
window.InsiteAuth = InsiteAuth;
window.onAuthReady = onAuthReady;
