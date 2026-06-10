'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { examensAPI } from '@/lib/api';
import { 
  BookOpen, Plus, Edit2, Trash2, Calendar, Clock, Users, 
  RefreshCw, Eye, Download, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';
import api from '@/lib/api';

// Types
interface Examen {
  _id: string;
  titre: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  nombreCandidats: number;
  nombreCentres: number;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE';
  description?: string;
  lieu?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CreateExamenDTO {
  titre: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  description?: string;
  lieu?: string;
}

const STATUT_CONFIG: Record<string, { label: string; badge: string; icon: any; color: string }> = {
  PLANIFIE: { 
    label: 'Planifié', 
    badge: 'badge-blue', 
    icon: Calendar,
    color: 'var(--accent)'
  },
  EN_COURS: { 
    label: 'En cours', 
    badge: 'badge-amber', 
    icon: Clock,
    color: 'var(--accent-yellow)'
  },
  TERMINE: { 
    label: 'Terminé', 
    badge: 'badge-green', 
    icon: CheckCircle,
    color: 'var(--accent-green)'
  },
};

const TYPE_LABELS: Record<string, string> = {
  BAC: 'Baccalauréat',
  BEPC: 'BEPC',
  CEPE: 'CEPE',
};

export default function ExamensPage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CreateExamenDTO>({ 
    titre: '', 
    type: '', 
    dateDebut: '', 
    dateFin: '',
    description: '',
    lieu: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const canCreate = user?.role === 'ADMIN';

  // Charger les examens depuis le backend
  const fetchExamens = async () => {
    setLoading(true);
    try {
      const response = await examensAPI.lister();
      console.log('📦 Réponse API examens:', response);

      // Gérer différents formats de réponse
      let examensData: Examen[] = [];

      const data = response?.data;
      if (data && Array.isArray(data)) {
        examensData = data;
      } else if (data && typeof data === 'object' && 'examens' in data && Array.isArray((data as any).examens)) {
        examensData = (data as any).examens;
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        examensData = (data as any).data;
      } else if (Array.isArray(response)) {
        examensData = response;
      } else if (data && typeof data === 'object' && '_id' in data) {
        examensData = [data as Examen];
      }

      setExamens(examensData);
    } catch (err: any) {
      console.error('Erreur chargement examens:', err);
      toast.error('Impossible de charger la liste des examens');
      setExamens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamens();
  }, []);

  // Créer ou modifier un examen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.titre || !form.type || !form.dateDebut || !form.dateFin) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(form.dateDebut) > new Date(form.dateFin)) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await examensAPI.modifier(editing, form);
        toast.success('Examen modifié avec succès');
      } else {
        await examensAPI.creer(form);
        toast.success('Examen créé avec succès');
      }
      
      // Reset form et recharger
      resetForm();
      await fetchExamens();
    } catch (err: any) {
      console.error('Erreur:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de l\'opération';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un examen
  const handleDelete = async (id: string, titre: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'examen "${titre}" ? Cette action est irréversible.`)) {
      return;
    }
    
    try {
      await examensAPI.supprimer(id);
      toast.success('Examen supprimé avec succès');
      await fetchExamens();
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Préparer le formulaire pour modification
  const handleEdit = (examen: Examen) => {
    setForm({
      titre: examen.titre,
      type: examen.type,
      dateDebut: examen.dateDebut?.split('T')[0] || examen.dateDebut,
      dateFin: examen.dateFin?.split('T')[0] || examen.dateFin,
      description: examen.description || '',
      lieu: examen.lieu || '',
    });
    setEditing(examen._id);
    setShowForm(true);
  };

  // Reset formulaire
  const resetForm = () => {
    setForm({ titre: '', type: '', dateDebut: '', dateFin: '', description: '', lieu: '' });
    setShowForm(false);
    setEditing(null);
  };

  // Filtrer les examens (avec sécurité)
  const filteredExamens = Array.isArray(examens) ? examens.filter(exam => {
    const matchSearch = exam?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       exam?.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !filterType || exam?.type === filterType;
    const matchStatut = !filterStatut || exam?.statut === filterStatut;
    return matchSearch && matchType && matchStatut;
  }) : [];

  // Statistiques (avec sécurité)
  const stats = {
    total: Array.isArray(examens) ? examens.length : 0,
    planifies: Array.isArray(examens) ? examens.filter(e => e?.statut === 'PLANIFIE').length : 0,
    enCours: Array.isArray(examens) ? examens.filter(e => e?.statut === 'EN_COURS').length : 0,
    termines: Array.isArray(examens) ? examens.filter(e => e?.statut === 'TERMINE').length : 0,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14 }}>Chargement des examens...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
            📚 Gestion des examens
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Créer, planifier et suivre les examens nationaux
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-ghost"
            onClick={fetchExamens}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
          {canCreate && (
            <button
              className="btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              {showForm ? '✕ Annuler' : <><Plus size={16} /> Créer un examen</>}
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total examens', value: stats.total, tone: 'var(--tile-sky)', icon: BookOpen },
          { label: 'Planifiés', value: stats.planifies, tone: 'var(--tile-lila)', icon: Calendar },
          { label: 'En cours', value: stats.enCours, tone: 'var(--tile-sun)', icon: Clock },
          { label: 'Terminés', value: stats.termines, tone: 'var(--tile-mint)', icon: CheckCircle },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <stat.icon size={20} style={{ color: stat.tone }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Formulaire de création/modification */}
      {showForm && canCreate && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)', padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)', fontSize: 18 }}>
            {editing ? '✏️ Modifier l\'examen' : '➕ Créer un nouvel examen'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Titre de l'examen *
                </label>
                <input
                  className="input-field"
                  placeholder="Ex: Baccalauréat 2025"
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Type d'examen *
                </label>
                <select
                  className="input-field"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  <option value="BAC">Baccalauréat (BAC)</option>
                  <option value="BEPC">BEPC</option>
                  <option value="CEPE">CEPE</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Date de début *
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.dateDebut}
                  onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Date de fin *
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.dateFin}
                  onChange={e => setForm({ ...form, dateFin: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Lieu / Centre principal
                </label>
                <input
                  className="input-field"
                  placeholder="Ex: Antananarivo"
                  value={form.lieu}
                  onChange={e => setForm({ ...form, lieu: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  className="input-field"
                  placeholder="Informations supplémentaires..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={resetForm}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting}
                style={{ minWidth: 120 }}
              >
                {submitting ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-field"
          placeholder="🔍 Rechercher par titre ou type..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="input-field"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="">Tous les types</option>
          <option value="BAC">BAC</option>
          <option value="BEPC">BEPC</option>
          <option value="CEPE">CEPE</option>
        </select>
        <select
          className="input-field"
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="">Tous les statuts</option>
          <option value="PLANIFIE">Planifiés</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminés</option>
        </select>
      </div>

      {/* Liste des examens */}
      {!Array.isArray(filteredExamens) || filteredExamens.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun examen trouvé</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {stats.total === 0 
              ? 'Commencez par créer votre premier examen' 
              : 'Aucun examen ne correspond à vos critères de recherche'}
          </p>
          {stats.total === 0 && canCreate && (
            <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>
              <Plus size={16} /> Créer un examen
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredExamens.map(exam => {
            const StatutIcon = STATUT_CONFIG[exam?.statut]?.icon || Calendar;
            const statutInfo = STATUT_CONFIG[exam?.statut] || STATUT_CONFIG.PLANIFIE;
            
            return (
              <div key={exam._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                      <BookOpen size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {exam.titre}
                      </h3>
                      <span className={`badge ${statutInfo.badge}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <StatutIcon size={12} />
                        {statutInfo.label}
                      </span>
                      <span className="badge badge-gray" style={{ background: 'var(--bg-soft)' }}>
                        {TYPE_LABELS[exam.type] || exam.type}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, auto))', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} />
                        <span>
                          Du {new Date(exam.dateDebut).toLocaleDateString('fr-FR')} 
                          {' '}au {new Date(exam.dateFin).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} />
                        <span>{exam.nombreCandidats?.toLocaleString() || 0} candidats</span>
                      </div>
                    </div>
                    
                    {exam.description && (
                      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', padding: 8, background: 'var(--bg-soft)', borderRadius: 6 }}>
                        {exam.description}
                      </p>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: '8px 12px' }}
                        onClick={() => handleEdit(exam)}
                        title="Modifier"
                      >
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '8px 12px', color: 'var(--accent-red)' }}
                        onClick={() => handleDelete(exam._id, exam.titre)}
                        title="Supprimer"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}