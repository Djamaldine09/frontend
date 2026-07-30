'use client';

import { useEffect, useState } from 'react';
import { Activity, KeyRound, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, adminExtendedAPI, authAPI } from '@/lib/api';

export default function SecuritePage() {
  const { user, token, login } = useAuth();
  const [security, setSecurity] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving2FA, setSaving2FA] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [dashboardResult, auditResult] = await Promise.allSettled([
        adminAPI.dashboard(),
        adminExtendedAPI.getAuditLogs(),
      ]);

      if (dashboardResult.status === 'fulfilled') {
        const data: any = (dashboardResult.value.data as any).data || dashboardResult.value.data;
        setSecurity(data.security);
      }
      if (auditResult.status === 'fulfilled') {
        const data = (auditResult.value as any).data;
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user]);

  const toggleTwoFactor = async () => {
    if (!user || !token) return;

    const nextEnabled = !user.twoFactorEnabled;
    setSaving2FA(true);

    try {
      const res = await authAPI.updateTwoFactorPreference({ enabled: nextEnabled });
      login(token, { ...user, ...res.data.user });
      toast.success(nextEnabled ? '2FA activee' : '2FA desactivee');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur pendant la mise a jour 2FA');
    } finally {
      setSaving2FA(false);
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
    <div className="animate-fade-in" data-testid="securite-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Securite</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>Audit, conformite et etat du systeme</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw size={14} /> Actualiser
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <ShieldCheck size={24} style={{ color: user.twoFactorEnabled ? 'var(--status-green)' : 'var(--ink-soft)' }} />
            <div>
              <h3 style={{ fontWeight: 800, marginBottom: 4 }}>Authentification a deux facteurs</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: 0 }}>
                {user.telephone
                  ? `Code SMS envoye au telephone enregistre (${user.telephone}).`
                  : 'Ajoutez un numero de telephone dans votre profil pour activer la 2FA.'}
              </p>
            </div>
          </div>
          <button
            className={user.twoFactorEnabled ? 'btn-ghost' : 'btn-lime'}
            onClick={toggleTwoFactor}
            disabled={saving2FA || !user.telephone}
            data-testid="toggle-2fa"
          >
            <KeyRound size={14} />
            {saving2FA ? 'Mise a jour...' : user.twoFactorEnabled ? 'Desactiver 2FA' : 'Activer 2FA'}
          </button>
        </div>
      </div>

      {user.role === 'ADMIN' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
            <div className="card" style={{ padding: 18 }}>
              <ShieldCheck size={22} style={{ color: 'var(--status-green)' }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase' }}>Administrateurs</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{security?.adminCount ?? '-'}</div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <KeyRound size={22} style={{ color: security?.jwtConfigured ? 'var(--status-green)' : 'var(--status-red)' }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase' }}>JWT</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                <span className={`badge ${security?.jwtConfigured ? 'badge-green' : 'badge-red'}`}>{security?.jwtConfigured ? 'Configure' : 'Manquant'}</span>
              </div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <Activity size={22} />
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase' }}>Origines CORS</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{security?.corsOrigins?.length ?? '-'}</div>
            </div>
          </div>

          <div className="card" style={{ padding: 22, marginBottom: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Origines CORS autorisees</h3>
            {(security?.corsOrigins || []).length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Aucune origine restrictive configuree.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {security.corsOrigins.map((origin: string) => (
                  <code key={origin} style={{ background: 'var(--bg-soft)', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}>{origin}</code>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid var(--ink-line)' }}>
              <strong>Journal d'audit</strong> <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>- {logs.length} evenement(s)</span>
            </div>
            {logs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Aucun evenement enregistre</div>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-line)' }}>
                    {['Date', 'Utilisateur', 'Action', 'Cible'].map((heading) => (
                      <th key={heading} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 50).map((log, index) => (
                    <tr key={log._id || index} style={{ borderBottom: index < logs.length - 1 ? '1px solid var(--ink-line)' : 'none' }}>
                      <td style={{ padding: '10px 18px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : '-'}
                      </td>
                      <td style={{ padding: '10px 18px' }}>{log.user?.email || log.userEmail || '-'}</td>
                      <td style={{ padding: '10px 18px' }}><span className="badge badge-blue">{log.action || '-'}</span></td>
                      <td style={{ padding: '10px 18px', color: 'var(--ink-soft)' }}>{log.resource || log.target || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
