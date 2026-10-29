import React from 'react';
import type { PageView, Language } from '../types';
import { STATIC_PAGES } from '../data/staticPagesContent';
import { t } from '../data/i18n';

interface StaticPageViewProps {
  page: PageView;
  language: Language;
  onBack: () => void;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ page, language, onBack }) => {
  const content = STATIC_PAGES[page] || '';

  return (
    <div className="static-page-view" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 0' }}>
      <button type="button" className="tool-back-btn" onClick={onBack} style={{ marginBottom: 20 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>{t('ui.backToAllTools', language) || 'Back to Home'}</span>
      </button>

      <div
        className="static-page-content"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-m)',
          padding: '32px 28px',
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
