import React, { useState } from 'react';
import type { Language } from '../types';
import { t } from '../data/i18n';

interface HeroProps {
  language: Language;
  onSearch: (query: string) => void;
  onSelectTool: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ language, onSearch, onSelectTool }) => {
  const [val, setVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim()) {
      onSearch(val.trim());
    }
  };

  const quickPicks = [
    { id: 'p01', label: language === 'hi' ? 'पीडीएफ मर्जर' : 'PDF Merger' },
    { id: 'p03', label: language === 'hi' ? 'पीडीएफ कंप्रेसर' : 'PDF Compressor' },
    { id: 'i01', label: language === 'hi' ? 'इमेज रीसाइज़र' : 'Image Resizer' },
    { id: 'i02', label: language === 'hi' ? 'इमेज कंप्रेसर' : 'Image Compressor' },
    { id: 'c04', label: language === 'hi' ? 'उम्र कैलकुलेटर' : 'Age Calculator' },
    { id: 't01', label: language === 'hi' ? 'वर्ड काउंटर' : 'Word Counter' },
    { id: 'd01', label: 'JSON Formatter' },
    { id: 'd03', label: 'Base64' },
    { id: 'c07', label: language === 'hi' ? 'ईएमआई कैलकुलेटर' : 'EMI Calculator' },
    { id: 'd08', label: language === 'hi' ? 'पासवर्ड जनरेटर' : 'Password Generator' },
    { id: 't28', label: language === 'hi' ? 'टेक्स्ट टू स्पीच' : 'Text to Speech' },
    { id: 'pr07', label: language === 'hi' ? 'टाइपिंग टेस्ट' : 'Typing Test' },
  ];

  return (
    <div className="hero" id="heroSection">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span>{t('hero.titleMain', language) || 'All-in-One Online Tools'} </span>
            <span className="accent">{t('hero.titleAccent', language) || 'for Everyone'}</span>
          </h1>
          <p className="hero-sub">
            {t('hero.sub', language) ||
              '218+ free, browser-based tools for text, images, calculators and developers to make your work easier, faster and smarter — no sign-ups, no AI, no uploads to a server.'}
          </p>

          <form className="hero-search" onSubmit={handleSubmit}>
            <input
              type="search"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={t('hero.searchPlaceholder', language) || 'Search tools… try “resize”, “json”, “emi”, “base64”…'}
              aria-label="Search tools"
            />
            <button className="hero-search-btn" type="submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>{t('hero.searchBtn', language) || 'Search'}</span>
            </button>
          </form>

          {/* Quick Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            <span style={{ fontSize: '12px', color: '#93A4C8', fontWeight: 600 }}>Popular:</span>
            {quickPicks.map((pick) => (
              <button
                key={pick.id}
                type="button"
                onClick={() => onSelectTool(pick.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '999px',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {pick.label}
              </button>
            ))}
          </div>

          <div className="hero-badges">
            <span className="hero-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{t('hero.badge1', language) || '100% Free'}</span>
            </span>
            <span className="hero-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h7l-1 8 11-14h-7z" />
              </svg>
              <span>{t('hero.badge2', language) || 'No AI'}</span>
            </span>
            <span className="hero-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6z" />
              </svg>
              <span>{t('hero.badge3', language) || 'Private & Secure'}</span>
            </span>
            <span className="hero-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
              <span>{t('hero.badge4', language) || 'Works on All Devices'}</span>
            </span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-glow"></div>
          <div className="hero-chip c1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0 0-3L18 6a2.1 2.1 0 0 0-3 0L4.5 16.5z" />
              <path d="m13 7 4 4" />
            </svg>
          </div>
          <div className="hero-chip c2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="m21 16-5.5-5.5a2 2 0 0 0-2.8 0L4 19" />
            </svg>
          </div>
          <div className="hero-chip c3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M8 7h8" />
              <circle cx="8.3" cy="12" r=".9" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none" />
              <circle cx="15.7" cy="12" r=".9" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="hero-chip c4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 7-5 5 5 5" />
              <path d="m16 7 5 5-5 5" />
            </svg>
          </div>
          <div className="hero-art-main">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6 6a2 2 0 1 0 2.8 2.8l6-6a4 4 0 0 0 5.6-5.6l-2.1 2.1-2.8-2.8Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
