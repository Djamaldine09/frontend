'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/lib/i18n/translations';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn-icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('topbar.language')}
        title={t('topbar.language')}
        data-testid="topbar-language"
        style={{ fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontSize: 17, lineHeight: 1 }}>{current.flag}</span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'var(--bg-card)', border: '1px solid var(--ink-line)',
            borderRadius: 12, padding: 6, minWidth: 168,
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)', zIndex: 200,
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              data-testid={`lang-option-${l.code}`}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 10px', borderRadius: 8, border: 'none',
                background: l.code === lang ? 'var(--bg-soft)' : 'transparent',
                color: 'var(--ink)', fontSize: 13.5, fontWeight: l.code === lang ? 700 : 500,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}