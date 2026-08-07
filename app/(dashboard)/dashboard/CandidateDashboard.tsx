'use client';
import {
  CheckCircle2, Clock3, FileCheck, IdCard, MapPin, QrCode,
  ChevronRight, ChevronLeft, Calculator,
  Atom, BookText, FlaskConical, ArrowUpRight, Award, ZoomIn, X,
  LucideIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Resultat, User } from '@/types';
import { useCandidatData } from '@/lib/useCandidatData';
import { documentsAPI, EpreuvePlanning, CandidatMe, getDownloadErrorMessage, resolveFileUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lang } from '@/lib/i18n/translations';
import { WEEKDAYS_MIN, formatDayMonth, formatWeekdayDayMonth, formatMonthYear } from '@/lib/i18n/dates';

/* ---------- Helpers ---------- */
type T = (key: string) => string;

function daysUntil(value: string | Date | undefined | null): number | null {
  const target = parseDateSafely(value);
  if (!target) return null;
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function areSameDay(a: Date, b: Date): boolean {
  return normalizeCalendarDate(a) === normalizeCalendarDate(b);
}

function buildRevisionHours(planning: EpreuvePlanning[], period: 'Hebdomadaire' | 'Mensuel', t: T, lang: Lang, today = new Date()) {
  const revisionItems = planning
    .filter((item) => item.type === 'REVISION')
    .map((item) => ({
      ...item,
      dateObj: getValidDate(item.date),
    }))
    .filter((item): item is EpreuvePlanning & { dateObj: Date } => item.dateObj !== null);

  if (revisionItems.length === 0) {
    return { data: [], summary: t('cdash.revision.none'), trend: '' };
  }

  const computeTrend = (current: number, previous: number, context: string) => {
    if (current === 0 && previous === 0) return t('cdash.revision.noneWeekPrevious').replace('{context}', context);
    if (previous === 0) return t('cdash.revision.increaseFromPrevious').replace('{context}', context);
    const change = Math.round(((current - previous) / previous) * 100);
    return t('cdash.revision.changeFromPrevious').replace('{change}', `${change >= 0 ? '+' : ''}${change}`).replace('{context}', context);
  };

  if (period === 'Hebdomadaire') {
    const weekStart = getMonday(today);
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const slots = Array.from({ length: 7 }, (_, index) => {
      const slotDate = new Date(weekStart);
      slotDate.setDate(slotDate.getDate() + index);
      return {
        d: WEEKDAYS_MIN[lang][index],
        v: 0,
        highlight: areSameDay(slotDate, today),
        ts: undefined as string | undefined,
        iso: normalizeCalendarDate(slotDate),
      };
    });

    let totalThisWeek = 0;
    let totalLastWeek = 0;

    revisionItems.forEach((item) => {
      const itemHours = item.duree / 60;
      const itemIso = normalizeCalendarDate(item.dateObj);
      const itemWeekStart = getMonday(item.dateObj);

      if (normalizeCalendarDate(itemWeekStart) === normalizeCalendarDate(weekStart)) {
        totalThisWeek += itemHours;
      }
      if (normalizeCalendarDate(itemWeekStart) === normalizeCalendarDate(previousWeekStart)) {
        totalLastWeek += itemHours;
      }

      const slot = slots.find((s) => s.iso === itemIso);
      if (slot) {
        slot.v += itemHours;
        if (areSameDay(item.dateObj, today)) {
          slot.ts = `${formatHours(item.duree)} · ${t('cdash.revision.today')}`;
        }
      }
    });

    const summary = totalThisWeek > 0
      ? t('cdash.revision.thisWeek').replace('{hours}', formatHours(totalThisWeek * 60))
      : t('cdash.revision.noneThisWeek');
    const trend = computeTrend(totalThisWeek, totalLastWeek, t('cdash.revision.contextWeek'));

    return { data: slots.map((slot) => ({ d: slot.d, v: slot.v, highlight: slot.highlight, ts: slot.ts })), summary, trend };
  }

  const month = today.getMonth();
  const year = today.getFullYear();
  const firstOfMonth = new Date(year, month, 1);
  const monthStart = getMonday(firstOfMonth);
  const monthEnd = new Date(year, month + 1, 0);

  const weeks: Array<{ d: string; v: number; highlight: boolean; ts?: string; start: Date; end: Date }> = [];
  const weekStart = new Date(monthStart);
  let weekIndex = 0;

  while (weekStart <= monthEnd || weeks.length < 4) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weeks.push({
      d: `S${weekIndex + 1}`,
      v: 0,
      highlight: today >= weekStart && today <= weekEnd,
      ts: undefined,
      start: new Date(weekStart),
      end: new Date(weekEnd),
    });
    weekStart.setDate(weekStart.getDate() + 7);
    weekIndex += 1;
    if (weeks.length >= 6) break;
  }

  let totalMonth = 0;
  let totalLastMonth = 0;
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastMonthYear = month === 0 ? year - 1 : year;

  revisionItems.forEach((item) => {
    const itemHours = item.duree / 60;
    const itemDate = item.dateObj;
    if (itemDate.getMonth() === month && itemDate.getFullYear() === year) {
      const weekSlot = weeks.find((w) => itemDate >= w.start && itemDate <= w.end);
      if (weekSlot) {
        weekSlot.v += itemHours;
        totalMonth += itemHours;
        if (weekSlot.highlight) {
          weekSlot.ts = `${formatHours(item.duree)} · ${t('cdash.revision.session')}`;
        }
      }
    }
    if (itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear) {
      totalLastMonth += itemHours;
    }
  });

  const summary = totalMonth > 0
    ? t('cdash.revision.thisMonth').replace('{hours}', formatHours(totalMonth * 60))
    : t('cdash.revision.noneThisMonth');
  const trend = computeTrend(totalMonth, totalLastMonth, t('cdash.revision.contextMonth'));

  return { data: weeks.map(({ d, v, highlight, ts }) => ({ d, v, highlight, ts })), summary, trend };
}

