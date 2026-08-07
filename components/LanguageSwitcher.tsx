'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES, Lang } from '@/lib/i18n/translations';

function FlagIcon({ code }: { code: Lang }) {
  const common = { width: 22, height: 16, style: { borderRadius: 3, display: 'block', flexShrink: 0 } as React.CSSProperties };

  if (code === 'fr') {
    return (
      <svg viewBox="0 0 3 2" {...common}>
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    );
  }

  if (code === 'en') {
    return (
      <svg viewBox="0 0 60 40" {...common}>
        <rect width="60" height="40" fill="#00247D" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#CF142B" strokeWidth="3" />
        <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="13" />
        <path d="M30,0 V40 M0,20 H60" stroke="#CF142B" strokeWidth="8" />
      </svg>
    );
  }

  // Madagascar
  return (
    <svg viewBox="0 0 3 2" {...common}>
      <rect width="1" height="2" x="0" fill="#FFFFFF" />
      <rect width="2" height="1" x="1" y="0" fill="#FC3D32" />
      <rect width="2" height="1" x="1" y="1" fill="#007E3A" />
    </svg>
  );
}

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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <FlagIcon code={current.code} />
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
              <FlagIcon code={l.code} />
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}