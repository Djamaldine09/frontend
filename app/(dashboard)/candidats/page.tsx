'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

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

// Mock data for demo
const mockCandidats = [
  { _id: '1', numeroMatricule: 'MAT-001', user: { nom: 'Rakoto', prenom: 'Jean' }, examen: 'Baccalauréat', serieFiliere: 'Série S', statutInscription: 'VALIDE', paiement: { statut: 'PAYE' }, genre: 'M', lieuNaissance: 'Antananarivo' },
  { _id: '2', numeroMatricule: null, user: { nom: 'Razafy', prenom: 'Marie' }, examen: 'BEPC', serieFiliere: 'Générale', statutInscription: 'EN_ATTENTE_VALIDATION', paiement: { statut: 'EN_COURS' }, genre: 'F', lieuNaissance: 'Fianarantsoa' },
  { _id: '3', numeroMatricule: null, user: { nom: 'Rabe', prenom: 'Paul' }, examen: 'Baccalauréat', serieFiliere: 'Série L', statutInscription: 'BROUILLON', paiement: { statut: 'NON_PAYE' }, genre: 'M', lieuNaissance: 'Toamasina' },
];

export default function CandidatsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  const filtered = mockCandidats.filter(c =>
    `${c.user.nom} ${c.user.prenom} ${c.examen}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>Candidats</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Gestion des dossiers d'inscription</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input-field"
            placeholder="🔍 Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { l: 'Total', v: mockCandidats.length, c: 'var(--accent)' },
          { l: 'Validés', v: mockCandidats.filter(c => c.statutInscription === 'VALIDE').length, c: 'var(--accent-green)' },
          { l: 'En attente', v: mockCandidats.filter(c => c.statutInscription === 'EN_ATTENTE_VALIDATION').length, c: 'var(--accent-yellow)' },
          { l: 'Rejetés', v: mockCandidats.filter(c => c.statutInscription === 'REJETE').length, c: 'var(--accent-red)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, fontFamily: 'var(--font-mono)', marginTop: 6 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Candidat', 'Examen / Filière', 'Statut dossier', 'Paiement', ...(isAdmin ? ['Actions'] : [])].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0d1117', flexShrink: 0 }}>
                      {c.user.prenom[0]}{c.user.nom[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.user.prenom} {c.user.nom}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {c.numeroMatricule || '— matricule non attribué'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{c.examen}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.serieFiliere}</div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span className={`badge ${STATUT_BADGE[c.statutInscription]}`}>{c.statutInscription.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span className={`badge ${PAIEMENT_BADGE[c.paiement.statut]}`}>{c.paiement.statut.replace('_', ' ')}</span>
                </td>
                {isAdmin && (
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => toast.success('Dossier validé !')}>✓ Valider</button>
                      <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => toast.error('Dossier rejeté')}>✕</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Aucun candidat trouvé</div>
        )}
      </div>
    </div>
  );
}
