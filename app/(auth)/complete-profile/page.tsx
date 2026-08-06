'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function cleanGeneratedEmail(email?: string) {
  return email?.endsWith('@examgest.local') ? '' : email || '';
}

export default function CompleteProfilePage() {
  const { user, token, login, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const initialForm = useMemo(
    () => ({
      nom: user?.nom === 'Candidat' ? '' : user?.nom || '',
      prenom: user?.prenom === 'À compléter' ? '' : user?.prenom || '',
      email: cleanGeneratedEmail(user?.email),
      telephone: user?.telephone || '',
    }),
    [user]
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      toast.error('Veuillez remplir le nom, le prénom et l’email');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.updateMe({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim() || undefined,
      });

      const updatedUser = res.data.user;
      if (!token || !updatedUser) {
        throw new Error('Réponse de mise à jour invalide');
      }

      login(token, {
        _id: updatedUser._id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom || '',
        email: updatedUser.email,
        telephone: updatedUser.telephone || '',
        photo: updatedUser.photo || user?.photo,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt || user?.createdAt || new Date().toISOString(),
      });

      toast.success('Profil complété');
      router.replace('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Impossible de compléter le profil');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !token) {
    return null;
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc' }}>
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 440,
          display: 'grid',
          gap: 16,
          padding: 28,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ display: 'grid', gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 26, color: '#111827' }}>Compléter votre profil</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            Ces informations seront utilisées pour votre dossier candidat.
          </p>
        </div>

        <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#374151' }}>
          Nom
          <input
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#374151' }}>
          Prénom
          <input
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            required
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#374151' }}>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#374151' }}>
          Téléphone
          <input
            type="tel"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 8,
            padding: 13,
            border: 0,
            borderRadius: 10,
            background: '#5c54f3',
            color: '#ffffff',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Enregistrement...' : 'Continuer'}
        </button>
      </form>
    </main>
  );
}