function parseDateSafely(value: string | Date | undefined | null): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeCalendarDate(value: string | Date | undefined | null): string | null {
  const date = parseDateSafely(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

function getValidDate(value: string | Date | undefined | null, fallback: Date = new Date()): Date {
  return parseDateSafely(value) ?? fallback;
}

function getExamWindow(planning: EpreuvePlanning[], convocation: { dateEpreuve: string } | null) {
  const examDates = planning
    .filter((item) => item.type === 'EPREUVE')
    .map((item) => parseDateSafely(item.date))
    .filter((date): date is Date => date !== null);

  if (convocation && parseDateSafely(convocation.dateEpreuve)) {
    examDates.push(parseDateSafely(convocation.dateEpreuve) as Date);
  }

  if (examDates.length === 0) {
    return { first: null, last: null };
  }

  const sorted = examDates.sort((a, b) => a.getTime() - b.getTime());
  return { first: sorted[0], last: sorted[sorted.length - 1] };
}

function isDateBeforeDay(value: string | Date | undefined | null, compareTo: Date = new Date()): boolean {
  const date = parseDateSafely(value);
  if (!date) return false;
  return normalizeCalendarDate(date)! < normalizeCalendarDate(compareTo)!;
}

function buildCalendar(year: number, month: number, examDates: Set<string>): { day: number | null; iso?: string; isExam?: boolean; isToday?: boolean }[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon
  // Convert Sunday-first to Monday-first index: 0->6, 1->0 ... 6->5
  const offset = (firstDay + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const todayISO = normalizeCalendarDate(new Date()) ?? '';
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
  key: string;
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

/* ---------- Phase tracker (derived from statutInscription + paiement + exam dates) ---------- */
function derivePhases(
  candidat: CandidatMe,
  convocation: { dateEpreuve: string } | null,
  planning: EpreuvePlanning[],
  resultat: Resultat | null,
  t: T
): Array<{ key: string; label: string; state: 'done' | 'active' | 'idle' }> {
  const dossierDone = candidat.statutInscription === 'VALIDE';
  const paiementDone = candidat.paiement?.statut === 'PAYE';
  const preDone = dossierDone && paiementDone;
  const { last: lastExam } = getExamWindow(planning, convocation);

  const today = new Date();
  const examFinished = lastExam !== null && isDateBeforeDay(lastExam, today);
  const resultsPublished = resultat?.estPublie === true;
  const finalPhaseActive = examFinished && resultsPublished;

  return [
    { key: 'pre',   label: t('cdash.phase.pre'),   state: preDone ? 'done' : 'active' },
    { key: 'exam',  label: t('cdash.phase.exam'),  state: preDone ? (examFinished ? 'done' : 'active') : 'idle' },
    { key: 'post',  label: t('cdash.phase.post'),  state: examFinished ? (finalPhaseActive ? 'done' : 'active') : 'idle' },
    { key: 'final', label: t('cdash.phase.final'), state: finalPhaseActive ? 'active' : 'idle' },
  ];
}

/* ---------- Component ---------- */
export default function CandidateDashboard({ user }: { user: User }) {
  const { data, loading, error } = useCandidatData();
  const [downloading, setDownloading] = useState(false);
  const [revisionPeriod, setRevisionPeriod] = useState<'Hebdomadaire' | 'Mensuel'>('Hebdomadaire');
  const [showCentrePhoto, setShowCentrePhoto] = useState(false);
  const router = useRouter();
  const { t, lang } = useLanguage();

  const revisionData = useMemo(() => buildRevisionHours(data?.planning ?? [], revisionPeriod, t, lang), [data?.planning, revisionPeriod, t, lang]);

  if (loading) return <DashboardSkeleton />;
  if (!data) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>{t('cdash.notFound.title')}</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{error || t('cdash.notFound.subtitle')}</p>
      </div>
    );
  }

  const { candidat, convocation, planning, resultat } = data;
  const phases = derivePhases(candidat, convocation, planning, resultat, t);

  // Build calendar from real planning
  const examDates = new Set(planning
    .filter(p => p.type === 'EPREUVE')
    .map(p => normalizeCalendarDate(p.date))
    .filter(Boolean) as string[]
  );
  const nextExam = planning
    .filter(p => p.type === 'EPREUVE')
    .map(p => ({ ...p, normalizedDate: normalizeCalendarDate(p.date) }))
    .filter((p): p is EpreuvePlanning & { normalizedDate: string } => Boolean(p.normalizedDate))
    .filter(p => p.normalizedDate >= normalizeCalendarDate(new Date())!)
    .sort((a, b) => a.normalizedDate.localeCompare(b.normalizedDate))[0] ?? planning[0];
  const examDate = getValidDate(nextExam?.date, getValidDate(convocation?.dateEpreuve, new Date()));
  const examMonth = examDate.getMonth();
  const examYear = examDate.getFullYear();
  const calendar = buildCalendar(examYear, examMonth, examDates);
  const days = convocation && normalizeCalendarDate(convocation.dateEpreuve)
    ? daysUntil(convocation.dateEpreuve)
    : null;

  const overviewCards: OverviewCard[] = [
    {
      key: 'dossier',
      label: t('cdash.card.dossier'),
      value: candidat.statutInscription === 'VALIDE' ? t('cdash.dossier.valide') :
             candidat.statutInscription === 'EN_ATTENTE_VALIDATION' ? t('cdash.dossier.enAttente') :
             candidat.statutInscription === 'REJETE' ? t('cdash.dossier.rejete') : t('cdash.dossier.aCompleter'),
      hint: candidat.statutInscription === 'VALIDE' ? t('cdash.dossier.confirme') : t('cdash.dossier.aFinaliser'),
      tone: 'var(--tile-mint)', Icon: FileCheck,
      dot: candidat.statutInscription === 'VALIDE' ? 'var(--status-green)' :
           candidat.statutInscription === 'REJETE' ? 'var(--status-red)' : 'var(--status-amber)',
    },
    {
      key: 'paiement',
      label: t('cdash.card.paiement'),
      value: candidat.paiement?.statut === 'PAYE'
        ? `${(candidat.paiement.montant || 25000).toLocaleString('fr-FR')} Ar`
        : candidat.paiement?.statut === 'EN_COURS' ? t('cdash.paiement.enCours') : t('cdash.paiement.nonPaye'),
      hint: candidat.paiement?.modePaiement ? `${candidat.paiement.modePaiement} · ${t('cdash.paiement.regle')}` : t('cdash.paiement.aRegler'),
      tone: 'var(--tile-sun)', Icon: Award,
      dot: candidat.paiement?.statut === 'PAYE' ? 'var(--status-green)' : 'var(--status-amber)',
    },
    {
      key: 'convocation',
      label: t('cdash.card.convocation'),
      value: convocation ? t('cdash.convocation.prete') : t('cdash.convocation.nonDisponible'),
      hint: convocation
        ? `${t('cdash.convocation.qrGenere')} · ${formatDayMonth(new Date(convocation.dateEpreuve), lang)}`
        : t('cdash.convocation.enAttenteGeneration'),
      tone: 'var(--tile-lila)', Icon: QrCode,
      dot: convocation ? 'var(--status-violet)' : 'var(--ink-mute)',
    },
  ];

  const docs: DocumentItem[] = [
    { key: 'photoIdentite',    label: t('cdash.documents.photoIdentite'), Icon: IdCard,    state: (typeof candidat.piecesJustificatives?.photoIdentite === 'string' ? 'valide' : candidat.piecesJustificatives?.photoIdentite?.status) ?? 'manquant' },
    { key: 'acteNaissance',    label: t('cdash.documents.acteNaissance'), Icon: FileCheck, state: (typeof candidat.piecesJustificatives?.acteNaissance === 'string' ? 'valide' : candidat.piecesJustificatives?.acteNaissance?.status) ?? 'manquant' },
    { key: 'photoSupp',        label: t('cdash.documents.photoSupp'),     Icon: IdCard,    state: (typeof candidat.piecesJustificatives?.photoSupp === 'string' ? 'valide' : candidat.piecesJustificatives?.photoSupp?.status) ?? 'manquant' },
  ];

  const handleDownload = async () => {
    if (!convocation) {
      toast.error(t('cdash.toast.convocationIndisponible'));
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
      toast.success(t('cdash.toast.convocationTelechargee'));
    } catch (error) {
      toast.error(getDownloadErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting + phase tracker */}
      <section style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 data-testid="welcome-title" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.2, color: 'var(--ink)', lineHeight: 1.05 }}>
            {t('cdash.greeting')} {user.prenom || candidat.user.prenom || user.nom}
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 8 }}>
            {candidat.examen ?? t('cdash.session')} — {t('cdash.matricule')} <strong style={{ color: 'var(--ink)' }}>{candidat.numeroMatricule ?? '—'}</strong>
            {days !== null && days > 0 && (
              <>
                {' '}· {t('cdash.daysLeft.before')} <strong style={{ color: 'var(--ink)' }}>{days} {days > 1 ? t('cdash.daysLeft.days') : t('cdash.daysLeft.day')}</strong> {t('cdash.daysLeft.after')}
              </>
            )}
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
          <SectionHeader title={t('cdash.status.title')} cta={{ label: t('cdash.status.seeAll'), href: '/mon-dossier' }} />
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {overviewCards.map((c) => (
              <div key={c.key} className="card card-hoverable" style={{ padding: 18 }} data-testid={`status-${c.key}`}>
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
              <QrCode size={16} strokeWidth={2.4} color="var(--ink)" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-dark)' }}>{t('cdash.hero.title')}</div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.15, color: 'var(--ink-dark)' }}>
            {t('cdash.hero.headline')}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-dark-soft)', lineHeight: 1.4 }}>
            {t('cdash.hero.subtitle')}
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
            {downloading ? t('cdash.hero.preparing') : t('cdash.hero.download')} <ArrowUpRight size={15} strokeWidth={2.4} />
          </button>
        </Link>
      </section>

      {/* Mid row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr) 312px', gap: 22 }}>
        {/* Hours */}
        <div className="card" style={{ padding: 22 }} data-testid="hours-activity-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>{t('cdash.hours.title')}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 50, background: 'var(--lime)' }}>
                  <ArrowUpRight size={13} strokeWidth={2.6} />
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  <strong style={{ color: 'var(--ink)' }}>{revisionData.trend || '---'}</strong>
                </span>
              </div>
            </div>
            <select
              data-testid="hours-period"
              value={revisionPeriod}
              onChange={(e) => setRevisionPeriod(e.target.value as 'Hebdomadaire' | 'Mensuel')}
              style={{ background: 'var(--bg-soft)', border: 'none', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="Hebdomadaire">{t('cdash.hours.weekly')}</option>
              <option value="Mensuel">{t('cdash.hours.monthly')}</option>
            </select>
          </div>
          {revisionData.data.length > 0 ? (
            <BarChart data={revisionData.data} />
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: 13, background: 'var(--bg-soft)', borderRadius: 14 }}>
              {revisionData.summary}
            </div>
          )}
          {revisionData.data.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-soft)' }}>
              {revisionData.summary}
            </div>
          )}
        </div>

        {/* Schedule from planning */}
        <div className="card" style={{ padding: 22 }} data-testid="schedule-card">
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4, marginBottom: 14 }}>{t('cdash.schedule.title')}</h3>
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
                      {s.type === 'EPREUVE' ? t('cdash.schedule.epreuve') : t('cdash.schedule.revision')} · {formatWeekdayDayMonth(new Date(s.date), lang)} · {s.heureDebut}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--ink-mute)" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="card" style={{ padding: 20 }} data-testid="calendar-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button className="btn-icon" style={{ width: 28, height: 28 }} aria-label={t('cdash.calendar.prevMonth')}><ChevronLeft size={15} /></button>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{formatMonthYear(examDate, lang)}</div>
            <button className="btn-icon" style={{ width: 28, height: 28 }} aria-label={t('cdash.calendar.nextMonth')}><ChevronRight size={15} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {WEEKDAYS_MIN[lang].map((d, i) => (
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
                {t('cdash.calendar.nextExam')}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>
                {formatDayMonth(new Date(nextExam.date), lang)} · {nextExam.matiere}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 22 }}>
        <div className="card" style={{ padding: 22 }} data-testid="documents-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>{t('cdash.documents.title')}</h3>
            <Link href="/mon-dossier" data-testid="upload-doc-btn" className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>
              {t('cdash.documents.upload')}
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {docs.map((d) => {
              const tone =
                d.state === 'valide' ? 'var(--tile-mint)' :
                d.state === 'attente' ? 'var(--tile-sun)' : 'var(--tile-rose)';
              const badge =
                d.state === 'valide'  ? <span className="badge badge-green"><CheckCircle2 size={11} /> {t('cdash.doc.valide')}</span> :
                d.state === 'attente' ? <span className="badge badge-amber"><Clock3 size={11} /> {t('cdash.doc.enAttente')}</span> :
                                        <span className="badge badge-red">{t('cdash.doc.aFournir')}</span>;
              return (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: 'var(--bg-soft)' }}>
                  <div className="tile" style={{ background: tone }}>
                    <d.Icon size={20} strokeWidth={2} color="var(--ink)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                      {d.state === 'valide' ? t('cdash.doc.valide') : d.state === 'attente' ? t('cdash.doc.enVerification') : t('cdash.doc.aTeleverser')}
                    </div>
                  </div>
                  {badge}
                </div>
              );
            })}
          </div>
        </div>

        {/* Centre d'examen */}
        <div className="card" data-testid="center-card" style={{ padding: 22, background: 'var(--bg-card)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="tile tile-sm" style={{ background: 'var(--lime)' }}>
              <MapPin size={17} strokeWidth={2.2} color="var(--ink)" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>{t('cdash.centre.title')}</div>
          </div>

          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>
            {candidat.centreAffecte?.nom ?? t('cdash.centre.enCoursAffectation')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
            {candidat.centreAffecte
              ? `${candidat.centreAffecte.ville} · ${t('cdash.centre.salle')} ${candidat.centreAffecte.salle} · ${t('cdash.centre.place')} ${candidat.centreAffecte.numeroPlace}`
              : t('cdash.centre.sectorisationAuto')}
          </div>

          <div style={{
            marginTop: 16, height: 220, borderRadius: 14,
            background: candidat.centreAffecte?.photo
              ? 'var(--bg-soft)'
              : 'radial-gradient(circle at 30% 60%, rgba(205,245,100,0.18), transparent 40%), linear-gradient(135deg, #20232B 0%, #1B1E25 100%)',
            border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden',
            cursor: candidat.centreAffecte?.photo ? 'zoom-in' : 'default',
          }}
          onClick={() => { if (candidat.centreAffecte?.photo) setShowCentrePhoto(true); }}
          >
            {candidat.centreAffecte?.photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveFileUrl(candidat.centreAffecte.photo)}
                  alt={`${t('cdash.centre.title')} ${candidat.centreAffecte?.nom || ''}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  background: 'rgba(0,0,0,0.55)', color: '#fff',
                  fontSize: 11, fontWeight: 600, padding: '5px 10px',
                  borderRadius: 999, display: 'flex', alignItems: 'center', gap: 5,
                  backdropFilter: 'blur(4px)',
                }}>
                  <ZoomIn size={12} /> {t('cdash.centre.agrandir')}
                </div>
              </>
            ) : (
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
            )}
          </div>

          <button className="btn-lime" style={{ marginTop: 14, padding: '9px 18px', fontSize: 13 }} data-testid="itinerary-btn" onClick={() => router.push('/itineraire')}>
            {t('cdash.centre.itineraire')} <ArrowUpRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </section>

      {/* Lightbox photo du centre */}
      {showCentrePhoto && candidat.centreAffecte?.photo && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowCentrePhoto(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10,10,12,0.88)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setShowCentrePhoto(false)}
            aria-label={t('cdash.centre.fermer')}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveFileUrl(candidat.centreAffecte.photo)}
            alt={`${t('cdash.centre.title')} ${candidat.centreAffecte?.nom || ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain',
              borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center',
          }}>
            {candidat.centreAffecte?.nom}
            {candidat.centreAffecte?.ville && (
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}> · {candidat.centreAffecte.ville}</span>
            )}
          </div>
        </div>
      )}
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
            stroke="rgba(20,23,28,0.06)" strokeDasharray="3 5" />
        ))}
        {data.map((d, i) => {
          const x = padX + i * ((W - padX * 2) / data.length) + 6;
          const y = yScale(d.v);
          const h = H - padY - y;
          const fill = d.highlight ? 'var(--lime)' : 'var(--ink)';
          return (
            <g key={d.d}>
              <rect x={x} y={y} width={barW} height={h} rx={6} fill={fill} />
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink-mute)" fontFamily="var(--font-display)">{d.d}</text>
            </g>
          );
        })}
      </svg>
      {highlightIdx >= 0 && data[highlightIdx].ts && (
        <div style={{ position: 'absolute', left: `calc(${(highlightIdx + 0.5) * (100 / data.length)}% - 70px)`, top: 0,
          background: 'var(--ink)', color: 'var(--ink-dark-soft)', padding: '6px 10px', borderRadius: 10,
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