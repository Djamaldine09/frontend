'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  GraduationCap, Users, FileText, Shield, ArrowRight, 
  CheckCircle, TrendingUp, Clock, Award, ChevronRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

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
      background: 'linear-gradient(to bottom right, #f8fafc, #dbeafe)',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap style={{ width: 32, height: 32, color: '#2563eb' }} />
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ExamGest
            </span>
          </div>
          <div style={{ display: 'none', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500 }}>Fonctionnalités</a>
            <a href="#stats" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500 }}>Statistiques</a>
            <a href="#contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500 }}>Contact</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/login" style={{
              padding: '0.625rem 1.25rem',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Connexion
            </a>
            <a href="/login" style={{
              padding: '0.625rem 1.25rem',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 500,
              borderRadius: '9999px',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
            }}>
              S'inscrire
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} style={{ paddingTop: '8rem', paddingBottom: '5rem', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <span style={{ width: 8, height: 8, backgroundColor: '#2563eb', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                <span>Nouvelle Version 2024</span>
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#0f172a'
              }}>
                Gérez vos
                <span style={{
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {' '}Examens
                </span>
                <br />
                Nationaux avec
                <br />
                <span style={{ color: '#2563eb' }}>Excellence</span>
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: '#475569',
                lineHeight: 1.75,
                maxWidth: '32rem'
              }}>
                Plateforme complète pour la gestion des examens nationaux de Madagascar. 
                Simplifiez l'organisation, le suivi et l'évaluation des candidats.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="/login" style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 600,
                  borderRadius: '0.75rem',
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span>Commencer</span>
                  <ArrowRight style={{ width: 20, height: 20 }} />
                </a>
                <a href="#features" style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  textDecoration: 'none',
                  fontWeight: 600,
                  borderRadius: '0.75rem',
                  border: '2px solid #e2e8f0'
                }}>
                  En savoir plus
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle style={{ width: 20, height: 20, color: '#16a34a' }} />
                  <span style={{ fontSize: '0.875rem', color: '#475569' }}>100% Sécurisé</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle style={{ width: 20, height: 20, color: '#16a34a' }} />
                  <span style={{ fontSize: '0.875rem', color: '#475569' }}>Support 24/7</span>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                borderRadius: '1.5rem',
                filter: 'blur(3rem)',
                opacity: 0.2,
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{
                position: 'relative',
                backgroundColor: '#ffffff',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '2rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Tableau de bord</h3>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Aujourd'hui</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.75rem' }}>
                      <Users style={{ width: 32, height: 32, color: '#2563eb', marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>1,234</p>
                      <p style={{ fontSize: '0.875rem', color: '#475569' }}>Candidats</p>
                    </div>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.75rem' }}>
                      <FileText style={{ width: 32, height: 32, color: '#16a34a', marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>89</p>
                      <p style={{ fontSize: '0.875rem', color: '#475569' }}>Examens</p>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Progression</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb' }}>78%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '9999px', height: '0.5rem' }}>
                      <div style={{
                        background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                        height: '0.5rem',
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
      <section ref={statsRef} id="stats" style={{ padding: '5rem 1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: 64,
                height: 64,
                backgroundColor: '#dbeafe',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Users style={{ width: 32, height: 32, color: '#2563eb' }} />
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>50K+</p>
              <p style={{ color: '#475569' }}>Candidats Inscrits</p>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: 64,
                height: 64,
                backgroundColor: '#dcfce7',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <FileText style={{ width: 32, height: 32, color: '#16a34a' }} />
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>500+</p>
              <p style={{ color: '#475569' }}>Examens Organisés</p>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: 64,
                height: 64,
                backgroundColor: '#f3e8ff',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Award style={{ width: 32, height: 32, color: '#9333ea' }} />
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>98%</p>
              <p style={{ color: '#475569' }}>Taux de Réussite</p>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                width: 64,
                height: 64,
                backgroundColor: '#ffedd5',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <TrendingUp style={{ width: 32, height: 32, color: '#ea580c' }} />
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>24/7</p>
              <p style={{ color: '#475569' }}>Support Disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              Fonctionnalités
              <span style={{
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {' '}Puissantes
              </span>
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#475569',
              maxWidth: '32rem',
              margin: '0 auto'
            }}>
              Tout ce dont vous avez besoin pour gérer efficacement vos examens nationaux
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="feature-item" style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Users style={{ width: 28, height: 28, color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Gestion des Candidats</h3>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Inscription, suivi et gestion complète des candidats avec un système de profil détaillé.
              </p>
            </div>
            <div className="feature-item" style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(to bottom right, #22c55e, #16a34a)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <FileText style={{ width: 28, height: 28, color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Organisation d'Examens</h3>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Créez et gérez facilement vos examens avec planning automatique et allocation des salles.
              </p>
            </div>
            <div className="feature-item" style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(to bottom right, #a855f7, #9333ea)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Shield style={{ width: 28, height: 28, color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Sécurité Avancée</h3>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Protection des données et authentification sécurisée pour tous les utilisateurs.
              </p>
            </div>
            <div className="feature-item" style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Clock style={{ width: 28, height: 28, color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Suivi en Temps Réel</h3>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Tableau de bord interactif avec statistiques et mises à jour en temps réel.
              </p>
            </div>
            <div className="feature-item" style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(to bottom right, #ec4899, #db2777)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Award style={{ width: 28, height: 28, color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Rapports Détaillés</h3>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Génération automatique de rapports et analyses pour une meilleure prise de décision.
              </p>
            </div>
            <div className="feature-item" style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(to bottom right, #6366f1, #4f46e5)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <TrendingUp style={{ width: 28, height: 28, color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Analytics Avancés</h3>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Outils d'analyse et de visualisation pour suivre les performances et tendances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(to right, #2563eb, #4f46e5)'
      }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 900,
            color: '#ffffff',
            marginBottom: '1.5rem'
          }}>
            Prêt à Transformer
            <br />
            la Gestion de vos Examens?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#dbeafe',
            marginBottom: '2rem',
            maxWidth: '32rem',
            margin: '0 auto 2rem'
          }}>
            Rejoignez des centaines d'établissements qui font confiance à ExamGest pour leurs examens nationaux.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            <a href="/login" style={{
              padding: '1rem 2rem',
              backgroundColor: '#ffffff',
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: '0.75rem',
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
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: '0.75rem',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              Contacter l'Équipe
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '3rem 1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <GraduationCap style={{ width: 32, height: 32, color: '#60a5fa' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>ExamGest</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Plateforme de gestion des examens nationaux de Madagascar
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Produit</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Fonctionnalités</a>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tarifs</a>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Documentation</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Centre d'aide</a>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>FAQ</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Légal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Confidentialité</a>
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Conditions</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            <p>© 2024 ExamGest. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
