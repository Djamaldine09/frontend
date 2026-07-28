'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { documentsAPI, examensAPI, Examen, resultatsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type CopieAnonyme = {
  _id: string;
  numeroAnonymat: string;
  notes: { matiere: string; valeur: number; coefficient: number }[];
  statutCorrection: 'A_CORRIGER' | 'EN_COURS' | 'TERMINE';
  anonymatLeve: boolean;
  updatedAt: string;
};

const badgeClass: Record<CopieAnonyme['statutCorrection'], string> = {
  A_CORRIGER: 'badge-gray',
  EN_COURS: 'badge-yellow',
  TERMINE: 'badge-green',
};

export default function ResultatsPage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [examenId, setExamenId] = useState('');
  const [copies, setCopies] = useState<CopieAnonyme[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [noteForm, setNoteForm] = useState({ numeroAnonymat: '', matiere: '', valeur: '', coefficient: '' });

  const isAdminFlow = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';
  const isCorrecteur = user?.role === 'CORRECTEUR';
  const isCandidat = user?.role === 'CANDIDAT';
  const selectedExamen = useMemo(() => examens.find((exam) => exam._id === examenId), [examens, examenId]);
  const epreuves = selectedExamen?.epreuves?.filter((item) => item.type === 'EPREUVE') || [];

  useEffect(() => {
    const loadExamens = async () => {
      try {
        const res = await examensAPI.lister();
        setExamens(res.data);
        if (res.data[0]?._id) setExamenId(res.data[0]._id);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Impossible de charger les examens');
      }
    };

    if (!isCandidat) loadExamens();
  }, [isCandidat]);

  useEffect(() => {
    if (!examenId || isCandidat) return;
    void loadCopies(examenId);
  }, [examenId, isCandidat]);

  const loadCopies = async (id = examenId) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await resultatsAPI.listerCopiesAnonymes(id);
      setCopies(res.data);
    } catch (error: any) {
      setCopies([]);
      toast.error(error.response?.data?.message || 'Table d’anonymat non disponible');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnonymat = async () => {
    if (!examenId) return;
    setLoading(true);
    try {
      const res = await resultatsAPI.genererAnonymat(examenId);
      toast.success(`${res.data.total} copies anonymisées`);
      await loadCopies(examenId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur génération anonymat');
    } finally {
      setLoading(false);
    }
  };

  const handleLeverAnonymat = async (force = false) => {
    if (!examenId) return;
    setLoading(true);
    try {
      const res = await resultatsAPI.leverAnonymat(examenId, force);
      toast.success(res.data.message || 'Anonymat levé');
      await loadCopies(examenId);
    } catch (error: any) {
      const data = error.response?.data;
      if (error.response?.status === 409 && data?.count) {
        toast.error(`${data.count} copie(s) incomplète(s). Relance avec force si nécessaire.`);
      } else {
        toast.error(data?.message || 'Erreur levée anonymat');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaisirNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!examenId) return toast.error('Sélectionnez un examen');
    if (!noteForm.numeroAnonymat || !noteForm.matiere || !noteForm.valeur) {
      return toast.error('Numéro anonymat, matière et note sont requis');
    }

    setLoading(true);
    try {
      await resultatsAPI.saisirNoteAnonyme(noteForm.numeroAnonymat.trim(), {
        examenId,
        matiere: noteForm.matiere,
        valeur: Number(noteForm.valeur),
        coefficient: noteForm.coefficient ? Number(noteForm.coefficient) : undefined,
      });
      toast.success('Note anonyme enregistrée');
      setNoteForm({ numeroAnonymat: '', matiere: '', valeur: '', coefficient: '' });
      await loadCopies(examenId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de saisie');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await documentsAPI.telechargerReleve();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'releve-notes.pdf';
      a.click();
      toast.success('Relevé téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  if (isCandidat) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Mes résultats</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, marginBottom: 24 }}>
          Les résultats sont accessibles après publication officielle.
        </p>
        <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
          {downloading ? '...' : 'Télécharger mon relevé PDF'}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            Correction anonyme
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Les correcteurs saisissent les notes uniquement avec le numéro d’anonymat.
          </p>
        </div>

        <select className="input-field" style={{ maxWidth: 320 }} value={examenId} onChange={(e) => setExamenId(e.target.value)}>
          {examens.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.titre}
            </option>
          ))}
        </select>
      </div>

      {isAdminFlow && (
        <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-primary" onClick={handleGenerateAnonymat} disabled={loading || !examenId}>
            Générer table d’anonymat
          </button>
          <button className="btn-ghost" onClick={() => handleLeverAnonymat(false)} disabled={loading || !copies.length}>
            Lever l’anonymat
          </button>
          <button className="btn-ghost" onClick={() => handleLeverAnonymat(true)} disabled={loading || !copies.length}>
            Lever avec force
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {copies.length} copie(s) dans la table
          </span>
        </div>
      )}

      {isCorrecteur && (
        <form className="card" onSubmit={handleSaisirNote} style={{ display: 'grid', gap: 14 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Saisir une note</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 0.8fr 0.8fr', gap: 10 }}>
            <input className="input-field" placeholder="Numéro anonymat" value={noteForm.numeroAnonymat} onChange={(e) => setNoteForm({ ...noteForm, numeroAnonymat: e.target.value })} />
            <select className="input-field" value={noteForm.matiere} onChange={(e) => {
              const epreuve = epreuves.find((item) => item.matiere === e.target.value);
              setNoteForm({ ...noteForm, matiere: e.target.value, coefficient: epreuve?.coefficient ? String(epreuve.coefficient) : noteForm.coefficient });
            }}>
              <option value="">Matière</option>
              {epreuves.map((epreuve) => (
                <option key={epreuve.matiere} value={epreuve.matiere}>
                  {epreuve.matiere}
                </option>
              ))}
            </select>
            <input className="input-field" type="number" min={0} max={20} step={0.25} placeholder="Note /20" value={noteForm.valeur} onChange={(e) => setNoteForm({ ...noteForm, valeur: e.target.value })} />
            <input className="input-field" type="number" min={1} placeholder="Coeff." value={noteForm.coefficient} onChange={(e) => setNoteForm({ ...noteForm, coefficient: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? '...' : 'Enregistrer la note'}
          </button>
        </form>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Copies anonymes</h3>
          <button className="btn-ghost" onClick={() => loadCopies()} disabled={loading || !examenId}>
            Actualiser
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {copies.length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Aucune copie anonyme. L’administration doit générer la table d’anonymat.
            </p>
          )}
          {copies.map((copie) => (
            <div key={copie._id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: 14, border: '1px solid var(--border)', borderRadius: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {copie.numeroAnonymat}
                  </strong>
                  <span className={`badge ${badgeClass[copie.statutCorrection]}`}>{copie.statutCorrection}</span>
                  {copie.anonymatLeve && <span className="badge badge-green">ANONYMAT LEVÉ</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {copie.notes.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Aucune note</span>}
                  {copie.notes.map((note) => (
                    <span key={note.matiere} style={{ fontSize: 12, background: 'var(--bg-hover)', padding: '4px 9px', borderRadius: 6 }}>
                      {note.matiere}: <strong>{note.valeur}/20</strong> coef. {note.coefficient}
                    </span>
                  ))}
                </div>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                {new Date(copie.updatedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
