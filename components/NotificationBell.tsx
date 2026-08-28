'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, Clock, Loader2, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notificationAPI, type AppNotification } from '@/lib/api';

const typeColors: Record<AppNotification['type'], string> = {
  INFO: 'var(--tile-sky)',
  SUCCESS: 'var(--tile-mint)',
  WARNING: 'var(--tile-sun)',
  ERROR: 'var(--tile-rose)',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

type NotificationsPayload = Awaited<ReturnType<typeof notificationAPI.getAll>>['data'];

function normalizeResponse(data: NotificationsPayload) {
  if (Array.isArray(data)) {
    return {
      notifications: data,
      unreadCount: data.filter((notification) => !notification.lue).length,
    };
  }

  return {
    notifications: data.notifications || [],
    unreadCount: data.unreadCount || 0,
  };
}

export default function NotificationBell() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const hasUnread = unreadCount > 0;
  const badgeText = useMemo(() => (unreadCount > 9 ? '9+' : String(unreadCount)), [unreadCount]);

  const loadNotifications = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const response = await notificationAPI.getAll();
      const normalized = normalizeResponse(response.data);
      setNotifications(normalized.notifications);
      setUnreadCount(normalized.unreadCount);
    } catch {
      if (!silent) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    loadNotifications();
    const interval = window.setInterval(() => loadNotifications(true), 45000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) loadNotifications(true);
  };

  const handleMarkAsRead = async (notification: AppNotification) => {
    if (!notification.lue) {
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, lue: true } : item))
      );
      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await notificationAPI.markAsRead(notification._id);
      } catch {
        await loadNotifications(true);
        return;
      }
    }

    if (notification.lien) {
      setOpen(false);
      router.push(notification.lien);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!hasUnread) return;

    const previousNotifications = notifications;
    const previousCount = unreadCount;
    setNotifications((current) => current.map((item) => ({ ...item, lue: true })));
    setUnreadCount(0);

    try {
      await notificationAPI.markAllAsRead();
    } catch {
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
    }
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn-icon"
        onClick={handleOpen}
        aria-label="Ouvrir les notifications"
        aria-expanded={open}
        style={{ position: 'relative', width: 40, height: 40, padding: 0 }}
      >
        <Bell size={20} />
        {hasUnread && (
          <span
            aria-label={`${unreadCount} notifications non lues`}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent-red)',
              color: '#fff',
              borderRadius: 999,
              border: '2px solid var(--bg-primary)',
              fontSize: 10,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {badgeText}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            top: 50,
            right: 0,
            width: 'min(360px, calc(100vw - 24px))',
            maxHeight: 'min(560px, calc(100vh - 90px))',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--ink-line)',
            borderRadius: 18,
            boxShadow: '0 24px 70px rgba(16, 20, 30, 0.18)',
            zIndex: 80,
          }}
        >
          <div style={{ padding: 16, borderBottom: '1px solid var(--ink-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                {hasUnread ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est a jour'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => loadNotifications()}
                aria-label="Actualiser"
                disabled={loading}
                style={{ width: 34, height: 34 }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                style={{ width: 34, height: 34 }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              style={{
                width: '100%',
                border: 0,
                borderBottom: '1px solid var(--ink-line)',
                background: 'var(--bg-soft)',
                color: 'var(--ink)',
                padding: '10px 16px',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <CheckCheck size={15} />
              Tout marquer comme lu
            </button>
          )}

          <div style={{ maxHeight: 430, overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}>
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13 }}>
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() => handleMarkAsRead(notification)}
                  style={{
                    width: '100%',
                    border: 0,
                    borderBottom: '1px solid var(--ink-line)',
                    background: notification.lue ? 'transparent' : 'rgba(165, 214, 167, 0.16)',
                    padding: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      background: typeColors[notification.type] || 'var(--tile-sky)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ink)',
                    }}
                  >
                    <Bell size={16} />
                  </span>

                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ color: 'var(--ink)', fontSize: 13, fontWeight: notification.lue ? 700 : 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.titre}
                      </span>
                      {!notification.lue && (
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent-red)', flexShrink: 0 }} />
                      )}
                    </span>
                    <span style={{ display: 'block', marginTop: 4, color: 'var(--ink-soft)', fontSize: 12, lineHeight: 1.45 }}>
                      {notification.message}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: 'var(--ink-mute)', fontSize: 11 }}>
                      <Clock size={12} />
                      {formatDate(notification.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
