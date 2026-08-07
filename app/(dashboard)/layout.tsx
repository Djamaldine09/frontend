// app/(dashboard)/layout.tsx
'use client';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { resolveFileUrl } from '@/lib/api';
import { Role } from '@/types';
import Image from 'next/image';
import NotificationBell from '@/components/NotificationBell';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  LayoutGrid, FileText, BookOpen, ScrollText, CreditCard, Building2,
  Bell, Settings, LogOut, Search, Download, ArrowUpRight, Calendar,
  Users, Activity, ShieldCheck, BarChart3, Wrench, Menu, X, Moon, Sun, CheckCircle
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',  labelKey: 'nav.dashboard', icon: LayoutGrid,  roles: ['ADMIN','RESPONSABLE','SURVEILLANT','CORRECTEUR','CANDIDAT'] },
  { href: '/dashboard/admin/utilisateurs', labelKey: 'nav.utilisateurs',    icon: Users,       roles: ['ADMIN'] },
  { href: '/supervision',  labelKey: 'nav.supervision',     icon: Activity,    roles: ['ADMIN'] },
  { href: '/mon-dossier',  labelKey: 'nav.monDossier',     icon: FileText,    roles: ['CANDIDAT'] },
  { href: '/convocation',  labelKey: 'nav.convocation',     icon: ScrollText,    roles: ['CANDIDAT'] },
  { href: '/dashboard/admin/candidat',  labelKey: 'nav.candidats',       icon: FileText,    roles: ['ADMIN'] },
  { href: '/matieres', labelKey: 'nav.matieres',        icon: BookOpen,    roles: ['ADMIN'] },
  { href: '/examens',    labelKey: 'nav.examens',         icon: BookOpen,    roles: ['ADMIN','RESPONSABLE','SURVEILLANT','CORRECTEUR','CANDIDAT'] },
  { href: '/resultats',  labelKey: 'nav.resultats',       icon: ScrollText,  roles: ['ADMIN','RESPONSABLE','CORRECTEUR','CANDIDAT'] },
  { href: '/affectation-automatique',  labelKey: 'nav.affectations',     icon: ScrollText,    roles: ['RESPONSABLE'] },
  { href: '/presence',      labelKey: 'nav.presences',       icon: Activity,      roles: ['SURVEILLANT'] },
  { href: '/notation',      labelKey: 'nav.saisirNotes', icon: FileText,      roles: ['CORRECTEUR'] },
  { href: '/validation',    labelKey: 'nav.validerResultats',icon: CheckCircle,   roles: ['CORRECTEUR'] },
  { href: '/rapports',   labelKey: 'nav.rapports', icon: BarChart3,   roles: ['ADMIN'] },
  { href: '/paiements',  labelKey: 'nav.paiements',       icon: CreditCard,  roles: ['ADMIN','RESPONSABLE','CANDIDAT'] },
  { href: '/centres',    labelKey: 'nav.centres',         icon: Building2,   roles: ['ADMIN','RESPONSABLE'] },
  { href: '/securite',   labelKey: 'nav.securite',        icon: ShieldCheck, roles: ['ADMIN'] },
  { href: '/systeme',    labelKey: 'nav.systeme',      icon: Wrench,      roles: ['ADMIN'] },
];

const bottomNav = [
  { href: '#notifications', labelKey: 'nav.notifications', icon: Bell, badge: 2 },
  { href: '/dashboard/parametres',      labelKey: 'nav.parametres',    icon: Settings },
];

