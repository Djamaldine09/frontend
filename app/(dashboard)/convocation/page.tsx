'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin, Clock, User, Printer, Download, AlertCircle, LoaderCircle,
  Building2, MapPinned, Calendar, CheckCircle
} from 'lucide-react';

// Types locaux en attendant l'API backend
interface Convocation {
  _id?: string;
  nom: string;
  prenom: string;
  matricule: string;
  examenTitre: string;
  dateEpreuve: string;
  heureDebut: string;
  heureFin: string;
  centre: {
    nom: string;
    adresse?: string;
    ville?: string;
    code?: string;
  };
  salle?: string;
  numeroPlace?: string;
  qrPayload: string;
  pdfUrl?: string;
}

interface EpreuvePlanning {
  matiere: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  coefficient: number;
  duree: number;
  type: 'EPREUVE' | 'REVISION' | 'PAUSE';
}

// Données mockées pour le développement
const getMockConvocation = (user: any): Convocation => ({
  _id: 'mock_001',
  nom: user?.nom || 'Rakoto',
  prenom: user?.prenom || 'Jean',
  matricule: `MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  examenTitre: 'Baccalauréat 2025',
  dateEpreuve: '2025-06-15',
  heureDebut: '08:00',
  heureFin: '12:00',
  centre: {
    nom: 'Centre Andohalo',
    adresse: 'Boulevard de l\'Indépendance',
    ville: 'Antananarivo',
    code: 'CAD-001'
  },
  salle: 'Salle A101',
  numeroPlace: `P${Math.floor(Math.random() * 200) + 1}`,
  qrPayload: `CONV-${user?.email || 'candidat'}-${Date.now()}`,
  pdfUrl: undefined
});

const getMockPlanning = (): EpreuvePlanning[] => [
  {
    matiere: 'Mathématiques',
    date: '2025-06-15',
    heureDebut: '08:00',
    heureFin: '10:00',
    coefficient: 4,
    duree: 120,
    type: 'EPREUVE'
  },
  {
    matiere: 'Français',
    date: '2025-06-16',
    heureDebut: '08:00',
    heureFin: '11:00',
    coefficient: 3,
    duree: 180,
    type: 'EPREUVE'
  },
  {
    matiere: 'Anglais',
    date: '2025-06-17',
    heureDebut: '08:00',
    heureFin: '10:00',
    coefficient: 2,
    duree: 120,
    type: 'EPREUVE'
  },
  {
    matiere: 'Physique-Chimie',
    date: '2025-06-18',
    heureDebut: '08:00',
    heureFin: '10:00',
    coefficient: 3,
    duree: 120,
    type: 'EPREUVE'
  },
  {
    matiere: 'Philosophie',
    date: '2025-06-19',
    heureDebut: '08:00',
    heureFin: '11:00',
    coefficient: 2,
    duree: 180,
    type: 'EPREUVE'
  }
];

// Composant QR Code simple
const SimpleQRCode = ({ value, size = 200 }: { value: string; size?: number }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (value) {
      // Créer un canvas pour simuler un QR code
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Dessiner un motif de QR code simulé
        ctx.fillStyle = '#000000';
        const blockSize = size / 10;
        
        // Coin supérieur gauche
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if ((i < 2 || i > 4 || j < 2 || j > 4) && !(i > 4 && j > 4)) {
              ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
            }
          }
        }
        
        // Coin supérieur droit
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if ((i < 2 || i > 4 || j < 2 || j > 4) && !(i > 4 && j > 4)) {
              ctx.fillRect(size - (i + 1) * blockSize, j * blockSize, blockSize, blockSize);
            }
          }
        }
        
        // Coin inférieur gauche
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if ((i < 2 || i > 4 || j < 2 || j > 4) && !(i > 4 && j > 4)) {
              ctx.fillRect(i * blockSize, size - (j + 1) * blockSize, blockSize, blockSize);
            }
          }
        }
        
        // Données aléatoires
        for (let i = 0; i < 100; i++) {
          const x = Math.floor(Math.random() * 9);
          const y = Math.floor(Math.random() * 9);
          if (!(x < 7 && y < 7) && !(x > 2 && y > 2 && x < 7 && y < 7)) {
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
          }
        }
        
        // Texte au centre
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.floor(size / 15)}px monospace`;
        ctx.fillText(value.substring(0, 8), size / 3, size / 2);
        
        setQrDataUrl(canvas.toDataURL());
      }
    }
  }, [value, size]);

  if (!qrDataUrl) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        background: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 12,
        border: '1px solid #e0e0e0'
      }}>
        <LoaderCircle size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <img src={qrDataUrl} alt="QR Code" width={size} height={size} style={{ borderRadius: 12 }} />
    </div>
  );
};

