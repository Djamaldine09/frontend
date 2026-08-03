'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Bell, User, LogOut, Settings as SettingsIcon, KeyRound, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';

export default function ParametresPage() {
  const { user, token, login, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme-mode') === 'dark' ? 'dark' : 'light';
  });
  const [notifications, setNotifications] = useState<{ email: boolean; sms: boolean }>(() => {
    if (typeof window === 'undefined') return { email: true, sms: false };
    const saved = window.localStorage.getItem('settings-notifications');
    return saved ? JSON.parse(saved) : { email: true, sms: false };
  });
  const [saving2FA, setSaving2FA] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme-mode', theme === 'dark' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('settings-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const toggleNotification = (key: 'email' | 'sms') => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    toast.success(`${key === 'email' ? 'Notifications email' : 'Notifications SMS'} ${next[key] ? 'activées' : 'désactivées'}`);
  };

  const toggleTwoFactor = async () => {
    if (!user || !token) return;

    const nextEnabled = !user.twoFactorEnabled;
    setSaving2FA(true);

    try {
      const res = await authAPI.updateTwoFactorPreference({ enabled: nextEnabled });
      login(token, { ...user, ...res.data.user });
      toast.success(nextEnabled ? '2FA activée' : '2FA désactivée');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur pendant la mise à jour 2FA');
    } finally {
      setSaving2FA(false);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Utilisateur non connecté</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Connectez-vous pour accéder aux paramètres.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="parametres-page" style={{ display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Paramètres</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>Gérez votre thème et vos préférences utilisateur.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) 340px', gap: 22 }}>
        <div style={{ display: 'grid', gap: 22 }}>
          <section className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 14, background: 'var(--bg-soft)', display: 'grid', placeItems: 'center' }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>Affichage</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>Choisissez le thème de l'interface.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>Mode sombre</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>Actuellement : {theme === 'dark' ? 'Sombre' : 'Clair'}</div>
              </div>
              <button
                className="btn-lime"
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                data-testid="toggle-theme"
              >
                {theme === 'dark' ? 'Clair' : 'Sombre'}
              </button>
            </div>
          </section>

          <section className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Bell size={20} />
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>Notifications</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>Gérez les alertes qui vous intéressent.</p>
              </div>
            </div>
            <ToggleRow
              label="Email"
              description="Recevoir des notifications par email."
              checked={notifications.email}
              onToggle={() => toggleNotification('email')}
            />
            <ToggleRow
              label="SMS"
              description="Recevoir des alertes par SMS."
              checked={notifications.sms}
              onToggle={() => toggleNotification('sms')}
            />
          </section>

          <section className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldCheck size={20} />
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>Authentification 2FA</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
                  Protégez votre compte avec un code SMS après le mot de passe.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14, borderRadius: 14, background: 'var(--bg-soft)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
                  {user.twoFactorEnabled ? '2FA active' : '2FA inactive'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {user.telephone
                    ? `Code envoyé au numéro enregistré : ${user.telephone}`
                    : 'Ajoutez un numéro de téléphone dans votre profil avant activation.'}
                </div>
              </div>
              <button
                className={user.twoFactorEnabled ? 'btn-ghost' : 'btn-lime'}
                type="button"
                onClick={toggleTwoFactor}
                disabled={saving2FA || !user.telephone}
                data-testid="toggle-2fa-settings"
              >
                <KeyRound size={14} />
                {saving2FA ? 'Mise à jour...' : user.twoFactorEnabled ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </section>
        </div>

        <aside style={{ display: 'grid', gap: 22 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <User size={20} />
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>Compte</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>Détails de votre session.</p>
              </div>
            </div>
            <Row label="Nom" value={`${user.prenom} ${user.nom}`} />
            <Row label="Rôle" value={user.role} />
            <Row label="Email" value={user.email} />
            <button
              className="btn-ghost"
              type="button"
              onClick={() => logout()}
              style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
              data-testid="logout-settings"
            >
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <SettingsIcon size={20} />
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>Informations</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>Préférences enregistrées localement.</p>
              </div>
            </div>
            <Row label="Thème" value={theme === 'dark' ? 'Sombre' : 'Clair'} />
            <Row label="Notifications email" value={notifications.email ? 'Activées' : 'Désactivées'} />
            <Row label="Notifications SMS" value={notifications.sms ? 'Activées' : 'Désactivées'} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ink-line)' }}>
      <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
    </div>
  );
}

function ToggleRow({ label, description, checked, onToggle }: { label: string; description: string; checked: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14, borderRadius: 14, background: 'var(--bg-soft)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{description}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          minWidth: 90,
          padding: '9px 14px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: checked ? 'var(--lime)' : 'var(--ink-line)',
          color: checked ? 'var(--ink)' : 'var(--ink-soft)',
          fontWeight: 700,
        }}
      >
        {checked ? 'Activé' : 'Désactivé'}
      </button>
    </div>
  );
}
