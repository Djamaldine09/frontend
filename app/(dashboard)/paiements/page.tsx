'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { paiementAPI } from '@/lib/api';
import { Smartphone, CreditCard, CheckCircle2, Clock3, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

type Mode = 'MVOLA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'CARTE_BANCAIRE';

const MODES: { value: Mode; label: string; color: string; logos: string[] }[] = [
  { value: 'MVOLA', label: 'MVola (Telma)', color: '#FED402', logos: ['/logo/wghoORdJFd1ERxqJ7Kfz0UiDChalPIO0.png'] },
  { value: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF7900', logos: ['/logo/Orange_Money-Logo.wine.png'] },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money', color: '#ED1C24', logos: ['/logo/Airtel-Money-Logo-Vector-PNG.png'] },
  { value: 'CARTE_BANCAIRE', label: 'Carte bancaire', color: '#1A1F71', logos: ['/logo/visa.webp', '/logo/MasterCard-Logo-1979-1990.png'] },
];

const STATUT_BADGE: Record<string, string> = {
  PAYE: 'badge-green',
  EN_COURS: 'badge-amber',
  NON_PAYE: 'badge-gray',
  ECHEC: 'badge-red',
};

const STATUT_ICON: Record<string, any> = {
  PAYE: CheckCircle2,
  EN_COURS: Clock3,
  NON_PAYE: AlertCircle,
  ECHEC: XCircle,
};

const MONTANT_DEFAUT = 25000;

export default function PaiementsPage() {
  const { user } = useAuth();
  const [showPay, setShowPay] = useState(false);
  const [mode, setMode] = useState<Mode>('MVOLA');
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [pendingTx, setPendingTx] = useState<string | null>(null);

  const isCandidat = user?.role === 'CANDIDAT';
  const canSeeAll = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const r = await paiementAPI.getHistory();
      setHistory(Array.isArray((r as any).data) ? (r as any).data : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  // Polling du statut de transaction en cours
  useEffect(() => {
    if (!pendingTx) return;
    const id = setInterval(async () => {
      try {
        const r = await paiementAPI.checkStatus(pendingTx);
        const statut = (r as any).data?.statut;
        if (statut === 'PAYE') {
          toast.success('Paiement confirmé !');
          setPendingTx(null);
          fetchHistory();
        } else if (statut === 'ECHEC') {
          toast.error('Paiement échoué');
          setPendingTx(null);
          fetchHistory();
        }
      } catch {
        // continue polling
      }
    }, 4000);
    return () => clearInterval(id);
  }, [pendingTx]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'CARTE_BANCAIRE' && !phone) {
      toast.error('Numéro de téléphone requis pour Mobile Money');
      return;
    }
    setPaying(true);
    try {
      const r = await paiementAPI.initiate({
        montant: MONTANT_DEFAUT,
        modePaiement: mode,
        numeroTelephone: mode !== 'CARTE_BANCAIRE' ? phone : undefined,
      });
      const tx = (r as any).data?.transactionId || (r as any).data?._id;
      toast.success(`Paiement initié via ${mode.replace('_', ' ')}. Confirmez sur votre mobile.`);
      if (tx) setPendingTx(tx);
      setShowPay(false);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Initialisation du paiement impossible');
    } finally {
      setPaying(false);
    }
  };

  const handleRetry = async (candidatId: string) => {
    try {
      await paiementAPI.retry(candidatId);
      toast.success('Nouvelle tentative lancée');
      fetchHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Relance impossible');
    }
  };

  return (
    <div className="animate-fade-in" data-testid="paiements-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Paiements</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
            {isCandidat ? 'Réglez vos frais d\'inscription via Mobile Money' : 'Suivi des frais d\'inscription'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={fetchHistory} disabled={loadingHistory} data-testid="refresh-paiements">
            <RefreshCw size={14} /> Actualiser
          </button>
          {isCandidat && (
            <button className="btn-lime" onClick={() => setShowPay(!showPay)} data-testid="pay-toggle-btn">
              {showPay ? 'Annuler' : <><CreditCard size={14} /> Payer mes frais</>}
            </button>
          )}
        </div>
      </div>

      {pendingTx && (
        <div className="card" style={{ padding: 16, marginBottom: 22, background: 'var(--tile-sun)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Clock3 size={18} />
          <div style={{ flex: 1, fontSize: 13 }}>
            <strong>Transaction en cours :</strong> Confirmez le paiement sur votre téléphone. Vérification automatique…
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{pendingTx.slice(-8)}</span>
        </div>
      )}

      {showPay && isCandidat && (
        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Paiement des frais d'inscription</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18 }}>
            Montant dû : <strong style={{ color: 'var(--status-amber)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{MONTANT_DEFAUT.toLocaleString('fr-FR')} Ar</strong>
          </p>
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ marginBottom: 10 }}>Mode de paiement</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {MODES.map((m) => (
                  <label
                    key={m.value}
                    data-testid={`paymode-${m.value}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: 14,
                      border: `2px solid ${mode === m.value ? 'var(--ink)' : 'var(--ink-line)'}`,
                      cursor: 'pointer',
                      background: mode === m.value ? 'var(--bg-soft)' : 'transparent',
                      transition: 'all 0.18s',
                    }}
                  >
                    <input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {m.logos.map((logo, idx) => (
                        <img
                          key={idx}
                          src={logo}
                          alt={m.label}
                          style={{
                            width: 60,
                            height: 40,
                            objectFit: 'contain',
                            borderRadius: 8,
                            background: '#fff',
                            padding: 4,
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {mode !== 'CARTE_BANCAIRE' && (
              <div>
                <label>Numéro de téléphone Mobile Money</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-mute)' }} />
                  <input
                    className="input-field"
                    data-testid="pay-phone"
                    placeholder="+261 34 XX XXX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-lime" disabled={paying} data-testid="pay-submit" style={{ alignSelf: 'flex-start' }}>
              {paying ? 'Initialisation…' : `Payer ${MONTANT_DEFAUT.toLocaleString('fr-FR')} Ar via ${mode.replace('_', ' ')}`}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--ink-line)' }}>
          <strong>Historique des paiements</strong>
        </div>
        {loadingHistory ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Chargement…</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            <CreditCard size={32} style={{ marginBottom: 8 }} />
            <div>Aucun paiement enregistré</div>
          </div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink-line)' }}>
                {[...(canSeeAll ? ['Candidat'] : []), 'Montant', 'Mode', 'Statut', 'Référence', 'Date', ...(canSeeAll ? ['Actions'] : [])].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((p, i) => {
                const StatutIcon = STATUT_ICON[p.statut] || AlertCircle;
                return (
                  <tr key={p._id || i} style={{ borderBottom: i < history.length - 1 ? '1px solid var(--ink-line)' : 'none' }}>
                    {canSeeAll && <td style={{ padding: '12px 18px' }}>{p.candidat?.user?.prenom} {p.candidat?.user?.nom || p.candidatNom || '—'}</td>}
                    <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.montant?.toLocaleString('fr-FR') || '—'} Ar</td>
                    <td style={{ padding: '12px 18px' }}>
                      {p.modePaiement ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {(MODES.find(m => m.value === p.modePaiement)?.logos || ['/logo/wghoORdJFd1ERxqJ7Kfz0UiDChalPIO0.png']).map((logo, idx) => (
                              <img
                                key={idx}
                                src={logo}
                                alt={p.modePaiement}
                                style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }}
                              />
                            ))}
                          </div>
                          <span>{p.modePaiement.replace('_', ' ')}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span className={`badge ${STATUT_BADGE[p.statut] || 'badge-gray'}`}>
                        <StatutIcon size={11} /> {p.statut?.replace('_', ' ') || 'NON_PAYE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.referenceTransaction || '—'}</td>
                    <td style={{ padding: '12px 18px', fontSize: 13, color: 'var(--ink-soft)' }}>
                      {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    {canSeeAll && (
                      <td style={{ padding: '12px 18px' }}>
                        {p.statut === 'ECHEC' && (
                          <button className="btn-ghost" onClick={() => handleRetry(p.candidat?._id || p._id)} style={{ padding: '6px 12px', fontSize: 12 }}>
                            <RefreshCw size={12} /> Relancer
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
