import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),
  actions: {
    login(token: string) {
      this.token = token;
      this.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    logout() {
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    isTokenExpired() {
      if (!this.token) {
        return true;
      }
      const decodedToken: { exp: number } = jwtDecode(this.token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    }
  }
});