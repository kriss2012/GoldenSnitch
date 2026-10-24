import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  ShieldAlert,
  Sparkles,
  Users,
  Compass,
  Layers,
  Clock,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { notificationService } from '../../services/notificationService';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll unread count periodically every 30 seconds
    const interval = setInterval(async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // ignore polling error
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifs();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.is_read) {
      notificationService.markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: 1 } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);

    if (n.resource_type === 'player' && n.resource_id) {
      navigate(`/players/${n.resource_id}`);
    } else if (n.resource_type === 'roster' && n.resource_id) {
      navigate(`/rosters/${n.resource_id}`);
    } else if (n.type === 'watchlist') {
      navigate('/watchlist');
    } else if (n.type === 'scouting' || n.type === 'vacancy') {
      navigate('/scouting');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'vacancy':
        return <Users size={16} className="text-violet" />;
      case 'scouting':
        return <Sparkles size={16} className="text-lilac" />;
      case 'analysis':
        return <ShieldAlert size={16} className="text-warning" />;
      case 'synergy':
        return <Layers size={16} className="text-[#5662f6]" />;
      default:
        return <Compass size={16} className="text-lilac" />;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return ts;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-control border border-border hover:border-violet/40 hover:bg-surface/60 transition-all relative focus-visible:outline-lilac"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 bg-violet text-white text-[10px] font-extrabold font-mono rounded-full flex items-center justify-center absolute -top-1 -right-1 shadow-[0_0_10px_rgba(155,48,255,0.7)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-[420px] bg-surface/95 backdrop-blur-md border border-border shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-panel z-50 overflow-hidden flex flex-col text-xs">
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-text text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet/20 text-lilac border border-violet/40">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2 py-1 text-[11px] font-medium text-lilac hover:text-white hover:bg-violet/20 rounded transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded"
                aria-label="Close notifications"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted">
                <Loader2 size={24} className="animate-spin text-violet" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="py-8 px-4 text-center text-danger">
                <p className="font-medium">{error}</p>
                <button
                  onClick={fetchNotifs}
                  className="mt-2 text-xs text-lilac hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-text-muted">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium text-text">All caught up</p>
                <p className="text-[11px] mt-0.5 opacity-80">
                  No notifications to review at this time.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.is_read;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      isUnread
                        ? 'bg-plum/30 hover:bg-plum/50 border-l-2 border-l-violet'
                        : 'hover:bg-surface-raised/60'
                    }`}
                  >
                    <div className="p-2 rounded-control bg-void/80 border border-border shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`font-heading text-xs truncate ${
                            isUnread ? 'font-bold text-text' : 'font-medium text-text/80'
                          }`}
                        >
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-text-muted shrink-0 font-mono">
                          {formatTime(n.created_at)}
                        </span>
                      </div>

                      <p className="text-text-muted text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-lilac flex items-center gap-1 group-hover:underline">
                          View details <ChevronRight size={12} />
                        </span>

                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, n.id)}
                            className="px-1.5 py-0.5 text-[10px] font-medium text-text-muted hover:text-text hover:bg-void rounded flex items-center gap-1 border border-border"
                            title="Mark as read"
                          >
                            <Check size={11} /> Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-void/60 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
            <span className="font-mono text-[10px]">Golden Snitch Engine</span>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/reports');
              }}
              className="text-lilac hover:underline"
            >
              Audit log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
