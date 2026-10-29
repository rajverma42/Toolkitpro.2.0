import React, { useState } from 'react';
import type { Tool, Language } from '../types';
import { ToolCard } from './ToolCard';
import { popularToolIds, allTools } from '../data/tools';
import { t } from '../data/i18n';

interface HomeSectionsProps {
  language: Language;
  favorites: string[];
  pinned: string[];
  recent: string[];
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onSelectTool: (id: string) => void;
  onBrowseAll: () => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  language,
  favorites,
  pinned,
  recent,
  onToggleFav,
  onTogglePin,
  onSelectTool,
  onBrowseAll,
}) => {
  const [popularCat, setPopularCat] = useState<string>('all');
  const [showAllPopular, setShowAllPopular] = useState<boolean>(false);

  // Pinned tools
  const pinnedTools = pinned
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is Tool => Boolean(t));

  // All popular tools in priority order
  const allPopularTools = popularToolIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is Tool => Boolean(t));

  // Filtered popular tools by selected sub-category
  const filteredPopularTools = allPopularTools.filter((t) => {
    if (popularCat === 'all') return true;
    if (popularCat === 'pdf') return t.cat === 'pdf';
    if (popularCat === 'image') return t.cat === 'image';
    if (popularCat === 'text') return t.cat === 'text';
    if (popularCat === 'calc') return t.cat === 'calc' || t.cat === 'converters';
    if (popularCat === 'dev') return t.cat === 'dev' || t.cat === 'security';
    if (popularCat === 'productivity') return t.cat === 'productivity' || t.cat === 'color' || t.cat === 'seo';
    return t.cat === popularCat;
  });

  // Sort popular tools so pinned popular tools appear first (overriding popular order)
  const sortedPopularTools = [...filteredPopularTools].sort((a, b) => {
    const aPin = pinned.includes(a.id);
    const bPin = pinned.includes(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    if (aPin && bPin) return pinned.indexOf(a.id) - pinned.indexOf(b.id);
    return 0;
  });

  // Limit display unless expanded
  const displayedPopular = showAllPopular
    ? sortedPopularTools
    : sortedPopularTools.slice(0, 12);

  const favoriteTools = favorites
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is Tool => Boolean(t))
    .sort((a, b) => {
      const aPin = pinned.includes(a.id);
      const bPin = pinned.includes(b.id);
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return 0;
    });

  const recentTools = recent
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is Tool => Boolean(t))
    .sort((a, b) => {
      const aPin = pinned.includes(a.id);
      const bPin = pinned.includes(b.id);
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return 0;
    });

  const browseAllLabel =
    language === 'hi'
      ? `सभी ${allTools.length} टूल्स देखें →`
      : `Browse All ${allTools.length} Tools →`;

  const popularFilters = [
    { id: 'all', label: language === 'hi' ? 'सभी लोकप्रिय' : 'All Popular', icon: '⚡' },
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'image', label: language === 'hi' ? 'इमेज' : 'Image', icon: '🖼️' },
    { id: 'text', label: language === 'hi' ? 'टेक्स्ट' : 'Text', icon: '✍️' },
    { id: 'calc', label: language === 'hi' ? 'कैलकुलेटर' : 'Calculators', icon: '🧮' },
    { id: 'dev', label: 'Dev Tools', icon: '💻' },
    { id: 'productivity', label: language === 'hi' ? 'प्रोडक्टिविटी' : 'Productivity', icon: '⏱️' },
  ];

  return (
    <div id="homeView">
      {/* Pinned Tools Section - Hoisted to the top, overriding popular/recent */}
      {pinnedTools.length > 0 && (
        <div className="home-section" id="pinnedSection">
          <div className="section-head" style={{ alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📌 {language === 'hi' ? 'पिन किए गए टूल्स' : 'Pinned Tools'}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                    color: 'var(--accent)',
                  }}
                >
                  {pinnedTools.length}
                </span>
              </h2>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  maxWidth: '640px',
                }}
              >
                {language === 'hi'
                  ? 'आपके द्वारा मैन्युअल रूप से पिन किए गए टूल्स — यह लोकप्रिय और हाल के टूल्स से ऊपर रहते हैं।'
                  : 'Your manually pinned tools — hoisted to the top above popular and recent utilities.'}
              </p>
            </div>
          </div>
          <div className="tool-grid">
            {pinnedTools.map((tool) => (
              <ToolCard
                key={`pinned-${tool.id}`}
                tool={tool}
                isFav={favorites.includes(tool.id)}
                isPinned={true}
                language={language}
                onToggleFav={onToggleFav}
                onTogglePin={onTogglePin}
                onSelect={onSelectTool}
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Tools Section */}
      <div className="home-section" id="popularSection">
        <div className="section-head" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t('home.popularTools', language) || '⚡ Popular Tools'}</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                  color: 'var(--accent)',
                }}
              >
                {allPopularTools.length}
              </span>
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-dim)',
                maxWidth: '640px',
              }}
            >
              {t('home.popularToolsSub', language) ||
                'Top-rated utilities used daily by thousands for PDF, images, calculations, and dev tasks.'}
            </p>
          </div>
          <button
            type="button"
            className="section-head-link"
            onClick={onBrowseAll}
          >
            <span>{t('home.viewAllTools', language) || 'View All Tools'}</span>{' '}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Popular Category Sub-Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 10,
            marginBottom: 16,
            scrollbarWidth: 'none',
          }}
        >
          {popularFilters.map((flt) => {
            const isActive = popularCat === flt.id;
            return (
              <button
                key={flt.id}
                type="button"
                onClick={() => {
                  setPopularCat(flt.id);
                  setShowAllPopular(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  background: isActive ? 'var(--accent)' : 'var(--surface)',
                  color: isActive ? 'var(--accent-text, #fff)' : 'var(--text-dim)',
                  boxShadow: isActive ? '0 2px 8px color-mix(in srgb, var(--accent) 35%, transparent)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span>{flt.icon}</span>
                <span>{flt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Popular Tools Grid */}
        <div className="tool-grid">
          {displayedPopular.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFav={favorites.includes(tool.id)}
              isPinned={pinned.includes(tool.id)}
              language={language}
              onToggleFav={onToggleFav}
              onTogglePin={onTogglePin}
              onSelect={onSelectTool}
            />
          ))}
        </div>

        {/* Show More / Show Less Popular Tools */}
        {filteredPopularTools.length > 12 && (
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button
              type="button"
              onClick={() => setShowAllPopular(!showAllPopular)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 'var(--radius-s)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {showAllPopular ? (
                <>
                  <span>Show Less</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                </>
              ) : (
                <>
                  <span>{language === 'hi' ? `और लोकप्रिय टूल्स देखें (+${filteredPopularTools.length - 12})` : `Show More Popular Tools (+${filteredPopularTools.length - 12})`}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Favourite Tools */}
      <div className="home-section">
        <div className="section-head">
          <h2>{t('home.favoriteTools', language) || '⭐ Favourite Tools'}</h2>
        </div>
        <div className="tool-grid">
          {favoriteTools.length === 0 ? (
            <div className="recent-empty">
              {t('ui.noFavoritesText', language) || 'No favourite tools yet. Click the heart icon on any tool card to save it here.'}
            </div>
          ) : (
            favoriteTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFav={true}
                isPinned={pinned.includes(tool.id)}
                language={language}
                onToggleFav={onToggleFav}
                onTogglePin={onTogglePin}
                onSelect={onSelectTool}
              />
            ))
          )}
        </div>
      </div>

      {/* Recently Used */}
      <div className="home-section">
        <div className="section-head">
          <h2>{t('home.recentlyUsed', language) || '🕓 Recently Used'}</h2>
        </div>
        <div className="tool-grid">
          {recentTools.length === 0 ? (
            <div className="recent-empty">
              {t('ui.noRecentText', language) || 'No tools used recently yet. Open any tool and it will appear here for quick access.'}
            </div>
          ) : (
            recentTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFav={favorites.includes(tool.id)}
                isPinned={pinned.includes(tool.id)}
                language={language}
                onToggleFav={onToggleFav}
                onTogglePin={onTogglePin}
                onSelect={onSelectTool}
              />
            ))
          )}
        </div>
      </div>

      {/* Browse All CTA */}
      <div className="browse-all-wrap">
        <button
          className="btn-browse-all"
          id="browseAllBtn"
          type="button"
          onClick={onBrowseAll}
        >
          {browseAllLabel}
        </button>
      </div>

      {/* FAQ */}
      <div
        className="home-section"
        style={{ marginTop: 44, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div className="section-head">
          <h2>{t('home.faqHeading', language) || '❓ Frequently Asked Questions'}</h2>
        </div>

        <div className="doc-card" style={{ marginBottom: 12, padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {t('home.faq1q', language) || 'Is Toolkit Pro really free to use?'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            {t('home.faq1a', language) ||
              'Yes — every one of the 218+ tools is free, with no sign-up, no subscription, and no usage limit. The site is supported by ads rather than paid accounts.'}
          </p>
        </div>

        <div className="doc-card" style={{ marginBottom: 12, padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {t('home.faq2q', language) || 'Does Toolkit Pro use AI?'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            {t('home.faq2a', language) ||
              'No. Every tool runs on deterministic, hand-written code — standard math, string operations, and browser APIs like Canvas and the Web Crypto API. Nothing here is generated or processed by an AI model.'}
          </p>
        </div>

        <div className="doc-card" style={{ marginBottom: 12, padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {t('home.faq3q', language) || 'Is my data uploaded to a server?'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            {t('home.faq3a', language) ||
              'No — every tool runs entirely inside your own browser tab. Text, images, and files you use with a tool never leave your device or get sent anywhere.'}
          </p>
        </div>

        <div className="doc-card" style={{ marginBottom: 12, padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {t('home.faq4q', language) || 'Do I need to create an account?'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            {t('home.faq4a', language) ||
              'No accounts, no logins, no email required for any tool. Your only optional saved data is a local "recently used tools" list and your theme choice, both stored in your own browser.'}
          </p>
        </div>

        <div className="doc-card" style={{ marginBottom: 12, padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {t('home.faq5q', language) || 'Does it work on mobile?'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            {t('home.faq5a', language) ||
              'Yes — the site is fully responsive and every tool works the same way on a phone, tablet, or desktop browser.'}
          </p>
        </div>
      </div>
    </div>
  );
};
