'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, AdminDashboard, NationalReport } from '@/lib/api';
import { Activity, Users, Building2, BookOpen, ShieldAlert, TrendingUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupervisionPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [report, setReport] = useState<NationalReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, r] = await Promise.allSettled([adminAPI.dashboard(), adminAPI.report()]);
      if (d.status === 'fulfilled') setDashboard((d.value.data as any).data || d.value.data);
      if (r.status === 'fulfilled') setReport(r.value.data);
    } catch (e: any) {
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
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="supervision-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Supervision nationale</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
            Vue temps réel des indicateurs et alertes du système
          </p>
        </div>
        <button className="btn-ghost" data-testid="refresh-supervision" onClick={load} disabled={loading}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Chargement…</div>
      ) : !dashboard ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
          Aucune donnée disponible. Vérifiez la connexion au backend.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
            {[
              { label: 'Utilisateurs actifs', value: dashboard.users.total, tone: 'var(--tile-sky)', Icon: Users },
              { label: 'Candidats inscrits', value: dashboard.candidats.total, tone: 'var(--tile-lila)', Icon: Activity },
              { label: 'Centres opérationnels', value: dashboard.centres.total, tone: 'var(--tile-mint)', Icon: Building2 },
              { label: "Taux d'occupation", value: `${dashboard.centres.occupancyRate}%`, tone: 'var(--tile-sun)', Icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="card card-hoverable">
                <div className="tile" style={{ background: s.tone, marginBottom: 12 }}>
                  <s.Icon size={20} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Répartition par rôle</h3>
              {Object.entries(dashboard.users.byRole || {}).map(([role, count]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--ink-line)' }}>
                  <span style={{ fontWeight: 500 }}>{role}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Sécurité</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                <div>Admins : <strong>{dashboard.security.adminCount}</strong></div>
                <div>JWT configuré : <span className={`badge ${dashboard.security.jwtConfigured ? 'badge-green' : 'badge-red'}`}>{dashboard.security.jwtConfigured ? 'OUI' : 'NON'}</span></div>
                <div>Origines CORS : <strong>{dashboard.security.corsOrigins?.length || 0}</strong></div>
              </div>
            </div>
          </div>

          {report && (
            <div className="card" style={{ padding: 22, marginTop: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Rapport national</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 12 }}>
                Généré le {new Date(report.generatedAt).toLocaleString('fr-FR')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <Stat label="Régions couvertes" value={(report.centresByRegion || []).length} />
                <Stat label="Statuts de résultats" value={(report.resultatsByStatus || []).length} />
                <Stat label="Régions candidats" value={(report.candidatsByRegion || []).length} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-soft)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
