import React, { useEffect, useRef, useState } from 'react';
import type { Tool, Language } from '../types';
import { categories, runToolCleanup, getRelatedTools } from '../data/tools';
import { getToolName, getToolDesc, t } from '../data/i18n';
import { ToolUsageGuide } from './ToolUsageGuide';

interface ToolViewProps {
  tool: Tool;
  language: Language;
  isFav: boolean;
  isPinned?: boolean;
  onToggleFav: () => void;
  onTogglePin?: () => void;
  onBack: () => void;
  onSelectTool: (id: string) => void;
  onSelectCat: (cat: string) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const FAV_HEART_PATH =
  'M12 20.5s-7.5-4.6-10-9.3C.4 7.7 2.3 4 6 4c2.1 0 3.6 1.1 4.6 2.4l1.4 1.8 1.4-1.8C14.4 5.1 15.9 4 18 4c3.7 0 5.6 3.7 4 7.2-2.5 4.7-10 9.3-10 9.3Z';

export const ToolView: React.FC<ToolViewProps> = ({
  tool,
  language,
  isFav,
  isPinned = false,
  onToggleFav,
  onTogglePin,
  onBack,
  onSelectTool,
  onSelectCat,
  onShowToast,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const cat = categories[tool.cat] || { label: tool.cat, varName: '--accent' };
  const catLabel = t(`cat.${tool.cat}`, language) || cat.label;
  const name = getToolName(tool, language);
  const desc = getToolDesc(tool, language);
  const favLabel = isFav
    ? t('ui.removeFromFav', language) || 'Remove from favourites'
    : t('ui.addToFav', language) || 'Add to favourites';

  const related = getRelatedTools(tool, 4);

  const mountTool = () => {
    if (!containerRef.current) return;
    runToolCleanup();
    containerRef.current.innerHTML = '';
    try {
      tool.mount(containerRef.current);
    } catch (e: any) {
      containerRef.current.innerHTML = `<p class="hint">This tool failed to load (${e?.message || 'Error'}).</p>`;
    }
  };

  useEffect(() => {
    mountTool();
    return () => {
      runToolCleanup();
    };
  }, [tool]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#tool=${tool.id}`;
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        success = true;
      }
    } catch (e) {
      success = false;
    }
    if (!success) {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        success = document.execCommand('copy');
        ta.remove();
      } catch (err) {
        success = false;
      }
    }
    if (success) {
      onShowToast('Direct tool link copied to clipboard!', 'success');
    } else {
      onShowToast('Could not copy link.', 'error');
    }
  };

  const handleReset = () => {
    mountTool();
    onShowToast('Workspace reset to default state.', 'info');
  };

  return (
    <div
      className={`tool-view ${isFocusMode ? 'tool-view-focus' : ''}`}
      id="toolView"
      role="region"
      aria-labelledby="toolViewTitle"
      style={{
        ['--cat-color' as string]: `var(${cat.varName})`,
        ...(isFocusMode
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 9990,
              background: 'var(--bg)',
              overflowY: 'auto',
              padding: '24px 32px 60px',
            }
          : {}),
      }}
    >
      {/* Top Navigation Bar: Breadcrumbs & Actions */}
      <div className="tool-view-top-bar">
        <nav className="tool-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" className="tool-back-btn" id="toolBackBtn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>{t('ui.backToAllTools', language) || 'Back'}</span>
          </button>
          <span className="crumb-sep">/</span>
          <button
            type="button"
            className="crumb-cat"
            onClick={() => onSelectCat(tool.cat)}
          >
            {catLabel}
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{name}</span>
        </nav>

        {/* Workspace Toolbar Controls */}
        <div className="tool-actions-toolbar">
          {/* Reset Workspace */}
          <button
            type="button"
            className="btn ghost small"
            onClick={handleReset}
            title="Reset workspace"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>

          {/* Share Link */}
          <button
            type="button"
            className="btn ghost small"
            onClick={handleCopyLink}
            title="Copy share link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Share</span>
          </button>

          {/* Focus Mode Toggle */}
          <button
            type="button"
            className={`btn ${isFocusMode ? 'primary' : 'ghost'} small`}
            onClick={() => setIsFocusMode(!isFocusMode)}
            title={isFocusMode ? 'Exit Fullscreen' : 'Fullscreen / Focus Mode'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isFocusMode ? (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              ) : (
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              )}
            </svg>
            <span>{isFocusMode ? 'Exit' : 'Focus'}</span>
          </button>

          {/* Pin to Top Button */}
          {onTogglePin && (
            <button
              type="button"
              className={`btn ${isPinned ? 'primary' : 'ghost'} small`}
              id="toolViewPinBtn"
              aria-pressed={isPinned}
              aria-label={isPinned ? 'Unpin tool from top' : 'Pin tool to top'}
              title={isPinned ? 'Unpin tool from top' : 'Pin tool to top of Home & All Tools'}
              onClick={onTogglePin}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="17" x2="12" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
              </svg>
              <span>{isPinned ? (language === 'hi' ? 'पिन है' : 'Pinned') : (language === 'hi' ? 'पिन' : 'Pin')}</span>
            </button>
          )}

          {/* Favorite Button */}
          <button
            className={`tool-view-fav-btn ${isFav ? 'active' : ''}`}
            id="toolViewFavBtn"
            type="button"
            aria-pressed={isFav}
            aria-label={favLabel}
            title={favLabel}
            onClick={onToggleFav}
          >
            <svg viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d={FAV_HEART_PATH} />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Tool Window Container */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: isFocusMode ? '0 16px 48px var(--shadow)' : '0 4px 20px var(--shadow)',
          background: 'var(--surface)',
          overflow: 'hidden',
        }}
      >
        <div className="tool-view-head">
          <div>
            <div className="tool-view-eyebrow" id="toolViewEyebrow">
              {catLabel}
            </div>
            <h1 className="tool-view-title" id="toolViewTitle">
              {name}
            </h1>
            <p className="tool-view-desc" id="toolViewDesc">
              {desc}
            </p>
          </div>
        </div>

        <div className="tool-view-body" ref={containerRef} style={{ border: 'none' }}></div>
      </div>

      {/* Dynamic How-To-Use Collapsible Guide */}
      <ToolUsageGuide tool={tool} language={language} />

      {/* Related Tools */}
      {related.length > 0 && !isFocusMode && (
        <div
          className="related-tools"
          style={{
            marginTop: 28,
            padding: '20px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
          }}
        >
          <div className="related-tools-label" style={{ fontWeight: 700, marginBottom: 12 }}>
            More Tools in {catLabel}
          </div>
          <div className="related-tools-list">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                className="related-tool-chip"
                onClick={() => onSelectTool(r.id)}
              >
                {getToolName(r, language)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
