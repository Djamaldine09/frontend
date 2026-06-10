'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Image from 'next/image';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// --- IMPORTS GOOGLE ---
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// --- IMPORTS FACEBOOK SDK ---

// --- IMPORTS FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB7sjTBjRLJA9pWeoZ07uZiu9y7iOSU-q8",
  authDomain: "examgest-a96f9.firebaseapp.com",
  projectId: "examgest-a96f9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="198209309688-pg3puag6p249q6ms9i4tqnfh5o75bnbb.apps.googleusercontent.com">
      <LoginContent />
    </GoogleOAuthProvider>
  );
}

function LoginContent() {
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHttps, setIsHttps] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHttps(window.location.protocol === 'https:');
    }
  }, []);

  // ================= CAROUSEL AUTO-SCROLL =================
  const slides = [
    '/images/im2.jpg',
    '/images/im4.jpg',
    '/images/im3.webp'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  // ================= 1. LOGIQUE GOOGLE =================
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:5000/api/auth/google', {
          token: tokenResponse.access_token
        });

        const data = res.data;
        const token = data.token || data.jwt;
        const userData = data.user || data;
        const user = {
          _id: userData._id,
          nom: userData.nom || userData.name || 'Candidat',
          prenom: userData.prenom || userData.given_name || '',
          email: userData.email,
          role: userData.role || 'CANDIDAT',
          telephone: userData.telephone || '',
          createdAt: userData.createdAt || new Date().toISOString(),
        };

        login(token, user);
        toast.success(`Bienvenue, ${user.nom} !`);
        router.push('/dashboard');
      } catch (err: any) {
        toast.error("Échec de la connexion avec ton serveur backend");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Connexion Google annulée ou échouée');
    }
  });

  // ================= 2. LOGIQUE FACEBOOK =================
  const handleFacebookLogin = () => {
    setLoading(true);
    // Charger le SDK Facebook si ce n'est pas déjà fait
    if (!(window as any).FB) {
      // Charger le script Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onload = () => {
        (window as any).FB.init({
          appId: '914690428259746 ', // Remplacez par votre Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        initiateFacebookLogin();
      };
      document.body.appendChild(script);
    } else {
      initiateFacebookLogin();
    }
  };

  const initiateFacebookLogin = () => {
    (window as any).FB.login(async (response: any) => {
      if (response.authResponse) {
        try {
          const res = await axios.post('http://localhost:5000/api/auth/facebook', {
            token: response.authResponse.accessToken
          });

          const data = res.data;
          const token = data.token || data.jwt;
          const userData = data.user || data;
          const user = {
            _id: userData._id,
            nom: userData.nom || userData.name || 'Candidat',
            prenom: userData.prenom || userData.given_name || '',
            email: userData.email,
            role: userData.role || 'CANDIDAT',
            telephone: userData.telephone || '',
            createdAt: userData.createdAt || new Date().toISOString(),
          };

          login(token, user);
          toast.success(`Bienvenue, ${user.nom} !`);
          router.push('/dashboard');
        } catch (err: any) {
          toast.error("Échec de la connexion avec Facebook");
        } finally {
          setLoading(false);
        }
      } else {
        toast.error('Connexion Facebook annulée');
        setLoading(false);
      }
    }, { scope: 'email,public_profile' });
  };

  // ================= 2. LOGIQUE CLASSIQUE (EMAIL) =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const data = res.data;

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
      toast.success(`Bienvenue, ${user.nom} !`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // ================= 3. LOGIQUE FIREBASE (TÉLÉPHONE) =================
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error("Veuillez entrer un numéro valide");
    
    setLoading(true);
    setupRecaptcha();
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      toast.success("Code SMS envoyé !");
    } catch (error) {
      toast.error("Erreur d'envoi. Format attendu : +26134...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const firebaseToken = await result.user.getIdToken();

      const res = await axios.post('http://localhost:5000/api/auth/phone', { 
        token: firebaseToken 
      });
      
      const data = res.data;
      const user = {
          _id: data._id,
          nom: data.nom,
          prenom: data.prenom || '',
          email: data.email,
          role: data.role,
          telephone: data.telephone,
          createdAt: data.createdAt || new Date().toISOString(),
      };

      login(data.token, user);
      toast.success(`Bienvenue !`);
      router.push('/dashboard');
    } catch (error) {
      toast.error("Code incorrect ou expiré");
      console.error(error);
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
      
      <div id="recaptcha-container"></div>

      {/* ================= GAUCHE : BANNIÈRE AVEC CAROUSEL IMAGES ================= */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        flex: 1, 
        padding: '60px', 
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }} className="hidden-mobile-logic">
        
        {/* Carousel Container */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderTopRightRadius: '35px',
          borderBottomRightRadius: '35px',
          overflow: 'hidden',
          zIndex: 0
        }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                borderTopRightRadius: '35px',
                borderBottomRightRadius: '35px',
              }}
            >
              <Image
                src={slide}
                alt={`Slide ${index + 1}`}
                fill
                style={{
                  objectFit: 'cover',
                  borderTopRightRadius: '35px',
                  borderBottomRightRadius: '35px',
                }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Overlay Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // background: 'linear-gradient(135deg, rgba(79, 70, 233, 0.6) 0%, rgba(99, 102, 241, 0.5) 40%, rgba(124, 58, 237, 0.6) 100%)',
          // backdropFilter: 'blur(1px)',
          zIndex: 1,
          borderTopRightRadius: '15px',
          borderBottomRightRadius: '15px',
        }} />

        {/* Milieu: Textes (position relative + z-index requis) */}
        <div style={{ maxWidth: '460px', margin: 'auto 0', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '35px', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px', letterSpacing: '-1px', color: '#ffffff' }}>
            Votre avenir académique commence ici
          </h1>
          <p style={{ fontSize: '16px', color: '#e0e7ff', lineHeight: 1.5 }}>
            Rejoignez la plateforme officielle. Créez votre espace personnel en quelques clics pour faciliter vos inscriptions, suivre vos dossiers et consulter vos résultats aux examens de Madagascar.
          </p>
        </div>

        {/* Slide Indicators */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: index === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          ))}
        </div>
      </div>

      {/* ================= DROITE : FORMULAIRE ================= */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#111827' }}>Connexion</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Accédez à votre espace personnel</p>
          </div>

          {loginMethod === 'email' ? (
            <>
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
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                      style={{ width: '100%', padding: '14px 14px 14px 46px', backgroundColor: '#f0f4f9', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Mot de passe</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3 13.5h15a2.25 2.25 0 002.25-2.25V13.5a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 13.5v7.5a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.motDePasse}
                      onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                      required
                      style={{ width: '100%', padding: '14px 46px 14px 46px', backgroundColor: '#f0f4f9', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? (
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', backgroundColor: '#5c54f3', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(92, 84, 243, 0.2)' }}
                >
                  {loading ? <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : 'Se connecter'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                <span style={{ padding: '0 16px', fontSize: '12px', color: '#9ca3af' }}>Ou continuer avec</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button 
                    type="button" 
                    onClick={() => handleGoogleLogin()} 
                    disabled={loading}
                    style={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px', 
                      border: 'none', 
                      borderRadius: '12px', 
                      padding: '12px', 
                      backgroundColor: '#ffffff',
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#374151',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.7 3.4-4.46 6.64-4.46z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58l3.76 2.91c2.2-2.03 3.69-5.02 3.69-8.64z"/>
                      <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.84 0 11 0 13.2s.54 4.36 1.5 6.3l3.86-3z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.5 1.18-4.2 1.18-3.24 0-5.74-1.76-6.64-4.46L1.5 16.9C3.4 20.75 7.35 23 12 23z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  {isHttps && (
                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    title="Facebook Login"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg style={{ width: '18px', height: '18px', color: '#1877F2' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={() => setLoginMethod('phone')}
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px', 
                    padding: '12px', 
                    backgroundColor: '#ffffff',
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#374151',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = '#5c54f3';
                      e.currentTarget.style.backgroundColor = '#f3f0ff';
                      e.currentTarget.style.color = '#5c54f3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  <svg style={{ width: '18px', height: '18px', color: 'currentColor' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622l1.056-1.056a2.25 2.25 0 013.182 0l2.9 2.9a2.25 2.25 0 010 3.182l-1.127 1.127a1.455 1.455 0 00-.372 1.353 11.916 11.916 0 005.155 5.155 1.455 1.455 0 001.353-.372l1.127-1.127a2.25 2.25 0 013.182 0l2.9 2.9a2.25 2.25 0 010 3.182l-1.057 1.057a2.25 2.25 0 01-3.18 0a17.481 17.481 0 01-4.745-4.745a17.487 17.487 0 01-4.745-4.745a2.25 2.25 0 010-3.18z" />
                  </svg>
                  <span>Continuer avec un numéro</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {!confirmationResult ? (
                <form onSubmit={handleSendSMS} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Numéro de téléphone</label>
                    <PhoneInput
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="MG"
                      value={phoneNumber}
                      onChange={(value: string | undefined) => setPhoneNumber(value || '')}
                      placeholder="+261 34 ..."
                      className="phone-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', backgroundColor: '#5c54f3', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(92, 84, 243, 0.2)' }}
                  >
                    {loading ? <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : 'Recevoir le code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Code de vérification (SMS)</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3 13.5h15a2.25 2.25 0 002.25-2.25V13.5a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 13.5v7.5a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value)}
                        required
                        style={{ width: '100%', padding: '14px 14px 14px 46px', backgroundColor: '#f0f4f9', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                  >
                    {loading ? <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : 'Valider et se connecter'}
                  </button>
                </form>
              )}

              <button 
                onClick={() => {
                  setLoginMethod('email');
                  setConfirmationResult(null);
                }} 
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}
              >
                Retour à la connexion par e-mail
              </button>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: '#5c54f3', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>
              Créer un compte
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

        /* PhoneInput Modern Styling */
        .PhoneInput {
          display: flex;
          align-items: center;
          background-color: #f0f4f9;
          border-radius: 12px;
          border: none;
          padding: 0;
          overflow: hidden;
        }

        .PhoneInput--focus {
          background-color: #f0f4f9;
          box-shadow: 0 0 0 3px rgba(92, 84, 243, 0.1);
          border-color: #5c54f3;
        }

        .PhoneInputCountry {
          padding: 14px 12px;
          border: none;
          background-color: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .PhoneInputCountry:hover {
          background-color: rgba(92, 84, 243, 0.05);
        }

        .PhoneInputCountrySelectMenu {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-height: 280px;
          overflow-y: auto;
          z-index: 1000;
        }

        .PhoneInputCountrySelectMenu__item {
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 14px;
          color: #374151;
        }

        .PhoneInputCountrySelectMenu__item:hover {
          background-color: #f3f0ff;
          color: #5c54f3;
        }

        .PhoneInputCountrySelectMenu__item--selected {
          background-color: #f0f4f9;
          color: #5c54f3;
          font-weight: 600;
        }

        .PhoneInputCountryFlag {
          margin-right: 8px;
          font-size: 18px;
        }

        .PhoneInputCountryCallingCode {
          margin-left: 6px;
          color: #6b7280;
          font-size: 12px;
        }

        input.PhoneInputInput {
          flex: 1;
          background-color: transparent;
          border: none;
          padding: 14px 14px;
          font-size: 14px;
          color: #111827;
          outline: none;
          font-family: inherit;
        }

        input.PhoneInputInput::placeholder {
          color: #9ca3af;
        }

        input.PhoneInputInput:focus {
          outline: none;
        }

        .PhoneInput input::-webkit-outer-spin-button,
        .PhoneInput input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .PhoneInput input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
