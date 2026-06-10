'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, type AdminCentre } from '@/lib/api';
import { Plus, Edit2, Trash2, Building2, MapPin, Users } from 'lucide-react';

export default function CentresAdminPage() {
  const { user } = useAuth();
  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [form, setForm] = useState({
    nom: '',
    code: '',
    ville: '',
    region: '',
    capaciteMaximale: 0,
    examensAcceptes: ['BAC'],
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch centres from API
  useEffect(() => {
    const fetchCentres = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getCentres();
        setCentres(response.data);
      } catch (err) {
        console.error('Erreur chargement centres:', err);
        toast.error('Erreur lors du chargement des centres');
      } finally {
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

  // Vérifier permission
  if (user?.role !== 'ADMIN' && user?.role !== 'RESPONSABLE') {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="tile tile-sm" style={{ background: 'var(--tile-rose)', flexShrink: 0 }}>
          <Building2 size={17} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Accès administrateur requis
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            Seuls les administrateurs et responsables peuvent accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14 }}>Chargement des centres...</div>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.code || !form.ville || !form.region || !form.capaciteMaximale) {
      toast.error('Les champs requis doivent être complétés');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        const response = await adminAPI.updateCentre(editing, form);
        setCentres(centres.map(c => c._id === editing ? response.data : c));
        toast.success('Centre modifié');
      } else {
        const response = await adminAPI.createCentre(form);
        setCentres([response.data, ...centres]);
        toast.success('Centre créé');
      }
      
      setForm({ nom: '', code: '', ville: '', region: '', capaciteMaximale: 0, examensAcceptes: ['BAC'] });
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr ? Cette action est irréversible.')) return;
    
    try {
      await adminAPI.deleteCentre(id);
      setCentres(centres.filter(c => c._id !== id));
      toast.success('Centre supprimé');
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (c: AdminCentre) => {
    setForm({
      nom: c.nom,
      code: c.code,
      ville: c.ville,
      region: c.region,
      capaciteMaximale: c.capaciteMaximale,
      examensAcceptes: c.examensAcceptes,
    });
    setEditing(c._id);
    setShowForm(true);
  };

  const filtered = centres.filter(c => {
    const matchSearch = `${c.nom} ${c.code} ${c.ville}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = !regionFilter || c.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const regions = [...new Set(centres.map(c => c.region))];
  const totalCapacity = centres.reduce((acc, c) => acc + c.capaciteMaximale, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
            Gestion des centres d'examen
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Créer et gérer les centres dans les différentes régions
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditing(null);
            setForm({ nom: '', code: '', ville: '', region: '', capaciteMaximale: 0, examensAcceptes: ['BAC'] });
          }}
        >
          {showForm ? '✕ Annuler' : <><Plus size={16} /> Créer un centre</>}
        </button>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Centres', value: centres.length, tone: 'var(--tile-sky)' },
          { label: 'Régions', value: regions.length, tone: 'var(--tile-mint)' },
          { label: 'Capacité totale', value: totalCapacity.toLocaleString(), tone: 'var(--tile-sun)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>
            {editing ? 'Modifier le centre' : 'Créer un nouveau centre'}
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div>
                <label>Nom du centre *</label>
                <input
                  className="input-field"
                  placeholder="Centre Andohalo"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Code centre *</label>
                <input
                  className="input-field"
                  placeholder="CAD-001"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label>Ville *</label>
                <input
                  className="input-field"
                  placeholder="Antananarivo"
                  value={form.ville}
                  onChange={e => setForm({ ...form, ville: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Région *</label>
                <input
                  className="input-field"
                  placeholder="Analamanga"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Capacité maximale *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="500"
                  value={form.capaciteMaximale}
                  onChange={e => setForm({ ...form, capaciteMaximale: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label>Examens acceptés</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['BAC', 'BEPC', 'CEPE'].map(exam => (
                    <label key={exam} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.examensAcceptes.includes(exam)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm({ ...form, examensAcceptes: [...form.examensAcceptes, exam] });
                          } else {
                            setForm({ ...form, examensAcceptes: form.examensAcceptes.filter(ex => ex !== exam) });
                          }
                        }}
                      />
                      {exam}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm({ nom: '', code: '', ville: '', region: '', capaciteMaximale: 0, examensAcceptes: ['BAC'] });
                }}
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          className="input-field"
          placeholder="🔍 Rechercher par nom ou code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          className="input-field"
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          style={{ width: 200 }}
        >
          <option value="">Toutes les régions</option>
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map(centre => (
          <div key={centre._id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Building2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {centre.nom}
                  </h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-soft)', padding: '3px 8px', borderRadius: 4 }}>
                    {centre.code}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} />
                    {centre.ville}, {centre.region}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} />
                    Capacité: {centre.capaciteMaximale} places
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--accent)' }}>
                    {centre.examensAcceptes.join(', ')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-ghost"
                  style={{ padding: '8px 12px', fontSize: 13 }}
                  onClick={() => handleEdit(centre)}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: '8px 12px', fontSize: 13, color: 'var(--accent-red)' }}
                  onClick={() => handleDelete(centre._id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}