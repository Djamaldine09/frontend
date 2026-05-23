'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { useEffect, useState } from 'react';

const roleGreeting: Record<Role, string> = {
  ADMIN: 'Tableau de bord Administrateur',
  RESPONSABLE: 'Tableau de bord Responsable',
  SURVEILLANT: 'Tableau de bord Correcteur',
  CANDIDAT: 'Mon espace candidat',
};

const stats = {
  ADMIN: [
    { label: 'Candidats inscrits', value: '—', icon: '◈', color: 'var(--accent)' },
    { label: 'Examens planifiés', value: '—', icon: '◻', color: 'var(--accent-purple)' },
    { label: 'Centres actifs', value: '—', icon: '⬡', color: 'var(--accent-green)' },
    { label: 'Résultats publiés', value: '—', icon: '◇', color: 'var(--accent-yellow)' },
  ],
  RESPONSABLE: [
    { label: 'Candidats à valider', value: '—', icon: '◈', color: 'var(--accent)' },
    { label: 'Examens en cours', value: '—', icon: '◻', color: 'var(--accent-purple)' },
    { label: 'Paiements reçus', value: '—', icon: '◇', color: 'var(--accent-green)' },
    { label: 'Résultats saisis', value: '—', icon: '◈', color: 'var(--accent-yellow)' },
  ],
  SURVEILLANT: [
    { label: 'Notes à saisir', value: '—', icon: '◈', color: 'var(--accent)' },
    { label: 'Notes validées', value: '—', icon: '◻', color: 'var(--accent-green)' },
    { label: 'Examens assignés', value: '—', icon: '⬡', color: 'var(--accent-purple)' },
    { label: 'Candidats suivis', value: '—', icon: '◇', color: 'var(--accent-yellow)' },
  ],
  CANDIDAT: [
    { label: 'Statut dossier', value: 'BROUILLON', icon: '◈', color: 'var(--accent-yellow)' },
    { label: 'Paiement', value: 'NON PAYÉ', icon: '◇', color: 'var(--accent-red)' },
    { label: 'Centre affecté', value: '—', icon: '⬡', color: 'var(--accent-purple)' },
    { label: 'Résultat', value: 'EN ATTENTE', icon: '◻', color: 'var(--text-secondary)' },
  ],
};

const quickLinks: Record<Role, { label: string; href: string; desc: string; icon: string }[]> = {
  ADMIN: [
    { label: 'Gérer les candidats', href: '/candidats', desc: 'Voir, valider ou rejeter les dossiers', icon: '◈' },
    { label: 'Créer un examen', href: '/examens', desc: 'Planifier un nouvel examen national', icon: '◻' },
    { label: 'Centres d\'examen', href: '/centres', desc: 'Administrer les centres nationaux', icon: '⬡' },
  ],
  RESPONSABLE: [
    { label: 'Valider dossiers', href: '/candidats', desc: 'Traiter les inscriptions en attente', icon: '◈' },
    { label: 'Saisir résultats', href: '/resultats', desc: 'Encoder les notes des candidats', icon: '◻' },
  ],
  SURVEILLANT: [
    { label: 'Saisir les notes', href: '/resultats', desc: 'Encoder les résultats des candidats', icon: '◈' },
    { label: 'Voir les candidats', href: '/candidats', desc: 'Consulter les dossiers assignés', icon: '◻' },
  ],
  CANDIDAT: [
    { label: 'Mon dossier', href: '/candidats', desc: 'Compléter mon inscription', icon: '◈' },
    { label: 'Payer les frais', href: '/paiements', desc: 'Régler les frais d\'inscription', icon: '◇' },
    { label: 'Mes résultats', href: '/resultats', desc: 'Consulter mon relevé de notes', icon: '◻' },
  ],
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
  console.log("Données utilisateur dans le Dashboard:", user);
}, [user]);

if (isLoading) return <div>Chargement...</div>;
if (!user) return <div>Veuillez vous connecter</div>;

  const roleStats = stats[user.role];
  const roleLinks = quickLinks[user.role];
  const [, setLoading] = useState(true);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
          {roleGreeting[user.role]}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 15 }}>
          Bonjour, <strong style={{ color: 'var(--text-primary)' }}>{user.prenom} {user.nom}</strong> — bonne journée !
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
        {(roleStats || []).map((stat, i) => (
          <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 28, opacity: 0.12, color: stat.color }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-mono)', letterSpacing: '-1px' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Actions rapides</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {(roleLinks || []).map((link, i) => (
            <a key={i} href={link.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', borderColor: 'var(--border)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{link.icon}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5, fontSize: 15 }}>{link.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{link.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
