// src/api/auth.js
import axios from "axios";

const API_ROOT = "/api/auth"; // relative URL, use proxy

class AuthServiceClass {
  constructor() {
    this.client = axios.create({
      baseURL: API_ROOT,
      withCredentials: true, // send cookies automatically
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async checkStatus() {
    try {
      const res = await this.client.get("/status");
      return {
        isAuthenticated: res.status === 200 && res.data.is_logged_in,
        user: res.data.user || null,
      };
    } catch (err) {
      console.error("❌ Status check failed:", err.response?.data || err);
      return { isAuthenticated: false, user: null };
    }
  }

  async login(credentials) {
    try {
      console.log("🔑 LOGIN REQUEST:", credentials);
      const res = await this.client.post("/login", credentials);
      console.log("✅ LOGIN RESPONSE:", res.data);
      return {
        success: res.status === 200,
        message: res.data.message,
        user: res.data.user,
      };
    } catch (err) {
      console.error("❌ LOGIN FAILED:", err.response?.data || err);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
        user: null,
      };
    }
  }

  async register(userData) {
    try {
      console.log("📝 REGISTER REQUEST DATA:", userData);
      const res = await this.client.post("/register", userData);
      console.log("✅ REGISTER RESPONSE:", res.data);
      return {
        success: res.status === 200,
        message: res.data.message,
      };
    } catch (err) {
      console.error("❌ REGISTER FAILED:", err.response?.data || err);
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  }

  async logout() {
    try {
      const res = await this.client.post("/logout");
      return res.status === 200;
    } catch (err) {
      console.error("❌ LOGOUT FAILED:", err.response?.data || err);
      return false;
    }
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
