import React, { useState, useRef, useEffect } from 'react';
import type { Theme, Language, PageView } from '../types';
import { categories, allTools } from '../data/tools';
import { t } from '../data/i18n';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  activeCat: string;
  onSelectCat: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  favoritesCount: number;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeCat,
  onSelectCat,
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  favoritesCount,
  onOpenCommandPalette,
}) => {
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const catMenuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const nextTheme: Record<Theme, Theme> = {
    light: 'dark',
    dark: 'auto',
    auto: 'light',
  };

  const counts: Record<string, number> = { all: allTools.length };
  counts.popular = allTools.filter((t) => t.isPopular).length;
  Object.keys(categories).forEach((k) => {
    counts[k] = allTools.filter((t) => t.cat === k).length;
  });

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="brand-row">
          {/* Brand */}
          <div
            className="brand"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
          >
            <div className="brand-mark">
              <img src="/favicon/icon-192.png" alt="Toolkit Pro" />
            </div>
            <div className="brand-text">
              <span className="brand-name">
                Toolkit<span className="accent">Pro</span>
              </span>
              <span className="brand-tag">
                {t('brand.tag', language) || '218+ tools · zero AI · runs in your browser'}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="main-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`main-nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              {t('nav.home', language)}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'all' && activeCat !== 'popular' ? 'active' : ''}`}
              onClick={() => {
                onSelectCat('all');
                onNavigate('all');
              }}
            >
              {t('nav.allTools', language)}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'all' && activeCat === 'popular' ? 'active' : ''}`}
              onClick={() => {
                onSelectCat('popular');
                onNavigate('all');
              }}
              style={{
                color: currentView === 'all' && activeCat === 'popular' ? 'var(--accent)' : undefined,
                fontWeight: 700,
              }}
            >
              {t('nav.popular', language) || '⚡ Popular'}
            </button>

            {/* Categories dropdown */}
            <div className={`nav-dropdown-wrap ${catMenuOpen ? 'open' : ''}`} ref={catMenuRef}>
              <button
                type="button"
                className="main-nav-link"
                onClick={(e) => {
                  e.stopPropagation();
                  setCatMenuOpen(!catMenuOpen);
                }}
                aria-expanded={catMenuOpen}
              >
                <span>{t('nav.categories', language)}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {catMenuOpen && (
                <div className="nav-dropdown">
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => {
                      onSelectCat('all');
                      onNavigate('all');
                      setCatMenuOpen(false);
                    }}
                  >
                    All Tools ({allTools.length})
                  </button>
                  {Object.entries(categories).map(([k, cat]) => (
                    <button
                      key={k}
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => {
                        onSelectCat(k);
                        onNavigate('all');
                        setCatMenuOpen(false);
                      }}
                    >
                      {t(`cat.${k}`, language) || cat.label} ({counts[k] || 0})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className={`main-nav-link ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => onNavigate('about')}
            >
              {t('nav.about', language)}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => onNavigate('contact')}
            >
              {t('nav.contact', language)}
            </button>
          </nav>

          {/* Action Zone */}
          <div className="head-actions">
            {/* Quick Command Palette Button */}
            <button
              type="button"
              className="quick-search-trigger"
              onClick={onOpenCommandPalette}
              title="Quick Search (Ctrl + K or /)"
              aria-label="Quick Search"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 'var(--radius-s)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text-dim)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="hidden sm:inline">Search...</span>
              <kbd
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '2px 5px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  lineHeight: 1,
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              className="icon-btn lang-toggle-btn"
              onClick={() => onLanguageChange(language === 'hi' ? 'en' : 'hi')}
              aria-label="Switch Language"
              title="Switch Language"
            >
              <span className="lang-toggle-label">{language === 'hi' ? 'हि' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              className="icon-btn"
              onClick={() => onThemeChange(nextTheme[theme])}
              aria-label={`Toggle theme (currently ${theme})`}
              title={`Toggle theme (currently ${theme})`}
            >
              {theme === 'light' && (
                <svg className="ti-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
              {theme === 'dark' && (
                <svg className="ti-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
              {theme === 'auto' && (
                <svg className="ti-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              )}
            </button>

            {/* Settings Popover */}
            <div className="settings-wrap" ref={settingsRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsOpen(!settingsOpen);
                }}
                aria-label="Settings"
                title="Settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {settingsOpen && (
                <div className="settings-popover open">
                  <h3>{t('settings.theme', language)}</h3>
                  <div className="theme-options">
                    <button
                      type="button"
                      className={`theme-opt ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => onThemeChange('light')}
                    >
                      {t('settings.light', language)}
                    </button>
                    <button
                      type="button"
                      className={`theme-opt ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => onThemeChange('dark')}
                    >
                      {t('settings.dark', language)}
                    </button>
                    <button
                      type="button"
                      className={`theme-opt ${theme === 'auto' ? 'active' : ''}`}
                      onClick={() => onThemeChange('auto')}
                    >
                      {t('settings.auto', language)}
                    </button>
                  </div>

                  <h3 className="second">{t('settings.language', language)}</h3>
                  <div className="theme-options">
                    <button
                      type="button"
                      className={`theme-opt lang-opt ${language === 'en' ? 'active' : ''}`}
                      onClick={() => onLanguageChange('en')}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      className={`theme-opt lang-opt ${language === 'hi' ? 'active' : ''}`}
                      onClick={() => onLanguageChange('hi')}
                    >
                      हिंदी
                    </button>
                  </div>

                  <h3 className="second">{t('settings.pages', language)}</h3>
                  <div className="settings-links">
                    <button
                      type="button"
                      className="settings-link"
                      onClick={() => {
                        onNavigate('about');
                        setSettingsOpen(false);
                      }}
                    >
                      {t('nav.about', language)}
                    </button>
                    <button
                      type="button"
                      className="settings-link"
                      onClick={() => {
                        onNavigate('contact');
                        setSettingsOpen(false);
                      }}
                    >
                      {t('nav.contact', language)}
                    </button>
                    <button
                      type="button"
                      className="settings-link"
                      onClick={() => {
                        onNavigate('privacy');
                        setSettingsOpen(false);
                      }}
                    >
                      {t('settings.privacy', language)}
                    </button>
                    <button
                      type="button"
                      className="settings-link"
                      onClick={() => {
                        onNavigate('terms');
                        setSettingsOpen(false);
                      }}
                    >
                      {t('settings.terms', language)}
                    </button>
                    <button
                      type="button"
                      className="settings-link"
                      onClick={() => {
                        onNavigate('disclaimer');
                        setSettingsOpen(false);
                      }}
                    >
                      {t('settings.disclaimer', language)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              className="icon-btn md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 0',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: 'drawerSlide 0.2s ease',
            }}
          >
            <button
              type="button"
              className={`main-nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              style={{ justifyContent: 'flex-start' }}
            >
              {t('nav.home', language)}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'all' && activeCat !== 'popular' ? 'active' : ''}`}
              onClick={() => {
                onSelectCat('all');
                onNavigate('all');
                setMobileMenuOpen(false);
              }}
              style={{ justifyContent: 'flex-start' }}
            >
              {t('nav.allTools', language)}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'all' && activeCat === 'popular' ? 'active' : ''}`}
              onClick={() => {
                onSelectCat('popular');
                onNavigate('all');
                setMobileMenuOpen(false);
              }}
              style={{ justifyContent: 'flex-start', color: 'var(--accent)', fontWeight: 700 }}
            >
              {t('nav.popular', language) || '⚡ Popular'}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              style={{ justifyContent: 'flex-start' }}
            >
              {t('nav.about', language)}
            </button>
            <button
              type="button"
              className={`main-nav-link ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              style={{ justifyContent: 'flex-start' }}
            >
              {t('nav.contact', language)}
            </button>
          </div>
        )}

        {/* Search & Category Filter Row when in All Tools view */}
        {currentView === 'all' && (
          <div className="search-area">
            <div className="search-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="searchInput"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('hero.searchPlaceholder', language) || 'Search tools… try “resize”, “json”, “emi”, “base64”…'}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Category Chips */}
            <div className="chip-row">
              <button
                type="button"
                className={`chip ${activeCat === 'all' ? 'active' : ''}`}
                onClick={() => onSelectCat('all')}
              >
                <span className="dot" style={{ background: 'var(--accent)' }}></span>
                {t('ui.allToolsChip', language) || 'All Tools'}
                <span className="count">{counts.all}</span>
              </button>
              <button
                type="button"
                className={`chip ${activeCat === 'popular' ? 'active' : ''}`}
                onClick={() => onSelectCat('popular')}
              >
                <span className="dot" style={{ background: '#F59E0B' }}></span>
                {t('ui.popularToolsChip', language) || '⚡ Popular Tools'}
                <span className="count">{counts.popular}</span>
              </button>
              {Object.entries(categories).map(([k, cat]) => (
                <button
                  key={k}
                  type="button"
                  className={`chip ${activeCat === k ? 'active' : ''}`}
                  onClick={() => onSelectCat(k)}
                >
                  <span className="dot" style={{ background: `var(${cat.varName})` }}></span>
                  {t(`cat.${k}`, language) || cat.label}
                  <span className="count">{counts[k] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
