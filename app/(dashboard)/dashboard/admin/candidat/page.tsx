'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Users, Loader, Search, RefreshCw } from 'lucide-react';

interface CandidatData {
  _id: string;
  numeroMatricule?: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
  };
  examen: string;
  serieFiliere: string;
  statutInscription: 'BROUILLON' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REJETE';
  paiement: {
    statut: 'NON_PAYE' | 'EN_COURS' | 'PAYE' | 'ECHEC';
  };
  genre: 'M' | 'F';
  lieuNaissance: string;
}

const STATUT_BADGE: Record<string, string> = {
  BROUILLON: 'badge-gray',
  EN_ATTENTE_VALIDATION: 'badge-yellow',
  VALIDE: 'badge-green',
  REJETE: 'badge-red',
};

const PAIEMENT_BADGE: Record<string, string> = {
  NON_PAYE: 'badge-red',
  EN_COURS: 'badge-yellow',
  PAYE: 'badge-green',
  ECHEC: 'badge-red',
};

export default function CandidatsPage() {
  const { user } = useAuth();
  const [candidats, setCandidats] = useState<CandidatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  // 🔥 Utiliser useCallback pour mémoriser la fonction
  const fetchCandidats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint à créer au backend: GET /api/admin/candidats
      const response = await api.get('/admin/candidats');
      // Gérer différents formats de réponse
      const data = response.data?.data || response.data || [];
      setCandidats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des candidats';
      setError(message);
      console.error('Erreur:', message);
      setCandidats([]);
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances, la fonction est stable

  // 🔥 useEffect avec la fonction mémorisée
  useEffect(() => {
    let isMounted = true; // Flag pour éviter les mises à jour après démontage

    const loadData = async () => {
      if (!isMounted) return;
      await fetchCandidats();
    };

    loadData();

    return () => {
      isMounted = false; // Nettoyage
    };
  }, [fetchCandidats]); // Dépendance à fetchCandidats

  const filtered = candidats.filter(c =>
    `${c.user.nom} ${c.user.prenom} ${c.examen} ${c.numeroMatricule || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: candidats.length,
    valides: candidats.filter(c => c.statutInscription === 'VALIDE').length,
    enAttente: candidats.filter(c => c.statutInscription === 'EN_ATTENTE_VALIDATION').length,
    payes: candidats.filter(c => c.paiement.statut === 'PAYE').length,
  };

  if (!isAdmin) {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <div className="tile" style={{ background: 'var(--tile-rose)', margin: '0 auto 20px', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
          <Users size={28} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Accès restreint
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Seuls les administrateurs et responsables peuvent accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
            👥 Gestion des candidats
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Liste complète des candidats inscrits aux examens nationaux
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={() => fetchCandidats()}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      {!loading && candidats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total candidats', value: stats.total, tone: 'var(--tile-sky)', icon: Users },
            { label: 'Dossiers validés', value: stats.valides, tone: 'var(--tile-mint)', icon: Users },
            { label: 'En attente', value: stats.enAttente, tone: 'var(--tile-sun)', icon: Users },
            { label: 'Paiements effectués', value: stats.payes, tone: 'var(--tile-lila)', icon: Users },
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
      )}

      {/* Loading */}
      {loading && (
        <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48, gap: 12 }}>
          <Loader size={24} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Chargement des candidats...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="card" style={{ padding: 20, background: 'var(--tile-rose)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span>⚠️</span>
            <p style={{ margin: 0, flex: 1 }}>{error}</p>
            <button 
              className="btn-ghost" 
              onClick={() => fetchCandidats()} 
              style={{ padding: '6px 12px' }}
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Search et Liste */}
      {!loading && !error && (
        <>
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Rechercher par nom, prénom, email, examen ou matricule..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', maxWidth: 400 }}
            />
          </div>

          {/* Liste */}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun candidat trouvé</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {candidats.length === 0 
                  ? 'Aucun candidat n\'est encore inscrit' 
                  : 'Aucun candidat ne correspond à votre recherche'}
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Candidat', 'Email', 'Examen', 'Série', 'Statut', 'Paiement'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 20px',
                          textAlign: 'left',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c._id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>
                          {c.user.prenom} {c.user.nom}
                        </div>
                        {c.numeroMatricule && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                            🆔 {c.numeroMatricule}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {c.user.email}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                        {c.examen}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {c.serieFiliere || '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${STATUT_BADGE[c.statutInscription]}`}>
                          {c.statutInscription === 'EN_ATTENTE_VALIDATION' ? 'En attente' : c.statutInscription}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${PAIEMENT_BADGE[c.paiement.statut]}`}>
                          {c.paiement.statut === 'NON_PAYE' ? 'Non payé' : 
                           c.paiement.statut === 'EN_COURS' ? 'En cours' :
                           c.paiement.statut === 'PAYE' ? 'Payé' : 'Échec'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}