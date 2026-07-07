'use client';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import { useAuth } from '@/contexts/AuthContext';
import { presenceAPI, examensAPI, Examen } from '@/lib/api';
import { QrCode, ShieldAlert, CheckCircle2, Download, ScanLine } from 'lucide-react';

interface PresenceHistoryItem {
  _id?: string;
  candidat?: { prenom?: string; nom?: string; user?: { prenom?: string; nom?: string; numeroMatricule?: string } };
  examen?: { titre?: string };
  centre?: { nom?: string };
  date?: string;
  heureArrivee?: string;
  statut?: 'PRESENT' | 'ABSENT' | 'RETARD';
}

type BarcodeDetectorConstructorType = new (options: { formats: string[] }) => {
  detect(canvas: HTMLCanvasElement): Promise<Array<{ rawValue?: string }>>;
};

export default function PresencePage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [selectedExamen, setSelectedExamen] = useState('');
  const [history, setHistory] = useState<PresenceHistoryItem[]>([]);
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowed = user?.role === 'SURVEILLANT' || user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';
  const canExport = user?.role === 'SURVEILLANT' || user?.role === 'ADMIN' || user?.role === 'RESPONSABLE';

  useEffect(() => {
    if (!allowed) return;
    examensAPI.lister().then((r) => {
      setExamens(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
  }, [allowed]);

  const loadHistory = async (examenId: string) => {
    try {
      const r = await presenceAPI.getHistory(examenId);
      const data = (r.data as unknown) as PresenceHistoryItem[];
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    if (!selectedExamen) return;

    const load = async () => {
      await loadHistory(selectedExamen);
    };

    void load();
  }, [selectedExamen]);

  const decodeCanvasQr = async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const BarcodeDetectorConstructor = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructorType }).BarcodeDetector;
    if (BarcodeDetectorConstructor) {
      try {
        const detector = new BarcodeDetectorConstructor({ formats: ['qr_code'] });
        const barcodes = await detector.detect(canvas);
        if (barcodes?.[0]?.rawValue) {
          return barcodes[0].rawValue.trim() || null;
        }
      } catch {
        // Fallback to jsQR if the browser detector fails.
      }
    }

    const tryJsQr = (target: HTMLCanvasElement) => {
      const targetCtx = target.getContext('2d');
      if (!targetCtx) return null;
      const imageData = targetCtx.getImageData(0, 0, target.width, target.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      return result?.data?.trim() || null;
    };

    let decoded = tryJsQr(canvas);
    if (decoded) return decoded;

    const scales = [0.75, 0.5, 0.33];
    for (const scale of scales) {
      const scaled = document.createElement('canvas');
      scaled.width = Math.max(100, Math.floor(canvas.width * scale));
      scaled.height = Math.max(100, Math.floor(canvas.height * scale));
      const scaledCtx = scaled.getContext('2d');
      if (!scaledCtx) continue;
      scaledCtx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
      decoded = tryJsQr(scaled);
      if (decoded) return decoded;
    }

    return null;
  };

  const decodeImageFile = async (file: File) => {
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Impossible de charger l’image'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const maxDim = 2048;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    canvas.width = Math.max(100, Math.floor(width * scale));
    canvas.height = Math.max(100, Math.floor(height * scale));
    const ctx = canvas.getContext('2d');
    URL.revokeObjectURL(objectUrl);
    if (!ctx) throw new Error('Impossible de décoder l’image');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return decodeCanvasQr(canvas);
  };

  const decodePdfFile = async (file: File) => {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');

    // Explicitly assign the worker source for same-origin loading in Next.js.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pageCount = Math.min(pdf.numPages, 3);
    const originalViewport = await pdf.getPage(1).then((page: any) => page.getViewport({ scale: 1 }));

    for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      for (const scale of [1.5, 2, 3]) {
        const maxDim = 2500;
        const effectiveScale = Math.min(
          scale,
          maxDim / originalViewport.width,
          maxDim / originalViewport.height
        );
        const viewport = page.getViewport({ scale: effectiveScale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(100, Math.floor(viewport.width));
        canvas.height = Math.max(100, Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const decoded = await decodeCanvasQr(canvas);
        if (decoded) return decoded;
      }
    }

    return null;
  };

  const decodeFileToQr = async (file: File) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return decodePdfFile(file);
    }
    return decodeImageFile(file);
  };

  const submitQrCode = async (qrCode: string) => {
    if (!qrCode.trim()) return;
    setScanning(true);
    try {
      const r = await presenceAPI.scan(qrCode.trim());
      const data = (r.data as unknown) as PresenceHistoryItem;
      toast.success(`Présence enregistrée : ${data?.candidat?.prenom || ''} ${data?.candidat?.nom || ''}`);
      setQrInput('');
      inputRef.current?.focus();
      if (selectedExamen) {
        void loadHistory(selectedExamen);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message as string | undefined)
        : undefined;
      toast.error(errorMessage || 'QR invalide ou expiré');
    } finally {
      setScanning(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    await submitQrCode(qrInput.trim());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileProcessing(true);
    try {
      const decodedQr = await decodeFileToQr(file);
      if (!decodedQr) {
        toast.error('Aucun QR détecté dans ce fichier. Vérifiez que le QR est bien visible.');
        return;
      }
      await submitQrCode(decodedQr);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de lire le QR depuis le fichier.';
      toast.error(message);
    } finally {
      setFileProcessing(false);
      e.target.value = '';
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleExport = async () => {
    if (!selectedExamen) {
      toast.error('Sélectionnez un examen');
      return;
    }

    try {
      const response = await presenceAPI.export(selectedExamen);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences-${selectedExamen}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Export indisponible';
      toast.error(message);
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
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn-outline"
            
            onClick={openFilePicker} disabled={fileProcessing}>
              <Download size={14} /> Importer convocation
            </button>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              Image ou PDF contenant le QR.
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Filtrer par examen</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="input-field" data-testid="presence-examen-select" value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)}>
              <option value="">— Tous —</option>
              {examens.map((ex) => <option key={ex._id} value={ex._id}>{ex.titre}</option>)}
            </select>
            <button type="button" className="btn-ghost" onClick={handleExport} disabled={!selectedExamen || !canExport} data-testid="presence-export-btn">
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
                {['Candidat', 'Examen', 'Centre', 'Heure', 'Statut'].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((p, i) => (
                <tr key={p._id || i} style={{ borderBottom: i < history.length - 1 ? '1px solid var(--ink-line)' : 'none' }}>
                  <td style={{ padding: '12px 18px' }}>
                    {p.candidat?.prenom || p.candidat?.user?.prenom ? `${p.candidat?.prenom || p.candidat?.user?.prenom} ${p.candidat?.nom || p.candidat?.user?.nom || ''}`.trim() : '—'}
                  </td>
                  <td style={{ padding: '12px 18px' }}>{p.examen?.titre || '—'}</td>
                  <td style={{ padding: '12px 18px' }}>{p.centre?.nom || '—'}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>
                    {p.heureArrivee || (p.date ? new Date(p.date).toLocaleTimeString('fr-FR') : '—')}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    {p.statut || 'PRESENT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
