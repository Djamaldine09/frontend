'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Clock, Loader2, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

import { AppNotification, notificationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type FilterKey = 'ALL' | 'UNREAD' | AppNotification['type'];

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'UNREAD', label: 'Non lues' },
  { key: 'INFO', label: 'Info' },
  { key: 'SUCCESS', label: 'Succes' },
  { key: 'WARNING', label: 'Alerte' },
  { key: 'ERROR', label: 'Erreur' },
];

const typeLabels: Record<AppNotification['type'], string> = {
  INFO: 'Information',
  SUCCESS: 'Succes',
  WARNING: 'Alerte',
  ERROR: 'Erreur',
};

const typeStyles: Record<AppNotification['type'], { badge: string; tile: string }> = {
  INFO: { badge: 'badge-blue', tile: 'var(--tile-sky)' },
  SUCCESS: { badge: 'badge-green', tile: 'var(--tile-mint)' },
  WARNING: { badge: 'badge-amber', tile: 'var(--tile-sun)' },
  ERROR: { badge: 'badge-red', tile: 'var(--tile-rose)' },
};

function normalizeNotifications(data: Awaited<ReturnType<typeof notificationAPI.getAll>>['data']) {
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll();
      const normalized = normalizeNotifications(response.data);
      setNotifications(normalized.notifications);
      setUnreadCount(normalized.unreadCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const filteredNotifications = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'UNREAD' && !notification.lue) ||
        notification.type === filter;

      const matchesQuery =
        !needle ||
        notification.titre.toLowerCase().includes(needle) ||
        notification.message.toLowerCase().includes(needle);

      return matchesFilter && matchesQuery;
    });
  }, [filter, notifications, query]);

  const markAsRead = async (notification: AppNotification) => {
    if (notification.lue) return;

    setSaving(notification._id);
    const previous = notifications;
    const previousUnread = unreadCount;

    setNotifications((current) =>
      current.map((item) => (item._id === notification._id ? { ...item, lue: true } : item))
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    try {
      await notificationAPI.markAsRead(notification._id);
    } catch (error: any) {
      setNotifications(previous);
      setUnreadCount(previousUnread);
      toast.error(error.response?.data?.message || 'Impossible de marquer comme lu');
    } finally {
      setSaving(null);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    const previous = notifications;
    const previousUnread = unreadCount;

    setNotifications((current) => current.map((item) => ({ ...item, lue: true })));
    setUnreadCount(0);

    try {
      const response = await notificationAPI.markAllAsRead();
      toast.success(response.data?.message || 'Notifications marquees comme lues');
    } catch (error: any) {
      setNotifications(previous);
      setUnreadCount(previousUnread);
      toast.error(error.response?.data?.message || 'Impossible de tout marquer comme lu');
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', gap: 14 }}>
        <ShieldAlert size={20} color="var(--status-red)" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Connexion requise</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="notifications-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, marginBottom: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Notifications</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
            Suivez les convocations, paiements, corrections et messages administratifs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn-ghost" onClick={load} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Actualiser
          </button>
          <button type="button" className="btn-lime" onClick={markAllAsRead} disabled={unreadCount === 0 || loading}>
            <CheckCheck size={14} />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div className="card" style={{ padding: 18 }}>
          <Bell size={22} />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 28, fontWeight: 850 }}>{notifications.length}</div>
        </div>
        <div className="card" style={{ padding: 18, background: unreadCount > 0 ? 'var(--tile-sun)' : 'var(--bg-card)' }}>
          <CheckCheck size={22} />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase', fontWeight: 700 }}>Non lues</div>
          <div style={{ fontSize: 28, fontWeight: 850 }}>{unreadCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une notification"
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: 999,
                border: '1px solid var(--ink-line)',
                background: 'var(--bg-soft)',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filters.map((item) => (
              <button
                type="button"
                key={item.key}
                className={filter === item.key ? 'btn-lime' : 'btn-ghost'}
                onClick={() => setFilter(item.key)}
                style={{ padding: '9px 14px' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', gap: 10 }}>
            <Loader2 size={18} className="animate-spin" />
            Chargement des notifications
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: 44, textAlign: 'center', color: 'var(--ink-soft)' }}>
            <Bell size={32} style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 750, color: 'var(--ink)' }}>Aucune notification trouvee</div>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Les nouvelles notifications apparaitront ici automatiquement.</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const style = typeStyles[notification.type] || typeStyles.INFO;

            return (
              <article
                key={notification._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto',
                  gap: 14,
                  padding: 18,
                  borderBottom: index < filteredNotifications.length - 1 ? '1px solid var(--ink-line)' : 'none',
                  background: notification.lue ? 'transparent' : 'rgba(201, 243, 106, 0.12)',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: style.tile, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: notification.lue ? 750 : 900, color: 'var(--ink)' }}>
                      {notification.titre}
                    </h2>
                    <span className={`badge ${style.badge}`}>{typeLabels[notification.type]}</span>
                    {!notification.lue && <span className="badge badge-lime">Nouveau</span>}
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)', fontSize: 13, lineHeight: 1.6 }}>
                    {notification.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'var(--ink-mute)', fontSize: 12 }}>
                    <Clock size={13} />
                    {formatDate(notification.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {!notification.lue && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => markAsRead(notification)}
                      disabled={saving === notification._id}
                      style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
                    >
                      {saving === notification._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                      Lu
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
