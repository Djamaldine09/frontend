// app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import {
  Users,
  BookOpen,
  Building2,
  ScrollText,
  FileCheck,
  Wallet,
  ClipboardEdit,
  CheckCircle2,
  Layers,
  UserCheck,
  ArrowUpRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import CandidateDashboard from './CandidateDashboard';
import { adminAPI, type AdminDashboard } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatWeekdayDayMonth } from '@/lib/i18n/dates';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type T = (key: string) => string;

function roleGreeting(role: Role, t: T): string {
  return t(`adash.greeting.${role}`);
}

type DashboardStat = {
  labelKey: string;
  value: string;
  hintKey?: string;
  hint?: string;
  tone: string;
  Icon: typeof Users;
};

type QuickLink = {
  labelKey: string;
  href: string;
  descKey: string;
  Icon: typeof Users;
  tone: string;
};

function isAdminDashboard(value: unknown): value is AdminDashboard {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const dashboard = value as Partial<AdminDashboard>;
  return Boolean(
    dashboard.users &&
      dashboard.candidats &&
      dashboard.examens &&
      dashboard.centres &&
      dashboard.repartitionRegionale &&
      dashboard.security
  );
}

function extractAdminDashboard(value: unknown): AdminDashboard | null {
  if (isAdminDashboard(value)) {
    return value;
  }

  if (value && typeof value === 'object' && 'data' in value) {
    const nested = (value as { data?: unknown }).data;
    if (isAdminDashboard(nested)) {
      return nested;
    }
  }

  return null;
}

// Fallback stats en cas d'erreur API (pour les non-admin)
const fallbackStats: Record<Exclude<Role, 'CANDIDAT'>, DashboardStat[]> = {
  ADMIN: [
    { labelKey: 'adash.stat.candidatsInscrits', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-sky)', Icon: Users },
    { labelKey: 'adash.stat.examensPlanifies', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-lila)', Icon: BookOpen },
    { labelKey: 'adash.stat.centresActifs', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-mint)', Icon: Building2 },
    { labelKey: 'adash.stat.tauxOccupation', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-sun)', Icon: TrendingUp },
  ],
  RESPONSABLE: [
    { labelKey: 'adash.stat.dossiersAValider', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-peach)', Icon: FileCheck },
    { labelKey: 'adash.stat.examensEnCours', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-lila)', Icon: BookOpen },
    { labelKey: 'adash.stat.paiementsRecus', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-mint)', Icon: Wallet },
    { labelKey: 'adash.stat.resultatsSaisis', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-sun)', Icon: ClipboardEdit },
  ],
  SURVEILLANT: [
    { labelKey: 'adash.stat.notesASaisir', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-sky)', Icon: ClipboardEdit },
    { labelKey: 'adash.stat.notesValidees', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-mint)', Icon: CheckCircle2 },
    { labelKey: 'adash.stat.examensAssignes', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-lila)', Icon: Layers },
    { labelKey: 'adash.stat.candidatsSuivis', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-peach)', Icon: UserCheck },
  ],
  CORRECTEUR: [
    { labelKey: 'adash.stat.copiesACorriger', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-sky)', Icon: ClipboardEdit },
    { labelKey: 'adash.stat.notesSaisies', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-mint)', Icon: CheckCircle2 },
    { labelKey: 'adash.stat.moyenneCentre', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-sun)', Icon: ScrollText },
    { labelKey: 'adash.stat.tempsRestant', value: '...', hintKey: 'adash.loadingGeneric', tone: 'var(--tile-peach)', Icon: Layers },
  ],
};

