import React from 'react';
import type { Tool, Language } from '../types';
import { categories, icons } from '../data/tools';
import { getToolName, getToolDesc, t } from '../data/i18n';

interface ToolCardProps {
  tool: Tool;
  isFav: boolean;
  isPinned?: boolean;
  language: Language;
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onTogglePin?: (id: string, e: React.MouseEvent) => void;
  onSelect: (id: string) => void;
}

const FAV_HEART_PATH =
  'M12 20.5s-7.5-4.6-10-9.3C.4 7.7 2.3 4 6 4c2.1 0 3.6 1.1 4.6 2.4l1.4 1.8 1.4-1.8C14.4 5.1 15.9 4 18 4c3.7 0 5.6 3.7 4 7.2-2.5 4.7-10 9.3-10 9.3Z';

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFav,
  isPinned = false,
  language,
  onToggleFav,
  onTogglePin,
  onSelect,
}) => {
  const cat = categories[tool.cat] || { label: tool.cat, varName: '--accent', icon: 'dev' };
  const name = getToolName(tool, language);
  const desc = getToolDesc(tool, language);
  const catLabel = t(`cat.${tool.cat}`, language) || cat.label;
  const favLabel = isFav ? t('ui.removeFromFav', language) || 'Remove from favourites' : t('ui.addToFav', language) || 'Add to favourites';
  const pinLabel = isPinned
    ? language === 'hi' ? 'अनपिन करें' : 'Unpin from top'
    : language === 'hi' ? 'शीर्ष पर पिन करें' : 'Pin to top';
  const iconPath = icons[cat.icon] || icons['dev'] || '';

  return (
    <div
      className={`tool-card ${isPinned ? 'is-pinned' : ''}`}
      style={{ ['--cat-color' as string]: `var(${cat.varName})` }}
      data-id={tool.id}
      onClick={() => onSelect(tool.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(tool.id)}
    >
      <div className="card-top-actions" onClick={(e) => e.stopPropagation()}>
        {onTogglePin && (
          <button
            type="button"
            className={`card-pin-btn ${isPinned ? 'active' : ''}`}
            aria-pressed={isPinned}
            aria-label={pinLabel}
            title={pinLabel}
            onClick={(e) => onTogglePin(tool.id, e)}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isPinned ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className={`card-fav-btn ${isFav ? 'active' : ''}`}
          aria-pressed={isFav}
          aria-label={favLabel}
          title={favLabel}
          onClick={(e) => onToggleFav(tool.id, e)}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          >
            <path d={FAV_HEART_PATH} />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 64, flexWrap: 'wrap' }}>
        <div className="tool-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: iconPath }}
          />
        </div>
        {isPinned && (
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              letterSpacing: '0.02em',
              border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
            }}
          >
            📌 {language === 'hi' ? 'पिन' : 'Pinned'}
          </span>
        )}
        {tool.isPopular && (
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              letterSpacing: '0.02em',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            }}
          >
            ⚡ {t('ui.popularBadge', language) || 'Popular'}
          </span>
        )}
      </div>

      <div className="tool-name">{name}</div>
      <div className="tool-desc">{desc}</div>

      <div className="tool-cat-row">
        <div className="tool-cat">{catLabel}</div>
        <svg
          className="tool-card-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
};
