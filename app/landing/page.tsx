'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
// Importation de Framer Motion
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  GraduationCap, Users, FileText, Shield, ArrowRight, 
  CheckCircle, TrendingUp, Clock, Award, ChevronRight
} from 'lucide-react';
import Iridescence from '../../components/Iridescence';
import ImageSlider3D from "@/components/lightswind/3d-image-slider";
import { MagneticButton } from "@/components/lightswind/magnetic-button";
import { RadialGlowButton } from "@/components/ui/radial-glow-button"

gsap.registerPlugin(ScrollTrigger, SplitText);

// Machine à écrire : tape un mot, pause, l'efface, passe au mot suivant — en boucle infinie.
function TypewriterText({
  words,
  fontSize = 'clamp(2rem, 4vw, 4rem)',
  color = '#0C6478',
}: {
  words: string[];
  fontSize?: string;
  color?: string;
}) {
  const [text, setText] = useState('');
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const TYPING_SPEED = 90;
    const DELETING_SPEED = 45;
    const PAUSE_AFTER_WORD = 1400;
    const PAUSE_BEFORE_NEXT = 400;

    const tick = () => {
      const currentWord = words[wordIndex];

      if (!isDeleting) {
        charIndex += 1;
        setText(currentWord.slice(0, charIndex));
        if (charIndex === currentWord.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, PAUSE_AFTER_WORD);
          return;
        }
        timeoutId = setTimeout(tick, TYPING_SPEED);
      } else {
        charIndex -= 1;
        setText(currentWord.slice(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          timeoutId = setTimeout(tick, PAUSE_BEFORE_NEXT);
          return;
        }
        timeoutId = setTimeout(tick, DELETING_SPEED);
      }
    };

    timeoutId = setTimeout(tick, PAUSE_BEFORE_NEXT);
    return () => clearTimeout(timeoutId);
  }, [words]);

  // Curseur clignotant (GSAP)
  useEffect(() => {
    if (!cursorRef.current) return;
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <span className="hero-typewriter" style={{ display: 'inline-block', marginLeft: '0.35em', fontSize, fontWeight: 900, color, whiteSpace: 'nowrap' }}>
      {text}
      <span
        ref={cursorRef}
        style={{ display: 'inline-block', width: '3px', marginLeft: '3px', color, transform: 'translateY(2px)' }}
      >
        |
      </span>
    </span>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const heroTitleSplitRef = useRef<SplitText | null>(null);
  const heroSubtitleSplitRef = useRef<SplitText | null>(null);
  const cardCleanupsRef = useRef<Array<() => void>>([]);

  const [hoverLogin, setHoverLogin] = useState(false);

  // --- HOOKS FRAMER MOTION POUR LE PARALLAXE ---
  
  // Parallaxe Section Hero
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Mapping du défilement vers des valeurs Y (pixels)
  const heroGlowY = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroDashboardY = useTransform(heroScroll, [0, 1], [0, -70]);
  const heroTitleY = useTransform(heroScroll, [0, 1], [0, -70]);
  const heroSubtitleY = useTransform(heroScroll, [0, 1], [0, -30]);

  // Parallaxe Section Fonctionnalités
  const { scrollYProgress: featuresScroll } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });
  const featuresTextY = useTransform(featuresScroll, [0, 1], [100, -100]); 

  // Parallaxe Section Contact (CTA)
  const { scrollYProgress: ctaScroll } = useScroll({
    target: contactRef,
    offset: ["start end", "end start"]
  });
  const ctaTextY = useTransform(ctaScroll, [0, 1], [80, -80]);

  // --- EFFETS GSAP ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations (fondu global des colonnes du hero)
      gsap.from('.hero-col', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Reveal du titre lettre par lettre (SplitText)
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

      // TypewriterText apparaît
      gsap.from('.hero-typewriter', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'expo.out',
        delay: 0.2,
      });

      // Reveal du sous-titre
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

      // Entrée du widget "Tableau de bord"
      gsap.from('.hero-dashboard-wrapper', {
        x: 150,
        opacity: 0,
        duration: 1.3,
        ease: 'power3.out',
        delay: 0.4,
      });

      // Compteurs animés
      const counterEls = gsap.utils.toArray<HTMLElement>('.counter-number');
      counterEls.forEach((el) => {
        const target = parseFloat(el.dataset.target || '0');
        const suffix = el.dataset.suffix || '';
        const useComma = el.dataset.comma === 'true';
        const counterProxy = { val: 0 };

        gsap.to(counterProxy, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
          onUpdate: () => {
            const rounded = Math.round(counterProxy.val);
            el.textContent = (useComma ? rounded.toLocaleString('en-US') : String(rounded)) + suffix;
          },
        });
      });

      // Anneau de progression SVG
      const donutRing = document.querySelector<SVGCircleElement>('.donut-ring');
      if (donutRing) {
        const circumference = 2 * Math.PI * 50;
        const target = parseFloat(donutRing.dataset.target || '78');
        gsap.to(donutRing, {
          strokeDashoffset: circumference * (1 - target / 100),
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.hero-dashboard-wrapper',
            start: 'top 85%',
          },
        });
      }

      // Titre CTA : remplissage blanc
      gsap.to('.cta-title-fill', {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta-title-wrapper',
          start: 'top 85%',
          end: 'top 25%',
          scrub: true,
        },
      });

      // Parallax des images gauche/droite dans la section CTA (GSAP)
      const ctaParallaxTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 30%',
          end: 'bottom 80%',
          scrub: true,
        },
      });

      ctaParallaxTimeline
        .from('#cta-left-leaf', { x: -100, y: 100 })
        .from('#cta-right-leaf', { x: 100, y: 100 });

      // Stats
      gsap.from('.stat-card', {
        scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        opacity: 0, y: 40, scale: 0.9, stagger: 0.1, duration: 0.9, ease: 'power2.out',
      });

      // Header de la section Fonctionnalités
      gsap.from('.features-header-item', {
        scrollTrigger: { trigger: featuresRef.current, start: 'top bottom' },
        opacity: 0, y: 60, duration: 1, stagger: 0.15, ease: 'power3.out',
      });

      // Features animation
      gsap.from('.feature-item', {
        scrollTrigger: { trigger: featuresRef.current, start: 'top bottom' },
        opacity: 0, y: 50, scale: 0.92, stagger: 0.15, duration: 0.9, ease: 'power2.out',
      });

      // Hover
      const hoverCards = gsap.utils.toArray<HTMLElement>('.feature-item, .stat-card');
      hoverCards.forEach((card) => {
        const isFeature = card.classList.contains('feature-item');
        card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';

        const glow = card.querySelector<HTMLElement>('.feature-item-glow');
        const arrow = card.querySelector<HTMLElement>('.feature-item-arrow');

        const enter = () => {
          gsap.to(card, { y: isFeature ? -8 : -10, scale: isFeature ? 1.015 : 1.03, duration: 0.4, ease: 'power2.out' });
          if (isFeature) {
            card.style.boxShadow = '0 20px 40px -15px rgba(12, 100, 120, 0.18)';
            card.style.borderColor = 'rgba(12, 100, 120, 0.35)';
            if (glow) glow.style.opacity = '1';
            if (arrow) {
              arrow.style.opacity = '1';
              arrow.style.transform = 'translateX(0)';
            }
          } else {
            card.style.boxShadow = '0 25px 45px -12px rgba(12, 100, 120, 0.25)';
          }
        };
        const leave = () => {
          gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
          if (isFeature) {
            card.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.06)';
            card.style.borderColor = '#e2e8f0';
            if (glow) glow.style.opacity = '0';
            if (arrow) {
              arrow.style.opacity = '0';
              arrow.style.transform = 'translateX(-8px)';
            }
          } else {
            card.style.boxShadow = '0 10px 40px -10px rgba(0, 0, 0, 0.05)';
          }
        };
        card.addEventListener('mouseenter', enter);
        card.addEventListener('mouseleave', leave);
        cardCleanupsRef.current.push(() => {
          card.removeEventListener('mouseenter', enter);
          card.removeEventListener('mouseleave', leave);
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
      cardCleanupsRef.current.forEach((cleanup) => cleanup());
      cardCleanupsRef.current = [];
      heroTitleSplitRef.current?.revert();
      heroSubtitleSplitRef.current?.revert();
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      minHeight: '100vh',
      overflowX: 'hidden',
      color: '#0f172a',
      fontFamily: '"Roboto", sans-serif',
      position: 'relative',
      backgroundColor: 'transparent'
    }}>
      
      {/* Wrapper pour l'effet Iridescence en arrière-plan complet */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}>
        <Iridescence
          speed={1}
          amplitude={0.1}
          mouseReact
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.35)', 
        backdropFilter: 'blur(24px)', 
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 50,
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)', 
        boxShadow: '0 8px 32px 0 rgba(12, 100, 120, 0.12)' 
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0.01rem 0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <img 
              src="/logo/logo-app.png" 
              alt="Exam Mada Logo" 
              style={{ width: 90, height: 90, objectFit: 'contain' }}
            />
          </div>
          
          {/* Liens de Navigation */}
          <div style={{ display: 'none', alignItems: 'center', gap: '2.5rem' }}>
            <a href="#features" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Fonctionnalités</a>
            <a href="#stats" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Statistiques</a>
            <a href="#contact" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Contact</a>
          </div>
          
          {/* Boutons d'Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a 
              href="/login" 
              onMouseEnter={() => setHoverLogin(true)}
              onMouseLeave={() => setHoverLogin(false)}
              style={{
                color: hoverLogin ? '#8BCC62' : '#0C6478',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                transform: hoverLogin ? 'translateY(-2px)' : 'translateY(0)',
                opacity: hoverLogin ? 0.8 : 1
              }}
            >
              Connexion
            </a>
            <a href="/register" style={{ display: 'inline-block' }}>
              <MagneticButton 
                variant="dark" 
                className="!w-auto !px-8 !py-2.5 !rounded-full whitespace-nowrap cursor-pointer"
              >
                S&lsquo;inscrire
              </MagneticButton>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} style={{ paddingTop: '10rem', paddingBottom: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div className="hero-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <motion.h1 style={{
                y: heroTitleY, 
                fontSize: '3.5rem',
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#0f172a',
                letterSpacing: '-0.03em'
              }}>
                <span className="hero-title-line">Gérez vos</span>
                <TypewriterText
                    words={["EXAMEN", "RESULTAT", "DASH"]}
                    fontSize="clamp(2rem, 4vw, 4rem)"
                />
                <br />
                <span className="hero-title-line">Nationaux avec</span>
                <br />
                <span className="hero-title-line" style={{ color: '#0C6478' }}>Excellence</span>
              </motion.h1>
              
              <motion.p className="hero-subtitle" style={{
                y: heroSubtitleY,
                fontSize: '1.15rem',
                color: '#475569',
                lineHeight: 1.8,
                maxWidth: '32rem'
              }}>
                Plateforme complète pour la gestion des examens nationaux. 
                Simplifiez l&lsquo;organisation, le suivi et l&lsquo;évaluation des candidats.
              </motion.p>
              
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
            
            {/* Widget Tableau de bord (correction hero-col retiré ici) */}
            <div className="hero-dashboard-wrapper" style={{ position: 'relative' }}>
              <motion.div className="hero-glow" style={{
                y: heroGlowY, 
                position: 'absolute',
                inset: '-20px',
                background: 'linear-gradient(135deg, #0C6478, #BDEE98)',
                borderRadius: '2rem',
                filter: 'blur(40px)',
                opacity: 0.15,
                zIndex: 0
              }}></motion.div>
              
              <motion.div className="hero-dashboard-card" style={{
                y: heroDashboardY, 
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Tableau de bord</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                    <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.15rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <Users style={{ width: 26, height: 26, color: '#0C6478' }} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', backgroundColor: 'rgba(34, 197, 94, 0.12)', padding: '0.15rem 0.45rem', borderRadius: '999px' }}>
                          <TrendingUp style={{ width: 12, height: 12 }} /> +12%
                        </span>
                      </div>
                      <p
                        className="counter-number"
                        data-target="1234"
                        data-comma="true"
                        style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}
                      >0</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>Candidats</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.15rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <FileText style={{ width: 26, height: 26, color: '#0C6478' }} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', backgroundColor: 'rgba(34, 197, 94, 0.12)', padding: '0.15rem 0.45rem', borderRadius: '999px' }}>
                          <TrendingUp style={{ width: 12, height: 12 }} /> +5%
                        </span>
                      </div>
                      <p
                        className="counter-number"
                        data-target="89"
                        style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}
                      >0</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>Examens</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: 'rgba(248, 250, 252, 0.7)', padding: '1.15rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                    <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
                      <svg viewBox="0 0 120 120" style={{ width: 84, height: 84, transform: 'rotate(-90deg)' }}>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle
                          className="donut-ring"
                          cx="60" cy="60" r="50" fill="none"
                          stroke="#0C6478" strokeWidth="10" strokeLinecap="round"
                          strokeDasharray="314.159"
                          strokeDashoffset="314.159"
                          data-target="78"
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span
                          className="counter-number"
                          data-target="78"
                          data-suffix="%"
                          style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}
                        >0%</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Taux de Réussite</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>+4% par rapport au trimestre dernier</p>
                    </div>
                  </div>

                </div>
              </motion.div>
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
            {[{ icon: Users, target: 50, suffix: 'K+', label: 'Candidats Inscrits' },
              { icon: FileText, target: 500, suffix: '+', label: 'Examens Organisés' },
              { icon: Award, target: 98, suffix: '%', label: 'Taux de Réussite' },
              { icon: TrendingUp, target: 24, suffix: '/7', label: 'Support Disponible' }
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
                <p
                  className="counter-number"
                  data-target={stat.target}
                  data-suffix={stat.suffix}
                  style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}
                >0{stat.suffix}</p>
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
          
          <motion.div style={{ y: featuresTextY, textAlign: 'center', marginBottom: '5rem' }}>
            <div className="features-header-item" style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(12, 100, 120, 0.08)',
              color: '#0C6478',
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem'
            }}>
              Fonctionnalités Clés
            </div>
            <h2 className="features-header-item" style={{
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
            <p className="features-header-item" style={{
              fontSize: '1.15rem',
              color: '#475569',
              maxWidth: '36rem',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Tout ce dont vous avez besoin pour gérer efficacement vos examens nationaux
            </p>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
            {[
              { icon: Users, title: 'Gestion des Candidats', desc: 'Inscription, suivi et gestion complète des candidats avec un système de profil détaillé.' },
              { icon: FileText, title: 'Organisation d\'Examens', desc: 'Créez et gérez facilement vos examens avec planning automatique et allocation des salles.' },
              { icon: Shield, title: 'Sécurité Avancée', desc: 'Protection des données et authentification sécurisée pour tous les utilisateurs.' },
              { icon: Clock, title: 'Suivi en Temps Réel', desc: 'Tableau de bord interactif avec statistiques et mises à jour en temps réel.' },
              { icon: Award, title: 'Rapports Détaillés', desc: 'Génération automatique de rapports et analyses pour une meilleure prise de décision.' },
              { icon: TrendingUp, title: 'Analytics Avancés', desc: 'Outils d\'analyse et de visualisation pour suivre les performances et tendances.' }
            ].map((feat, i) => (
              <div key={i} className="feature-item" style={{
                position: 'relative',
                backgroundColor: '#ffffff',
                padding: '2.25rem',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden'
              }}>
                <div className="feature-item-glow" style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 20% 0%, rgba(12, 100, 120, 0.10), transparent 60%)',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none'
                }}></div>

                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    backgroundColor: 'rgba(12, 100, 120, 0.08)',
                    borderRadius: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <feat.icon style={{ width: 24, height: 24, color: '#0C6478' }} />
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    letterSpacing: '0.05em'
                  }}>
                    0{i + 1}
                  </span>
                </div>

                <h3 style={{ position: 'relative', zIndex: 1, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  {feat.title}
                </h3>
                <p style={{ position: 'relative', zIndex: 1, color: '#64748b', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  {feat.desc}
                </p>

                <div className="feature-item-arrow" style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#0C6478',
                  opacity: 0,
                  transform: 'translateX(-8px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}>
                  En savoir plus
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={contactRef} id="contact" style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(135deg, #0C6478 0%, #1087a3 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Images décoratives gauche/droite */}
        <img
          src="/images/cta-left-pencil.png"
          alt="crayon"
          id="cta-left-leaf"
          style={{
            position: 'absolute',
            left: 'clamp(-3rem, -2vw, -1rem)',
            bottom: 'clamp(-2rem, -1vw, 0px)',
            width: 'clamp(110px, 14vw, 220px)',
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
        <img
          src="/images/cta-right-notebook.png"
          alt="cahier"
          id="cta-right-leaf"
          style={{
            position: 'absolute',
            right: 'clamp(-2rem, -1.5vw, -0.5rem)',
            bottom: 'clamp(-1rem, -0.5vw, 0px)',
            width: 'clamp(120px, 15vw, 240px)',
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            transform: 'rotate(-18deg)',
            transformOrigin: 'bottom right'
          }}
        />
        
        {/* Texte du CTA avec parallaxe Framer Motion */}
        <motion.div style={{ 
          y: ctaTextY, 
          maxWidth: '56rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 
        }}>
          <div className="cta-title-wrapper" style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <h2 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              lineHeight: 1.15,
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
              margin: 0
            }}>
              Prêt à Transformer
              <br />
              la Gestion de vos Examens?
            </h2>
            <h2 className="cta-title-fill" style={{
              position: 'absolute',
              inset: 0,
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              lineHeight: 1.15,
              color: '#ffffff',
              margin: 0,
              clipPath: 'inset(100% 0 0 0)'
            }}>
              Prêt à Transformer
              <br />
              la Gestion de vos Examens?
            </h2>
          </div>
          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '2.5rem',
            maxWidth: '36rem',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Rejoignez des centaines d&lsquo;établissements qui font confiance à ExamGest pour leurs examens nationaux.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            <a href="/login" style={{
              padding: '1.1rem 2.5rem',
              backgroundColor: '#ffffff',
              color: '#0C6478',
              textDecoration: 'none',
              fontWeight: 700,
              borderRadius: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>Commencer Gratuitement</span>
              <ChevronRight style={{ width: 20, height: 20 }} />
            </a>
            <a href="#" style={{
              padding: '1.1rem 2.5rem',
              backgroundColor: 'transparent',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: '1rem',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              Contacter l&lsquo;Équipe
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        padding: '5rem 1.5rem 3rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <img 
                  src="/logo/logo-app.png" 
                  alt="Exam Mada Logo" 
                  style={{ width: 110, height: 110, objectFit: 'contain' }}
                />
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Plateforme de gestion des examens nationaux de Madagascar
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Produit</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Fonctionnalités</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Tarifs</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Documentation</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Centre d&lsquo;aide</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>FAQ</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Légal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Confidentialité</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Conditions</a>
              </div>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            paddingTop: '2rem', 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontSize: '0.85rem' 
          }}>
            <p>© 2026 Exam Mada. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}