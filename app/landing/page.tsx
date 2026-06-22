'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  GraduationCap, Users, FileText, Shield, ArrowRight, 
  CheckCircle, TrendingUp, Clock, Award, ChevronRight
} from 'lucide-react';
import Iridescence from '../../components/Iridescence';
import ImageSlider3D from "@/components/lightswind/3d-image-slider";
import { AuroraTextEffect } from "@/components/lightswind/aurora-text-effect";
import { MagneticButton } from "@/components/lightswind/magnetic-button";
import { HangingIdCard } from "@/components/lightswind/HangingIdCard"


gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(heroRef.current?.children || [], {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      });

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

    return () => ctx.revert();
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
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.35)', /* Plus transparent (35%) pour laisser passer l'animation */
        backdropFilter: 'blur(24px)', /* Flou beaucoup plus fort pour adoucir les mouvements de l'arrière-plan */
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 50,
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)', /* Bordure blanche un peu plus nette */
        boxShadow: '0 8px 32px 0 rgba(12, 100, 120, 0.12)' /* Ombre délicate teintée avec ton bleu #0C6478 */
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
              alt="ExamGest Logo" 
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
          {/* Boutons d'Action Animés */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a 
              href="/login" 
              onMouseEnter={() => setHoverLogin(true)}
              onMouseLeave={() => setHoverLogin(false)}
              style={{
                color: hoverLogin ? '#8BCC62' : '#0C6478', /* Devient un vert un peu plus lisible au survol */
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                transform: hoverLogin ? 'translateY(-2px)' : 'translateY(0)', /* Se soulève légèrement */
                opacity: hoverLogin ? 0.8 : 1
              }}
            >
              Connexion
            </a>
            <a href="/register" style={{ display: 'inline-block' }}>
              <MagneticButton 
                variant="dark" 
                /* On enlève size="md" au cas où il imposerait une largeur fixe */
                className="!w-auto !px-8 !py-2.5 !rounded-full whitespace-nowrap"
              >
                S'inscrire
              </MagneticButton>
            </a>
          </div>
        </div>
      </nav>

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
                Gérez vos
                <AuroraTextEffect 
  text="Examen" 
  fontSize="clamp(3rem, 8vw, 7rem)"
  colors={{
    first: "bg-cyan-400",
    second: "bg-yellow-400",
    third: "bg-green-400",
    fourth: "bg-primarylw"
  }}
  blurAmount="blur-lg"
/>
                <br />
                Nationaux avec
                <br />
                <span style={{ color: '#0C6478' }}>Excellence</span>
              </h1>
              <p style={{
                fontSize: '1.15rem',
                color: '#475569',
                lineHeight: 1.8,
                maxWidth: '32rem'
              }}>
                Plateforme complète pour la gestion des examens nationaux. 
                Simplifiez l'organisation, le suivi et l'évaluation des candidats.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                <a href="/login" style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #0C6478, #BDEE98)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 600,
                  borderRadius: '1rem',
                  boxShadow: '0 20px 40px -10px rgba(12, 100, 120, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span>Commencer</span>
                  <ArrowRight style={{ width: 20, height: 20 }} />
                </a>
                <a href="#features" style={{
                  padding: '1rem 2.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  color: '#334155',
                  textDecoration: 'none',
                  fontWeight: 600,
                  borderRadius: '1rem',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  En savoir plus
                </a>
              </div>
            </div>
            

            
            {/* Widget Tableau de bord avec styles ajustés */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: '-20px',
                background: 'linear-gradient(135deg, #0C6478, #BDEE98)',
                borderRadius: '2rem',
                filter: 'blur(40px)',
                opacity: 0.15,
                zIndex: 0
              }}></div>
              <div style={{
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
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>Aujourd'hui</span>
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
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {[
              { icon: Users, title: 'Gestion des Candidats', desc: 'Inscription, suivi et gestion complète des candidats avec un système de profil détaillé.' },
              { icon: FileText, title: 'Organisation d\'Examens', desc: 'Créez et gérez facilement vos examens avec planning automatique et allocation des salles.' },
              { icon: Shield, title: 'Sécurité Avancée', desc: 'Protection des données et authentification sécurisée pour tous les utilisateurs.' },
              { icon: Clock, title: 'Suivi en Temps Réel', desc: 'Tableau de bord interactif avec statistiques et mises à jour en temps réel.' },
              { icon: Award, title: 'Rapports Détaillés', desc: 'Génération automatique de rapports et analyses pour une meilleure prise de décision.' },
              { icon: TrendingUp, title: 'Analytics Avancés', desc: 'Outils d\'analyse et de visualisation pour suivre les performances et tendances.' }
            ].map((feat, i) => (
              <div key={i} className="feature-item" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #0C6478, #BDEE98)',
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: '0 8px 16px -4px rgba(12, 100, 120, 0.3)'
                }}>
                  <feat.icon style={{ width: 28, height: 28, color: '#ffffff' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>{feat.title}</h3>
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center p-20">
      <HangingIdCard
        name="Djamaldine"
        role="Developer Full Stack"
        badgeId="2026"
        accentColor="#ff17ec"
        ropeLength={90}
      />
    </div>

      {/* CTA Section */}
      <section id="contact" style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(135deg, #0C6478 0%, #1087a3 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '2.75rem',
            fontWeight: 900,
            color: '#ffffff',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            Prêt à Transformer
            <br />
            la Gestion de vos Examens?
          </h2>
          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '2.5rem',
            maxWidth: '36rem',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Rejoignez des centaines d'établissements qui font confiance à ExamGest pour leurs examens nationaux.
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
              Contacter l'Équipe
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)', /* Couleur sombre avec 65% d'opacité */
        backdropFilter: 'blur(16px)', /* Effet de flou sur l'animation en arrière-plan */
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)', /* Ligne subtile pour séparer le contenu */
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
                  alt="ExamGest Logo" 
                  style={{ width: 110, height: 110, objectFit: 'contain' }}
                />
                {/* <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Exam Mada</span> */}
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
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Centre d'aide</a>
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