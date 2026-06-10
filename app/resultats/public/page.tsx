'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Trophy, CheckCircle2, XCircle, Clock3, Share2, Sparkles, ArrowLeft, GraduationCap } from 'lucide-react';
import { publicAPI, PublicResult } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

function getMention(moyenne: number) {
  if (moyenne >= 16) return { label: 'Très bien', color: '#7c3aed', emoji: '🏆' };
  if (moyenne >= 14) return { label: 'Bien', color: '#0ea5e9', emoji: '⭐' };
  if (moyenne >= 12) return { label: 'Assez bien', color: '#10b981', emoji: '👍' };
  if (moyenne >= 10) return { label: 'Passable', color: '#f59e0b', emoji: '✅' };
  return { label: '—', color: '#94a3b8', emoji: '' };
}

const STATUT_STYLES: Record<PublicResult['statut'], { label: string; bg: string; fg: string; Icon: any }> = {
  ADMIS: { label: 'ADMIS', bg: '#dcfce7', fg: '#15803d', Icon: CheckCircle2 },
  REFUSE: { label: 'NON ADMIS', bg: '#fee2e2', fg: '#b91c1c', Icon: XCircle },
  REPECHAGE: { label: 'REPÊCHAGE', bg: '#fef3c7', fg: '#a16207', Icon: Clock3 },
  EN_ATTENTE: { label: 'EN ATTENTE', bg: '#e5e7eb', fg: '#4b5563', Icon: Clock3 },
};

function PublicResultatContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialMatricule = params.get('matricule') || '';

  const [matricule, setMatricule] = useState(initialMatricule);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (m: string) => {
    const clean = m.trim().toUpperCase();
    if (!clean) {
      setError('Veuillez saisir un matricule');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await publicAPI.getResultByMatricule(clean);
      setResult(res.data);
      const url = new URL(window.location.href);
      url.searchParams.set('matricule', clean);
      window.history.replaceState({}, '', url.toString());
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        setError(`Aucun résultat trouvé pour le matricule « ${clean} ». Vérifiez l'orthographe.`);
      } else if (status === 403) {
        setError('Les résultats ne sont pas encore publiés officiellement.');
      } else {
        setError(err.response?.data?.message || 'Service temporairement indisponible. Réessayez plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMatricule) search(initialMatricule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    if (!result) return;
    const url = window.location.href;
    const text = `Résultat de ${result.nomComplet} — ${result.examen} : ${STATUT_STYLES[result.statut].label} (${result.moyenne.toFixed(2)}/20)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Résultat examen', text, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success('Lien copié dans le presse-papier !');
      } catch {
        toast.error('Impossible de copier');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(1100px 600px at 12% -10%, #ddd6fe 0%, transparent 55%), radial-gradient(900px 500px at 88% 110%, #fef3c7 0%, transparent 60%), #f8fafc',
        padding: '40px 20px',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <Toaster position="top-center" />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <button
            onClick={() => router.push('/')}
            data-testid="back-home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              cursor: 'pointer',
              color: '#0f172a',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} /> Accueil
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
            <GraduationCap size={14} /> Résultats officiels
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(124, 58, 237, 0.1)',
              color: '#7c3aed',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            <Sparkles size={14} /> Consultation publique
          </div>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              letterSpacing: -1.2,
              color: '#0f172a',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Résultats des examens nationaux
          </h1>
          <p style={{ marginTop: 12, color: '#475569', fontSize: 15, lineHeight: 1.6 }}>
            Saisissez le matricule du candidat pour consulter son résultat officiel.
            <br />Aucune connexion requise — partagez librement !
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(matricule);
          }}
          style={{
            background: '#fff',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: 20,
            padding: 10,
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            gap: 8,
            marginBottom: 22,
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              data-testid="matricule-input"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Ex: BAC2025-00123"
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                border: 'none',
                background: 'transparent',
                fontSize: 16,
                color: '#0f172a',
                outline: 'none',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="search-btn"
            style={{
              padding: '0 24px',
              borderRadius: 14,
              border: 'none',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <Search size={15} />
            )}
            {loading ? 'Recherche…' : 'Rechercher'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            data-testid="result-error"
            style={{
              padding: 18,
              borderRadius: 16,
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 22,
            }}
          >
            {error}
          </div>
        )}

        {/* Result card */}
        {result && (
          <div
            data-testid="result-card"
            style={{
              background: '#fff',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)',
              animation: 'slideUp 0.4s ease-out',
            }}
          >
            {/* Banner */}
            <div
              style={{
                background: result.statut === 'ADMIS'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : result.statut === 'REPECHAGE'
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : result.statut === 'REFUSE'
                  ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                color: '#fff',
                padding: '32px 28px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, opacity: 0.85, textTransform: 'uppercase' }}>
                    Matricule {result.matricule}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{result.nomComplet}</div>
                  <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                    {result.examen}
                    {result.centre && <> · {result.centre}</>}
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    padding: '10px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {(() => { const I = STATUT_STYLES[result.statut].Icon; return <I size={15} />; })()}
                  {STATUT_STYLES[result.statut].label}
                </div>
              </div>
            </div>

            {/* Score */}
            <div style={{ padding: '32px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.8 }}>
                  Moyenne générale
                </div>
                <div style={{ fontSize: 44, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginTop: 6, fontFamily: 'monospace' }}>
                  {result.moyenne.toFixed(2)}
                  <span style={{ fontSize: 18, color: '#94a3b8', fontWeight: 500 }}> /20</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.8 }}>
                  Mention
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                    padding: '10px 16px',
                    borderRadius: 12,
                    background: `${getMention(result.moyenne).color}15`,
                    color: getMention(result.moyenne).color,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  <span>{getMention(result.moyenne).emoji}</span>
                  {result.mention || getMention(result.moyenne).label}
                </div>
              </div>
            </div>

            {/* Notes par matière */}
            {result.notes && result.notes.length > 0 && (
              <div style={{ padding: '0 28px 24px' }}>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>
                  Détail par matière
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                  {result.notes.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: 14,
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: i < result.notes!.length - 1 ? '1px solid #f1f5f9' : 'none',
                        background: i % 2 === 0 ? '#fafbfc' : '#fff',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{n.matiere}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Coef. {n.coefficient}</div>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: n.valeur >= 10 ? '#15803d' : '#b91c1c',
                          minWidth: 56,
                          textAlign: 'right',
                        }}
                      >
                        {n.valeur.toFixed(2)}/20
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                padding: '18px 28px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {result.datePublication ? (
                  <>Publié le {new Date(result.datePublication).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</>
                ) : (
                  'Résultat officiel'
                )}
              </div>
              <button
                onClick={handleShare}
                data-testid="share-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1px solid #0f172a',
                  background: '#0f172a',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={14} /> Partager
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: '#94a3b8',
              fontSize: 14,
            }}
          >
            <Trophy size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div>Saisissez un matricule pour afficher le résultat</div>
          </div>
        )}

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: 36, fontSize: 12, color: '#94a3b8' }}>
          En cas de contestation, contactez le centre d'examen ou le ministère.
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function PublicResultatPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Chargement…
        </div>
      }
    >
      <PublicResultatContent />
    </Suspense>
  );
}
