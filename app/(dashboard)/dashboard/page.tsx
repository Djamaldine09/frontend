// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import {
  Users, BookOpen, Building2, ScrollText, FileCheck, Wallet,
  ClipboardEdit, CheckCircle2, Layers, UserCheck, ArrowUpRight,
  TrendingUp, MapPin, FileText
} from 'lucide-react';
import Link from 'next/link';
import CandidateDashboard from './CandidateDashboard';
import { adminAPI, type AdminDashboard } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const roleGreeting: Record<Role, string> = {
  ADMIN: 'Tableau de bord Administrateur',
  RESPONSABLE: 'Tableau de bord Responsable',
  SURVEILLANT: 'Tableau de bord Surveillant',
  CORRECTEUR: 'Tableau de bord Correcteur',
  CANDIDAT: 'Mon espace candidat',
};

// Fallback stats en cas d'erreur API (pour les non-admin)
const fallbackStats: Record<Exclude<Role, 'CANDIDAT'>, any[]> = {
  ADMIN: [
    { label: 'Candidats inscrits',  value: '...', hint: 'Chargement...', tone: 'var(--tile-sky)',   Icon: Users },
    { label: 'Examens planifiés',    value: '...', hint: 'Chargement...', tone: 'var(--tile-lila)',  Icon: BookOpen },
    { label: 'Centres actifs',       value: '...', hint: 'Chargement...', tone: 'var(--tile-mint)',  Icon: Building2 },
    { label: 'Taux occupation',      value: '...', hint: 'Chargement...', tone: 'var(--tile-sun)',   Icon: TrendingUp },
  ],
  RESPONSABLE: [
    { label: 'Dossiers à valider',   value: '...', hint: 'Chargement...', tone: 'var(--tile-peach)', Icon: FileCheck },
    { label: 'Examens en cours',     value: '...', hint: 'Chargement...', tone: 'var(--tile-lila)',  Icon: BookOpen },
    { label: 'Paiements reçus',      value: '...', hint: 'Chargement...', tone: 'var(--tile-mint)',  Icon: Wallet },
    { label: 'Résultats saisis',     value: '...', hint: 'Chargement...', tone: 'var(--tile-sun)',  Icon: ClipboardEdit },
  ],
  SURVEILLANT: [
    { label: 'Notes à saisir',       value: '...', hint: 'Chargement...', tone: 'var(--tile-sky)',  Icon: ClipboardEdit },
    { label: 'Notes validées',       value: '...', hint: 'Chargement...', tone: 'var(--tile-mint)',  Icon: CheckCircle2 },
    { label: 'Examens assignés',     value: '...', hint: 'Chargement...', tone: 'var(--tile-lila)',  Icon: Layers },
    { label: 'Candidats suivis',     value: '...', hint: 'Chargement...', tone: 'var(--tile-peach)', Icon: UserCheck },
  ],
  CORRECTEUR: [
    { label: 'Copies à corriger',    value: '...', hint: 'Chargement...', tone: 'var(--tile-sky)',   Icon: ClipboardEdit },
    { label: 'Notes saisies',        value: '...', hint: 'Chargement...', tone: 'var(--tile-mint)',  Icon: CheckCircle2 },
    { label: 'Moyenne centre',       value: '...', hint: 'Chargement...', tone: 'var(--tile-sun)',   Icon: ScrollText },
    { label: 'Temps restant',        value: '...', hint: 'Chargement...', tone: 'var(--tile-peach)', Icon: Layers },
  ],
};

