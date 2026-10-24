import { api } from './apiClient';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(limit = 50, offset = 0): Promise<{ notifications: NotificationItem[]; unread_count: number }> {
    try {
      const data = await api.get<{ notifications: NotificationItem[]; unread_count: number }>(
        `/api/v1/notifications?limit=${limit}&offset=${offset}`
      );
      return data;
    } catch {
      // Fallback for offline / demo mode
      const raw = localStorage.getItem('gs_fallback_notifs');
      const list: NotificationItem[] = raw ? JSON.parse(raw) : [
        {
          id: 'NTF-001',
          user_id: 'USR-001',
          type: 'vacancy',
          title: 'Sentinels Vacancy Created',
          message: 'Priority Controller gap opened for VCT Americas Split 2.',
          resource_type: 'roster',
          resource_id: '1',
          is_read: 0,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'NTF-002',
          user_id: 'USR-001',
          type: 'scouting',
          title: 'Scouting Recommendation Ready',
          message: 'Mirage ranked #1 for Sentinels Controller vacancy (74.8 Fit, High confidence).',
          resource_type: 'player',
          resource_id: 'VAL-002',
          is_read: 0,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'NTF-003',
          user_id: 'USR-001',
          type: 'analysis',
          title: 'Decoy Frag Profile Warning',
          message: 'Voltz flagged as Statistical Decoy (49.3 Fit, 30/100 Utility rating).',
          resource_type: 'player',
          resource_id: 'VAL-003',
          is_read: 0,
          created_at: new Date(Date.now() - 14400000).toISOString(),
        },
      ];
      const unread_count = list.filter(n => !n.is_read).length;
      return { notifications: list, unread_count };
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const data = await api.get<{ unread_count: number }>('/api/v1/notifications/unread-count');
      return data.unread_count;
    } catch {
      const notifs = await this.getNotifications();
      return notifs.unread_count;
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/read`);
      return true;
    } catch {
      // Update local storage fallback
      const notifs = await this.getNotifications();
      const updated = notifs.notifications.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n);
      localStorage.setItem('gs_fallback_notifs', JSON.stringify(updated));
      return true;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await api.post('/api/v1/notifications/mark-all-read');
      return true;
    } catch {
      const notifs = await this.getNotifications();
      const updated = notifs.notifications.map(n => ({ ...n, is_read: 1 }));
      localStorage.setItem('gs_fallback_notifs', JSON.stringify(updated));
      return true;
    }
  },
};
