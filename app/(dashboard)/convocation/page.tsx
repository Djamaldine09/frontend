'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { candidatAPI, documentsAPI, resolveSalle } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock, User, Printer, Download, AlertCircle, LoaderCircle,
  Building2, Calendar, CheckCircle
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
  planning?: EpreuvePlanning[];
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

type UserInfo = {
  nom?: string;
  prenom?: string;
  email?: string;
};

export default function ConvocationPage() {
  const { user } = useAuth();
  const [convocation, setConvocation] = useState<Convocation | null>(null);
  const [planning, setPlanning] = useState<EpreuvePlanning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let convData = null;
        let planData: EpreuvePlanning[] = [];
        
        try {
          // CORRECTION ICI : "any" pour esquiver l'erreur TS2339 sur Convocation
          const convRes: any = await candidatAPI.convocation();
          // On gère tous les cas d'imbrication (Axios, Fetch, Wrapper personnalisé)
          convData = convRes?.data?.data ?? convRes?.data ?? convRes;
        } catch (convErr: unknown) {
          const errMessage = convErr instanceof Error ? convErr.message : 'Erreur convocation';
          console.warn('API convocation non disponible:', errMessage);
          const response = typeof convErr === 'object' && convErr !== null && 'response' in convErr
            ? (convErr as { response?: { status?: number } }).response
            : undefined;
          if (response?.status === 404) {
            setError('Votre convocation n’est pas encore publiée par l’administration.');
          } else {
            setError(errMessage || 'Impossible de charger votre convocation.');
          }
          setConvocation(null);
          setLoading(false);
          return;
        }
        
        try {
          // CORRECTION PRECEDENTE : "any" pour esquiver l'erreur TS2339 sur EpreuvePlanning[]
          const planRes: any = await candidatAPI.planning();
          const responseData = planRes?.data ?? planRes; 
          
          planData = Array.isArray(responseData?.data)
            ? responseData.data
            : Array.isArray(responseData)
              ? responseData
              : [];
              
        } catch (planErr: unknown) {
          const errMessage = planErr instanceof Error ? planErr.message : 'Erreur planning';
          console.warn('API planning non disponible:', errMessage);
          planData = [];
        }

        const convDataTyped = convData as Convocation & { planning?: EpreuvePlanning[] };
        const convPlanning = Array.isArray(convDataTyped.planning) ? convDataTyped.planning : planData;
        
        setConvocation(convDataTyped);
        setPlanning(convPlanning);
      } catch (err: unknown) {
        console.error('Erreur chargement:', err);
        const errMessage = err instanceof Error ? err.message : String(err);
        setError(errMessage || 'Impossible de charger votre convocation');
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
      const response = await documentsAPI.telechargerConvocation();
      const blob = new Blob([response.data], { type: 'application/pdf' });
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

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const response = await documentsAPI.telechargerConvocation();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Erreur impression PDF:', err);
      toast.error('Impossible de charger le PDF de convocation pour impression.');
    } finally {
      setPrinting(false);
    }
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

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
          Ma convocation
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
          Examen: <strong style={{ color: 'var(--text-primary)' }}>{convocation.examenTitre}</strong> ·
          Date: <strong style={{ color: 'var(--text-primary)' }}>
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
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 22px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #1F7A74 0%, #3ECF8E 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 14px 30px rgba(31, 122, 116, 0.18)',
            cursor: downloading ? 'not-allowed' : 'pointer',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(event) => {
            if (!downloading) {
              (event.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (event.currentTarget as HTMLButtonElement).style.boxShadow = '0 18px 35px rgba(31, 122, 116, 0.25)';
            }
          }}
          onMouseLeave={(event) => {
            (event.currentTarget as HTMLButtonElement).style.transform = 'none';
            (event.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 30px rgba(31, 122, 116, 0.18)';
          }}
        >
          <Download size={18} />
          {downloading ? 'Téléchargement...' : 'Télécharger ma convocation'}
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
              <Building2 size={18} /> Centre d&apos;examen
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
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {resolveSalle(convocation.salle, convocation.numeroPlace)} - Place {convocation.numeroPlace}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horaire */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} /> Horaire de l&apos;épreuve
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Date</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-soft)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Horaire</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {convocation.heureDebut} - {convocation.heureFin}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <QRCodeSVG value={convocation.qrPayload} size={220} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Code QR de validation
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Présentez ce QR le jour de l’examen pour validation.
              </p>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--tile-mint)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} /> À apporter
            </h3>
            <ul style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>📄 Cette convocation imprimée ou sur mobile</li>
              <li>🆔 Pièce d&apos;identité (CIN ou Passeport)</li>
              <li>✍️ Stylo noir et règle</li>
              <li>📏 Matériel autorisé selon la matière</li>
            </ul>
          </div>

          <div className="card" style={{ background: 'var(--tile-sun)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⏰ Important
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Présentez-vous <strong>30 minutes avant</strong> l&apos;heure de début. 
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
                <div><Clock size={18} style={{ color: 'var(--text-primary)' }} /></div>
                <div>
                  <div style={{ fontWeight: 700 }}>{epreuve.matiere}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {new Date(epreuve.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {epreuve.heureDebut} - {epreuve.heureFin}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12 }}>
                  <div style={{ color: 'var(--text-primary)' }}>Coeff. {epreuve.coefficient}</div>
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