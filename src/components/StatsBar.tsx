import React from 'react';
import type { Language } from '../types';
import { allTools } from '../data/tools';
import { t } from '../data/i18n';

interface StatsBarProps {
  language: Language;
}

export const StatsBar: React.FC<StatsBarProps> = ({ language }) => {
  const toolCountStr = language === 'hi' ? `${allTools.length}+ टूल्स` : `${allTools.length}+ Tools`;

  return (
    <div className="stats-bar">
      <div className="stats-bar-inner">
        <div className="stats-item">
          <div className="stats-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <div>
            <div className="stats-item-title" id="statsItem1Title">
              {toolCountStr}
            </div>
            <div className="stats-item-sub">
              {t('stats.item1Sub', language) || 'Useful tools for daily needs'}
            </div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h7l-1 8 11-14h-7z" />
            </svg>
          </div>
          <div>
            <div className="stats-item-title">
              {t('stats.item2Title', language) || 'Instant Results'}
            </div>
            <div className="stats-item-sub">
              {t('stats.item2Sub', language) || 'Get results in just one click'}
            </div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6z" />
            </svg>
          </div>
          <div>
            <div className="stats-item-title">
              {t('stats.item3Title', language) || 'Safe & Secure'}
            </div>
            <div className="stats-item-sub">
              {t('stats.item3Sub', language) || 'Your data is 100% safe'}
            </div>
          </div>
        </div>

        <div className="stats-item">
          <div className="stats-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="2" width="12" height="20" rx="2" />
              <path d="M11 18h2" />
            </svg>
          </div>
          <div>
            <div className="stats-item-title">
              {t('stats.item4Title', language) || 'Always Accessible'}
            </div>
            <div className="stats-item-sub">
              {t('stats.item4Sub', language) || 'Use anytime, anywhere'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
