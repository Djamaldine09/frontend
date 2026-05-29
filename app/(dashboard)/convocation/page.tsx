'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Calendar, Clock, MapPin, IdCard, QrCode,
  Download, Share2, Info, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useCandidatData } from '@/lib/useCandidatData';
import { documentsAPI, getDownloadErrorMessage } from '@/lib/api';

export default function ConvocationPage() {
  const { data, loading, error } = useCandidatData();
  const [downloading, setDownloading] = useState(false);

  if (loading) {
    return (
      <div className="card" style={{ height: 400, background: 'var(--bg-soft)' }} data-testid="convocation-loading" />
    );
  }

  if (!data) {
    return <Unavailable title="Dossier candidat introuvable" message={error || 'Aucun dossier réel n’est enregistré pour ce compte.'} />;
  }

  const { convocation, candidat } = data;

  if (!convocation) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'inherit', textDecoration: 'none' }} data-testid="back-link">
            <ArrowLeft size={15} /> Tableau de bord
          </Link>
          <span style={{ color: 'var(--ink-mute)' }}>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Convocation</span>
        </div>

        <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }} data-testid="convocation-unavailable">
          <div className="tile tile-sm" style={{ background: 'var(--tile-sun)', flexShrink: 0 }}>
            <AlertCircle size={17} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Convocation non disponible</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
              {error || 'Aucune convocation réelle n’est enregistrée pour ce candidat.'}
            </p>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 8 }}>
              Candidat : {candidat.user.prenom} {candidat.user.nom}
            </p>
          </div>
        </div>
      </div>
    );
  }
  const dateLong = new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await documentsAPI.telechargerConvocation();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `convocation-${convocation.matricule}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Convocation téléchargée');
    } catch (error) {
      toast.error(getDownloadErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = `Convocation Examen — ${candidat.user.prenom} ${candidat.user.nom}\n${convocation.examenTitre}\n${dateLong} à ${convocation.heureDebut}\n${convocation.centre.nom} · Salle ${convocation.salle}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Ma convocation', text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Détails copiés dans le presse-papier');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'inherit', textDecoration: 'none' }} data-testid="back-link">
          <ArrowLeft size={15} /> Tableau de bord
        </Link>
        <span style={{ color: 'var(--ink-mute)' }}>/</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Convocation</span>
      </div>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <h1 data-testid="convocation-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: 'var(--ink)' }}>
            Ma convocation officielle
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 6 }}>
            Matricule <strong style={{ color: 'var(--ink)' }}>{convocation.matricule}</strong> · {convocation.examenTitre}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={handleShare} data-testid="share-btn">
            <Share2 size={15} /> Partager
          </button>
          <button className="btn-lime" onClick={handleDownload} disabled={downloading} data-testid="download-btn">
            {downloading ? 'Préparation…' : <><Download size={15} /> Télécharger PDF</>}
          </button>
        </div>
      </header>

      {/* Main grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 22 }}>
        {/* Left: details */}
        <div className="card" style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 22 }} data-testid="convocation-details">
          {/* Identity strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 22, borderBottom: '1px dashed var(--ink-line)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'var(--ink)', color: 'var(--lime)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 22, letterSpacing: -0.5,
            }}>
              {candidat.user.prenom[0]}{candidat.user.nom[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>
                {candidat.user.prenom} {candidat.user.nom}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 13, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IdCard size={14} /> {convocation.matricule}</span>
                {candidat.serieFiliere && <span>· {candidat.serieFiliere}</span>}
                {candidat.dateNaissance && <span>· Né(e) le {new Date(candidat.dateNaissance).toLocaleDateString('fr-FR')}</span>}
              </div>
            </div>
            <span className="badge badge-green" data-testid="status-badge"><CheckCircle2 size={12} /> Validé</span>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            <InfoTile Icon={Calendar} label="Date de l'épreuve" value={dateLong} tone="var(--tile-lila)" />
            <InfoTile Icon={Clock} label="Heure" value={`${convocation.heureDebut} – ${convocation.heureFin}`} tone="var(--tile-sun)" />
            <InfoTile Icon={MapPin} label="Centre d'examen" value={convocation.centre.nom} sub={convocation.centre.adresse} tone="var(--tile-mint)" />
            <InfoTile Icon={QrCode} label="Salle et place" value={`Salle ${convocation.salle}`} sub={`Place n° ${convocation.numeroPlace}`} tone="var(--tile-sky)" />
          </div>

          {/* Instructions */}
          <div style={{
            background: 'var(--bg-soft)', borderRadius: 16, padding: 20,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div className="tile tile-sm" style={{ background: 'var(--lime)', flexShrink: 0 }}>
              <Info size={17} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Consignes le jour J</div>
              <ul style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                <li>Présentez-vous <strong style={{ color: 'var(--ink)' }}>30 minutes avant</strong> le début de l'épreuve</li>
                <li>Munissez-vous d'une <strong style={{ color: 'var(--ink)' }}>pièce d'identité valide</strong> + cette convocation (papier ou écran)</li>
                <li>Le surveillant scanne le QR code pour valider votre présence</li>
                <li>Matériel autorisé : stylo bleu/noir, règle, calculatrice non programmable</li>
                <li>Tout retard supérieur à 30 minutes entraîne l'exclusion de la salle</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: QR card */}
        <div className="card card-dark" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }} data-testid="qr-large-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={17} color="var(--ink)" />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--ink-dark)' }}>Code d'émargement</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
            <QRCodeSVG
              value={convocation.qrPayload}
              size={240}
              level="Q"
              bgColor="#FFFFFF"
              fgColor="#15171C"
              imageSettings={{
                src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="%23CDF564"/><text x="12" y="16" text-anchor="middle" font-family="Arial" font-weight="900" font-size="11" fill="%2315171C">EM</text></svg>',
                height: 36, width: 36, excavate: true,
              }}
              data-testid="qr-large"
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-dark)' }}>
              {convocation.prenom} {convocation.nom}
            </div>
            <div className="text-mono" style={{ fontSize: 13, color: 'var(--ink-dark-soft)', marginTop: 3 }}>
              {convocation.matricule}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--ink-dark-line)', width: '100%' }} />

          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', textAlign: 'center', gap: 8 }}>
            <Mini label="Date" value={new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} />
            <Mini label="Heure" value={convocation.heureDebut} />
            <Mini label="Salle" value={convocation.salle} />
            <Mini label="Place" value={convocation.numeroPlace} />
          </div>

          <div style={{ fontSize: 11, color: 'var(--ink-dark-soft)', textAlign: 'center', lineHeight: 1.5, marginTop: -4 }}>
            Cette convocation est signée numériquement.
            <br />Toute modification la rend invalide.
          </div>
        </div>
      </section>
    </div>
  );
}

function Unavailable({ title, message }: { title: string; message: string }) {
  return (
    <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div className="tile tile-sm" style={{ background: 'var(--tile-sun)', flexShrink: 0 }}>
        <AlertCircle size={17} />
      </div>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>{title}</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      </div>
    </div>
  );
}

function InfoTile({ Icon, label, value, sub, tone }: { Icon: any; label: string; value: string; sub?: string; tone: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div className="tile" style={{ background: tone }}>
        <Icon size={20} strokeWidth={2} color="var(--ink)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }}>{value}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-dark-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--lime)', marginTop: 3 }}>{value}</div>
    </div>
  );
}
