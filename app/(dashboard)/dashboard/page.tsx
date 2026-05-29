'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import {
  Users, BookOpen, Building2, ScrollText, FileCheck, Wallet,
  ClipboardEdit, CheckCircle2, Layers, UserCheck, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import CandidateDashboard from './CandidateDashboard';
import api from '@/lib/api';

const roleGreeting: Record<Role, string> = {
  ADMIN: 'Tableau de bord Administrateur',
  RESPONSABLE: 'Tableau de bord Responsable',
  SURVEILLANT: 'Tableau de bord Surveillant',
  CORRECTEUR: 'Tableau de bord Correcteur',
  CANDIDAT: 'Mon espace candidat',
};

type Stat = { label: string; value: string; hint: string; tone: string; Icon: any };

const stats: Record<Exclude<Role, 'CANDIDAT'>, Stat[]> = {
  ADMIN: [
    { label: 'Candidats inscrits',  value: '12 480', hint: '+8% ce mois',     tone: 'var(--tile-sky)',   Icon: Users },
    { label: 'Examens planifiés',    value: '7',     hint: 'Session 2025',     tone: 'var(--tile-lila)',  Icon: BookOpen },
    { label: 'Centres actifs',       value: '128',   hint: '22 régions',       tone: 'var(--tile-mint)',  Icon: Building2 },
    { label: 'Résultats publiés',    value: '3 210', hint: 'Taux 72.4%',       tone: 'var(--tile-sun)',   Icon: ScrollText },
  ],
  RESPONSABLE: [
    { label: 'Dossiers à valider',   value: '24',    hint: '6 urgents',        tone: 'var(--tile-peach)', Icon: FileCheck },
    { label: 'Examens en cours',     value: '3',     hint: 'BEPC · BAC · CEPE', tone: 'var(--tile-lila)',  Icon: BookOpen },
    { label: 'Paiements reçus',      value: '94%',   hint: '180 candidats',    tone: 'var(--tile-mint)',  Icon: Wallet },
    { label: 'Résultats saisis',     value: '78%',   hint: '+12% cette semaine', tone: 'var(--tile-sun)',  Icon: ClipboardEdit },
  ],
  SURVEILLANT: [
    { label: 'Notes à saisir',       value: '46',    hint: '3 copies en attente', tone: 'var(--tile-sky)',  Icon: ClipboardEdit },
    { label: 'Notes validées',       value: '128',   hint: 'Session active',   tone: 'var(--tile-mint)',  Icon: CheckCircle2 },
    { label: 'Examens assignés',     value: '2',     hint: 'Maths · Physique', tone: 'var(--tile-lila)',  Icon: Layers },
    { label: 'Candidats suivis',     value: '210',   hint: 'Centre Andohalo', tone: 'var(--tile-peach)', Icon: UserCheck },
  ],
  CORRECTEUR: [
    { label: 'Copies à corriger',    value: '42',    hint: 'Session 2025',     tone: 'var(--tile-sky)',   Icon: ClipboardEdit },
    { label: 'Notes saisies',        value: '128',   hint: 'Saisie en cours',   tone: 'var(--tile-mint)',  Icon: CheckCircle2 },
    { label: 'Moyenne centre',       value: '11.8',  hint: 'Sur 210 candidats', tone: 'var(--tile-sun)',   Icon: ScrollText },
    { label: 'Temps restant',        value: '4j',    hint: 'Avant clôture',     tone: 'var(--tile-peach)', Icon: Layers },
  ],
};

const quickLinks: Record<Exclude<Role, 'CANDIDAT'>, { label: string; href: string; desc: string; Icon: any; tone: string }[]> = {
  ADMIN: [
    { label: 'Gérer les candidats', href: '/candidats', desc: 'Validation, sectorisation, affectation', Icon: Users,    tone: 'var(--tile-sky)' },
    { label: 'Créer un examen',     href: '/examens',   desc: 'Planifier une session nationale',       Icon: BookOpen, tone: 'var(--tile-lila)' },
    { label: "Centres d'examen",    href: '/centres',   desc: 'Capacité, salles, sectorisation',       Icon: Building2,tone: 'var(--tile-mint)' },
  ],
  RESPONSABLE: [
    { label: 'Valider les dossiers', href: '/candidats', desc: 'Traiter les inscriptions en attente', Icon: FileCheck,     tone: 'var(--tile-peach)' },
    { label: 'Saisir les résultats', href: '/resultats', desc: 'Encoder les notes anonymisées',        Icon: ClipboardEdit, tone: 'var(--tile-sun)' },
  ],
  SURVEILLANT: [
    { label: 'Saisir les notes',     href: '/resultats', desc: 'Notation anonyme des copies',         Icon: ClipboardEdit, tone: 'var(--tile-sky)' },
    { label: 'Voir les candidats',   href: '/candidats', desc: 'Consulter les dossiers assignés',     Icon: Users,         tone: 'var(--tile-lila)' },
  ],
  CORRECTEUR: [
    { label: 'Saisir les notes',     href: '/notation',   desc: 'Encoder les notes des copies',       Icon: ClipboardEdit, tone: 'var(--tile-sun)' },
    { label: 'Valider résultats',    href: '/validation', desc: 'Vérification finale des notes',      Icon: CheckCircle2,  tone: 'var(--tile-mint)' },
  ],
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [liveStats, setLiveStats] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'CANDIDAT') {
      const loadDashboardData = async () => {
        try {
          const res = await api.get(`/dashboard/stats?role=${user.role}`);
          // On fusionne les icônes et styles prédéfinis avec les valeurs de l'API
          const baseStats = stats[user.role as keyof typeof stats] || [];
          const enriched = baseStats.map((s, i) => ({
            ...s,
            value: res.data[i]?.value || s.value // Priorité à la donnée réelle
          }));
          setLiveStats(enriched);
        } catch (err) {
          setLiveStats(stats[user.role as keyof typeof stats] || []);
        } finally {
          setFetching(false);
        }
      };
      loadDashboardData();
    }
  }, [user]);

  if (isLoading) return <div style={{ padding: 40 }}>Chargement...</div>;
  if (!user) return <div style={{ padding: 40 }}>Veuillez vous connecter</div>;

  // Candidat → vue dédiée style Eduplex
  if (user.role === 'CANDIDAT') return <CandidateDashboard user={user} />;

  const roleLinks = quickLinks[user.role as keyof typeof quickLinks] || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'capitalize' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
          {roleGreeting[user.role]}
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: 14.5 }}>
          Bienvenue <strong style={{ color: 'var(--ink)' }}>{user.prenom} {user.nom}</strong> — vue d'ensemble de la session.
        </p>
      </section>

      {/* Stats grid */}
      <section
        className="stagger"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {liveStats.map((s) => (
          <div key={s.label} className="card card-hoverable" data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="tile" style={{ background: s.tone, marginBottom: 14 }}>
              <s.Icon size={20} strokeWidth={2} color="var(--ink)" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{s.hint}</div>
          </div>
        ))}
      </section>

      {/* Quick actions */}
      <section>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, letterSpacing: -0.4 }}>
          Actions rapides
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {roleLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              data-testid={`action-${l.label.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card card-hoverable\" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="tile tile-lg\" style={{ background: l.tone }}>
                  <l.Icon size={24} strokeWidth={2} color="var(--ink)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{l.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{l.desc}</div>
                </div>
                <div className="btn-icon"><ArrowUpRight size={16} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
