'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { examensAPI } from '@/lib/api';
import { AlertCircle, Play, BarChart3 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AffectationAutomatiquePage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<any[]>([]);
  const [selectedExamen, setSelectedExamen] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const isAuthorized = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  useEffect(() => {
    if (!isAuthorized) return;
    (async () => {
      try {
        const res = await examensAPI.lister();
        setExamens(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error('Erreur chargement examens');
      }
    })();
  }, [isAuthorized]);

  const handleLancerAffectation = async () => {
    if (!selectedExamen) {
      toast.error('Veuillez sélectionner un examen');
      return;
    }

    if (
      !confirm(
        '⚠️ ATTENTION: Ceci affectera TOUS les candidats validés et payés!\n\nContinuer?'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/affectation-auto/lancer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ examenId: selectedExamen })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(
        `✅ ${data.resultats.totalCandidatsAffectes} candidats affectés!`
      );
      await loadStats();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedExamen) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/affectation-auto/stats/${selectedExamen}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    if (selectedExamen) loadStats();
  }, [selectedExamen]);

  if (!isAuthorized) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', gap: 14 }}>
        <AlertCircle size={20} color="var(--status-red)" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Accès refusé</h1>
          <p style={{ color: 'var(--ink-soft)' }}>Réservé aux responsables et administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Affectation Automatique</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
          Affectez automatiquement tous les candidats aux centres par région
        </p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Sélectionner l'examen</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
          <select
            className="input-field"
            value={selectedExamen}
            onChange={(e) => setSelectedExamen(e.target.value)}
          >
            <option value="">— Choisir un examen —</option>
            {examens.map((ex) => (
              <option key={ex._id} value={ex._id}>{ex.titre}</option>
            ))}
          </select>
          <button
            className="btn-lime"
            onClick={handleLancerAffectation}
            disabled={!selectedExamen || loading}
          >
            <Play size={14} /> {loading ? 'En cours...' : 'Lancer'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Statistiques</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Affectés ✅</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--status-green)' }}>{stats.affectes}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                {stats.totalCandidats > 0 ? Math.round((stats.affectes / stats.totalCandidats) * 100) : 0}%
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Non affectés ❌</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--status-red)' }}>{stats.nonAffectes}</div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Centres</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--status-purple)' }}>{stats.centresUtilises}</div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'rgba(251, 146, 60, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Régions</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.regionsAffectees.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}