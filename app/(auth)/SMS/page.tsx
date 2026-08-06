'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const sendSMS = async () => {
    if (!phoneNumber) {
      toast.error('Veuillez entrer un numero de telephone');
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendLoginOtp({ telephone: phoneNumber });
      setOtpSent(true);
      setVerificationCode('');
      toast.success('SMS envoye !');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur d'envoi SMS");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      toast.error('Veuillez entrer le code');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.verifyLoginOtp({
        telephone: phoneNumber,
        code: verificationCode,
      });
      const data = res.data;

      login(data.token, {
        _id: data._id,
        nom: data.nom,
        prenom: data.prenom || '',
        email: data.email,
        role: data.role,
        telephone: data.telephone,
        photo: data.photo,
        createdAt: data.createdAt || new Date().toISOString(),
      });

      toast.success('Bienvenue !');
      router.push(data.profileIncomplete ? '/complete-profile' : '/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Code incorrect ou expire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'grid', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Connexion par telephone</h1>

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="+26134..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #d1d5db' }}
            />
            <button onClick={sendSMS} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
              {loading ? 'Envoi...' : 'Recevoir le code'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Code a 6 chiffres"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #d1d5db' }}
            />
            <button onClick={verifyCode} disabled={loading} style={{ padding: 12, borderRadius: 8 }}>
              {loading ? 'Verification...' : 'Valider le code'}
            </button>
            <button
              onClick={() => {
                setOtpSent(false);
                setVerificationCode('');
              }}
              disabled={loading}
              style={{ padding: 12, borderRadius: 8 }}
            >
              Changer de numero
            </button>
          </>
        )}
      </div>
    </div>
  );
}