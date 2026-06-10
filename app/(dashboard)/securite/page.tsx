'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, adminExtendedAPI } from '@/lib/api';
import { ShieldAlert, ShieldCheck, KeyRound, Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecuritePage() {
  const { user } = useAuth();
  const [security, setSecurity] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, a] = await Promise.allSettled([adminAPI.dashboard(), adminExtendedAPI.getAuditLogs()]);
      if (d.status === 'fulfilled') {
        const data: any = (d.value.data as any).data || d.value.data;
        setSecurity(data.security);
      }
      if (a.status === 'fulfilled') setLogs(Array.isArray((a.value as any).data) ? (a.value as any).data : []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', gap: 14 }}>
        <ShieldAlert size={20} color="var(--status-red)" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Accès refusé</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="securite-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Sécurité</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>Audit, conformité et état du système</p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div className="card" style={{ padding: 18 }}>
          <ShieldCheck size={22} style={{ color: 'var(--status-green)' }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase' }}>Administrateurs</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{security?.adminCount ?? '—'}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <KeyRound size={22} style={{ color: security?.jwtConfigured ? 'var(--status-green)' : 'var(--status-red)' }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase' }}>JWT</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            <span className={`badge ${security?.jwtConfigured ? 'badge-green' : 'badge-red'}`}>{security?.jwtConfigured ? 'Configuré' : 'Manquant'}</span>
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <Activity size={22} />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', marginTop: 12, textTransform: 'uppercase' }}>Origines CORS</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{security?.corsOrigins?.length ?? '—'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Origines CORS autorisées</h3>
        {(security?.corsOrigins || []).length === 0 ? (
          <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Aucune origine restrictive configurée.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {security.corsOrigins.map((o: string) => (
              <code key={o} style={{ background: 'var(--bg-soft)', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}>{o}</code>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: '1px solid var(--ink-line)' }}>
          <strong>Journal d'audit</strong> <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>· {logs.length} évènement(s)</span>
        </div>
        {logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Aucun évènement enregistré</div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink-line)' }}>
                {['Date', 'Utilisateur', 'Action', 'Cible'].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((l, i) => (
                <tr key={l._id || i} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--ink-line)' : 'none' }}>
                  <td style={{ padding: '10px 18px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {l.createdAt ? new Date(l.createdAt).toLocaleString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '10px 18px' }}>{l.user?.email || l.userEmail || '—'}</td>
                  <td style={{ padding: '10px 18px' }}><span className="badge badge-blue">{l.action || '—'}</span></td>
                  <td style={{ padding: '10px 18px', color: 'var(--ink-soft)' }}>{l.resource || l.target || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
