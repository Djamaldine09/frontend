'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { examensAPI, examensExtendedAPI, Examen, Epreuve } from '@/lib/api';
import { BookOpen, Plus, Save, Trash2, Calendar, Clock, FileText } from 'lucide-react';

interface FormEpreuve {
  matiere: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  coefficient: number;
  type: 'EPREUVE' | 'REVISION';
}

const emptyEpreuve: FormEpreuve = {
  matiere: '',
  date: '',
  heureDebut: '',
  heureFin: '',
  duree: 0,
  coefficient: 1,
  type: 'EPREUVE',
};

export default function MatieresPage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [selectedExamenId, setSelectedExamenId] = useState('');
  const [epreuves, setEpreuves] = useState<FormEpreuve[]>([emptyEpreuve]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExam, setEditingExam] = useState<Examen | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const fetchExamens = async () => {
    setLoading(true);
    try {
      const response = await examensAPI.lister();
      const data = response?.data;
      if (Array.isArray(data)) {
        setExamens(data);
      } else if (data && Array.isArray((data as any).data)) {
        setExamens((data as any).data);
      } else {
        setExamens([]);
      }
    } catch (err: any) {
      console.error('Erreur chargement examens:', err);
      toast.error('Impossible de charger les examens');
      setExamens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchExamens();
  }, [isAdmin]);

  const handleAddRow = () => {
    setEpreuves([...epreuves, { ...emptyEpreuve }]);
  };

  const handleRemoveRow = (index: number) => {
    setEpreuves(epreuves.filter((_, idx) => idx !== index));
  };

  const handleChange = (index: number, field: keyof FormEpreuve, value: string | number) => {
    const updated = [...epreuves];
    (updated[index] as any)[field] = value;
    setEpreuves(updated);
  };

  const fetchExamenDetails = async (examenId: string) => {
    if (!examenId) {
      setEditingExam(null);
      return;
    }

    try {
      const response = await examensExtendedAPI.getById(examenId);
      const data = response?.data;
      if (data && typeof data === 'object') {
        setEditingExam(data as Examen);
      } else {
        setEditingExam(null);
      }
    } catch (err: any) {
      console.error('Erreur récupération examen :', err);
      toast.error('Impossible de récupérer les détails de l examen');
      setEditingExam(null);
    }
  };

  useEffect(() => {
    if (!selectedExamenId) {
      setEditingExam(null);
      return;
    }

    fetchExamenDetails(selectedExamenId);
  }, [selectedExamenId]);

  const handleSave = async () => {
    if (!selectedExamenId) {
      toast.error('Veuillez sélectionner un examen existant');
      return;
    }

    const valid = epreuves.every((ep) => ep.matiere && ep.date && ep.heureDebut && ep.heureFin && ep.duree > 0 && ep.coefficient > 0);
    if (!valid) {
      toast.error('Veuillez remplir toutes les matières et les informations requises');
      return;
    }

    setSaving(true);
    try {
      const payload = epreuves.map((ep) => ({
        matiere: ep.matiere,
        date: ep.date,
        heureDebut: ep.heureDebut,
        heureFin: ep.heureFin,
        duree: ep.duree,
        coefficient: ep.coefficient,
        type: ep.type,
      }));
      const response = await examensExtendedAPI.addEpreuves(selectedExamenId, payload);
      toast.success('Matières ajoutées avec succès');
      setEpreuves([emptyEpreuve]);
      if (response?.data) {
        setEditingExam(response.data as Examen);
      }
    } catch (err: any) {
      console.error('Erreur ajout matières:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la création des matières');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h2>Accès refusé</h2>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Gestion des matières</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640 }}>
            Sélectionnez un examen déjà créé, puis ajoutez les matières et horaires qui composeront cet examen.
          </p>
        </div>
        <button className="btn-primary" onClick={handleAddRow} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Ajouter une matière
        </button>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Examen *</label>
            <select
              className="input-field"
              value={selectedExamenId}
              onChange={(e) => setSelectedExamenId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— Sélectionner un examen —</option>
              {examens.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.titre} • {exam.type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Date de l'examen</label>
            <input className="input-field" type="date" disabled value={editingExam?.dateDebut?.split('T')[0] || ''} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        {epreuves.map((ep, index) => (
          <div key={index} className="card" style={{ padding: 20, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Matière {index + 1}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Ajoutez une matière et son horaire de passage.
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleRemoveRow(index)}
                style={{ color: 'var(--accent-red)' }}
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label className="label">Matière *</label>
                <input
                  className="input-field"
                  value={ep.matiere}
                  onChange={(e) => handleChange(index, 'matiere', e.target.value)}
                  placeholder="Ex: Mathématiques"
                />
              </div>
              <div>
                <label className="label">Date *</label>
                <input
                  className="input-field"
                  type="date"
                  value={ep.date}
                  onChange={(e) => handleChange(index, 'date', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Heure début *</label>
                <input
                  className="input-field"
                  type="time"
                  value={ep.heureDebut}
                  onChange={(e) => handleChange(index, 'heureDebut', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Heure fin *</label>
                <input
                  className="input-field"
                  type="time"
                  value={ep.heureFin}
                  onChange={(e) => handleChange(index, 'heureFin', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Durée (min) *</label>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  value={ep.duree}
                  onChange={(e) => handleChange(index, 'duree', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Coefficient *</label>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  value={ep.coefficient}
                  onChange={(e) => handleChange(index, 'coefficient', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Type *</label>
                <select
                  className="input-field"
                  value={ep.type}
                  onChange={(e) => handleChange(index, 'type', e.target.value as 'EPREUVE' | 'REVISION')}
                >
                  <option value="EPREUVE">Épreuve</option>
                  <option value="REVISION">Révision</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
        <button type="button" className="btn-ghost" onClick={() => setEpreuves([emptyEpreuve])}>
          Réinitialiser
        </button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les matières'}
        </button>
      </div>

      {editingExam && editingExam.epreuves && editingExam.epreuves.length > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FileText size={18} />
            <h2 style={{ margin: 0 }}>Matières enregistrées pour {editingExam.titre}</h2>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {editingExam.epreuves.map((ep, idx) => (
              <div key={`${ep._id || idx}`} style={{ padding: 16, background: 'var(--bg-soft)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700 }}>{ep.matiere}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ep.type}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span><Calendar size={14} /> {new Date(ep.date).toLocaleDateString('fr-FR')}</span>
                  <span><Clock size={14} /> {ep.heureDebut} - {ep.heureFin}</span>
                  <span>Durée: {ep.duree} min</span>
                  <span>Coef : {ep.coefficient}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
