import React, { useState } from 'react';
import type { Tool, Language } from '../types';
import { ToolCard } from './ToolCard';
import { allTools, categories, trendingIds, popularToolIds } from '../data/tools';
import { t } from '../data/i18n';

interface AllToolsViewProps {
  language: Language;
  activeCat: string;
  searchQuery: string;
  favorites: string[];
  pinned: string[];
  recent: string[];
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onSelectTool: (id: string) => void;
  onSelectCat: (cat: string) => void;
  onClearSearch: () => void;
}

export type SortOption = 'default' | 'name-asc' | 'name-desc' | 'cat';
export type QuickFilter = 'all' | 'pinned' | 'popular' | 'fav' | 'recent';

export const AllToolsView: React.FC<AllToolsViewProps> = ({
  language,
  activeCat,
  searchQuery,
  favorites,
  pinned,
  recent,
  onToggleFav,
  onTogglePin,
  onSelectTool,
  onSelectCat,
  onClearSearch,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const matches = (tool: Tool, q: string): boolean => {
    if (!q) return true;
    const hay = `${tool.name} ${tool.desc} ${tool.cat} ${tool.keywords || ''}`.toLowerCase();
    return q
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((term) => hay.includes(term));
  };

  // Base list
  let list = allTools.filter((tool) => {
    if (activeCat === 'popular') {
      return (tool.isPopular || popularToolIds.includes(tool.id)) && matches(tool, searchQuery);
    }
    return (activeCat === 'all' || tool.cat === activeCat) && matches(tool, searchQuery);
  });

  // Quick filter
  if (quickFilter === 'pinned') {
    list = list.filter((t) => pinned.includes(t.id));
  } else if (quickFilter === 'popular') {
    list = list.filter((t) => t.isPopular || popularToolIds.includes(t.id));
  } else if (quickFilter === 'fav') {
    list = list.filter((t) => favorites.includes(t.id));
  } else if (quickFilter === 'recent') {
    list = list.filter((t) => recent.includes(t.id));
  }

  // Count of popular tools in the current category/search scope
  const popularCount = allTools.filter((t) => t.isPopular || popularToolIds.includes(t.id)).length;

  // Sorting: Pinned tools override default, popular, recent and category order to always stay at the top!
  const sorted = [...list].sort((a, b) => {
    const aPin = pinned.includes(a.id);
    const bPin = pinned.includes(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    if (aPin && bPin) return pinned.indexOf(a.id) - pinned.indexOf(b.id);

    if (sortBy === 'name-asc') return a.name.localeCompare(a.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'cat') return a.cat.localeCompare(b.cat);
    // default: trending/popular first, then ID
    const aTrend = trendingIds.indexOf(a.id);
    const bTrend = trendingIds.indexOf(b.id);
    if (aTrend !== -1 && bTrend !== -1) return aTrend - bTrend;
    if (aTrend !== -1) return -1;
    if (bTrend !== -1) return 1;
    return a.id.localeCompare(b.id);
  });

  let metaText = '';
  if (searchQuery) {
    const raw = t('ui.resultsForQuery', language) || '{n} result{plural} for “{q}”';
    metaText = raw
      .replace('{n}', String(sorted.length))
      .replace('{plural}', sorted.length === 1 ? '' : 's')
      .replace('{q}', searchQuery);
  } else if (quickFilter === 'pinned') {
    metaText = language === 'hi'
      ? `${sorted.length} पिन किए गए टूल्स दिखाए जा रहे हैं`
      : `Showing ${sorted.length} Pinned Tools`;
  } else if (activeCat === 'popular') {
    metaText = language === 'hi'
      ? `${sorted.length} लोकप्रिय टूल्स दिखाए जा रहे हैं`
      : `Showing ${sorted.length} Popular Tools`;
  } else {
    const raw = t('ui.showingOfTotal', language) || 'Showing {n} of {total} tools';
    metaText = raw
      .replace('{n}', String(sorted.length))
      .replace('{total}', String(allTools.length));
  }

  return (
    <div id="allToolsView">
      {/* Control Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-m)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p className="result-meta" id="resultMeta" style={{ margin: 0, fontWeight: 600 }}>
            {metaText}
          </p>
          {(searchQuery || activeCat === 'popular') && (
            <button
              type="button"
              onClick={() => {
                if (searchQuery) onClearSearch();
                if (activeCat === 'popular') onSelectCat('all');
              }}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                padding: '3px 10px',
                fontSize: 12,
                cursor: 'pointer',
                color: 'var(--text-dim)',
              }}
            >
              Clear filter ✕
            </button>
          )}
        </div>

        {/* Quick Filters & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Quick Filter Segments */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-s)',
              padding: 2,
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => setQuickFilter('all')}
              style={{
                padding: '5px 11px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--radius-s) - 2px)',
                background: quickFilter === 'all' ? 'var(--surface)' : 'transparent',
                color: quickFilter === 'all' ? 'var(--text)' : 'var(--text-dim)',
                boxShadow: quickFilter === 'all' ? '0 1px 3px var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              {language === 'hi' ? 'सभी' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('pinned')}
              style={{
                padding: '5px 11px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--radius-s) - 2px)',
                background: quickFilter === 'pinned' ? 'var(--surface)' : 'transparent',
                color: quickFilter === 'pinned' ? 'var(--accent)' : 'var(--text-dim)',
                boxShadow: quickFilter === 'pinned' ? '0 1px 3px var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              📌 {language === 'hi' ? 'पिन' : 'Pinned'} ({pinned.length})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('popular')}
              style={{
                padding: '5px 11px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--radius-s) - 2px)',
                background: quickFilter === 'popular' ? 'var(--surface)' : 'transparent',
                color: quickFilter === 'popular' ? 'var(--accent)' : 'var(--text-dim)',
                boxShadow: quickFilter === 'popular' ? '0 1px 3px var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              ⚡ {language === 'hi' ? 'लोकप्रिय' : 'Popular'} ({popularCount})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('fav')}
              style={{
                padding: '5px 11px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--radius-s) - 2px)',
                background: quickFilter === 'fav' ? 'var(--surface)' : 'transparent',
                color: quickFilter === 'fav' ? 'var(--text)' : 'var(--text-dim)',
                boxShadow: quickFilter === 'fav' ? '0 1px 3px var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              ⭐ {language === 'hi' ? 'पसंदीदा' : 'Favorites'} ({favorites.length})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('recent')}
              style={{
                padding: '5px 11px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--radius-s) - 2px)',
                background: quickFilter === 'recent' ? 'var(--surface)' : 'transparent',
                color: quickFilter === 'recent' ? 'var(--text)' : 'var(--text-dim)',
                boxShadow: quickFilter === 'recent' ? '0 1px 3px var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              🕓 {language === 'hi' ? 'हाल में' : 'Recent'} ({recent.length})
            </button>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: '5px 9px',
                fontSize: 12,
                fontWeight: 600,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-s)',
                cursor: 'pointer',
              }}
            >
              <option value="default">{language === 'hi' ? 'अनुशंसित (Recommended)' : 'Recommended'}</option>
              <option value="name-asc">{language === 'hi' ? 'नाम (A → Z)' : 'Name (A → Z)'}</option>
              <option value="name-desc">{language === 'hi' ? 'नाम (Z → A)' : 'Name (Z → A)'}</option>
              <option value="cat">{language === 'hi' ? 'श्रेणी (Category)' : 'Category'}</option>
            </select>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-m)', padding: '60px 20px' }}>
          <div className="big">{t('ui.emptyBinTitle', language) || 'No Tools Found'}</div>
          <p style={{ maxWidth: 420, margin: '10px auto 20px' }}>
            {t('ui.emptyBinSub', language) || 'Try another search term or pick another category.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {searchQuery && (
              <button
                type="button"
                className="btn primary"
                onClick={onClearSearch}
              >
                Clear Search Query
              </button>
            )}
            {activeCat !== 'all' && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => onSelectCat('all')}
              >
                Show All Categories
              </button>
            )}
            {quickFilter !== 'all' && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => setQuickFilter('all')}
              >
                Reset Quick Filter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="tool-grid" id="toolGrid">
          {sorted.map((tool) => (
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
      )}
    </div>
  );
};
