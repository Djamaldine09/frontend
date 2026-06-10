'use client';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ValidationPage() {
  const { user } = useAuth();

  const allowed = user?.role === 'CORRECTEUR' || user?.role === 'ADMIN';

  if (!allowed) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', gap: 14 }}>
        <ShieldAlert size={20} color="var(--status-red)" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Accès refusé</h1>
          <p style={{ color: 'var(--ink-soft)' }}>Réservé aux correcteurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="validation-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Valider les résultats</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
          Validation finale des notes avant publication
        </p>
      </div>

      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
        Fonctionnalité en cours de développement
      </div>
    </div>
  );
}