const quickLinks: Record<Exclude<Role, 'CANDIDAT'>, QuickLink[]> = {
  ADMIN: [
    { labelKey: 'adash.link.gererUtilisateurs.label', href: '/admin/utilisateurs', descKey: 'adash.link.gererUtilisateurs.desc', Icon: Users, tone: 'var(--tile-sky)' },
    { labelKey: 'adash.link.gestionCentres.label', href: '/admin/centres', descKey: 'adash.link.gestionCentres.desc', Icon: Building2, tone: 'var(--tile-lila)' },
    { labelKey: 'adash.link.creerExamen.label', href: '/examens', descKey: 'adash.link.creerExamen.desc', Icon: BookOpen, tone: 'var(--tile-mint)' },
    { labelKey: 'adash.link.gererMatieres.label', href: '/matieres', descKey: 'adash.link.gererMatieres.desc', Icon: FileText, tone: 'var(--tile-green)' },
    { labelKey: 'adash.link.rapportsNationaux.label', href: '/admin/rapports', descKey: 'adash.link.rapportsNationaux.desc', Icon: FileText, tone: 'var(--tile-sun)' },
  ],
  RESPONSABLE: [
    { labelKey: 'adash.link.validerDossiers.label', href: '/candidats', descKey: 'adash.link.validerDossiers.desc', Icon: FileCheck, tone: 'var(--tile-peach)' },
    { labelKey: 'adash.link.saisirResultatsResp.label', href: '/resultats', descKey: 'adash.link.saisirResultatsResp.desc', Icon: ClipboardEdit, tone: 'var(--tile-sun)' },
  ],
  SURVEILLANT: [
    { labelKey: 'adash.link.saisirNotesSurv.label', href: '/resultats', descKey: 'adash.link.saisirNotesSurv.desc', Icon: ClipboardEdit, tone: 'var(--tile-sky)' },
    { labelKey: 'adash.link.voirCandidats.label', href: '/candidats', descKey: 'adash.link.voirCandidats.desc', Icon: Users, tone: 'var(--tile-lila)' },
  ],
  CORRECTEUR: [
    { labelKey: 'adash.link.saisirNotesCorr.label', href: '/notation', descKey: 'adash.link.saisirNotesCorr.desc', Icon: ClipboardEdit, tone: 'var(--tile-sun)' },
    { labelKey: 'adash.link.validerResultats.label', href: '/validation', descKey: 'adash.link.validerResultats.desc', Icon: CheckCircle2, tone: 'var(--tile-mint)' },
  ],
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { t, lang } = useLanguage();
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null);
  const [isFetchingAdminDashboard, setIsFetchingAdminDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }

    let cancelled = false;

    const fetchAdminDashboard = async () => {
      try {
        setIsFetchingAdminDashboard(true);
        const response = await adminAPI.dashboard();
        const dashboard = extractAdminDashboard(response.data);

        if (!cancelled) {
          setDashboardData(dashboard);
          setError(null);
        }
      } catch (err: unknown) {
        console.error('Erreur chargement dashboard admin:', err);
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsFetchingAdminDashboard(false);
        }
      }
    };

    void fetchAdminDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = isLoading || (user?.role === 'ADMIN' && isFetchingAdminDashboard);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14 }}>{t('adash.loading')}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        {t('adash.loginRequired')}
      </div>
    );
  }

  if (user.role === 'CANDIDAT') {
    return <CandidateDashboard user={user} />;
  }

  if (user.role === 'ADMIN') {
    if (error || !dashboardData) {
      return (
        <div className="card" style={{ padding: 28, background: 'var(--tile-rose)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{t('adash.error.title')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('adash.error.message')} {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {t('adash.error.retry')}
          </button>
        </div>
      );
    }

// Préparer les données pour les graphiques
    const statusLabels: Record<string, string> = {
      BROUILLON: t('adash.status.BROUILLON'),
      EN_ATTENTE_VALIDATION: t('adash.status.EN_ATTENTE_VALIDATION'),
      VALIDE: t('adash.status.VALIDE'),
      REJETE: t('adash.status.REJETE'),
      INSCRIT: t('adash.status.INSCRIT'),
      PAYE: t('adash.status.PAYE'),
    };

    // NOUVEAU : Assigner une couleur fixe à chaque statut
    const statusColors: Record<string, string> = {
      BROUILLON: '#94a3b8',             // Gris
      EN_ATTENTE_VALIDATION: '#f5bd38', // Jaune/Orange
      VALIDE: '#45c266',                // Vert
      REJETE: '#ff5f64',                // Rouge
      INSCRIT: '#26b7c7',               // Bleu cyan
      PAYE: '#b95cff',                  // Violet
    };

    const candidatsByStatusData = Object.entries(dashboardData.candidats.byStatus).map(
      ([status, count]) => ({
        name: statusLabels[status] || status,
        key: status,
        value: count,
        // On récupère la couleur fixe, ou on met un gris par défaut
        color: statusColors[status] || '#cbd5e1', 
      })
    );
    const candidatsStatusTotal = candidatsByStatusData.reduce((sum, item) => sum + item.value, 0);

    // Calcul du taux d'occupation
    const occupationRate = dashboardData.centres.capacity > 0 
      ? Math.round((dashboardData.centres.occupied / dashboardData.centres.capacity) * 100) 
      : 0;

    return (
      <div className="animate-fade-in">
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
            {formatWeekdayDayMonth(new Date(), lang)}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
            {roleGreeting(user.role, t)}
          </h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: 14.5 }}>
            {t('adash.welcome')} <strong style={{ color: 'var(--ink)' }}> {user.prenom} {user.nom}</strong>
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-sky)', marginBottom: 14 }}>
              <Users size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              {t('adash.stat.candidatsInscrits')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {dashboardData.candidats.total.toLocaleString()}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.candidats.payes} {t('adash.stat.payesSuffix')}
            </div>
          </div>

          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-lila)', marginBottom: 14 }}>
              <BookOpen size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              {t('adash.stat.examensPlanifies')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {dashboardData.examens.totalTypes}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.examens.resultatsPublies} {t('adash.stat.avecResultatsSuffix')}
            </div>
          </div>

          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-mint)', marginBottom: 14 }}>
              <Building2 size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              {t('adash.stat.centresActifs')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {dashboardData.centres.total}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.centres.regions} {t('adash.stat.regionsSuffix')}
            </div>
          </div>

          <div className="card card-hoverable">
            <div className="tile" style={{ background: 'var(--tile-sun)', marginBottom: 14 }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              {t('adash.stat.tauxOccupation')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {occupationRate}%
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {dashboardData.centres.occupied} / {dashboardData.centres.capacity} {t('adash.stat.placesSuffix')}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              {t('adash.chart.byStatus')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(160px, 0.85fr)', gap: 14, alignItems: 'center' }}>
            <div style={{ position: 'relative', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
                  <Pie
                    data={candidatsByStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={4}
                    cornerRadius={9}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 18;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="var(--text-secondary)"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          style={{ fontSize: 11, fontWeight: 800 }}
                        >
                          {`${Math.round(percent * 100)}%`}
                        </text>
                      );
                    }}
                  >
                    {candidatsByStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="var(--bg-soft)" 
                        strokeWidth={3} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value.toLocaleString()} candidat(s)`, name]}
                    contentStyle={{
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {candidatsStatusTotal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                    Total candidats
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
                {candidatsByStatusData.map((entry) => {
                  const percent = candidatsStatusTotal > 0 ? Math.round((entry.value / candidatsStatusTotal) * 100) : 0;
                  return (
                    <div key={entry.key} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto', alignItems: 'center', gap: 9 }}>
                      {/* On utilise entry.color ici pour le point de couleur et l'ombre */}
                      <span style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: 999, 
                        background: entry.color, 
                        boxShadow: `0 0 12px ${entry.color}55` 
                      }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.name}
                      </span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                        {percent}%
                      </strong>
                    </div>
                  );
                })}
            </div>
          </div>
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

        <section>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, letterSpacing: -0.4 }}>
            Actions rapides
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {quickLinks.ADMIN.map((link) => (
              <Link key={link.labelKey} href={link.href} style={{ textDecoration: 'none' }}>
                <div className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="tile tile-lg" style={{ background: link.tone }}>
                    <link.Icon size={24} strokeWidth={2} color="var(--ink)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{t(link.labelKey)}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{t(link.descKey)}</div>
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

  const roleFallback = fallbackStats[user.role as keyof typeof fallbackStats] || fallbackStats.RESPONSABLE;
  const roleLinks = quickLinks[user.role as keyof typeof quickLinks] || [];

  return (
    <div className="animate-fade-in">
      <section style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
          {roleGreeting(user.role, t)}
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: 14.5 }}>
          {t('adash.welcome')} <strong style={{ color: 'var(--ink)' }}>{user.prenom} {user.nom}</strong> — vue d&apos;ensemble de la session.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {roleFallback.map((stat) => (
          <div key={stat.labelKey} className="card card-hoverable">
            <div className="tile" style={{ background: stat.tone, marginBottom: 14 }}>
              <stat.Icon size={20} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
              {t(stat.labelKey)}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.8 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              {stat.hint ?? (stat.hintKey ? t(stat.hintKey) : '')}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, letterSpacing: -0.4 }}>
          Actions rapides
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {roleLinks.map((link) => (
            <Link key={link.labelKey} href={link.href} style={{ textDecoration: 'none' }}>
              <div className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="tile tile-lg" style={{ background: link.tone }}>
                  <link.Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{t(link.labelKey)}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{t(link.descKey)}</div>
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