import { api } from './apiClient';
import { AuthUser } from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>('/api/v1/auth/login', { username, password });
    localStorage.setItem('gs_token', data.access_token);
    localStorage.setItem('gs_user', JSON.stringify(data.user));
    return data;
  },

  async register(
    username: string,
    name: string,
    password: string,
    role = 'ROLE_SCOUT',
    organization = 'Logic Legend Esports'
  ): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>('/api/v1/auth/register', {
      username,
      name,
      password,
      role,
      organization,
    });
    localStorage.setItem('gs_token', data.access_token);
    localStorage.setItem('gs_user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_user');
    }
  },

  async getMe(): Promise<{ user: AuthUser; permissions: Record<string, boolean> }> {
    const data = await api.get<{ user: AuthUser; permissions: Record<string, boolean> }>('/api/v1/auth/me');
    localStorage.setItem('gs_user', JSON.stringify(data.user));
    return data;
  },

  async forgotPassword(usernameOrEmail: string): Promise<{ status: string; message: string; dev_reset_token?: string }> {
    return api.post('/api/v1/auth/forgot-password', { username_or_email: usernameOrEmail });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ status: string; message: string }> {
    return api.post('/api/v1/auth/reset-password', { token, new_password: newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ status: string; message: string }> {
    return api.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async exportUserData(): Promise<any> {
    return api.get('/api/v1/users/me/export');
  },

  async deleteAccount(): Promise<{ status: string; message: string }> {
    const res = await api.delete<{ status: string; message: string }>('/api/v1/users/me');
    localStorage.removeItem('gs_token');
    localStorage.removeItem('gs_user');
    return res;
  },

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem('gs_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('gs_token');
  },
};