const roleColors: Record<Role, string> = {
  ADMIN: 'badge-red',
  RESPONSABLE: 'badge-violet',
  SURVEILLANT: 'badge-amber',
  CORRECTEUR: 'badge-blue',
  CANDIDAT: 'badge-lime',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode');
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const applyTheme = (isDark: boolean) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
      localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    }
  };

  useLayoutEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    applyTheme(newMode);
  };

  if (isLoading || !user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--ink-line)', borderTopColor: 'var(--ink)', borderRadius: '50%' }} />
    </div>
  );

  const allowed = navItems.filter(n => n.roles.includes(user.role));

  return (
    <div
      data-testid="dashboard-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        padding: 18,
        background: 'var(--bg-canvas)',
        fontFamily: 'var(--font-display)',
        gap: 18,
        position: 'relative',
      }}
    >
      {/* ============================ STYLES DYNAMIQUES ============================ */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />

      {/* ============================ MOBILE HAMBURGER ============================ */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        data-testid="mobile-menu-toggle"
        style={{
          display: 'none',
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 100,
          background: 'var(--bg-sidebar)',
          border: 'none',
          borderRadius: 12,
          padding: 10,
          cursor: 'pointer',
          color: 'var(--ink)',
        }}
        className="mobile-menu-toggle"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ============================ MOBILE OVERLAY ============================ */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          data-testid="mobile-overlay"
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 98,
          }}
          className="mobile-overlay"
        />
      )}

      {/* ============================ SIDEBAR ============================ */}
      <aside
        data-testid="sidebar"
        className={`sidebar ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
        style={{
          width: sidebarCollapsed ? 80 : 248,
          background: 'var(--bg-sidebar)',
          color: 'var(--ink-dark)',
          // Ici on augmente considérablement le border-radius (40px par défaut, et 48px si réduit pour un effet pilule parfait)
          borderRadius: sidebarCollapsed ? '48px' : '36px',
          padding: sidebarCollapsed ? '18px 12px' : '22px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 18,
          height: 'calc(100vh - 36px)',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Brand & Toggle Croix sur la même ligne */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', marginBottom: 6 }}>
          <Link 
            href="/dashboard" 
            onClick={(e) => {
              if (sidebarCollapsed) {
                e.preventDefault();
                setSidebarCollapsed(false);
              }
            }}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minWidth: 0, cursor: 'pointer', width: sidebarCollapsed ? '100%' : 'auto' }} 
            data-testid="brand-link"
            title={sidebarCollapsed ? "Agrandir le menu" : "Aller au tableau de bord"}
          >
            <div style={{ width: sidebarCollapsed ? 44 : 48, height: sidebarCollapsed ? 44 : 48, flexShrink: 0, position: 'relative' }}>
              <Image
                src="/logo/logo-app1.png"
                alt="Logo ExamenMG"
                fill
                style={{ 
                  objectFit: 'contain',
                  borderRadius: 35
                }}
                sizes="36px"
              />
            </div>

            {!sidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4, whiteSpace: 'nowrap' }}>Exam Mada</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-dark-soft)', fontFamily: 'var(--font-mono)', marginTop: -1, whiteSpace: 'nowrap' }}>
                  national.exam
                </div>
              </div>
            )}
          </Link>

          {/* Bouton Croix sur la même ligne pour basculer le collapse */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-dark-soft)',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              title="Réduire"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Main nav */}
        <nav 
          style={{ 
            flex: 1, 
            marginTop: 22, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 4, 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            paddingRight: sidebarCollapsed ? 0 : 4 
          }} 
          className={sidebarCollapsed ? "hide-scrollbar" : "dark-scroll"}
        >
          {allowed.map((item, idx) => {
            const Icon = item.icon;
            const active = pathname === item.href || (idx === 0 && pathname === '/dashboard');
            const isFirstActive = active && allowed.findIndex(i => i.href === item.href) === idx;
            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-${item.labelKey.replace(/\./g, '-')}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 12,
                  padding: sidebarCollapsed ? '12px' : '11px 14px', borderRadius: 999,
                  textDecoration: 'none',
                  color: isFirstActive ? 'var(--ink)' : 'var(--ink-dark-soft)',
                  background: isFirstActive ? 'var(--lime)' : 'transparent',
                  fontWeight: isFirstActive ? 700 : 500,
                  fontSize: 14,
                  transition: 'all 0.18s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isFirstActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isFirstActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                title={sidebarCollapsed ? t(item.labelKey) : undefined}
              >
                <Icon size={18} strokeWidth={isFirstActive ? 2.4 : 1.9} />
                {!sidebarCollapsed && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}

          <div className="divider-dark" style={{ margin: '14px 6px' }} />

          {bottomNav.map((b) => {
            const Icon = b.icon;
            const itemContent = (
              <>
                <Icon size={18} strokeWidth={1.9} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{t(b.labelKey)}</span>}
                {!sidebarCollapsed && b.badge && (
                  <span style={{
                    background: '#FF6B5B', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 999,
                    minWidth: 20, textAlign: 'center',
                  }}>{b.badge}</span>
                )}
              </>
            );

            if (b.href.startsWith('/')) {
              return (
                <Link
                  key={b.labelKey}
                  href={b.href}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-${b.labelKey.replace(/\./g, '-')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 12,
                    padding: sidebarCollapsed ? '12px' : '11px 14px', borderRadius: 999,
                    textDecoration: 'none',
                    color: 'var(--ink-dark-soft)', background: 'transparent',
                    fontWeight: 500, fontSize: 14, fontFamily: 'inherit',
                    width: '100%', textAlign: 'left',
                    transition: 'all 0.18s ease',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    if (!(e.currentTarget as HTMLElement).classList.contains('active')) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                  title={sidebarCollapsed ? t(b.labelKey) : undefined}
                >
                  {itemContent}
                </Link>
              );
            }

            return (
              <button
                key={b.labelKey}
                data-testid={`nav-${b.labelKey.replace(/\./g, '-')}`}
                onClick={() => {
                  if (b.href.startsWith('#')) {
                    window.location.hash = b.href;
                  }
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 12,
                  padding: sidebarCollapsed ? '12px' : '11px 14px', borderRadius: 999,
                  color: 'var(--ink-dark-soft)', background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 500, fontSize: 14, fontFamily: 'inherit',
                  width: '100%', textAlign: 'left',
                  transition: 'all 0.18s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                title={sidebarCollapsed ? t(b.labelKey) : undefined}
              >
                {itemContent}
              </button>
            );
          })}
        </nav>

        {/* Mobile-app promo */}
        {!sidebarCollapsed && (
          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 18,
              background: 'var(--lime)',
              color: 'var(--ink)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg-card)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ArrowUpRight size={15} strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: 4,
                  background: 'rgba(20,23,28,0.85)', opacity: 1 - i * 0.25,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>
              Téléchargez<br />notre application
            </div>
          </div>
        )}

        <button
          onClick={() => { logout(); router.push('/login'); }}
          data-testid="logout-button"
          style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 10,
            padding: sidebarCollapsed ? '12px' : '10px 12px', borderRadius: 12, color: 'var(--ink-dark-soft)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
          title={sidebarCollapsed ? t('topbar.logout') : undefined}
        >
          <LogOut size={16} />
          {!sidebarCollapsed && <span>{t('topbar.logout')}</span>}
        </button>
      </aside>

      {/* ============================ MAIN ============================ */}
      <main
        data-testid="dashboard-main"
        style={{
          flex: 1,
          marginLeft: 18,
          background: 'var(--bg-app)',
          borderRadius: 'var(--r-xl)',
          padding: '26px 32px 40px',
          minHeight: 'calc(100vh - 36px)',
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            justifyContent: 'space-between', marginBottom: 28,
          }}
        >
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={17} strokeWidth={2} style={{
              position: 'absolute', left: 16, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--ink-mute)',
            }} />
            <input
              data-testid="top-search"
              className="input-pill"
              placeholder={t('topbar.search')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher />
            <button className="btn-icon" aria-label={t('topbar.calendar')} data-testid="topbar-calendar">
              <Calendar size={17} strokeWidth={2} />
            </button>
            <NotificationBell />
            <button className="btn-icon" aria-label={t('topbar.download')} data-testid="topbar-download">
              <Download size={17} strokeWidth={2} />
            </button>
            <button 
              onClick={toggleTheme}
              className="btn-icon" 
              aria-label={t('topbar.themeDark')}
              data-testid="topbar-theme"
              title={darkMode ? t('topbar.themeLight') : t('topbar.themeDark')}
            >
              {darkMode ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>

            <Link
              href="/profil"
              data-testid="user-chip"
              title={t('topbar.viewProfile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '4px 14px 4px 4px', background: 'var(--bg-card)',
                borderRadius: 999, marginLeft: 6, textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--ink)', color: 'var(--lime)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, letterSpacing: -0.3,
                overflow: 'hidden', flexShrink: 0,
              }}>
                {user.photo ? (
                  <img
                    src={resolveFileUrl(user.photo)}
                    alt={`${user.prenom} ${user.nom}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>{user.prenom?.[0]?.toUpperCase()}{user.nom?.[0]?.toUpperCase()}</>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                  {user.prenom} {user.nom}
                </div>
                <span className={`badge ${roleColors[user.role]}`} style={{ padding: '0 7px', fontSize: 10 }}>
                  {user.role}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}