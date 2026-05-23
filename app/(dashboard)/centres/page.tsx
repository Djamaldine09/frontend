'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const mockCentres = [
  { _id: '1', nom: 'Lycée Andohalo', code: 'CE-001', ville: 'Antananarivo', region: 'Analamanga', capaciteMaximale: 500, examensAcceptes: ['Baccalauréat', 'BEPC'], candidatsAffectes: Array(320).fill(null) },
  { _id: '2', nom: 'CEG Fianarantsoa', code: 'CE-002', ville: 'Fianarantsoa', region: 'Haute Matsiatra', capaciteMaximale: 300, examensAcceptes: ['BEPC', 'CEPE'], candidatsAffectes: Array(210).fill(null) },
  { _id: '3', nom: 'Lycée Toamasina', code: 'CE-003', ville: 'Toamasina', region: 'Atsinanana', capaciteMaximale: 400, examensAcceptes: ['Baccalauréat'], candidatsAffectes: Array(180).fill(null) },
];

export default function CentresPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', code: '', ville: '', region: '', capaciteMaximale: '', examensAcceptes: '' });

  const isAdmin = user?.role === 'ADMIN';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Centre créé avec succès !');
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>Centres d'examen</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Gestion des centres nationaux</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Annuler' : '+ Ajouter un centre'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>Nouveau centre</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label>Nom</label><input className="input-field" placeholder="Lycée d'Antananarivo" value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} required /></div>
            <div><label>Code unique</label><input className="input-field" placeholder="CE-004" value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value}))} required /></div>
            <div><label>Ville</label><input className="input-field" placeholder="Antananarivo" value={form.ville} onChange={e => setForm(p => ({...p, ville: e.target.value}))} required /></div>
            <div><label>Région</label><input className="input-field" placeholder="Analamanga" value={form.region} onChange={e => setForm(p => ({...p, region: e.target.value}))} required /></div>
            <div><label>Capacité maximale</label><input className="input-field" type="number" placeholder="500" value={form.capaciteMaximale} onChange={e => setForm(p => ({...p, capaciteMaximale: e.target.value}))} required /></div>
            <div><label>Examens acceptés (séparés par virgule)</label><input className="input-field" placeholder="Baccalauréat, BEPC" value={form.examensAcceptes} onChange={e => setForm(p => ({...p, examensAcceptes: e.target.value}))} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button className="btn-primary" type="submit">Créer le centre</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {mockCentres.map(c => {
          const taux = Math.round((c.candidatsAffectes.length / c.capaciteMaximale) * 100);
          const color = taux > 80 ? 'var(--accent-red)' : taux > 60 ? 'var(--accent-yellow)' : 'var(--accent-green)';
          return (
            <div key={c._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, marginBottom: 3 }}>{c.nom}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{c.code}</div>
                </div>
                <span className="badge badge-blue">{c.region}</span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                📍 {c.ville} — Capacité : {c.capaciteMaximale.toLocaleString()}
              </div>

              {/* Taux d'occupation */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Occupation</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>{taux}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${taux}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                  {c.candidatsAffectes.length} / {c.capaciteMaximale} candidats
                </div>
              </div>

              {/* Examens */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.examensAcceptes.map(ex => (
                  <span key={ex} className="badge badge-purple" style={{ fontSize: 11 }}>{ex}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
