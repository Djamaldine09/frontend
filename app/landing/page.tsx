'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Bell, CheckCircle2, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react';
import '../landing.css';

const stats = [
  { value: '100%', label: 'suivi numerique' },
  { value: '24/7', label: 'portail disponible' },
  { value: '5 roles', label: 'acces securises' },
];

const features = [
  {
    icon: FileCheck2,
    title: 'Dossiers candidats',
    text: 'Inscription, pieces justificatives, paiement et convocation dans un seul espace.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    text: 'Les candidats restent informes des convocations, paiements, corrections et resultats.',
  },
  {
    icon: BarChart3,
    title: 'Pilotage national',
    text: 'Tableaux de bord pour suivre les centres, les presences et la publication des resultats.',
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Navigation principale">
        <Link href="/landing" className="landing-brand">
          <span>ExamGest MG</span>
        </Link>

        <div className="landing-links">
          <a href="#plateforme">Plateforme</a>
          <a href="#securite">Securite</a>
          <a href="#roles">Roles</a>
        </div>

        <div className="landing-actions">
          <Link href="/login" className="landing-link-button">Connexion</Link>
          <Link href="/register" className="landing-primary-button">
            Commencer
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <ShieldCheck size={17} />
              Gestion nationale des examens
            </div>
            <h1>Une plateforme moderne pour organiser les examens nationaux.</h1>
            <p className="hero-lead">
              Centralisez les inscriptions, les affectations, les presences, les notes anonymisees et les resultats
              avec un parcours clair pour les candidats et les equipes administratives.
            </p>
            <div className="hero-buttons">
              <Link href="/register" className="hero-primary">
                Creer un compte
                <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="hero-secondary">Se connecter</Link>
            </div>
            <div className="hero-proof">
              <CheckCircle2 size={16} />
              Anonymat, controle des roles et notifications integrees
            </div>
          </div>

          <div className="hero-visual" aria-label="Apercu plateforme">
            <div className="visual-topbar">
              <span />
              <span />
              <span />
            </div>
            <div className="visual-header">
              <div>
                <p>Session nationale</p>
                <strong>Baccalaureat 2026</strong>
              </div>
              <span className="status-pill">Actif</span>
            </div>
            <div className="visual-map">
              <span className="orbit-dot" style={{ top: '26%', left: '32%' }} />
              <span className="orbit-dot" style={{ top: '58%', left: '58%' }} />
              <span className="orbit-dot" style={{ top: '42%', left: '72%' }} />
            </div>
            <div className="visual-grid">
              <div>
                <strong>1 284</strong>
                <span>Convocations</span>
              </div>
              <div>
                <strong>96%</strong>
                <span>Presences</span>
              </div>
              <div>
                <strong>72%</strong>
                <span>Corrections</span>
              </div>
              <div>
                <strong>5</strong>
                <span>Roles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plateforme" className="landing-section workflow-section">
        <div className="landing-container">
          <div className="section-heading">
            <span className="section-eyebrow">Plateforme</span>
            <h2>Les actions importantes sont au meme endroit.</h2>
            <p>Chaque role accede aux outils utiles sans melanger les responsabilites.</p>
          </div>
        </div>
        <div className="landing-container workflow-grid">
          {features.map((feature) => (
            <article className="workflow-card" key={feature.title}>
              <div className="workflow-icon">
                <feature.icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="securite" className="landing-section security-band">
        <div className="landing-container security-grid">
          <div className="security-card">
            <div className="hero-kicker">
              <LockKeyhole size={17} />
              Flux securise
            </div>
            <h2>Anonymat des copies et roles strictement separes.</h2>
          </div>
          <div className="security-points">
            <div>Numero anonymat pour les corrections</div>
            <div>Levee d'anonymat par administrateur</div>
            <div>2FA et controle JWT pour les espaces sensibles</div>
          </div>
        </div>
      </section>

      <section id="roles" className="landing-section">
        <div className="landing-container metric-strip">
          {stats.map((item) => (
            <div className="metric-item" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
