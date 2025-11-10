// src/api/auth.js
const API_ROOT = '/api/auth';

class AuthServiceClass {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_ROOT}${endpoint}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });

      // Attempt to parse JSON (if backend sends it)
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error(`❌ Request failed: ${endpoint}`, error);
      return { ok: false, status: 500, data: { message: 'Network error' } };
    }
  }

  async checkStatus() {
    const res = await this.request('/status');
    return {
      isAuthenticated: res.ok && res.data.is_logged_in,
      user: res.data.user || null,
    };
  }

  async login(credentials) {
    console.log('🔑 LOGIN REQUEST:', credentials);
    const res = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('✅ LOGIN RESPONSE:', res);
    return {
      success: res.ok,
      message: res.data.message,
      user: res.data.user,
    };
  }

  async register(userData) {
    console.log('📝 REGISTER REQUEST DATA:', userData);
    const res = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log('✅ REGISTER RESPONSE:', res);
    return {
      success: res.ok,
      message: res.data.message,
    };
  }

  async logout() {
    const res = await this.request('/logout', { method: 'POST' });
    return res.ok;
  }
}

// ✅ Export as a single instance — no `this` context lost anymore
const AuthService = new AuthServiceClass();
export default AuthService;
