import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import axios from 'axios';

// 1. Ta configuration Firebase (à récupérer dans les paramètres de ton projet Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyB7sjTBjRLJA9pWeoZ07uZiu9y7iOSU-q8",
  authDomain: "examgest-a96f9.firebaseapp.com",
  projectId: "examgest-a96f9",
  storageBucket: "examgest-a96f9.firebasestorage.app",
  messagingSenderId: "942950500031",
  appId: "1:942950500031:web:7c05adf25065f03920e80a",
  measurementId: "G-Z93MPGH83K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    // 2. Initialisation du reCAPTCHA invisible
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  // 3. Fonction pour envoyer le SMS
  const sendSMS = async () => {
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      // Le numéro doit inclure l'indicatif, ex: +26134...
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      alert("SMS envoyé !");
    } catch (error) {
      console.error("Erreur d'envoi SMS :", error);
    }
  };

  // 4. Fonction pour vérifier le code saisi par l'utilisateur
  const verifyCode = async () => {
    try {
      const result = await confirmationResult.confirm(verificationCode);
      // L'utilisateur est authentifié sur Firebase ! On récupère le token Firebase.
      const firebaseToken = await result.user.getIdToken();

      // 5. On envoie ce token à notre backend Express
      const res = await axios.post('http://localhost:5000/api/auth/phone', {
        token: firebaseToken
      });
      
      console.log("Connecté sur Express avec succès :", res.data);
      // Redirection vers le dashboard...
      
    } catch (error) {
      console.error("Code incorrect :", error);
    }
  };

  return (
    <div>
      <div id="recaptcha-container"></div> {/* Nécessaire pour Firebase */}
      
      {!confirmationResult ? (
        <div>
          <input 
            type="tel" 
            placeholder="+26134..." 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
          />
          <button onClick={sendSMS}>Recevoir le code</button>
        </div>
      ) : (
        <div>
          <input 
            type="text" 
            placeholder="Code à 6 chiffres" 
            value={verificationCode} 
            onChange={(e) => setVerificationCode(e.target.value)} 
          />
          <button onClick={verifyCode}>Valider le code</button>
        </div>
      )}
    </div>
  );
}