export default function ConvocationPage() {
  const { user } = useAuth();
  const [convocation, setConvocation] = useState<Convocation | null>(null);
  const [planning, setPlanning] = useState<EpreuvePlanning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Tenter d'appeler l'API réelle
        let convData = null;
        let planData: EpreuvePlanning[] = [];
        let useMock = false;
        
        try {
          // Essayer de charger depuis l'API
          const { candidatAPI } = await import('@/lib/api');
          
          try {
            const convRes = await candidatAPI.convocation();
            convData = convRes.data;
          } catch (convErr: any) {
            console.warn('API convocation non disponible:', convErr.message);
            if (convErr.response?.status === 404) {
              useMock = true;
            }
          }
          
          try {
            const planRes = await candidatAPI.planning();
            planData = Array.isArray(planRes.data) ? planRes.data : [];
          } catch (planErr: any) {
            console.warn('API planning non disponible:', planErr.message);
            if (planErr.response?.status === 404) {
              useMock = true;
            }
          }
        } catch (importErr) {
          console.warn('Module API non disponible, utilisation des données mockées');
          useMock = true;
        }
        
        // Utiliser les données mockées si nécessaire
        if (useMock || !convData) {
          setUsingMockData(true);
          convData = getMockConvocation(user);
          planData = getMockPlanning();
          toast.success('Mode démo: Affichage des données de test', {
            icon: '🔧',
            duration: 3000
          });
        }
        
        setConvocation(convData);
        setPlanning(planData);
      } catch (err: any) {
        console.error('Erreur chargement:', err);
        setError(err.message || 'Impossible de charger votre convocation');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDownloadPDF = async () => {
    if (!convocation) return;
    
    setDownloading(true);
    try {
      if (usingMockData) {
        // Mode démo: générer un PDF factice
        toast.success('Fonctionnalité disponible après implémentation backend', {
          icon: '📄',
          duration: 3000
        });
        
        // Simuler un téléchargement
        const blob = new Blob([
          `CONVOCATION D'EXAMEN
          
Candidat: ${convocation.prenom} ${convocation.nom}
Matricule: ${convocation.matricule}
Examen: ${convocation.examenTitre}
Date: ${new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR')}
Heure: ${convocation.heureDebut} - ${convocation.heureFin}
Centre: ${convocation.centre.nom}
Salle: ${convocation.salle}
Place: ${convocation.numeroPlace}

Ce document est généré en mode démo.`
        ], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `convocation-${convocation.matricule}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        return;
      }
      
      // API réelle
      const token = localStorage.getItem('token');
      const response = await fetch('/api/candidats/me/convocation/pdf', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `convocation-${convocation.matricule}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Convocation téléchargée avec succès');
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      toast.error('Impossible de télécharger la convocation');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    window.print();
    setTimeout(() => setPrinting(false), 1000);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        gap: 16,
        color: 'var(--text-secondary)',
      }}>
        <LoaderCircle size={32} className="animate-spin" />
        <span>Chargement de votre convocation...</span>
      </div>
    );
  }

  if (error || !convocation) {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div className="tile" style={{ 
          background: 'var(--tile-rose)', 
          margin: '0 auto 20px', 
          width: 60, 
          height: 60, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 30
        }}>
          <AlertCircle size={28} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Convocation non disponible
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          {error || 'Votre convocation n\'est pas encore disponible. Vérifiez que votre dossier est validé et complet.'}
        </p>
        {user?.role === 'CANDIDAT' && (
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: 24 }}
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" id="convocation-print">
      {/* Bannière mode démo */}
      {usingMockData && (
        <div style={{ 
          marginBottom: 20, 
          padding: '10px 16px', 
          background: 'var(--tile-sun)', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 13
        }}>
          <span>🔧</span>
          <span>Mode démo: Données de test affichées en attendant l'implémentation des endpoints backend.</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
          📄 Ma convocation
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
          Examen: <strong style={{ color: 'var(--text-primary)' }}>{convocation.examenTitre}</strong> ·
          Date: <strong style={{ color: 'var(--accent-yellow)' }}>
            {convocation.dateEpreuve ? new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Non définie'}
          </strong>
        </p>
      </div>

      {/* Actions */}
      <div className="no-print" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleDownloadPDF} disabled={downloading}>
          <Download size={16} />
          {downloading ? 'Téléchargement...' : 'Télécharger PDF'}
        </button>
        <button className="btn-ghost" onClick={handlePrint} disabled={printing}>
          <Printer size={16} />
          {printing ? 'Impression...' : 'Imprimer'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        {/* Bloc principal */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Informations candidat */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} /> Informations du candidat
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Nom complet</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {convocation.prenom} {convocation.nom}
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Matricule</div>
                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {convocation.matricule}
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Examen</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {convocation.examenTitre}
                </div>
              </div>
            </div>
          </div>

          {/* Centre d'examen */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} /> Centre d'examen
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Nom du centre</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {convocation.centre?.nom || 'Non spécifié'}
                </div>
              </div>
              {convocation.centre?.adresse && (
                <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Adresse</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{convocation.centre.adresse}</div>
                </div>
              )}
              {convocation.salle && (
                <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Salle / Place</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>
                    {convocation.salle} - Place {convocation.numeroPlace}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horaire */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} /> Horaire de l'épreuve
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Date</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                  {new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Horaire</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                  {convocation.heureDebut} - {convocation.heureFin}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <SimpleQRCode value={convocation.qrPayload} size={200} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Code QR de validation
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {convocation.qrPayload}
              </p>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--tile-mint)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} /> À apporter
            </h3>
            <ul style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>📄 Cette convocation imprimée ou sur mobile</li>
              <li>🆔 Pièce d'identité (CIN ou Passeport)</li>
              <li>✍️ Stylo noir et règle</li>
              <li>📏 Matériel autorisé selon la matière</li>
            </ul>
          </div>

          <div className="card" style={{ background: 'var(--tile-sun)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⏰ Important
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Présentez-vous <strong>30 minutes avant</strong> l'heure de début. 
              Les retardataires ne seront pas admis après 15 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Planning */}
      {planning.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} /> Calendrier des épreuves
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planning.map((epreuve, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 16,
                  padding: 16,
                  background: 'var(--bg-soft)',
                  borderRadius: 12,
                  borderLeft: `4px solid ${epreuve.type === 'EPREUVE' ? 'var(--accent)' : 'var(--accent-yellow)'}`,
                }}
              >
                <div><Clock size={18} style={{ color: 'var(--accent)' }} /></div>
                <div>
                  <div style={{ fontWeight: 700 }}>{epreuve.matiere}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {new Date(epreuve.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {epreuve.heureDebut} - {epreuve.heureFin}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12 }}>
                  <div style={{ color: 'var(--accent)' }}>Coeff. {epreuve.coefficient}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{epreuve.duree} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
            padding: 20px;
          }
          .card {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
}