'use client';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import NotificationBell from '@/components/NotificationBell';
import {
  LayoutGrid, FileText, BookOpen, ScrollText, CreditCard, Building2,
  Bell, Settings, LogOut, Search, Download, ArrowUpRight, Calendar,
  Users, Activity, ShieldCheck, BarChart3, Wrench, Menu, X, Moon, Sun, CheckCircle
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',  label: 'Tableau de bord', icon: LayoutGrid,  roles: ['ADMIN','RESPONSABLE','SURVEILLANT','CORRECTEUR','CANDIDAT'] },
  { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs',    icon: Users,       roles: ['ADMIN'] },
  { href: '/supervision',  label: 'Supervision',     icon: Activity,    roles: ['ADMIN'] },
  { href: '/mon-dossier',  label: 'Mon dossier',     icon: FileText,    roles: ['CANDIDAT'] },
  { href: '/convocation',  label: 'Convocation',     icon: ScrollText,    roles: ['CANDIDAT'] },
  { href: '/dashboard/admin/candidat',  label: 'Candidats',       icon: FileText,    roles: ['ADMIN'] },
  { href: '/examens',    label: 'Examens',         icon: BookOpen,    roles: ['ADMIN','RESPONSABLE','SURVEILLANT','CORRECTEUR','CANDIDAT'] },
  { href: '/resultats',  label: 'Résultats',       icon: ScrollText,  roles: ['ADMIN','RESPONSABLE','SURVEILLANT','CORRECTEUR','CANDIDAT'] },
  { href: '/affectations',  label: 'Affectations',     icon: ScrollText,    roles: ['RESPONSABLE'] },
  { href: '/presence',      label: 'Présences',       icon: Activity,      roles: ['SURVEILLANT'] },
  { href: '/notation',      label: 'Saisir les notes', icon: FileText,      roles: ['CORRECTEUR'] },
  { href: '/validation',    label: 'Valider résultats',icon: CheckCircle,   roles: ['CORRECTEUR'] },
  { href: '/rapports',   label: 'Rapports', icon: BarChart3,   roles: ['ADMIN'] },
  { href: '/paiements',  label: 'Paiements',       icon: CreditCard,  roles: ['ADMIN','RESPONSABLE','CANDIDAT'] },
  { href: '/centres',    label: 'Centres',         icon: Building2,   roles: ['ADMIN','RESPONSABLE'] },
  { href: '/securite',   label: 'Sécurité',        icon: ShieldCheck, roles: ['ADMIN'] },
  { href: '/systeme',    label: 'Système',         icon: Wrench,      roles: ['ADMIN'] },
];

const bottomNav = [
  { href: '#notifications', label: 'Notifications', icon: Bell, badge: 2 },
  { href: '#settings',      label: 'Paramètres',    icon: Settings },
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
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        className={`dark-scroll sidebar ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
        style={{
          width: 248,
          background: 'var(--bg-sidebar)',
          color: 'var(--ink-dark)',
          borderRadius: 'var(--r-xl)',
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 18,
          height: 'calc(100vh - 36px)',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Brand */}
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }} data-testid="brand-link">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'var(--lime)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink)', fontWeight: 800, fontSize: 16,
                letterSpacing: -0.5,
              }}
            >EM</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>ExamenMG</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-dark-soft)', fontFamily: 'var(--font-mono)', marginTop: -1 }}>
                national.exam
              </div>
            </div>
          </div>
        </Link>

        {/* Main nav */}
        <nav style={{ flex: 1, marginTop: 22, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 }} className="dark-scroll">
          {allowed.map((item, idx) => {
            const Icon = item.icon;
            const active = pathname === item.href || (idx === 0 && pathname === '/dashboard');
            const isFirstActive = active && allowed.findIndex(i => i.href === item.href) === idx;
            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 14,
                  textDecoration: 'none',
                  color: isFirstActive ? 'var(--ink)' : 'var(--ink-dark-soft)',
                  background: isFirstActive ? 'var(--lime)' : 'transparent',
                  fontWeight: isFirstActive ? 700 : 500,
                  fontSize: 14,
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isFirstActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isFirstActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <Icon size={18} strokeWidth={isFirstActive ? 2.4 : 1.9} />
                {item.label}
              </Link>
            );
          })}

          <div className="divider-dark" style={{ margin: '14px 6px' }} />

          {bottomNav.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.label}
                data-testid={`nav-${b.label.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 14,
                  color: 'var(--ink-dark-soft)', background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 500, fontSize: 14, fontFamily: 'inherit',
                  width: '100%', textAlign: 'left',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--bg-sidebar-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span style={{ flex: 1 }}>{b.label}</span>
                {b.badge && (
                  <span style={{
                    background: '#FF6B5B', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 999,
                    minWidth: 20, textAlign: 'center',
                  }}>{b.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile-app promo */}
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

        <button
          onClick={() => { logout(); router.push('/login'); }}
          data-testid="logout-button"
          style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, color: 'var(--ink-dark-soft)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
          }}
        >
          <LogOut size={16} /> Déconnexion
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
              placeholder="Rechercher un examen, un centre..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-icon" aria-label="Calendrier" data-testid="topbar-calendar">
              <Calendar size={17} strokeWidth={2} />
            </button>
            <NotificationBell />
            <button className="btn-icon" aria-label="Télécharger" data-testid="topbar-download">
              <Download size={17} strokeWidth={2} />
            </button>
            <button 
              onClick={toggleTheme}
              className="btn-icon" 
              aria-label="Changer le thème" 
              data-testid="topbar-theme"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>

            <div
              data-testid="user-chip"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '4px 14px 4px 4px', background: 'var(--bg-card)',
                borderRadius: 999, marginLeft: 6,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--ink)', color: 'var(--lime)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, letterSpacing: -0.3,
              }}>
                {user.prenom?.[0]?.toUpperCase()}{user.nom?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                  {user.prenom} {user.nom}
                </div>
                <span className={`badge ${roleColors[user.role]}`} style={{ padding: '0 7px', fontSize: 10 }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
