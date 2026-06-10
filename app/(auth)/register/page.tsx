'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import UnicornScene from 'unicornstudio-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmation: '',
    telephone: '',
    role: 'CANDIDAT',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.motDePasse !== form.confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.motDePasse.length < 8) {
      toast.error('Mot de passe : minimum 8 caractères');
      return;
    }
    // Vérification des critères de mot de passe
    const hasUpperCase = /[A-Z]/.test(form.motDePasse);
    const hasLowerCase = /[a-z]/.test(form.motDePasse);
    const hasNumber = /\d/.test(form.motDePasse);
    const hasSpecial = /[@$!%*?&]/.test(form.motDePasse);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      toast.error('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse,
        telephone: form.telephone,
        role: form.role,
      };
      const res = await authAPI.register(payload);
      const data: any = res.data;

      const token = data.token || data.jwt;
      const user = {
        _id: data._id,
        nom: data.nom,
        prenom: data.prenom || '',
        email: data.email,
        role: data.role,
        telephone: data.telephone,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      login(token, user);
      toast.success('Compte créé avec succès !');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Erreur lors de la création du compte';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Roboto', sans-serif", backgroundColor: '#ffffff', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      <style>{`
        .phone-input input {
          width: 100% !important;
          padding: 14px 14px !important;
          background-color: #f0f4f9 !important;
          border: none !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          color: #111827 !important;
          outline: none !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
        }
      `}</style>

      {/* ================= GAUCHE : Unicorn Studio 3D Scene ================= */}
      <div
        className="hidden-mobile-logic"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <UnicornScene
          projectId="cAJdEBOPBMiDdBZLDfAk"
          width="100%"
          height="100%"
          scale={1}
          dpi={1.5}
          sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.1/dist/unicornStudio.umd.js"
        />
      </div>

      {/* ================= DROITE : Formulaire ================= */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
        <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#111827' }}>Créer un compte</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Rejoignez la plateforme nationale</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nom</label>
                <input
                  data-testid="register-nom"
                  type="text"
                  placeholder="Rakoto"
                  value={form.nom}
                  onChange={(e) => f('nom', e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Prénom</label>
                <input
                  data-testid="register-prenom"
                  type="text"
                  placeholder="Jean"
                  value={form.prenom}
                  onChange={(e) => f('prenom', e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Adresse e-mail</label>
              <input
                data-testid="register-email"
                type="email"
                placeholder="votre.email@exemple.mg"
                value={form.email}
                onChange={(e) => f('email', e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Téléphone</label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="MG"
                value={form.telephone}
                onChange={(v: string | undefined) => f('telephone', v || '')}
                placeholder="+261 34 ..."
                className="phone-input"
                data-testid="register-phone-wrapper"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Mot de passe</label>
                <input
                  data-testid="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 car. : Maj, min, chiffre, spécial (@$!%*?&)"
                  value={form.motDePasse}
                  onChange={(e) => f('motDePasse', e.target.value)}
                  minLength={8}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Confirmer</label>
                <input
                  data-testid="register-confirmation"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmation}
                  onChange={(e) => f('confirmation', e.target.value)}
                  minLength={8}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Rôle</label>
              <select
                data-testid="register-role"
                value={form.role}
                onChange={(e) => f('role', e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="CANDIDAT">Candidat</option>
                <option value="SURVEILLANT">Surveillant</option>
                <option value="CORRECTEUR">Correcteur</option>
                <option value="RESPONSABLE">Responsable de centre</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                data-testid="register-show-password"
              />
              Afficher les mots de passe
            </label>

            <button
              type="submit"
              disabled={loading}
              data-testid="register-submit"
              style={{
                width: '100%',
                backgroundColor: '#5c54f3',
                color: '#ffffff',
                fontWeight: 600,
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(92, 84, 243, 0.2)',
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Vous avez déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#5c54f3', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .hidden-mobile-logic { display: none !important; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .PhoneInput {
          display: flex;
          align-items: center;
          background-color: #f0f4f9;
          border-radius: 12px;
          border: none;
          padding: 0;
          overflow: hidden;
        }
        .PhoneInputCountry {
          padding: 14px 12px;
          background-color: transparent;
          cursor: pointer;
        }
        input.PhoneInputInput {
          flex: 1;
          background-color: transparent;
          border: none;
          padding: 14px;
          font-size: 14px;
          color: #111827;
          outline: none;
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#f0f4f9',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
};