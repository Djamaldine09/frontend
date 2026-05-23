'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const mockPaiements = [
  { _id: '1', candidat: 'Jean Rakoto', montant: 25000, statut: 'PAYE', mode: 'MVOLA', date: '2025-01-15', ref: 'MVL-202501-001' },
  { _id: '2', candidat: 'Marie Razafy', montant: 25000, statut: 'EN_COURS', mode: 'ORANGE_MONEY', date: '2025-01-17', ref: 'OM-202501-042' },
  { _id: '3', candidat: 'Paul Rabe', montant: 25000, statut: 'NON_PAYE', mode: null, date: null, ref: null },
];

const STATUT_BADGE: Record<string, string> = {
  PAYE: 'badge-green',
  EN_COURS: 'badge-yellow',
  NON_PAYE: 'badge-gray',
  ECHEC: 'badge-red',
};

const MODES = ['MVOLA', 'ORANGE_MONEY', 'AIRTEL_MONEY', 'CARTE_BANCAIRE'];

export default function PaiementsPage() {
  const { user } = useAuth();
  const [showPay, setShowPay] = useState(false);
  const [mode, setMode] = useState('MVOLA');
  const [paying, setPaying] = useState(false);

  const isCandidat = user?.role === 'CANDIDAT';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      toast.success(`Paiement via ${mode} initié ! Vous recevrez une confirmation par SMS.`);
      setPaying(false);
      setShowPay(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>Paiements</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Suivi des frais d'inscription</p>
        </div>
        {isCandidat && (
          <button className="btn-primary" onClick={() => setShowPay(!showPay)}>
            {showPay ? '✕ Annuler' : '◇ Payer mes frais'}
          </button>
        )}
      </div>

      {/* Pay form */}
      {showPay && isCandidat && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Paiement des frais d'inscription</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
            Montant dû : <strong style={{ color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>25 000 Ar</strong>
          </p>
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Mode de paiement mobile</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {MODES.map(m => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', background: mode === m ? 'rgba(88,166,255,0.08)' : 'transparent', transition: 'all 0.15s', color: 'var(--text-primary)', fontSize: 13, fontWeight: mode === m ? 600 : 400 }}>
                    <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} style={{ display: 'none' }} />
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`, display: 'inline-block', background: mode === m ? 'var(--accent)' : 'transparent', flexShrink: 0 }} />
                    {m.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={paying} style={{ alignSelf: 'flex-start' }}>
              {paying ? <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block' }} /> Traitement...</> : `Payer 25 000 Ar via ${mode}`}
            </button>
          </form>
        </div>
      )}

      {/* Paiements table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Candidat', 'Montant', 'Mode', 'Statut', 'Référence', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPaiements.map((p, i) => (
              <tr key={p._id} style={{ borderBottom: i < mockPaiements.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{p.candidat}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)', fontWeight: 600 }}>{p.montant.toLocaleString()} Ar</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.mode?.replace('_', ' ') || '—'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span className={`badge ${STATUT_BADGE[p.statut]}`}>{p.statut.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{p.ref || '—'}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
