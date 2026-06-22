'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Un email de réinitialisation a été envoyé à votre adresse');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Roboto', sans-serif", backgroundColor: '#ffffff', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#111827' }}>Mot de passe oublié</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              {sent 
                ? 'Consultez votre email pour le lien de réinitialisation'
                : 'Entrez votre email pour recevoir un lien de réinitialisation'
              }
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Adresse e-mail</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '14px 14px 14px 46px', backgroundColor: '#f0f4f9', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', backgroundColor: '#5c54f3', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(92, 84, 243, 0.2)' }}
              >
                {loading ? <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : 'Envoyer le lien'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
                  ✓ Email envoyé avec succès. Vérifiez votre boîte de réception.
                </p>
              </div>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                style={{ width: '100%', backgroundColor: '#ffffff', color: '#5c54f3', fontWeight: 600, border: '2px solid #5c54f3', borderRadius: '12px', padding: '14px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Renvoyer l'email
              </button>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: 0 }}>
            <Link href="/login" style={{ color: '#5c54f3', fontWeight: 600, textDecoration: 'none' }}>
              ← Retour à la connexion
            </Link>
          </p>

        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
