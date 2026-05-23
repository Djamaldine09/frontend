'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { resultatsAPI, documentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const mockResultats = [
  { _id: '1', candidat: { user: { nom: 'Rakoto', prenom: 'Jean' }, numeroMatricule: 'MAT-001' }, examen: 'Baccalauréat', moyenneGenerale: 14.5, statutFinal: 'ADMIS', notes: [{ matiere: 'Mathématiques', valeur: 16, coefficient: 5 }, { matiere: 'Physique', valeur: 14, coefficient: 4 }, { matiere: 'Français', valeur: 13, coefficient: 3 }] },
  { _id: '2', candidat: { user: { nom: 'Razafy', prenom: 'Marie' }, numeroMatricule: 'MAT-002' }, examen: 'BEPC', moyenneGenerale: 9.2, statutFinal: 'REPECHAGE', notes: [{ matiere: 'Mathématiques', valeur: 10, coefficient: 3 }, { matiere: 'Français', valeur: 11, coefficient: 3 }, { matiere: 'SVT', valeur: 7, coefficient: 2 }] },
  { _id: '3', candidat: { user: { nom: 'Rabe', prenom: 'Paul' }, numeroMatricule: null }, examen: 'Baccalauréat', moyenneGenerale: 0, statutFinal: 'EN_ATTENTE', notes: [] },
];

const STATUT_BADGE: Record<string, string> = {
  ADMIS: 'badge-green',
  REFUSE: 'badge-red',
  REPECHAGE: 'badge-yellow',
  EN_ATTENTE: 'badge-gray',
};

export default function ResultatsPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ examen: '', notes: [{ matiere: '', valeur: '', coefficient: '' }] });
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canSaisir = user?.role === 'SURVEILLANT' || user?.role === 'RESPONSABLE' || user?.role === 'ADMIN';
  const isCandidat = user?.role === 'CANDIDAT';

  const addNote = () => setForm(p => ({ ...p, notes: [...p.notes, { matiere: '', valeur: '', coefficient: '' }] }));

  const handleSaisir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const notes = form.notes.map(n => ({ matiere: n.matiere, valeur: parseFloat(n.valeur), coefficient: parseInt(n.coefficient) }));
      await resultatsAPI.saisirNotes(selected, { examen: form.examen, notes });
      toast.success('Notes saisies avec succès !');
      setSelected(null);
      setForm({ examen: '', notes: [{ matiere: '', valeur: '', coefficient: '' }] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur de saisie');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await documentsAPI.telechargerReleve();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'releve-notes.pdf';
      a.click();
      toast.success('Relevé téléchargé !');
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>Résultats</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Moyennes et statuts des candidats</p>
        </div>
        {isCandidat && (
          <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? '...' : '⬇ Télécharger mon relevé PDF'}
          </button>
        )}
      </div>

      {/* Saisie notes form */}
      {selected && canSaisir && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Saisie des notes</h3>
            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setSelected(null)}>✕ Fermer</button>
          </div>
          <form onSubmit={handleSaisir} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Examen</label>
              <input className="input-field" placeholder="Ex: Baccalauréat 2025" value={form.examen} onChange={e => setForm(p => ({ ...p, examen: e.target.value }))} required />
            </div>
            {form.notes.map((note, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                <div>
                  {i === 0 && <label>Matière</label>}
                  <input className="input-field" placeholder="Ex: Mathématiques" value={note.matiere} onChange={e => { const n = [...form.notes]; n[i].matiere = e.target.value; setForm(p => ({ ...p, notes: n })); }} required />
                </div>
                <div>
                  {i === 0 && <label>Note /20</label>}
                  <input className="input-field" type="number" placeholder="0-20" min={0} max={20} step={0.5} value={note.valeur} onChange={e => { const n = [...form.notes]; n[i].valeur = e.target.value; setForm(p => ({ ...p, notes: n })); }} required />
                </div>
                <div>
                  {i === 0 && <label>Coefficient</label>}
                  <input className="input-field" type="number" placeholder="1-9" min={1} value={note.coefficient} onChange={e => { const n = [...form.notes]; n[i].coefficient = e.target.value; setForm(p => ({ ...p, notes: n })); }} required />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-ghost" onClick={addNote} style={{ fontSize: 13 }}>+ Ajouter matière</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '...' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Results list */}
      <div style={{ display: 'grid', gap: 12 }}>
        {mockResultats.map(r => (
          <div key={r._id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 15, flexShrink: 0,
                background: r.statutFinal === 'ADMIS' ? 'rgba(63,185,80,0.15)' : r.statutFinal === 'REPECHAGE' ? 'rgba(210,153,34,0.15)' : 'rgba(139,148,158,0.1)',
                color: r.statutFinal === 'ADMIS' ? 'var(--accent-green)' : r.statutFinal === 'REPECHAGE' ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
                {r.moyenneGenerale > 0 ? r.moyenneGenerale.toFixed(1) : '—'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>
                    {(r.candidat as any).user.prenom} {(r.candidat as any).user.nom}
                  </span>
                  <span className={`badge ${STATUT_BADGE[r.statutFinal]}`}>{r.statutFinal}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {r.examen} — {r.notes.length > 0 ? `${r.notes.length} matière(s)` : 'Aucune note saisie'}
                </div>
                {r.notes.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {r.notes.map((n, i) => (
                      <span key={i} style={{ fontSize: 12, background: 'var(--bg-hover)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 6, fontFamily: 'var(--font-mono)' }}>
                        {n.matiere} : <strong style={{ color: n.valeur >= 10 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{n.valeur}/20</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {canSaisir && (
                <button className="btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }} onClick={() => setSelected(r._id)}>
                  ✎ Saisir notes
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
