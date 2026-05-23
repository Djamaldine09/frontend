'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '⬡', roles: ['ADMIN', 'RESPONSABLE', 'SURVEILLANT', 'CANDIDAT'] },
  { href: '/candidats', label: 'Candidats', icon: '◈', roles: ['ADMIN', 'RESPONSABLE', 'SURVEILLANT'] },
  { href: '/examens', label: 'Examens', icon: '◻', roles: ['ADMIN', 'RESPONSABLE', 'SURVEILLANT', 'CANDIDAT'] },
  { href: '/resultats', label: 'Résultats', icon: '◈', roles: ['ADMIN', 'RESPONSABLE', 'SURVEILLANT', 'CANDIDAT'] },
  { href: '/paiements', label: 'Paiements', icon: '◇', roles: ['ADMIN', 'RESPONSABLE', 'CANDIDAT'] },
  { href: '/centres', label: 'Centres', icon: '⬡', roles: ['ADMIN', 'RESPONSABLE'] },
];

const roleColors: Record<Role, string> = {
  ADMIN: 'badge-red',
  RESPONSABLE: 'badge-purple',
  SURVEILLANT: 'badge-yellow',
  CANDIDAT: 'badge-blue',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
    </div>
  );

  const allowed = navItems.filter(n => n.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-display)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10 }}>
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              🎓
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>ExamensMG</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v1.0.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '6px 10px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Navigation</div>
          {allowed.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'rgba(88,166,255,0.1)' : 'transparent',
                fontWeight: active ? 600 : 400, fontSize: 14,
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-hover)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0d1117', flexShrink: 0 }}>
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.prenom} {user.nom}</div>
              <span className={`badge ${roleColors[user.role]}`} style={{ fontSize: 10, padding: '1px 7px' }}>{user.role}</span>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/login'); }} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: 13, padding: '8px' }}>
            ⎋ Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, padding: '32px', minHeight: '100vh', background: 'var(--bg-base)' }}>
        {children}
      </main>
    </div>
  );
}
