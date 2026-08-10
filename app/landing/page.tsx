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
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { 
  GraduationCap, Users, FileText, Shield, ArrowRight, 
  CheckCircle, TrendingUp, Clock, Award, ChevronRight
} from 'lucide-react';
import Iridescence from '../../components/Iridescence';
import { MorphText } from "@/components/ui/morph-text";
import ImageSlider3D from "@/components/lightswind/3d-image-slider";
import { MagneticButton } from "@/components/lightswind/magnetic-button";
import { RadialGlowButton } from "@/components/ui/radial-glow-button"

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroTitleSplitRef = useRef<SplitText | null>(null);
  const heroSubtitleSplitRef = useRef<SplitText | null>(null);

  const [hoverLogin, setHoverLogin] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations (fondu global des colonnes du hero)
      gsap.from(heroRef.current?.children || [], {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // --- Animation GSAP inspirée du projet "gsap_cocktails" ---

      // 1) Reveal du titre lettre par lettre (SplitText), comme le <h1 className="title">
      //    du Hero du projet cocktails.
      const heroTitleSplit = new SplitText('.hero-title-line', {
        type: 'chars, words',
      });
      heroTitleSplitRef.current = heroTitleSplit;

      gsap.from(heroTitleSplit.chars, {
        yPercent: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.03,
        delay: 0.2,
      });

      // Reveal du sous-titre ligne par ligne (SplitText "lines"), comme .subtitle
      const heroSubtitleSplit = new SplitText('.hero-subtitle', {
        type: 'lines',
      });
      heroSubtitleSplitRef.current = heroSubtitleSplit;

      gsap.from(heroSubtitleSplit.lines, {
        yPercent: 100,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        delay: 0.6,
      });

      // 2) Parallax au scroll dans le hero, comme .left-leaf / .right-leaf
      //    qui bougent à des vitesses différentes pendant le scroll.
      gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
        .to('.hero-glow', { y: 180, ease: 'none' }, 0)
        .to('.hero-dashboard-card', { y: -70, ease: 'none' }, 0)
        .to('.hero-title-line', { y: -50, ease: 'none' }, 0)
        .to('.hero-subtitle', { y: -20, ease: 'none' }, 0);

      // Stats counter animation
      gsap.from('.stat-card', {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
      });

      // Features animation
      gsap.from('.feature-item', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
      });

    }, containerRef);

    return () => {
      ctx.revert();
      heroTitleSplitRef.current?.revert();
      heroSubtitleSplitRef.current?.revert();
    };
  }, []);

>>>>>>> 9185738ff998183c2b63858404407b0d2bdef89a
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

<<<<<<< HEAD
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
=======
      {/* Hero Section */}
      <section ref={heroRef} style={{ paddingTop: '10rem', paddingBottom: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#0f172a',
                letterSpacing: '-0.03em'
              }}>
                <span className="hero-title-line">Gérez vos</span>
                <MorphText
                    words={["EXAMEN", "RESULTAT", "DASH"]}
                    interval={2500}
                    subtext="Move fast. Break things."
                    fontSize="clamp(2rem, 4vw, 4rem)"
                />
                <br />
                <span className="hero-title-line">Nationaux avec</span>
                <br />
                <span className="hero-title-line" style={{ color: '#0C6478' }}>Excellence</span>
              </h1>
              
    
              <p className="hero-subtitle" style={{
                fontSize: '1.15rem',
                color: '#475569',
                lineHeight: 1.8,
                maxWidth: '32rem'
              }}>
                Plateforme complète pour la gestion des examens nationaux. 
                Simplifiez l&lsquo;organisation, le suivi et l&lsquo;évaluation des candidats.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                <RadialGlowButton className="rounded-full" onClick={() => window.location.href = '/register'}>
      Commencer <ArrowRight style={{ width: 20, height: 20 }} />
    </RadialGlowButton>
                  
                  
                
                <a href="#features" style={{
                  padding: '1rem 2.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  color: '#334155',
                  textDecoration: 'none',
                  fontWeight: 600,
                  borderRadius: '33px',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  En savoir plus
                </a>
              </div>
            </div>
            

            
            {/* Widget Tableau de bord avec styles ajustés */}
            <div style={{ position: 'relative' }}>
              <div className="hero-glow" style={{
                position: 'absolute',
                inset: '-20px',
                background: 'linear-gradient(135deg, #0C6478, #BDEE98)',
                borderRadius: '2rem',
                filter: 'blur(40px)',
                opacity: 0.15,
                zIndex: 0
              }}></div>
              <div className="hero-dashboard-card" style={{
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                padding: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                zIndex: 1
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Tableau de bord</h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>Aujourd&lsquo;hui</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                    <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <Users style={{ width: 28, height: 28, color: '#0C6478', marginBottom: '0.75rem' }} />
                      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>1,234</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Candidats</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <FileText style={{ width: 28, height: 28, color: '#0C6478', marginBottom: '0.75rem' }} />
                      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>89</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Examens</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Progression</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0C6478' }}>78%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: 'rgba(226, 232, 240, 0.5)', borderRadius: '9999px', height: '0.5rem' }}>
                      <div style={{
                        background: 'linear-gradient(90deg, #0C6478, #BDEE98)',
                        height: '100%',
                        borderRadius: '9999px',
                        width: '78%'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} id="stats" style={{ 
        padding: '6rem 1.5rem', 
        backgroundColor: 'rgba(255, 255, 255, 0.6)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[{ icon: Users, val: '50K+', label: 'Candidats Inscrits' },
              { icon: FileText, val: '500+', label: 'Examens Organisés' },
              { icon: Award, val: '98%', label: 'Taux de Réussite' },
              { icon: TrendingUp, val: '24/7', label: 'Support Disponible' }
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{ 
                textAlign: 'center', 
                padding: '2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  backgroundColor: 'rgba(189, 238, 152, 0.2)',
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <stat.icon style={{ width: 32, height: 32, color: '#0C6478' }} />
                </div>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>{stat.val}</p>
                <p style={{ color: '#475569', fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      

    <div className="w-full h-[600px] flex items-center justify-center bg-[#fff3ed] dark:bg-black rounded-xl overflow-hidden relative">
      <ImageSlider3D duration={32} cardWidth="15em" />
    </div>

      {/* Features Section */}
      <section ref={featuresRef} id="features" style={{ padding: '8rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{
              fontSize: '2.75rem',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>
              Fonctionnalités
              <span style={{
                background: 'linear-gradient(135deg, #0C6478, #BDEE98)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {' '}Puissantes
              </span>
            </h2>
            <p style={{
              fontSize: '1.15rem',
              color: '#475569',
              maxWidth: '36rem',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Tout ce dont vous avez besoin pour gérer efficacement vos examens nationaux
>>>>>>> 9185738ff998183c2b63858404407b0d2bdef89a
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
