/**
 * InSite - Account Panel Module
 *
 * Manages the Account section in the settings panel of the main app.
 * Provides profile editing, password management, subscription management,
 * and account deletion functionality.
 *
 * Depends on: firebase-config.js, auth.js, user-data.js, stripe-checkout.js
 */

const AccountPanel = {
  /**
   * Initialize the account panel and render based on auth state.
   */
  init() {
    this.renderAccountSection();
  },

  /**
   * Render the account section based on current auth state.
   */
  renderAccountSection() {
    const container = document.getElementById('accountActions');
    if (!container) return;

    const user = firebase.auth().currentUser;
    const profile = window.userProfile;

    if (!user) {
      // Guest mode
      container.innerHTML = `
        <div class="account-guest">
          <div class="account-guest__icon">
            <i class="fas fa-user-circle" style="font-size: 2.5rem; color: var(--text-muted);"></i>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.75rem 0;">You're browsing as a guest. Create an account to save your favorites and preferences.</p>
          <button class="settings-action-btn account-btn--highlight" onclick="window.location.href='../auth.html?mode=signup'">
            <i class="fas fa-user-plus"></i>
            <span>Create Account</span>
          </button>
          <button class="settings-action-btn" onclick="window.location.href='../auth.html?mode=login'">
            <i class="fas fa-sign-in-alt"></i>
            <span>Sign In</span>
          </button>
        </div>
      `;
      return;
    }

    // Logged in - build the account section
    const tierLabel = this._getTierBadge(profile?.tier);
    const isPasswordUser = user.providerData.some(p => p.providerId === 'password');
    const isExplorer = !profile?.tier || profile.tier === 'explorer';

    container.innerHTML = `
      <div class="account-info">
        <div class="account-avatar">
          ${user.photoURL
            ? `<img src="${this._sanitize(user.photoURL)}" alt="" class="account-avatar__img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="account-avatar__fallback" style="display:none;">${this._getInitial(user)}</div>`
            : `<div class="account-avatar__fallback">${this._getInitial(user)}</div>`
          }
        </div>
        <div class="account-details">
          <div class="account-name">${this._sanitize(user.displayName || 'User')} ${tierLabel}</div>
          <div class="account-email">${this._sanitize(user.email || '')}</div>
        </div>
      </div>

      <button class="settings-action-btn" onclick="AccountPanel.showProfileEditor()">
        <i class="fas fa-user-edit"></i>
        <span>Edit Profile</span>
      </button>
      ${isPasswordUser ? `
      <button class="settings-action-btn" onclick="AccountPanel.showChangePassword()">
        <i class="fas fa-key"></i>
        <span>Change Password</span>
      </button>` : ''}
      ${isExplorer ? `
      <button class="settings-action-btn account-btn--upgrade" onclick="showProUpgradeModal()">
        <i class="fas fa-crown"></i>
        <span>Upgrade to Pro</span>
      </button>` : `
      <button class="settings-action-btn" onclick="StripeCheckout.openCustomerPortal()">
        <i class="fas fa-credit-card"></i>
        <span>Manage Subscription</span>
      </button>`}
      <button class="settings-action-btn account-btn--danger" onclick="AccountPanel.showDeleteConfirm()">
        <i class="fas fa-trash-alt"></i>
        <span>Delete Account</span>
      </button>
      <button class="settings-action-btn" onclick="AccountPanel.handleSignOut()">
        <i class="fas fa-sign-out-alt"></i>
        <span>Sign Out</span>
      </button>
    `;
  },

  /**
   * Show profile editor overlay.
   */
  showProfileEditor() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const overlay = this._createOverlay('Edit Profile', `
      <form id="profileEditForm" onsubmit="AccountPanel.saveProfile(event)">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="color: var(--text-secondary); font-size: 0.8rem;">Display Name</label>
          <input type="text" id="profileName" class="form-input" value="${this._sanitize(user.displayName || '')}"
                 placeholder="Your name" required minlength="2"
                 style="background: var(--bg-darker); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; font-size: 0.9rem;">
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="color: var(--text-secondary); font-size: 0.8rem;">Email</label>
          <input type="email" class="form-input" value="${this._sanitize(user.email || '')}" disabled
                 style="background: var(--bg-darker); border: 1px solid var(--border-subtle); color: var(--text-muted); padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; font-size: 0.9rem; cursor: not-allowed;">
        </div>
        <div id="profileMessage" style="display:none; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.75rem;"></div>
        <button type="submit" class="settings-action-btn account-btn--highlight" id="profileSaveBtn" style="width: 100%; justify-content: center;">
          <i class="fas fa-save"></i>
          <span>Save Changes</span>
        </button>
      </form>
    `);
    document.body.appendChild(overlay);
  },

  /**
   * Save profile changes.
   */
  async saveProfile(e) {
    e.preventDefault();
    const newName = document.getElementById('profileName').value.trim();
    const msgEl = document.getElementById('profileMessage');

    if (newName.length < 2) {
      msgEl.textContent = 'Name must be at least 2 characters.';
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.1)';
      msgEl.style.color = '#fca5a5';
      return;
    }

    const result = await InsiteAuth.updateDisplayName(newName);

    if (result.success) {
      msgEl.textContent = 'Profile updated!';
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(16, 185, 129, 0.1)';
      msgEl.style.color = '#6ee7b7';
      this.renderAccountSection();
      setTimeout(() => this._closeOverlay(), 1000);
    } else {
      msgEl.textContent = result.error;
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.1)';
      msgEl.style.color = '#fca5a5';
    }
  },

  /**
   * Show change password overlay.
   */
  showChangePassword() {
    const overlay = this._createOverlay('Change Password', `
      <form id="changePasswordForm" onsubmit="AccountPanel.savePassword(event)">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="color: var(--text-secondary); font-size: 0.8rem;">Current Password</label>
          <input type="password" id="currentPassword" class="form-input" required
                 style="background: var(--bg-darker); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; font-size: 0.9rem;">
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="color: var(--text-secondary); font-size: 0.8rem;">New Password</label>
          <input type="password" id="newPassword" class="form-input" required minlength="8"
                 style="background: var(--bg-darker); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; font-size: 0.9rem;">
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="color: var(--text-secondary); font-size: 0.8rem;">Confirm New Password</label>
          <input type="password" id="confirmPassword" class="form-input" required minlength="8"
                 style="background: var(--bg-darker); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; font-size: 0.9rem;">
        </div>
        <div id="passwordMessage" style="display:none; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.75rem;"></div>
        <button type="submit" class="settings-action-btn account-btn--highlight" id="passwordSaveBtn" style="width: 100%; justify-content: center;">
          <i class="fas fa-save"></i>
          <span>Update Password</span>
        </button>
      </form>
    `);
    document.body.appendChild(overlay);
  },

  /**
   * Save new password.
   */
  async savePassword(e) {
    e.preventDefault();
    const currentPw = document.getElementById('currentPassword').value;
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmPassword').value;
    const msgEl = document.getElementById('passwordMessage');

    if (newPw !== confirmPw) {
      msgEl.textContent = 'New passwords do not match.';
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.1)';
      msgEl.style.color = '#fca5a5';
      return;
    }

    if (newPw.length < 8) {
      msgEl.textContent = 'Password must be at least 8 characters.';
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.1)';
      msgEl.style.color = '#fca5a5';
      return;
    }

    const result = await InsiteAuth.changePassword(currentPw, newPw);

    if (result.success) {
      msgEl.textContent = 'Password updated!';
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(16, 185, 129, 0.1)';
      msgEl.style.color = '#6ee7b7';
      setTimeout(() => this._closeOverlay(), 1500);
    } else {
      msgEl.textContent = result.error;
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.1)';
      msgEl.style.color = '#fca5a5';
    }
  },

  /**
   * Show delete account confirmation.
   */
  showDeleteConfirm() {
    const user = firebase.auth().currentUser;
    const isPasswordUser = user?.providerData.some(p => p.providerId === 'password');

    const overlay = this._createOverlay('Delete Account', `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 0.75rem;"></i>
        <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5;">
          This action is <strong style="color: #ef4444;">permanent</strong> and cannot be undone.
          All your data, favorites, and preferences will be deleted.
        </p>
      </div>
      ${isPasswordUser ? `
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label" style="color: var(--text-secondary); font-size: 0.8rem;">Enter your password to confirm</label>
        <input type="password" id="deletePassword" class="form-input"
               style="background: var(--bg-darker); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; font-size: 0.9rem;">
      </div>` : ''}
      <div id="deleteMessage" style="display:none; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.75rem;"></div>
      <button class="settings-action-btn account-btn--danger" id="deleteConfirmBtn" onclick="AccountPanel.confirmDelete()" style="width: 100%; justify-content: center;">
        <i class="fas fa-trash-alt"></i>
        <span>Permanently Delete Account</span>
      </button>
      <button class="settings-action-btn" onclick="AccountPanel._closeOverlay()" style="width: 100%; justify-content: center; margin-top: 0.5rem;">
        <i class="fas fa-times"></i>
        <span>Cancel</span>
      </button>
    `);
    document.body.appendChild(overlay);
  },

  /**
   * Confirm and execute account deletion.
   */
  async confirmDelete() {
    const passwordEl = document.getElementById('deletePassword');
    const password = passwordEl ? passwordEl.value : null;
    const msgEl = document.getElementById('deleteMessage');

    const result = await InsiteAuth.deleteAccount(password);

    if (result.success) {
      msgEl.textContent = 'Account deleted. Redirecting...';
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(16, 185, 129, 0.1)';
      msgEl.style.color = '#6ee7b7';
      setTimeout(() => { window.location.href = '../auth.html'; }, 1500);
    } else {
      msgEl.textContent = result.error;
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.1)';
      msgEl.style.color = '#fca5a5';
    }
  },

  /**
   * Sign out the user.
   */
  async handleSignOut() {
    await InsiteAuth.signOut('../auth.html');
  },

  // ========================================================================
  // Private Helpers
  // ========================================================================

  _getTierBadge(tier) {
    if (tier === 'professional') {
      return '<span class="account-tier-badge account-tier-badge--pro"><i class="fas fa-crown"></i> Pro</span>';
    }
    if (tier === 'enterprise') {
      return '<span class="account-tier-badge account-tier-badge--enterprise"><i class="fas fa-building"></i> Enterprise</span>';
    }
    return '<span class="account-tier-badge account-tier-badge--free">Free</span>';
  },

  _getInitial(user) {
    return (user.displayName || user.email || '?')[0].toUpperCase();
  },

  _sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _createOverlay(title, content) {
    // Remove any existing overlay
    this._closeOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'accountOverlay';
    overlay.className = 'account-overlay';
    overlay.innerHTML = `
      <div class="account-overlay__backdrop" onclick="AccountPanel._closeOverlay()"></div>
      <div class="account-overlay__panel">
        <div class="account-overlay__header">
          <h4 style="color: var(--text-primary); margin: 0; font-size: 1rem;">${title}</h4>
          <button onclick="AccountPanel._closeOverlay()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="account-overlay__body">
          ${content}
        </div>
      </div>
    `;
    return overlay;
  },

  _closeOverlay() {
    const overlay = document.getElementById('accountOverlay');
    if (overlay) overlay.remove();
  }
};

// Export globally
window.AccountPanel = AccountPanel;
