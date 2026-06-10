'use client';
import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User as UserIcon, GraduationCap, Phone, FileUp,
  CheckCircle2, Clock3, AlertTriangle, X, Save, Upload,
  IdCard, FileText, BookOpen, AlertCircle,
} from 'lucide-react';
import { useCandidatData } from '@/lib/useCandidatData';
import { candidatAPI, CandidatMe } from '@/lib/api';

type DocKey = 'photoIdentite' | 'acteNaissance' | 'diplomePrecedent';

const DOC_META: Record<DocKey, { label: string; hint: string; Icon: any; accept: string }> = {
  photoIdentite:    { label: "Pièce d'identité",   hint: 'CIN ou passeport — JPG/PNG/PDF, max 5 Mo', Icon: IdCard,        accept: 'image/*,application/pdf' },
  acteNaissance:    { label: 'Acte de naissance',  hint: 'Copie certifiée — PDF, max 5 Mo',          Icon: FileText,      accept: 'application/pdf,image/*' },
  diplomePrecedent: { label: 'Diplôme précédent',  hint: 'BEPC ou équivalent — PDF, max 5 Mo',       Icon: GraduationCap, accept: 'application/pdf,image/*' },
};

export default function MonDossierPage() {
  const { data, loading, error, refetch } = useCandidatData();
  const [form, setForm] = useState<Partial<CandidatMe>>({});
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'identite' | 'scolarite' | 'coords' | 'pieces'>('identite');

  // hydrate form once we have data
  useEffect(() => {
    if (data?.candidat) setForm(data.candidat);
  }, [data?.candidat]);

  if (loading) {
    return <div className="card" style={{ height: 400, background: 'var(--bg-soft)' }} data-testid="dossier-loading" />;
  }

  if (!data) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="tile tile-sm" style={{ background: 'var(--tile-sun)', flexShrink: 0 }}>
          <AlertCircle size={17} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Dossier candidat introuvable</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
            {error || 'Aucun dossier réel n’est enregistré pour ce compte.'}
          </p>
        </div>
      </div>
    );
  }

  const { candidat } = data;

  const set = <K extends keyof CandidatMe>(key: K, value: CandidatMe[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await candidatAPI.update(form);
      toast.success('Dossier enregistré');
      await refetch();
    } catch {
      toast.error("Sauvegarde impossible — backend indisponible.");
    } finally {
      setSaving(false);
    }
  };

  const completion = computeCompletion(form, candidat);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/dashboard" data-testid="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'inherit', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Tableau de bord
        </Link>
        <span style={{ color: 'var(--ink-mute)' }}>/</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Mon dossier</span>
      </div>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <h1 data-testid="dossier-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>Mon dossier d'inscription</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 6 }}>
            Complétez vos informations et téléversez les pièces justificatives.
          </p>
        </div>
        <button className="btn-lime" onClick={handleSave} disabled={saving} data-testid="save-btn">
          {saving ? 'Enregistrement…' : <><Save size={15} /> Enregistrer</>}
        </button>
      </header>

      {/* Progress */}
      <div className="card" style={{ padding: 20 }} data-testid="completion-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Complétion du dossier</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: completion >= 100 ? 'var(--status-green)' : 'var(--ink)' }}>
            {completion}%
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-soft)', overflow: 'hidden' }}>
          <div data-testid="completion-bar" style={{
            width: `${completion}%`, height: '100%',
            background: 'var(--lime)', transition: 'width 0.4s ease',
            borderRadius: 999,
          }} />
        </div>
      </div>

      {/* Main grid: left nav + content */}
      <section style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 22 }}>
        {/* Section nav */}
        <aside className="card" style={{ padding: 14, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {([
            { key: 'identite',  label: 'Identité',      Icon: UserIcon },
            { key: 'scolarite', label: 'Scolarité',     Icon: GraduationCap },
            { key: 'coords',    label: 'Coordonnées',   Icon: Phone },
            { key: 'pieces',    label: 'Pièces',        Icon: FileUp },
          ] as const).map(s => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSection(s.key)}
              data-testid={`section-${s.key}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12,
                background: activeSection === s.key ? 'var(--lime)' : 'transparent',
                color: 'var(--ink)', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: activeSection === s.key ? 700 : 500,
                fontSize: 14, textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => { if (activeSection !== s.key) (e.currentTarget as HTMLElement).style.background = 'var(--bg-soft)'; }}
              onMouseLeave={(e) => { if (activeSection !== s.key) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <s.Icon size={17} strokeWidth={2} />
              {s.label}
            </button>
          ))}
        </aside>

        {/* Section content */}
        <div className="card" style={{ padding: 28 }}>
          {activeSection === 'identite' && (
            <Section title="Identité" subtitle="Informations personnelles">
              <Grid cols={2}>
                <Field label="Nom" value={candidat.user.nom} disabled />
                <Field label="Prénom" value={candidat.user.prenom} disabled />
                <Field label="Date de naissance" type="date" value={form.dateNaissance ?? ''} onChange={v => set('dateNaissance', v)} testId="input-dateNaissance" />
                <Field label="Lieu de naissance" value={form.lieuNaissance ?? ''} onChange={v => set('lieuNaissance', v)} testId="input-lieuNaissance" />
                <Select label="Genre" value={form.genre ?? ''} onChange={v => set('genre', v as 'M'|'F')} options={[
                  { value: '', label: '— Sélectionner —' },
                  { value: 'M', label: 'Masculin' },
                  { value: 'F', label: 'Féminin' },
                ]} testId="input-genre" />
                <Field label="Numéro CIN" value={form.cin ?? ''} onChange={v => set('cin', v)} placeholder="101 000 000 000" testId="input-cin" />
              </Grid>
            </Section>
          )}

          {activeSection === 'scolarite' && (
            <Section title="Scolarité" subtitle="Parcours académique">
              <Grid cols={2}>
                <Select label="Examen visé" value={form.examen ?? ''} onChange={v => set('examen', v)} options={[
                  { value: '', label: '— Sélectionner —' },
                  { value: 'Baccalauréat 2025', label: 'Baccalauréat 2025' },
                  { value: 'BEPC 2025', label: 'BEPC 2025' },
                  { value: 'CEPE 2025', label: 'CEPE 2025' },
                ]} testId="input-examen" />
                <Select label="Série / Filière" value={form.serieFiliere ?? ''} onChange={v => set('serieFiliere', v)} options={[
                  { value: '', label: '— Sélectionner —' },
                  { value: 'Série A', label: 'Série A — Littéraire' },
                  { value: 'Série C', label: 'Série C — Math-Physique' },
                  { value: 'Série D', label: 'Série D — Math-SVT' },
                  { value: 'Série L', label: 'Série L — Langues' },
                  { value: 'Série S', label: 'Série S — Scientifique' },
                  { value: 'Générale', label: 'Générale' },
                ]} testId="input-serie" />
                <Field label="Établissement précédent" value={form.etablissementPrecedent ?? ''} onChange={v => set('etablissementPrecedent', v)} placeholder="Lycée Jean Joseph Rabearivelo" testId="input-etablissement" />
                <Select label="Mention obtenue" value={form.mentionPrecedente ?? ''} onChange={v => set('mentionPrecedente', v)} options={[
                  { value: '', label: '— Sélectionner —' },
                  { value: 'Passable', label: 'Passable' },
                  { value: 'Assez Bien', label: 'Assez Bien' },
                  { value: 'Bien', label: 'Bien' },
                  { value: 'Très Bien', label: 'Très Bien' },
                ]} testId="input-mention" />
              </Grid>
            </Section>
          )}

          {activeSection === 'coords' && (
            <Section title="Coordonnées" subtitle="Comment vous joindre">
              <Grid cols={1}>
                <Field label="Adresse complète" value={form.adresse ?? ''} onChange={v => set('adresse', v)} placeholder="Lot II A 32, Antananarivo 101" testId="input-adresse" />
              </Grid>
              <Grid cols={2}>
                <Field label="Téléphone candidat" value={form.telephone ?? ''} onChange={v => set('telephone', v)} placeholder="+261 34 XX XXX XX" testId="input-telephone" />
                <Field label="Email parent / tuteur" type="email" value={form.emailParent ?? ''} onChange={v => set('emailParent', v)} placeholder="parent@example.mg" testId="input-emailParent" />
              </Grid>
            </Section>
          )}

          {activeSection === 'pieces' && (
            <Section title="Pièces justificatives" subtitle="Téléversez les documents requis (PDF ou image, max 5 Mo)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(Object.keys(DOC_META) as DocKey[]).map(key => (
                  <UploadZone
                    key={key}
                    docKey={key}
                    current={candidat.piecesJustificatives[key]}
                    onUploaded={refetch}
                  />
                ))}
              </div>

              <div style={{
                marginTop: 24, padding: 16, borderRadius: 14, background: 'var(--tile-sky)',
                display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink)',
              }}>
                <BookOpen size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Conseil :</strong> les documents au format PDF sont traités plus rapidement.
                  Assurez-vous que tout le contenu est lisible et bien éclairé.
                </div>
              </div>
            </Section>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Subcomponents ---------- */
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink)' }}>{title}</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 4 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </>
  );
}

function Grid({ cols, children }: { cols: 1 | 2; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols === 2 ? '1fr 1fr' : '1fr', gap: 14 }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled, testId }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean; testId?: string;
}) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        className="input-field"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={testId}
        style={disabled ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, testId }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; testId?: string;
}) {
  return (
    <div>
      <label>{label}</label>
      <select
        className="input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        data-testid={testId}
        style={{ appearance: 'none', cursor: 'pointer' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function UploadZone({ docKey, current, onUploaded }: {
  docKey: DocKey;
  current?: { url: string; status: 'valide' | 'attente' | 'manquant'; uploadedAt?: string };
  onUploaded: () => void;
}) {
  const meta = DOC_META[docKey];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const status = current?.status ?? 'manquant';
  const tone = status === 'valide' ? 'var(--tile-mint)' :
               status === 'attente' ? 'var(--tile-sun)' : 'var(--tile-rose)';

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5 Mo)');
      return;
    }
    setUploading(true);
    setProgress(0);
    // Fake progress for UX (real lib would use onUploadProgress)
    const tick = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 120);
    try {
      await candidatAPI.uploadDocument(docKey, file);
      setProgress(100);
      toast.success(`${meta.label} téléversé`);
      onUploaded();
    } catch {
      toast.error('Téléversement impossible — backend indisponible.');
    } finally {
      clearInterval(tick);
      setTimeout(() => { setUploading(false); setProgress(0); }, 400);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div data-testid={`upload-zone-${docKey}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: 18, borderRadius: 16,
        background: dragging ? 'var(--tile-mint)' : 'var(--bg-soft)',
        border: `2px dashed ${dragging ? 'var(--status-green)' : 'transparent'}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div className="tile tile-lg" style={{ background: tone }}>
        <meta.Icon size={24} strokeWidth={2} color="var(--ink)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{meta.label}</div>
          {status === 'valide'  && <span className="badge badge-green"><CheckCircle2 size={11} /> Validé</span>}
          {status === 'attente' && <span className="badge badge-amber"><Clock3 size={11} /> En attente</span>}
          {status === 'manquant'&& <span className="badge badge-red"><AlertTriangle size={11} /> À fournir</span>}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 3 }}>
          {uploading ? 'Téléversement en cours…' : meta.hint}
          {current?.uploadedAt && !uploading && <> · ajouté le {new Date(current.uploadedAt).toLocaleDateString('fr-FR')}</>}
        </div>

        {uploading && (
          <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: 'var(--ink-line)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--lime)', transition: 'width 0.2s ease' }} />
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn-dark"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        data-testid={`upload-btn-${docKey}`}
        style={{ padding: '9px 16px', fontSize: 13, gap: 6 }}
      >
        {status === 'manquant' ? <><Upload size={14} /> Téléverser</> : <><FileUp size={14} /> Remplacer</>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={meta.accept}
        onChange={onPick}
        style={{ display: 'none' }}
        data-testid={`upload-input-${docKey}`}
      />
    </div>
  );
}

function computeCompletion(form: Partial<CandidatMe>, real: CandidatMe): number {
  const checks: boolean[] = [
    !!form.dateNaissance,
    !!form.lieuNaissance,
    !!form.genre,
    !!form.cin,
    !!form.examen,
    !!form.serieFiliere,
    !!form.etablissementPrecedent,
    !!form.adresse,
    !!form.telephone,
    real.piecesJustificatives.photoIdentite?.status === 'valide',
    real.piecesJustificatives.acteNaissance?.status === 'valide',
    real.piecesJustificatives.diplomePrecedent?.status === 'valide',
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