const quickLinks: Record<Exclude<Role, 'CANDIDAT'>, { label: string; href: string; desc: string; Icon: any; tone: string }[]> = {
  ADMIN: [
    { label: 'Gérer les utilisateurs', href: '/admin/utilisateurs', desc: 'Créer, modifier, supprimer', Icon: Users,    tone: 'var(--tile-sky)' },
    { label: 'Gestion des centres',    href: '/admin/centres',   desc: 'Capacité, régions, affectation', Icon: Building2, tone: 'var(--tile-lila)' },
    { label: "Créer un examen",        href: '/examens',         desc: 'Planifier une session nationale', Icon: BookOpen, tone: 'var(--tile-mint)' },
    { label: "Rapports nationaux",     href: '/admin/rapports',  desc: 'Export PDF/Excel',               Icon: FileText,  tone: 'var(--tile-sun)' },
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
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      const fetchAdminDashboard = async () => {
        try {
          const response = await adminAPI.dashboard();
          setDashboardData(response.data);
          setError(null);
        } catch (err: any) {
          console.error('Erreur chargement dashboard admin:', err);
          setError(err.message || 'Erreur de chargement');
        } finally {
          setLoading(false);
        }
      };
      fetchAdminDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14 }}>Chargement du tableau de bord...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        Veuillez vous connecter pour accéder à votre tableau de bord.
      </div>
    );
  }

  // Vue CANDIDAT
  if (user.role === 'CANDIDAT') {
    return <CandidateDashboard user={user} />;
  }

  // Vue ADMIN avec données réelles
  if (user.role === 'ADMIN') {
    if (error || !dashboardData) {
      return (
        <div className="card" style={{ padding: 28, background: 'var(--tile-rose)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>⚠️ Erreur de chargement</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Impossible de charger les données du dashboard: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      );
    }

    // Préparer les données pour les graphiques
    const candidatsByStatusData = Object.entries(dashboardData.candidats.byStatus).map(([status, count]) => ({
      name: status === 'INSCRIT' ? 'Inscrits' : status === 'PAYE' ? 'Payés' : status === 'VALIDE' ? 'Validés' : 'Rejetés',
      value: count,
    }));

    const COLORS = ['#3fbf50', '#d29922', '#8b949e', '#da3633'];

    return (
      <div className="animate-fade-in">
        {/* Header */}
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
            {roleGreeting[user.role]}
          </h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: 14.5 }}>
            Bienvenue <strong style={{ color: 'var(--ink)' }}>{user.prenom} {user.nom}</strong> — session en cours.
          </p>
        </section>

        {/* KPIs avec données réelles */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-sky)', marginBottom: 14 }}>
              <Users size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              Candidats inscrits
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {dashboardData.candidats.total.toLocaleString()}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.candidats.payes} payés
            </div>
          </div>

          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-lila)', marginBottom: 14 }}>
              <BookOpen size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              Examens planifiés
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {dashboardData.examens.totalTypes}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.examens.resultatsPublies} avec résultats
            </div>
          </div>

          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-mint)', marginBottom: 14 }}>
              <Building2 size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              Centres actifs
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {dashboardData.centres.total}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.centres.regions} régions
            </div>
          </div>

          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-sun)', marginBottom: 14 }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              Taux d'occupation
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {Math.round((dashboardData.centres.occupied / dashboardData.centres.capacity) * 100)}%
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.centres.occupied} / {dashboardData.centres.capacity} places
            </div>
          </div>
        </section>

        {/* Graphiques */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Candidats par statut
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={candidatsByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {candidatsByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Distribution par région
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.repartitionRegionale || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="region" tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }} />
                <Legend />
                <Bar dataKey="centres" fill="var(--accent)" name="Centres" />
                <Bar dataKey="capacity" fill="var(--accent-yellow)" name="Capacité" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Actions rapides */}
        <section>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, letterSpacing: -0.4 }}>
            Actions rapides
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {quickLinks.ADMIN.map((link) => (
              <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
                <div className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="tile tile-lg" style={{ background: link.tone }}>
                    <link.Icon size={24} strokeWidth={2} color="var(--ink)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{link.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{link.desc}</div>
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

  // Vue pour RESPONSABLE, SURVEILLANT, CORRECTEUR (fallback)
  const roleFallback = fallbackStats[user.role as keyof typeof fallbackStats] || fallbackStats.RESPONSABLE;
  const roleLinks = quickLinks[user.role as keyof typeof quickLinks] || [];

  return (
    <div className="animate-fade-in">
      <section style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
          {roleGreeting[user.role]}
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: 14.5 }}>
          Bienvenue <strong style={{ color: 'var(--ink)' }}>{user.prenom} {user.nom}</strong> — vue d'ensemble de la session.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {roleFallback.map((stat) => (
          <div key={stat.label} className="card card-hoverable">
            <div className="tile" style={{ background: stat.tone, marginBottom: 14 }}>
              <stat.Icon size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{stat.hint}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, letterSpacing: -0.4 }}>
          Actions rapides
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {roleLinks.map((link) => (
            <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
              <div className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="tile tile-lg" style={{ background: link.tone }}>
                  <link.Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{link.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{link.desc}</div>
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