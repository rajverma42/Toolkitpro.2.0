import React, { useState, useEffect, useRef } from 'react';
import type { Tool, Language } from '../types';
import { allTools, categories, trendingIds, icons } from '../data/tools';
import { getToolName, getToolDesc, t } from '../data/i18n';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (id: string) => void;
  language: Language;
  favorites: string[];
  pinned?: string[];
  recent: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  language,
  favorites,
  pinned = [],
  recent,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const matches = (tool: Tool, q: string): boolean => {
    if (!q) return true;
    const hay = `${tool.name} ${tool.desc} ${tool.cat} ${tool.keywords || ''}`.toLowerCase();
    return q
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((term) => hay.includes(term));
  };

  const filteredTools: Tool[] = query
    ? allTools.filter((tool) => matches(tool, query)).slice(0, 40)
    : pinned
        .map((id) => allTools.find((t) => t.id === id))
        .filter((t): t is Tool => Boolean(t))
        .concat(
          recent
            .map((id) => allTools.find((t) => t.id === id))
            .filter((t): t is Tool => Boolean(t))
        )
        .concat(
          trendingIds
            .map((id) => allTools.find((t) => t.id === id))
            .filter((t): t is Tool => Boolean(t))
        )
        .filter((tool, index, self) => self.findIndex((t) => t.id === tool.id) === index)
        .slice(0, 16);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredTools.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          onSelectTool(filteredTools[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredTools, onSelectTool, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        background: 'rgba(5, 11, 24, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 20px',
        animation: 'paletteFadeIn 0.16s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-l)',
          boxShadow: '0 24px 60px var(--shadow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          animation: 'paletteSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            gap: 12,
            background: 'var(--surface)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'टूल खोजें... (उदा: resize, base64, pdf, emi)'
                : 'Search 218+ tools... (e.g. resize, base64, pdf, emi)'
            }
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--text)',
              outline: 'none',
              padding: 0,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: 4,
                fontSize: 12,
              }}
            >
              Clear
            </button>
          )}
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              padding: '3px 7px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text-dim)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: '8px',
            flex: 1,
          }}
        >
          <div
            style={{
              padding: '6px 12px 8px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-dim)',
            }}
          >
            {query
              ? `${filteredTools.length} ${filteredTools.length === 1 ? 'Tool found' : 'Tools found'}`
              : recent.length > 0
              ? 'Recent & Recommended Tools'
              : 'Popular Tools'}
          </div>

          {filteredTools.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                fontSize: '14px',
              }}
            >
              {t('ui.emptyBinTitle', language) || 'No tools found matching your query.'}
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              const cat = categories[tool.cat] || { label: tool.cat, varName: '--accent', icon: 'dev' };
              const isFav = favorites.includes(tool.id);
              const iconPath = icons[cat.icon] || icons['dev'] || '';

              return (
                <div
                  key={tool.id}
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-s)',
                    background: isSelected ? 'var(--accent-soft)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `var(${cat.varName})`,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dangerouslySetInnerHTML={{ __html: iconPath }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color: isSelected ? 'var(--accent)' : 'var(--text)',
                        }}
                      >
                        {getToolName(tool, language)}
                      </span>
                      {pinned.includes(tool.id) && (
                        <span style={{ fontSize: '11px' }} title="Pinned tool">
                          📌
                        </span>
                      )}
                      {isFav && (
                        <span style={{ color: 'var(--fav-color)', fontSize: '12px' }} title="Favourite">
                          ★
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-dim)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {getToolDesc(tool, language)}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontFamily: 'monospace',
                      flexShrink: 0,
                    }}
                  >
                    {t(`cat.${tool.cat}`, language) || cat.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            <span>
              <kbd style={{ background: 'var(--surface)', padding: '2px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>↑↓</kbd> Navigate
            </span>
            <span>
              <kbd style={{ background: 'var(--surface)', padding: '2px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>↵</kbd> Select
            </span>
            <span>
              <kbd style={{ background: 'var(--surface)', padding: '2px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>esc</kbd> Close
            </span>
          </div>
          <span>Total {allTools.length} tools</span>
        </div>
      </div>
    </div>
  );
};
