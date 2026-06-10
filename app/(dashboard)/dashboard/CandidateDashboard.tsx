'use client';
import {
  CheckCircle2, Clock3, FileCheck, IdCard, MapPin, QrCode,
  ChevronRight, ChevronLeft, GraduationCap, Sparkles, Calculator,
  Atom, BookText, FlaskConical, ArrowUpRight, Award,
  LucideIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { useCandidatData } from '@/lib/useCandidatData';
import { documentsAPI, EpreuvePlanning, CandidatMe, getDownloadErrorMessage } from '@/lib/api';

/* ---------- Helpers ---------- */
const FR_MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const FR_DAYS_SHORT = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

function daysUntil(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function buildHoursMock(highlightDayIdx = 3): { d: string; v: number; highlight: boolean; ts: string | undefined }[] {
  // Deterministic synthetic series — replaced by real data if available
  const base = [3.5, 5.0, 2.2, 8.75, 4.0, 1.5, 3.8];
  return base.map((v, i) => ({
    d: FR_DAYS_SHORT[i],
    v,
    highlight: i === highlightDayIdx,
    ts: i === highlightDayIdx ? '8h 45 min · 5 fév.' : undefined,
  }));
}

function buildCalendar(year: number, month: number, examDates: Set<string>): { day: number | null; iso?: string; isExam?: boolean; isToday?: boolean }[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon
  // Convert Sunday-first to Monday-first index: 0->6, 1->0 ... 6->5
  const offset = (firstDay + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const todayISO = new Date().toISOString().slice(0, 10);
  const grid: { day: number | null; iso?: string; isExam?: boolean; isToday?: boolean }[] = [];
  for (let i = 0; i < offset; i++) grid.push({ day: null });
  for (let d = 1; d <= total; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    grid.push({ day: d, iso, isExam: examDates.has(iso), isToday: iso === todayISO });
  }
  while (grid.length % 7 !== 0) grid.push({ day: null });
  return grid;
}

const SUBJECT_TILE: Record<string, { tone: string; Icon: LucideIcon }> = {
  'Mathématiques':   { tone: 'var(--tile-sky)',   Icon: Calculator },
  'Physique-Chimie': { tone: 'var(--tile-lila)',  Icon: Atom },
  'Français':        { tone: 'var(--tile-peach)', Icon: BookText },
  'SVT':             { tone: 'var(--tile-mint)',  Icon: FlaskConical },
};
const SUBJECT_FALLBACK_TONES = ['var(--tile-sky)','var(--tile-lila)','var(--tile-peach)','var(--tile-mint)','var(--tile-sun)','var(--tile-rose)'];

/* ---------- Types ---------- */
interface OverviewCard {
  label: string;
  value: string;
  hint: string;
  tone: string;
  Icon: LucideIcon;
  dot: string;
}

interface DocumentItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  state: 'valide' | 'attente' | 'manquant';
}

/* ---------- Phase tracker (derived from statutInscription + paiement) ---------- */
function derivePhases(candidat: CandidatMe): Array<{ key: string; label: string; state: 'done' | 'active' | 'idle' }> {
  const dossierDone = candidat.statutInscription === 'VALIDE';
  const paiementDone = candidat.paiement?.statut === 'PAYE';
  const examDone = false; // backend would tell us
  const finalDone = false;

  const preDone = dossierDone && paiementDone;
  return [
    { key: 'pre',   label: 'Pré-examen',   state: (preDone ? 'done' : 'active') as 'done' | 'active' | 'idle' },
    { key: 'exam',  label: 'Examen',       state: (examDone ? 'done' : preDone ? 'active' : 'idle') as 'done' | 'active' | 'idle' },
    { key: 'post',  label: 'Correction',   state: 'idle' as const },
    { key: 'final', label: 'Restitution',  state: 'idle' as const },
  ];
}

/* ---------- Component ---------- */
export default function CandidateDashboard({ user }: { user: User }) {
  const { data, loading, error } = useCandidatData();
  const [downloading, setDownloading] = useState(false);

  if (loading) return <DashboardSkeleton />;
  if (!data) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Dossier candidat introuvable</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{error || 'Aucun dossier réel n’est enregistré pour ce compte.'}</p>
      </div>
    );
  }

  const { candidat, convocation, planning } = data;
  const phases = derivePhases(candidat);

  // Build calendar from real planning
  const examDates = new Set(planning.filter(p => p.type === 'EPREUVE').map(p => p.date));
  const nextExam = planning
    .filter(p => p.type === 'EPREUVE' && new Date(p.date) >= new Date(new Date().toISOString().slice(0,10)))
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? planning[0];
  const examDate = nextExam ? new Date(nextExam.date) : convocation ? new Date(convocation.dateEpreuve) : new Date();
  const examMonth = examDate.getMonth();
  const examYear = examDate.getFullYear();
  const calendar = buildCalendar(examYear, examMonth, examDates);
  const days = convocation ? daysUntil(convocation.dateEpreuve) : null;

  const overviewCards: OverviewCard[] = [
    {
      label: 'Dossier',
      value: candidat.statutInscription === 'VALIDE' ? 'Validé' :
             candidat.statutInscription === 'EN_ATTENTE_VALIDATION' ? 'En attente' :
             candidat.statutInscription === 'REJETE' ? 'Rejeté' : 'À compléter',
      hint: candidat.statutInscription === 'VALIDE' ? 'Confirmé' : 'À finaliser',
      tone: 'var(--tile-mint)', Icon: FileCheck,
      dot: candidat.statutInscription === 'VALIDE' ? 'var(--status-green)' :
           candidat.statutInscription === 'REJETE' ? 'var(--status-red)' : 'var(--status-amber)',
    },
    {
      label: 'Paiement',
      value: candidat.paiement?.statut === 'PAYE'
        ? `${(candidat.paiement.montant || 25000).toLocaleString('fr-FR')} Ar`
        : candidat.paiement?.statut === 'EN_COURS' ? 'En cours' : 'Non payé',
      hint: candidat.paiement?.modePaiement ? `${candidat.paiement.modePaiement} · Réglé` : 'À régler',
      tone: 'var(--tile-sun)', Icon: Award,
      dot: candidat.paiement?.statut === 'PAYE' ? 'var(--status-green)' : 'var(--status-amber)',
    },
    {
      label: 'Convocation',
      value: convocation ? 'Prête' : 'Non disponible',
      hint: convocation
        ? `QR généré · ${new Date(convocation.dateEpreuve).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
        : 'En attente de génération',
      tone: 'var(--tile-lila)', Icon: QrCode,
      dot: convocation ? 'var(--status-violet)' : 'var(--ink-mute)',
    },
  ];

  const docs: DocumentItem[] = [
    { key: 'photoIdentite',    label: "Pièce d'identité",     Icon: IdCard,    state: (typeof candidat.piecesJustificatives?.photoIdentite === 'string' ? 'valide' : candidat.piecesJustificatives?.photoIdentite?.status) ?? 'manquant' },
    { key: 'acteNaissance',    label: 'Acte de naissance',    Icon: FileCheck, state: (typeof candidat.piecesJustificatives?.acteNaissance === 'string' ? 'valide' : candidat.piecesJustificatives?.acteNaissance?.status) ?? 'manquant' },
    { key: 'diplomePrecedent', label: 'Diplôme précédent',    Icon: GraduationCap, state: (typeof candidat.piecesJustificatives?.diplomePrecedent === 'string' ? 'valide' : candidat.piecesJustificatives?.diplomePrecedent?.status) ?? 'manquant' },
    { key: 'photoSupp',        label: 'Photo identité (4x4)', Icon: IdCard,    state: 'manquant' as const },
  ];

  const handleDownload = async () => {
    if (!convocation) {
      toast.error('Convocation non disponible pour ce candidat.');
      return;
    }

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

  const hours: { d: string; v: number; highlight?: boolean; ts?: string }[] = [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting + phase tracker */}
      <section style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 data-testid="welcome-title" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.2, color: 'var(--ink)', lineHeight: 1.05 }}>
            Bonjour {user.prenom || candidat.user.prenom || user.nom}
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--lime)', borderRadius: 12, padding: '3px 8px', marginLeft: 12, transform: 'translateY(-4px)' }}>
              <Sparkles size={20} strokeWidth={2.4} />
            </span>
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 8 }}>
            {candidat.examen ?? 'Session 2025'} — Matricule <strong style={{ color: 'var(--ink)' }}>{candidat.numeroMatricule ?? '—'}</strong>
            {days !== null && days > 0 && <> · Reste <strong style={{ color: 'var(--ink)' }}>{days} jour{days > 1 ? 's' : ''}</strong> avant l'épreuve.</>}
          </p>
        </div>

        <div data-testid="phase-tracker" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {phases.map((p, i) => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`phase-pill ${p.state === 'active' ? 'active' : p.state === 'done' ? 'done' : ''}`}>
                <span className="dot" /> {p.label}
              </span>
              {i < phases.length - 1 && <span style={{ width: 14, height: 1, background: 'var(--ink-line)' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* Top row: 3 status cards + Convocation hero */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 312px', gap: 22, alignItems: 'stretch' }}>
        <div>
          <SectionHeader title="Statut de mon dossier" cta={{ label: 'Tout voir', href: '/mon-dossier' }} />
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {overviewCards.map((c) => (
              <div key={c.label} className="card card-hoverable" style={{ padding: 18 }} data-testid={`status-${c.label.toLowerCase()}`}>
                <div className="tile" style={{ background: c.tone, marginBottom: 14 }}>
                  <c.Icon size={20} strokeWidth={2} color="var(--ink)" />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4, marginBottom: 4 }}>
                  {c.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 50, background: c.dot }} />
                  {c.hint}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Convocation hero (dark with real QR) */}
        <Link
          href="/convocation"
          data-testid="convocation-card"
          className="card card-dark"
          style={{
            padding: 22, borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 12, textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={16} strokeWidth={2.4} color="var(--ink)\" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-dark)' }}>Convocation</div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.15, color: 'var(--ink-dark)' }}>
            Présentez ce QR le jour J
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-dark-soft)', lineHeight: 1.4 }}>
            Émargement automatique du surveillant via scan.
          </p>

          {convocation && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 12, alignSelf: 'center' }}>
              <QRCodeSVG
                value={convocation.qrPayload}
                size={156}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#15171C"
                data-testid="convocation-qr"
              />
            </div>
          )}

          <button
            type="button"
            className="btn-lime"
            data-testid="download-convocation-btn"
            style={{ width: '100%', marginTop: 'auto', padding: '11px 18px' }}
            onClick={(e) => { e.preventDefault(); handleDownload(); }}
            disabled={downloading || !convocation}
          >
            {downloading ? 'Préparation…' : 'Télécharger PDF'} <ArrowUpRight size={15} strokeWidth={2.4} />
          </button>
        </Link>
      </section>

      {/* Mid row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr) 312px', gap: 22 }}>
        {/* Hours */}
        <div className="card" style={{ padding: 22 }} data-testid="hours-activity-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>Heures de révision</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 50, background: 'var(--lime)' }}>
                  <ArrowUpRight size={13} strokeWidth={2.6} />
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  <strong style={{ color: 'var(--ink)' }}>+21%</strong> par rapport à la semaine dernière
                </span>
              </div>
            </div>
            <select data-testid="hours-period" style={{ background: 'var(--bg-soft)', border: 'none', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option>Hebdomadaire</option>
              <option>Mensuel</option>
            </select>
          </div>
          {hours.length > 0 ? (
            <BarChart data={hours} />
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: 13, background: 'var(--bg-soft)', borderRadius: 14 }}>
              Aucune donnée réelle de révision disponible.
            </div>
          )}
        </div>

        {/* Schedule from planning */}
        <div className="card" style={{ padding: 22 }} data-testid="schedule-card">
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4, marginBottom: 14 }}>Programme à venir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {planning.slice(0, 4).map((s: EpreuvePlanning, idx: number) => {
              const meta = SUBJECT_TILE[s.matiere] ?? { tone: SUBJECT_FALLBACK_TONES[idx % SUBJECT_FALLBACK_TONES.length], Icon: BookText };
              return (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, cursor: 'pointer', transition: 'background 0.2s ease' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--bg-soft)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div className="tile tile-sm" style={{ background: meta.tone }}>
                    <meta.Icon size={17} strokeWidth={2} color="var(--ink)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{s.matiere}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      {s.type === 'EPREUVE' ? 'Épreuve' : 'Révision'} · {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {s.heureDebut}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--ink-mute)\" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="card" style={{ padding: 20 }} data-testid="calendar-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button className="btn-icon" style={{ width: 28, height: 28 }} aria-label="Mois précédent"><ChevronLeft size={15} /></button>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{FR_MONTHS[examMonth]} {examYear}</div>
            <button className="btn-icon" style={{ width: 28, height: 28 }} aria-label="Mois suivant"><ChevronRight size={15} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {['L','M','M','J','V','S','D'].map((d, i) => (
              <div key={i} style={{ fontSize: 10.5, fontWeight: 700, textAlign: 'center', color: 'var(--ink-mute)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {calendar.map((c, i) => (
              <div key={i} style={{
                aspectRatio: '1 / 1', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                background: c.isExam ? 'var(--lime)' : c.isToday ? 'var(--ink)' : 'transparent',
                color: c.isExam ? 'var(--ink)' : c.isToday ? 'var(--lime)' : c.day ? 'var(--ink-soft)' : 'transparent',
                cursor: c.day ? 'pointer' : 'default',
                position: 'relative',
              }}>
                {c.day ?? ''}
                {c.isExam && <span style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 50, background: 'var(--ink)' }} />}
              </div>
            ))}
          </div>

          {nextExam && (
            <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-soft)' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Prochaine épreuve
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>
                {new Date(nextExam.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {nextExam.matiere}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 22 }}>
        <div className="card" style={{ padding: 22 }} data-testid="documents-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>Mes documents</h3>
            <Link href="/mon-dossier" data-testid="upload-doc-btn" className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>
              + Téléverser
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {docs.map((d) => {
              const tone =
                d.state === 'valide' ? 'var(--tile-mint)' :
                d.state === 'attente' ? 'var(--tile-sun)' : 'var(--tile-rose)';
              const badge =
                d.state === 'valide'  ? <span className="badge badge-green"><CheckCircle2 size={11} /> Validé</span> :
                d.state === 'attente' ? <span className="badge badge-amber"><Clock3 size={11} /> En attente</span> :
                                        <span className="badge badge-red">À fournir</span>;
              return (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: 'var(--bg-soft)' }}>
                  <div className="tile" style={{ background: tone }}>
                    <d.Icon size={20} strokeWidth={2} color="var(--ink)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                      {d.state === 'valide' ? 'Validé' : d.state === 'attente' ? 'En vérification' : 'À téléverser'}
                    </div>
                  </div>
                  {badge}
                </div>
              );
            })}
          </div>
        </div>

        {/* Centre d'examen */}
        <div className="card" data-testid="center-card" style={{ padding: 22, background: 'var(--ink)', color: 'var(--ink-dark)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="tile tile-sm" style={{ background: 'var(--lime)' }}>
              <MapPin size={17} strokeWidth={2.2} color="var(--ink)\" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-dark-soft)' }}>Centre d'examen</div>
          </div>

          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink-dark)' }}>
            {candidat.centreAffecte?.nom ?? '— En cours d\'affectation'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-dark-soft)', marginTop: 4 }}>
            {candidat.centreAffecte
              ? `${candidat.centreAffecte.ville} · Salle ${candidat.centreAffecte.salle} · Place n° ${candidat.centreAffecte.numeroPlace}`
              : 'Affectation par sectorisation automatique'}
          </div>

          <div style={{
            marginTop: 16, height: 120, borderRadius: 14,
            background: 'radial-gradient(circle at 30% 60%, rgba(205,245,100,0.18), transparent 40%), linear-gradient(135deg, #20232B 0%, #1B1E25 100%)',
            border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <pattern id="grid-c" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-c)" />
              <path d="M0,80 C 80,40 160,100 300,55" fill="none" stroke="rgba(205,245,100,0.5)" strokeWidth="2.5" />
              <circle cx="180" cy="58" r="9" fill="var(--lime)" />
              <circle cx="180" cy="58" r="14" fill="none" stroke="var(--lime)" strokeWidth="1.5" opacity="0.6" />
            </svg>
          </div>

          <button className="btn-lime" style={{ marginTop: 14, padding: '9px 18px', fontSize: 13 }} data-testid="itinerary-btn">
            Itinéraire <ArrowUpRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------- Helpers ---------- */
function SectionHeader({ title, cta }: { title: string; cta?: { label: string; href: string } }): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>{title}</h2>
      {cta && (
        <Link href={cta.href} style={{ color: 'var(--ink-soft)', fontSize: 12.5, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4 }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function DashboardSkeleton(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} data-testid="dashboard-skeleton">
      <div className="card" style={{ height: 96, background: 'var(--bg-soft)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 312px', gap: 14 }}>
        {[1,2,3,4].map(i => <div key={i} className="card" style={{ height: 140, background: 'var(--bg-soft)' }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 312px', gap: 22 }}>
        {[1,2,3].map(i => <div key={i} className="card" style={{ height: 280, background: 'var(--bg-soft)' }} />)}
      </div>
    </div>
  );
}

/* Pure-SVG bar chart */
function BarChart({ data }: { data: { d: string; v: number; highlight?: boolean; ts?: string }[] }): React.ReactElement {
  const W = 460, H = 180, padX = 14, padY = 22;
  const max = Math.max(...data.map(d => d.v), 10);
  const barW = (W - padX * 2) / data.length - 12;
  const yScale = (v: number) => H - padY - (v / max) * (H - padY * 2);
  const highlightIdx = data.findIndex(d => d.highlight);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {[0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={padX} x2={W - padX}
            y1={H - padY - p * (H - padY * 2)} y2={H - padY - p * (H - padY * 2)}
            stroke="rgba(20,23,28,0.06)\" strokeDasharray="3 5" />
        ))}
        {data.map((d, i) => {
          const x = padX + i * ((W - padX * 2) / data.length) + 6;
          const y = yScale(d.v);
          const h = H - padY - y;
          const fill = d.highlight ? 'var(--lime)' : 'var(--ink)';
          return (
            <g key={d.d}>
              <rect x={x} y={y} width={barW} height={h} rx={6} fill={fill} />
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink-mute)" fontFamily="var(--font-display)\">{d.d}</text>
            </g>
          );
        })}
      </svg>
      {highlightIdx >= 0 && data[highlightIdx].ts && (
        <div style={{ position: 'absolute', left: `calc(${(highlightIdx + 0.5) * (100 / data.length)}% - 70px)`, top: 0,
          background: 'var(--ink)', color: 'var(--ink-dark)', padding: '6px 10px', borderRadius: 10,
          fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: 50, background: 'var(--lime)' }} />
          {data[highlightIdx].ts}
        </div>
      )}
      <div style={{ position: 'absolute', left: -2, top: 4, bottom: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-mute)', fontWeight: 600 }}>
        <span>10h</span><span>6h</span><span>4h</span><span>2h</span><span>1h</span>
      </div>
    </div>
  );
}

export { CandidateDashboard };
