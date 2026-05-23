'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { examensAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ExamensPage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', date: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  const fetchExamens = async () => {
    try {
      const res = await examensAPI.list();
      setExamens(res.data?.examens || []);
    } catch {
      setExamens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExamens(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await examensAPI.creer(form);
      toast.success('Examen créé avec succès !');
      setShowForm(false);
      setForm({ titre: '', date: '', type: '' });
      fetchExamens();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>Examens nationaux</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Calendrier des examens en cours et planifiés</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Annuler' : '+ Créer un examen'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>Nouvel examen</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label>Titre de l'examen</label>
              <input className="input-field" placeholder="Ex: Baccalauréat 2025" value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} required />
            </div>
            <div>
              <label>Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required style={{ appearance: 'none' }}>
                <option value="">-- Sélectionner --</option>
                <option value="Baccalauréat">Baccalauréat</option>
                <option value="BEPC">BEPC</option>
                <option value="CEPE">CEPE</option>
                <option value="BTS">BTS</option>
              </select>
            </div>
            <div>
              <label>Date prévue</label>
              <input className="input-field" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <button className="btn-primary" type="submit" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                {submitting ? '...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Chargement...</div>
      ) : examens.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◻</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Aucun examen planifié pour le moment.</div>
          {canCreate && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Cliquez sur "Créer un examen" pour commencer.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {examens.map((ex: any, i: number) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(88,166,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>◻</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{ex.titre || ex.type || 'Examen'}</div>
                {ex.date && <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>📅 {new Date(ex.date).toLocaleDateString('fr-FR')}</div>}
              </div>
              <span className="badge badge-blue">{ex.type || 'National'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
