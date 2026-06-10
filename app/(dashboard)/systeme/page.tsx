'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, Server, Database, Globe, Wrench, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SystemePage() {
  const { user } = useAuth();
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; ms: number } | null>(null);

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const pingBackend = async () => {
    setPinging(true);
    const start = Date.now();
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/health`, { method: 'GET' });
      const ms = Date.now() - start;
      setPingResult({ ok: res.ok, ms });
      res.ok ? toast.success(`Backend joignable (${ms}ms)`) : toast.error(`Backend a répondu ${res.status}`);
    } catch {
      setPingResult({ ok: false, ms: Date.now() - start });
      toast.error('Backend injoignable');
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="animate-fade-in" data-testid="systeme-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Système</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>Paramètres techniques et diagnostic</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Server size={20} /> <h3 style={{ fontWeight: 700 }}>Backend API</h3>
          </div>
          <Row label="URL" value={<code style={{ fontSize: 12 }}>{apiUrl}</code>} />
          <Row
            label="État"
            value={
              pingResult ? (
                <span className={`badge ${pingResult.ok ? 'badge-green' : 'badge-red'}`}>
                  {pingResult.ok ? `OK (${pingResult.ms}ms)` : `Échec (${pingResult.ms}ms)`}
                </span>
              ) : (
                <span className="badge badge-gray">Non testé</span>
              )
            }
          />
          <button className="btn-lime" onClick={pingBackend} disabled={pinging} style={{ marginTop: 14 }} data-testid="ping-backend">
            <RefreshCw size={14} /> {pinging ? 'Test…' : 'Tester la connexion'}
          </button>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Globe size={20} /> <h3 style={{ fontWeight: 700 }}>Environnement</h3>
          </div>
          <Row label="Mode" value={process.env.NODE_ENV || 'development'} />
          <Row label="Next.js" value="16.x (App Router)" />
          <Row label="Build" value={process.env.NEXT_PUBLIC_BUILD_VERSION || '—'} />
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Database size={20} /> <h3 style={{ fontWeight: 700 }}>Stockage local</h3>
          </div>
          <Row label="Token" value={typeof window !== 'undefined' && localStorage.getItem('token') ? 'Présent' : 'Absent'} />
          <Row label="User" value={typeof window !== 'undefined' && localStorage.getItem('user') ? 'Présent' : 'Absent'} />
          <button
            className="btn-ghost"
            onClick={() => {
              if (window.confirm('Vider le stockage local ?')) {
                localStorage.clear();
                toast.success('Stockage vidé — rechargement…');
                setTimeout(() => window.location.reload(), 600);
              }
            }}
            style={{ marginTop: 14, color: 'var(--status-red)' }}
            data-testid="clear-storage"
          >
            <Wrench size={14} /> Vider le stockage
          </button>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Wrench size={20} /> <h3 style={{ fontWeight: 700 }}>Variables d'env nécessaires</h3>
          </div>
          <ul style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.9, paddingLeft: 20 }}>
            <li><code>NEXT_PUBLIC_API_URL</code></li>
            <li><code>NEXT_PUBLIC_FIREBASE_*</code> (auth téléphone)</li>
            <li><code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code></li>
            <li><code>NEXT_PUBLIC_FACEBOOK_APP_ID</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--ink-line)' }}>
      <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
    </div>
  );
}
