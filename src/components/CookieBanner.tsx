import React, { useState, useEffect } from 'react';
import type { Language } from '../types';
import { t } from '../data/i18n';

interface CookieBannerProps {
  language: Language;
  onOpenPrivacy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ language, onOpenPrivacy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('tp-cookie-consent');
      if (!consent) {
        setVisible(true);
      }
    } catch (e) {
      setVisible(false);
    }
  }, []);

  const handleConsent = (val: 'accepted' | 'dismissed') => {
    try {
      localStorage.setItem('tp-cookie-consent', val);
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="tp-cookie-banner" role="region" aria-label="Cookie notice">
      <div className="tp-cookie-inner">
        <p className="tp-cookie-text">
          {t('cookie.text', language) ||
            'We use cookies for ads served by our ad partners and basic, non-personal analytics. Every tool on this site runs 100% in your browser — nothing you type or upload is ever sent to a server.'}{' '}
          <button
            type="button"
            onClick={onOpenPrivacy}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--accent)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              font: 'inherit',
            }}
          >
            {t('cookie.learnMore', language) || 'Learn more'}
          </button>
        </p>
        <div className="tp-cookie-actions">
          <button
            type="button"
            className="tp-cookie-btn tp-cookie-btn-accent"
            onClick={() => handleConsent('accepted')}
          >
            {t('cookie.accept', language) || 'Accept'}
          </button>
          <button
            type="button"
            className="tp-cookie-btn"
            onClick={() => handleConsent('dismissed')}
          >
            {t('cookie.dismiss', language) || 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
