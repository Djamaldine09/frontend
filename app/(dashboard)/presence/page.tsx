'use client';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { presenceAPI, examensAPI, Examen } from '@/lib/api';
import { QrCode, ShieldAlert, CheckCircle2, Download, ScanLine } from 'lucide-react';

export default function PresencePage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [selectedExamen, setSelectedExamen] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowed = user?.role === 'SURVEILLANT' || user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  useEffect(() => {
    if (!allowed) return;
    examensAPI.lister().then((r) => {
      setExamens(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
  }, [allowed]);

  const loadHistory = async () => {
    if (!selectedExamen) return;
    try {
      const r = await presenceAPI.getHistory(selectedExamen);
      setHistory(Array.isArray((r as any).data) ? (r as any).data : []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => { loadHistory(); }, [selectedExamen]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setScanning(true);
    try {
      const r = await presenceAPI.scan(qrInput.trim());
      const data: any = (r as any).data;
      toast.success(`Présence enregistrée : ${data?.candidat?.prenom || ''} ${data?.candidat?.nom || ''}`);
      setQrInput('');
      inputRef.current?.focus();
      loadHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR invalide ou expiré');
    } finally {
      setScanning(false);
    }
  };

  const handleExport = async () => {
    if (!selectedExamen) {
      toast.error('Sélectionnez un examen');
      return;
    }
    try {
      const r = await presenceAPI.export(selectedExamen);
      const url = window.URL.createObjectURL(new Blob([(r as any).data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences-${selectedExamen}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export indisponible');
    }
  };

  if (!allowed) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', gap: 14 }}>
        <ShieldAlert size={20} color="var(--status-red)" />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Accès refusé</h1>
          <p style={{ color: 'var(--ink-soft)' }}>Réservé aux surveillants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="presence-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Présences</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>Émargement par scan QR — temps réel</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 22, marginBottom: 22 }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ScanLine size={18} /> Scanner un QR de convocation
          </h3>
          <form onSubmit={handleScan} style={{ display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              className="input-field"
              data-testid="presence-qr-input"
              placeholder="Collez ou tapez le code QR…"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-lime" disabled={scanning} data-testid="presence-scan-btn">
              <CheckCircle2 size={15} /> {scanning ? 'Validation…' : 'Valider'}
            </button>
          </form>
          <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 10 }}>
            Astuce : utilisez un lecteur USB de QR pour saisir automatiquement le code.
          </p>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Filtrer par examen</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="input-field" data-testid="presence-examen-select" value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)}>
              <option value="">— Tous —</option>
              {examens.map((ex) => <option key={ex._id} value={ex._id}>{ex.titre}</option>)}
            </select>
            <button className="btn-ghost" onClick={handleExport} disabled={!selectedExamen} data-testid="presence-export-btn">
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: '1px solid var(--ink-line)', display: 'flex', justifyContent: 'space-between' }}>
          <strong>Historique des émargements</strong>
          <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{history.length} entrée(s)</span>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            <QrCode size={32} style={{ marginBottom: 8 }} /><div>Aucun émargement encore</div>
          </div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink-line)' }}>
                {['Candidat', 'Examen', 'Centre', 'Heure'].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((p, i) => (
                <tr key={p._id || i} style={{ borderBottom: i < history.length - 1 ? '1px solid var(--ink-line)' : 'none' }}>
                  <td style={{ padding: '12px 18px' }}>{p.candidat?.prenom} {p.candidat?.nom || '—'}</td>
                  <td style={{ padding: '12px 18px' }}>{p.examen?.titre || '—'}</td>
                  <td style={{ padding: '12px 18px' }}>{p.centre?.nom || '—'}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>{p.scannedAt ? new Date(p.scannedAt).toLocaleTimeString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
