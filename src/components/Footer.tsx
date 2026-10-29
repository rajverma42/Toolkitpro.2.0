import React from 'react';
import type { PageView, Language } from '../types';
import { categories } from '../data/tools';
import { t } from '../data/i18n';

interface FooterProps {
  language: Language;
  onNavigate: (view: PageView) => void;
  onSelectCat: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate, onSelectCat }) => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <p className="footer-brand-name">Toolkit Pro</p>
            <p className="footer-tagline">
              {t('footer.tagline', language) ||
                '218 free browser-based tools for text, images, PDFs, calculators, converters, security and developers. No sign-ups, no uploads, no AI — everything runs locally on your device.'}
            </p>
          </div>

          <div className="footer-col">
            <h4>{t('footer.explore', language) || 'Explore'}</h4>
            <button
              type="button"
              className="footer-link nav-home-btn"
              onClick={() => onNavigate('home')}
            >
              {t('nav.home', language) || 'Home'}
            </button>
            <button
              type="button"
              className="footer-link nav-alltools-btn"
              onClick={() => onNavigate('all')}
            >
              {t('nav.allTools', language) || 'All Tools'}
            </button>
          </div>

          <div className="footer-col">
            <h4>{t('footer.categories', language) || 'Categories'}</h4>
            {Object.entries(categories).map(([k, cat]) => (
              <button
                key={k}
                type="button"
                className="footer-link settings-cat-link"
                onClick={() => {
                  onSelectCat(k);
                  onNavigate('all');
                }}
              >
                {t(`cat.${k}`, language) || cat.label}
              </button>
            ))}
          </div>

          <div className="footer-col">
            <h4>{t('footer.support', language) || 'Support'}</h4>
            <button
              type="button"
              className="footer-link"
              onClick={() => onNavigate('about')}
            >
              {t('nav.about', language) || 'About'}
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => onNavigate('contact')}
            >
              {t('nav.contact', language) || 'Contact'}
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => onNavigate('privacy')}
            >
              {t('settings.privacy', language) || 'Privacy Policy'}
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => onNavigate('terms')}
            >
              {t('settings.terms', language) || 'Terms of Service'}
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => onNavigate('disclaimer')}
            >
              {t('settings.disclaimer', language) || 'Disclaimer'}
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t('footer.copyrightHome', language) || '© 2026 Toolkit Pro. All rights reserved.'}</span>
          <span>
            {t('footer.noaccountsHome', language) ||
              'No accounts · no uploads to a server · no AI models · every tool runs locally in this page'}
          </span>
        </div>
      </div>
    </footer>
  );
};
