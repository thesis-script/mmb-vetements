/**
 * Admin Authentication System
 * Simple credential-based authentication for admin panel
 */

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '123456',
};

const AUTH_TOKEN_KEY = 'mmb_admin_token';
const AUTH_EXPIRY_KEY = 'mmb_admin_expiry';
const AUTH_EXPIRY_HOURS = 24;

class AuthManager {
  /**
   * Login with credentials
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {boolean} - Authentication success
   */
  static login(email, password) {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const expiryTime = Date.now() + AUTH_EXPIRY_HOURS * 60 * 60 * 1000;

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());

      return true;
    }
    return false;
  }

  /**
   * Logout admin
   */
  static logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
  }

  /**
   * Check if admin is authenticated
   * @returns {boolean} - Authentication status
   */
  static isAuthenticated() {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const expiryTime = localStorage.getItem(AUTH_EXPIRY_KEY);

      if (!token || !expiryTime) return false;

      // Check if token expired
      if (Date.now() > parseInt(expiryTime)) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  /**
   * Get current auth token
   */
  static getToken() {
    if (this.isAuthenticated()) {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  }
}

export default AuthManager;
