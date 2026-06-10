'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { affectationAPI, examensAPI, adminAPI, Examen, AdminCentre } from '@/lib/api';
import { MapPin, ShieldAlert, RefreshCw, Send } from 'lucide-react';

export default function AffectationsPage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [selectedExamen, setSelectedExamen] = useState('');
  const [selectedCentre, setSelectedCentre] = useState('');
  const [affectations, setAffectations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const allowed = user?.role === 'SURVEILLANT' || user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      try {
        const [e, c] = await Promise.allSettled([examensAPI.lister(), adminAPI.getCentres()]);
        if (e.status === 'fulfilled') setExamens(Array.isArray(e.value.data) ? e.value.data : []);
        if (c.status === 'fulfilled') setCentres(Array.isArray(c.value.data) ? c.value.data : []);
      } catch {
        toast.error('Erreur chargement données');
      }
    })();
  }, [allowed]);

  const loadAffectations = async () => {
    if (!selectedExamen && !selectedCentre) {
      toast.error('Sélectionnez un examen ou un centre');
      return;
    }
    setLoading(true);
    try {
      const res = selectedExamen
        ? await affectationAPI.getByExamen(selectedExamen)
        : await affectationAPI.getByCentre(selectedCentre);
      setAffectations(Array.isArray((res as any).data) ? (res as any).data : []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur');
      setAffectations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', gap: 14 }}>
        <ShieldAlert size={20} color="var(--status-red)" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Accès refusé</h1>
          <p style={{ color: 'var(--ink-soft)' }}>Réservé aux surveillants, responsables et administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="affectations-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Affectations</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
          Consulter les affectations candidats / centres / salles
        </p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label>Examen</label>
            <select className="input-field" data-testid="affect-select-examen" value={selectedExamen} onChange={(e) => { setSelectedExamen(e.target.value); setSelectedCentre(''); }}>
              <option value="">— Choisir —</option>
              {examens.map((ex) => <option key={ex._id} value={ex._id}>{ex.titre}</option>)}
            </select>
          </div>
          <div>
            <label>Centre</label>
            <select className="input-field" data-testid="affect-select-centre" value={selectedCentre} onChange={(e) => { setSelectedCentre(e.target.value); setSelectedExamen(''); }}>
              <option value="">— Choisir —</option>
              {centres.map((c) => <option key={c._id} value={c._id}>{c.nom} · {c.ville}</option>)}
            </select>
          </div>
          <button className="btn-lime" onClick={loadAffectations} disabled={loading} data-testid="affect-load-btn">
            <RefreshCw size={14} /> {loading ? '…' : 'Charger'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {affectations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            <MapPin size={32} style={{ marginBottom: 8 }} />
            <div>Aucune affectation à afficher. Sélectionnez un filtre puis « Charger ».</div>
          </div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink-line)' }}>
                {['Candidat', 'Centre', 'Salle', 'Place'].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affectations.map((a, i) => (
                <tr key={a._id || i} style={{ borderBottom: i < affectations.length - 1 ? '1px solid var(--ink-line)' : 'none' }}>
                  <td style={{ padding: '12px 18px' }}>{a.candidat?.user?.prenom} {a.candidat?.user?.nom || a.candidatNom || '—'}</td>
                  <td style={{ padding: '12px 18px' }}>{a.centre?.nom || a.centreNom || '—'}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>{a.salle || '—'}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>{a.numeroPlace || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
