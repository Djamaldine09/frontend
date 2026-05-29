'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', motDePasse: '', telephone: '', role: 'CANDIDAT' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const data = res.data;

      // ✅ Le backend renvoie à plat : { _id, nom, prenom, email, role, token }
      const token = data.token || data.jwt;
      const user = {
        _id: data._id,
        nom: data.nom,
        prenom: data.prenom || '',
        email: data.email,
        role: data.role,
        telephone: data.telephone,
        createdAt: data.createdAt || new Date().toISOString()
      };

      login(token, user);
      toast.success('Compte créé avec succès !');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-base)' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', borderRadius: 14, marginBottom: 16, fontSize: 24 }}>
            🎓
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>GestionExamens MG</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Créer un nouveau compte</p>
        </div>

        <div className="card" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label>Nom</label>
                <input className="input-field" placeholder="Rakoto" value={form.nom} onChange={e => f('nom', e.target.value)} required />
              </div>
              <div>
                <label>Prénom</label>
                <input className="input-field" placeholder="Jean" value={form.prenom} onChange={e => f('prenom', e.target.value)} required />
              </div>
            </div>
            <div>
              <label>Email</label>
              <input className="input-field" type="email" placeholder="vous@exemple.mg" value={form.email} onChange={e => f('email', e.target.value)} required />
            </div>
            <div>
              <label>Téléphone</label>
              <input className="input-field" placeholder="+261 34 00 000 00" value={form.telephone} onChange={e => f('telephone', e.target.value)} />
            </div>
            <div>
              <label>Mot de passe</label>
              <input className="input-field" type="password" placeholder="Min. 6 caractères" value={form.motDePasse} onChange={e => f('motDePasse', e.target.value)} minLength={6} required />
            </div>
            <div>
              <label>Rôle</label>
              <select className="input-field" value={form.role} onChange={e => f('role', e.target.value)} style={{ appearance: 'none' }}>
                <option value="CANDIDAT">Candidat</option>
                <option value="SURVEILLANT">Surveillant (Examens & Présences)</option>
                <option value="CORRECTEUR">Correcteur (Résultats & Notes)</option>
                <option value="RESPONSABLE">Responsable de centre</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading
                ? <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block' }} />
                : 'Créer mon compte'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}