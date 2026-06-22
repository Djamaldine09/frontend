'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { affectationAPI, examensAPI, adminAPI, candidatAPI, Examen, AdminCentre, CandidatMe } from '@/lib/api';
import { MapPin, ShieldAlert, RefreshCw, Send, Plus, Eye } from 'lucide-react';

type Tab = 'create' | 'view';

export default function AffectationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('view');
  const [examens, setExamens] = useState<Examen[]>([]);
  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [candidats, setCandidats] = useState<any[]>([]);

  // Form state (Create tab)
  const [selectedCandidat, setSelectedCandidat] = useState('');
  const [selectedCentreCreate, setSelectedCentreCreate] = useState('');
  const [salle, setSalle] = useState('');
  const [numeroPlace, setNumeroPlace] = useState('');
  const [creatingAffectation, setCreatingAffectation] = useState(false);

  // View state (View tab)
  const [selectedExamen, setSelectedExamen] = useState('');
  const [selectedCentreView, setSelectedCentreView] = useState('');
  const [affectations, setAffectations] = useState<any[]>([]);
  const [loadingAffectations, setLoadingAffectations] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isResponsable = user?.role === 'RESPONSABLE';
  const isSurveillant = user?.role === 'SURVEILLANT';
  const allowed = isAdmin || isResponsable || isSurveillant;
  const canCreate = isAdmin || isResponsable;

  // Charger les données au montage
  useEffect(() => {
    if (!allowed) return;
    (async () => {
      try {
        const [e, c, cand] = await Promise.allSettled([
          examensAPI.lister(),
          adminAPI.getCentres(),
          adminAPI.getCandidats()
        ]);
        
        if (e.status === 'fulfilled') setExamens(Array.isArray(e.value.data) ? e.value.data : []);
        if (c.status === 'fulfilled') setCentres(Array.isArray(c.value.data) ? c.value.data : []);
        
        // Charger les candidats via l'endpoint /admin/candidats (accessible à ADMIN et RESPONSABLE)
        if (cand.status === 'fulfilled') {
          const candidatesData = (cand.value as any).data || [];
          console.log('Candidats chargés:', candidatesData);
          console.log('Nombre de candidats:', candidatesData.length);
          console.log('Structure du premier candidat:', candidatesData[0]);
          setCandidats(Array.isArray(candidatesData) ? candidatesData : []);
        } else if (cand.status === 'rejected') {
          console.error('Erreur chargement candidats:', cand.reason);
          toast.error('Erreur lors du chargement des candidats');
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur chargement données');
      }
    })();
  }, [allowed]);

  // Créer une affectation
  const handleCreateAffectation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCandidat) {
      toast.error('Veuillez sélectionner un candidat');
      return;
    }
    if (!selectedCentreCreate) {
      toast.error('Veuillez sélectionner un centre');
      return;
    }
    if (!salle.trim()) {
      toast.error('Veuillez entrer le numéro de salle');
      return;
    }
    if (!numeroPlace.trim()) {
      toast.error('Veuillez entrer le numéro de place');
      return;
    }

    setCreatingAffectation(true);
    try {
      const res = await affectationAPI.affectToCenter(
        selectedCandidat,
        selectedCentreCreate,
        salle.trim(),
        numeroPlace.trim()
      );

      toast.success('✅ Affectation créée avec succès');
      
      // Réinitialiser le formulaire
      setSelectedCandidat('');
      setSelectedCentreCreate('');
      setSalle('');
      setNumeroPlace('');
      
      // Basculer à la vue pour voir la nouvelle affectation
      setTimeout(() => {
        setActiveTab('view');
      }, 1000);
    } catch (error: any) {
      console.error('Erreur création affectation:', error);
      const message = error.response?.data?.message || 'Erreur lors de la création de l\'affectation';
      toast.error('❌ ' + message);
    } finally {
      setCreatingAffectation(false);
    }
  };

  // Charger les affectations
  const handleLoadAffectations = async () => {
    if (!selectedExamen && !selectedCentreView) {
      toast.error('Sélectionnez un examen ou un centre');
      return;
    }
    setLoadingAffectations(true);
    try {
      const res = selectedExamen
        ? await affectationAPI.getByExamen(selectedExamen)
        : await affectationAPI.getByCentre(selectedCentreView);
      setAffectations(Array.isArray((res as any).data) ? (res as any).data : []);
      if (Array.isArray((res as any).data) && (res as any).data.length > 0) {
        toast.success(`📋 ${(res as any).data.length} affectation(s) chargée(s)`);
      } else {
        toast('Aucune affectation trouvée', { icon: '📭' });
      }
    } catch (e: any) {
      console.error('Erreur chargement affectations:', e);
      toast.error(e.response?.data?.message || 'Erreur');
      setAffectations([]);
    } finally {
      setLoadingAffectations(false);
    }
  };

  // Supprimer une affectation
  const handleDeleteAffectation = async (affectationId: string) => {
    if (!isAdmin && !isResponsable) {
      toast.error('Vous n\'avez pas la permission de supprimer');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir annuler cette affectation ?')) {
      return;
    }

    try {
      await affectationAPI.cancel(affectationId);
      toast.success('✅ Affectation annulée');
      // Recharger les affectations
      await handleLoadAffectations();
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
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
          {canCreate
            ? 'Créer et consulter les affectations candidats / centres / salles'
            : 'Consulter les affectations candidats / centres / salles'}
        </p>
      </div>

      {/* Onglets */}
      {canCreate && (
        <div style={{ marginBottom: 22, display: 'flex', gap: 12 }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              backgroundColor: activeTab === 'create' ? 'var(--brand)' : 'var(--ink-line)',
              color: activeTab === 'create' ? 'white' : 'var(--ink-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 200ms'
            }}
          >
            <Plus size={16} /> Créer une affectation
          </button>
          <button
            onClick={() => setActiveTab('view')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              backgroundColor: activeTab === 'view' ? 'var(--brand)' : 'var(--ink-line)',
              color: activeTab === 'view' ? 'white' : 'var(--ink-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 200ms'
            }}
          >
            <Eye size={16} /> Consulter
          </button>
        </div>
      )}

      {/* Onglet Créer */}
      {canCreate && activeTab === 'create' && (
        <div className="card" style={{ padding: 22, marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Créer une affectation</h2>
          
          <form onSubmit={handleCreateAffectation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                Candidat <span style={{ color: 'var(--status-red)' }}>*</span>
              </label>
              <select
                className="input-field"
                value={selectedCandidat}
                onChange={(e) => setSelectedCandidat(e.target.value)}
                required
                data-testid="affect-create-select-candidat"
              >
                <option value="">— Sélectionner un candidat —</option>
                {candidats.map((cand) => (
                  <option key={cand._id} value={cand._id}>
                    {cand.user?.prenom} {cand.user?.nom} {cand.numeroMatricule ? `(${cand.numeroMatricule})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                Centre d'examen <span style={{ color: 'var(--status-red)' }}>*</span>
              </label>
              <select
                className="input-field"
                value={selectedCentreCreate}
                onChange={(e) => setSelectedCentreCreate(e.target.value)}
                required
                data-testid="affect-create-select-centre"
              >
                <option value="">— Sélectionner un centre —</option>
                {centres.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nom} ({c.ville})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                Salle <span style={{ color: 'var(--status-red)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: A101, Salle 1, etc."
                value={salle}
                onChange={(e) => setSalle(e.target.value)}
                required
                data-testid="affect-create-salle"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                Numéro de place <span style={{ color: 'var(--status-red)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: 001, 42, etc."
                value={numeroPlace}
                onChange={(e) => setNumeroPlace(e.target.value)}
                required
                data-testid="affect-create-place"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit"
                disabled={creatingAffectation}
                className="btn-lime"
                style={{ width: '100%' }}
                data-testid="affect-create-submit"
              >
                <Send size={14} /> {creatingAffectation ? 'Création en cours…' : 'Créer l\'affectation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onglet Consulter */}
      {activeTab === 'view' && (
        <>
          <div className="card" style={{ padding: 22, marginBottom: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Filtrer les affectations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                  Examen
                </label>
                <select
                  className="input-field"
                  data-testid="affect-select-examen"
                  value={selectedExamen}
                  onChange={(e) => {
                    setSelectedExamen(e.target.value);
                    setSelectedCentreView('');
                  }}
                >
                  <option value="">— Tous les examens —</option>
                  {examens.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                  Centre
                </label>
                <select
                  className="input-field"
                  data-testid="affect-select-centre"
                  value={selectedCentreView}
                  onChange={(e) => {
                    setSelectedCentreView(e.target.value);
                    setSelectedExamen('');
                  }}
                >
                  <option value="">— Tous les centres —</option>
                  {centres.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nom} · {c.ville}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn-lime"
                onClick={handleLoadAffectations}
                disabled={loadingAffectations}
                data-testid="affect-load-btn"
              >
                <RefreshCw size={14} /> {loadingAffectations ? '…' : 'Charger'}
              </button>
            </div>
          </div>

          {/* Tableau des affectations */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {affectations.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
                <MapPin size={32} style={{ marginBottom: 8 }} />
                <div>
                  {selectedExamen || selectedCentreView
                    ? 'Aucune affectation à afficher. Sélectionnez un filtre puis « Charger ».'
                    : 'Sélectionnez un filtre pour afficher les affectations.'}
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ink-line)', backgroundColor: 'var(--ink-lift)' }}>
                      {['Candidat', 'Centre', 'Ville', 'Salle', 'Place', 'Statut', canCreate ? 'Actions' : ''].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '12px 18px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--ink-mute)',
                            textTransform: 'uppercase',
                            display: h ? 'table-cell' : 'none'
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {affectations.map((a, i) => (
                      <tr
                        key={a._id || i}
                        style={{
                          borderBottom:
                            i < affectations.length - 1
                              ? '1px solid var(--ink-line)'
                              : 'none',
                          backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)'
                        }}
                      >
                        <td style={{ padding: '12px 18px' }}>
                          {a.candidat?.user?.prenom} {a.candidat?.user?.nom || '—'}
                        </td>
                        <td style={{ padding: '12px 18px' }}>{a.centre?.nom || a.centreNom || '—'}</td>
                        <td style={{ padding: '12px 18px' }}>{a.centre?.ville || '—'}</td>
                        <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>{a.salle || '—'}</td>
                        <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>{a.numeroPlace || '—'}</td>
                        <td style={{ padding: '12px 18px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              backgroundColor:
                                a.statut === 'CONFIRMEE'
                                  ? 'rgba(34, 197, 94, 0.1)'
                                  : a.statut === 'MODIFIEE'
                                    ? 'rgba(59, 130, 246, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                              color:
                                a.statut === 'CONFIRMEE'
                                  ? 'var(--status-green)'
                                  : a.statut === 'MODIFIEE'
                                    ? 'var(--status-blue)'
                                    : 'var(--status-red)'
                            }}
                          >
                            {a.statut || 'CONFIRMEE'}
                          </span>
                        </td>
                        {canCreate && (
                          <td style={{ padding: '12px 18px' }}>
                            <button
                              onClick={() => handleDeleteAffectation(a._id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 4,
                                border: '1px solid var(--status-red)',
                                backgroundColor: 'transparent',
                                color: 'var(--status-red)',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                transition: 'all 200ms'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--status-red)';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--status-red)';
                              }}
                            >
                              Annuler
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}