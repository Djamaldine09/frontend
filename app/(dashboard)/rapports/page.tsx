'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, adminExtendedAPI, NationalReport } from '@/lib/api';
import { FileText, Download, ShieldAlert, BarChart3, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RapportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<NationalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.report();
      setReport(r.data);
    } catch (err: any) {
      toast.error('Impossible de générer le rapport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setExporting(format);
    try {
      const r = await adminExtendedAPI.exportReport(format);
      const url = window.URL.createObjectURL(new Blob([(r as any).data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-national.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Rapport ${format.toUpperCase()} téléchargé`);
    } catch {
      toast.error(`Export ${format} indisponible`);
    } finally {
      setExporting(null);
    }
  };

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
    <div className="animate-fade-in" data-testid="rapports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Rapports nationaux</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>Statistiques globales et exports officiels</p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading} data-testid="refresh-rapport">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        {(['csv', 'excel', 'pdf'] as const).map((fmt) => (
          <button
            key={fmt}
            className="btn-lime"
            onClick={() => handleExport(fmt)}
            disabled={exporting === fmt}
            data-testid={`export-${fmt}`}
          >
            <Download size={14} /> {exporting === fmt ? '…' : `Télécharger ${fmt.toUpperCase()}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Chargement…</div>
      ) : !report ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
          <BarChart3 size={32} style={{ marginBottom: 8 }} /> Aucun rapport disponible
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Candidats par région</h3>
            <table style={{ width: '100%' }}>
              <tbody>
                {(report.candidatsByRegion || []).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--ink-line)' }}>
                    <td style={{ padding: '10px 0' }}>{c._id || 'Non spécifié'}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Centres et capacité par région</h3>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ink-line)' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, color: 'var(--ink-mute)' }}>Région</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 11, color: 'var(--ink-mute)' }}>Centres</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 11, color: 'var(--ink-mute)' }}>Capacité</th>
                </tr>
              </thead>
              <tbody>
                {(report.centresByRegion || []).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--ink-line)' }}>
                    <td style={{ padding: '10px 0' }}>{c._id || 'Non spécifié'}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{c.centres}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{c.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Résultats par statut</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(report.resultatsByStatus || []).map((r, i) => (
                <div key={i} style={{ flex: '1 1 200px', padding: 16, borderRadius: 12, background: 'var(--bg-soft)' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{r._id || 'EN_ATTENTE'}</div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{r.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
