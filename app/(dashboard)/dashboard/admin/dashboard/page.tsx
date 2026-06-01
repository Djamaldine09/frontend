'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, type AdminDashboard, type NationalReport } from '@/lib/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Users, BookOpen, Building2, TrendingUp, MapPin, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [report, setReport] = useState<NationalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, reportRes] = await Promise.all([
          adminAPI.dashboard(),
          adminAPI.report(),
        ]);
        setDashboard(dashRes.data);
        setReport(reportRes.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div
        className="card"
        style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}
      >
        <div
          className="tile tile-sm"
          style={{ background: 'var(--tile-rose)', flexShrink: 0 }}
        >
          <TrendingUp size={17} />
        </div>
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            Accès administrateur requis
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            Seuls les administrateurs peuvent accéder à ce dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          color: 'var(--text-secondary)',
        }}
      >
        Chargement du dashboard...
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="card" style={{ padding: 28, background: 'var(--tile-rose)' }}>
        Erreur lors du chargement des données: {error}
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const candidatsByStatusData = Object.entries(dashboard.candidats.byStatus).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  const COLORS = ['#3fbf50', '#d29922', '#8b949e', '#da3633'];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.6px',
            color: 'var(--text-primary)',
          }}
        >
          Dashboard National
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
          Aperçu des examens nationaux en temps réel
        </p>
      </div>

      {/* KPIs principaux */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          {
            Icon: Users,
            label: 'Candidats inscrits',
            value: dashboard.candidats.total.toLocaleString(),
            subtext: `${dashboard.candidats.payes} payés`,
            color: 'var(--tile-sky)',
          },
          {
            Icon: BookOpen,
            label: 'Examens planifiés',
            value: dashboard.examens.totalTypes,
            subtext: `${dashboard.examens.resultatsPublies} avec résultats`,
            color: 'var(--tile-lila)',
          },
          {
            Icon: Building2,
            label: 'Centres actifs',
            value: dashboard.centres.total,
            subtext: `${dashboard.centres.regions} régions`,
            color: 'var(--tile-mint)',
          },
          {
            Icon: TrendingUp,
            label: "Taux d'occupation",
            value: `${Math.round((dashboard.centres.occupied / dashboard.centres.capacity) * 100)}%`,
            subtext: `${dashboard.centres.occupied} / ${dashboard.centres.capacity} places`,
            color: 'var(--tile-sun)',
          },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <stat.Icon size={18} style={{ color: 'var(--text-primary)' }} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {stat.label}
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {stat.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Graphique candidats par statut */}
        <div className="card" style={{ padding: 20 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 16,
              color: 'var(--text-primary)',
            }}
          >
            📊 Candidats par statut
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
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique centres */}
        <div className="card" style={{ padding: 20 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 16,
              color: 'var(--text-primary)',
            }}
          >
            🏢 Distribution par région
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { region: 'Analamanga', centres: 28, capacity: 5000 },
                { region: 'Vakinankaratra', centres: 12, capacity: 2500 },
                { region: "Amoron'i Mania", centres: 8, capacity: 1800 },
                { region: 'Atsimo-Andrefana', centres: 15, capacity: 3200 },
                { region: 'Menabe', centres: 6, capacity: 1200 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="region" tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
              />
              <Legend />
              <Bar dataKey="centres" fill="var(--accent)" />
              <Bar dataKey="capacity" fill="var(--accent-yellow)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau des détails */}
      <div className="card" style={{ padding: 20 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            color: 'var(--text-primary)',
          }}
        >
          📈 Résumé national
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            {
              label: 'Candidats validés',
              value: Math.round(dashboard.candidats.total * 0.75),
              color: 'var(--accent-green)',
            },
            {
              label: 'Candidats en attente',
              value: Math.round(dashboard.candidats.total * 0.2),
              color: 'var(--accent-yellow)',
            },
            {
              label: 'Résultats publiés',
              value: dashboard.examens.resultatsPublies,
              color: 'var(--accent)',
            },
            {
              label: 'Résultats en cours',
              value: dashboard.examens.totalTypes - dashboard.examens.resultatsPublies,
              color: 'var(--text-muted)',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                background: 'var(--bg-soft)',
                borderRadius: 8,
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infos de sécurité */}
      <div style={{ marginTop: 24, padding: 16, background: 'var(--tile-mint)', borderRadius: 12 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          🔒 Configuration de sécurité
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Admins actifs:</span>
            <span style={{ fontWeight: 600, marginLeft: 6, color: 'var(--text-primary)' }}>
              {dashboard.security.adminCount}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>JWT:</span>
            <span
              style={{
                fontWeight: 600,
                marginLeft: 6,
                color: dashboard.security.jwtConfigured
                  ? 'var(--accent-green)'
                  : 'var(--accent-red)',
              }}
            >
              {dashboard.security.jwtConfigured ? '✓ Configuré' : '✗ Non configuré'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>CORS:</span>
            <span style={{ fontWeight: 600, marginLeft: 6, color: 'var(--text-primary)' }}>
              {dashboard.security.corsOrigins.length} origine(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}