/**
 * InSite - User Data Module (Firestore CRUD)
 *
 * Handles all Firestore operations for user profiles, favorites,
 * search history, and preferences.
 * Depends on firebase-config.js being loaded first.
 */

const UserData = {
  /**
   * Create initial user document on signup.
   */
  async createUserProfile(uid, data) {
    return db.collection('users').doc(uid).set({
      uid: uid,
      email: data.email || '',
      displayName: data.displayName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      photoURL: data.photoURL || '',
      tier: 'explorer',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      trialEnd: null,
      favorites: [],
      searchHistory: [],
      savedPreferences: {
        theme: 'auto',
        compactMode: false,
        animations: true,
        defaultMetro: null,
        matchPreferences: null
      },
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMetroUsed: null,
      loginCount: 1
    }, { merge: true });
  },

  /**
   * Get user profile from Firestore.
   */
  async getUserProfile(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  /**
   * Update specific fields on the user profile.
   */
  async updateUserProfile(uid, updates) {
    try {
      updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      return await db.collection('users').doc(uid).update(updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // --- Favorites ---

  /**
   * Add a favorite ZIP code / location.
   */
  async addFavorite(uid, favorite) {
    try {
      return await db.collection('users').doc(uid).update({
        favorites: firebase.firestore.FieldValue.arrayUnion({
          zipCode: favorite.zipCode,
          name: favorite.name || '',
          type: favorite.type || 'zip',
          metro: favorite.metro || 'atlanta',
          lat: favorite.lat || null,
          lng: favorite.lng || null,
          addedAt: new Date().toISOString()
        }),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  /**
   * Remove a favorite by ZIP code.
   * arrayRemove requires exact match, so we read-filter-write.
   */
  async removeFavorite(uid, zipCode) {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) return;
      const updated = (profile.favorites || []).filter(f => f.zipCode !== zipCode);
      return await this.updateUserProfile(uid, { favorites: updated });
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  /**
   * Replace all favorites at once (for bulk sync).
   */
  async setFavorites(uid, favorites) {
    try {
      return await this.updateUserProfile(uid, { favorites });
    } catch (error) {
      console.error('Error setting favorites:', error);
      throw error;
    }
  },

  // --- Search History ---

  /**
   * Add a search history entry. Deduplicates and limits to 50.
   */
  async addSearchHistoryEntry(uid, zipCode, metro) {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) return;
      let history = profile.searchHistory || [];
      // Prepend, deduplicate, limit to 50
      history = [
        { zipCode, metro: metro || 'atlanta', timestamp: new Date().toISOString() },
        ...history.filter(h => h.zipCode !== zipCode)
      ].slice(0, 50);
      return await this.updateUserProfile(uid, { searchHistory: history });
    } catch (error) {
      console.error('Error adding search history:', error);
    }
  },

  // --- Preferences ---

  /**
   * Save user preferences.
   */
  async savePreferences(uid, preferences) {
    try {
      return await this.updateUserProfile(uid, {
        savedPreferences: preferences
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  // --- Subscription Tier ---

  /**
   * Get user's subscription tier.
   */
  async getUserTier(uid) {
    const profile = await this.getUserProfile(uid);
    return profile?.tier || 'explorer';
  },

  // --- Account Deletion ---

  /**
   * Delete all user data from Firestore.
   */
  async deleteUserData(uid) {
    try {
      return await db.collection('users').doc(uid).delete();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  },

  // --- Favorites Sync Helper ---

  /**
   * Merge localStorage favorites into Firestore (one-time migration).
   */
  async mergeFavoritesFromLocalStorage(uid) {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) return;

      const firestoreFavs = profile.favorites || [];
      const firestoreZips = new Set(firestoreFavs.map(f => f.zipCode));

      // Read from both localStorage keys used in the app
      const localFavs = JSON.parse(localStorage.getItem('insiteFavorites') || '[]');
      const localFavs2 = JSON.parse(localStorage.getItem('insite_favorites') || '[]');

      const newEntries = [];

      // Simple string array (insiteFavorites)
      for (const zip of localFavs) {
        if (typeof zip === 'string' && !firestoreZips.has(zip)) {
          newEntries.push({
            zipCode: zip,
            name: '',
            type: 'zip',
            metro: 'atlanta',
            lat: null,
            lng: null,
            addedAt: new Date().toISOString()
          });
          firestoreZips.add(zip);
        }
      }

      // Object array (insite_favorites from phase2)
      for (const fav of localFavs2) {
        const zipCode = fav.id || fav.zipCode;
        if (zipCode && !firestoreZips.has(zipCode)) {
          newEntries.push({
            zipCode,
            name: fav.name || '',
            type: fav.type || 'zip',
            metro: 'atlanta',
            lat: fav.lat || null,
            lng: fav.lng || null,
            addedAt: fav.addedAt || new Date().toISOString()
          });
          firestoreZips.add(zipCode);
        }
      }

      if (newEntries.length > 0) {
        const merged = [...firestoreFavs, ...newEntries];
        await this.updateUserProfile(uid, { favorites: merged });
        return merged;
      }

      return firestoreFavs;
    } catch (error) {
      console.error('Error merging favorites:', error);
      return [];
    }
  }
};

// Export globally
window.UserData = UserData;
