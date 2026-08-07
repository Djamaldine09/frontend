'use client';
import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI, resolveFileUrl } from '@/lib/api';
import { Camera, Trash2, User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });

  if (!user) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{t('profil.notConnected.title')}</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{t('profil.notConnected.subtitle')}</p>
      </div>
    );
  }

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('profil.toast.invalidFormat'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profil.toast.tooLarge'));
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const res = await authAPI.uploadPhoto(file);
      updateUser({ photo: res.data.user.photo });
      toast.success(t('profil.toast.photoUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profil.toast.photoUploadError'));
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!user.photo) return;
    setDeleting(true);
    try {
      await authAPI.deletePhoto();
      updateUser({ photo: undefined });
      toast.success(t('profil.toast.photoDeleted'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profil.toast.photoDeleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      toast.error(t('profil.toast.requiredFields'));
      return;
    }

    setSaving(true);
    try {
      const res = await authAPI.updateMe({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim() || undefined,
      });
      updateUser(res.data.user);
      toast.success(t('profil.toast.profileUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profil.toast.profileUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = previewUrl || resolveFileUrl(user.photo);

  return (
    <div className="animate-fade-in" data-testid="profil-page" style={{ display: 'grid', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>{t('profil.title')}</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
          {t('profil.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 22 }}>
        {/* Formulaire d'informations */}
        <section className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={20} />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800 }}>{t('profil.personalInfo.title')}</h2>
              <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
                {t('profil.personalInfo.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveInfo} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={t('profil.field.firstName')}>
                <input
                  className="input-pill"
                  style={{ width: '100%' }}
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  data-testid="profil-prenom"
                  required
                />
              </Field>
              <Field label={t('profil.field.lastName')}>
                <input
                  className="input-pill"
                  style={{ width: '100%' }}
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  data-testid="profil-nom"
                  required
                />
              </Field>
            </div>

            <Field label={t('profil.field.email')} icon={<Mail size={14} />}>
              <input
                type="email"
                className="input-pill"
                style={{ width: '100%' }}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                data-testid="profil-email"
                required
              />
            </Field>

            <Field label={t('profil.field.phone')} icon={<Phone size={14} />}>
              <input
                className="input-pill"
                style={{ width: '100%' }}
                value={form.telephone}
                onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                placeholder="+261 34 00 000 00"
                data-testid="profil-telephone"
              />
            </Field>

            <button
              type="submit"
              className="btn-lime"
              disabled={saving}
              style={{ justifySelf: 'start', marginTop: 4 }}
              data-testid="profil-save"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? t('profil.saving') : t('profil.save')}
            </button>
          </form>
        </section>

        {/* Carte photo de profil */}
        <aside className="card" style={{ padding: 22, display: 'grid', gap: 16, alignContent: 'start' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800 }}>{t('profil.photo.title')}</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
              {t('profil.photo.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'var(--ink)', color: 'var(--lime)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 800, overflow: 'hidden',
                position: 'relative', border: '3px solid var(--bg-soft)',
              }}
              data-testid="profil-avatar"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${user.prenom} ${user.nom}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploading ? 0.5 : 1 }}
                />
              ) : (
                <>{user.prenom?.[0]?.toUpperCase()}{user.nom?.[0]?.toUpperCase()}</>
              )}
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <Loader2 size={22} className="animate-spin" color="var(--lime)" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              data-testid="profil-photo-input"
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-lime"
                onClick={handlePickPhoto}
                disabled={uploading}
                data-testid="profil-photo-upload"
              >
                <Camera size={14} />
                {user.photo ? t('profil.photo.change') : t('profil.photo.add')}
              </button>
              {user.photo && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleDeletePhoto}
                  disabled={deleting || uploading}
                  data-testid="profil-photo-delete"
                >
                  <Trash2 size={14} />
                  {deleting ? t('profil.photo.deleting') : t('profil.photo.delete')}
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--ink-line)', paddingTop: 14, display: 'grid', gap: 8 }}>
            <Row label={t('profil.role')} value={t(`role.${user.role}`)} />
            <Row label={t('profil.memberSince')} value={new Date(user.createdAt).toLocaleDateString('fr-FR')} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}{label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}