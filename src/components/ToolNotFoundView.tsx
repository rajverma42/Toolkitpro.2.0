import React, { useState } from 'react';
import type { Language, Tool } from '../types';
import { allTools, popularToolIds } from '../data/tools';
import { getToolName, t } from '../data/i18n';

interface ToolNotFoundViewProps {
  language: Language;
  onSelectTool: (id: string) => void;
  onBrowseAll: () => void;
  onGoHome: () => void;
}

export const ToolNotFoundView: React.FC<ToolNotFoundViewProps> = ({
  language,
  onSelectTool,
  onBrowseAll,
  onGoHome,
}) => {
  const [query, setQuery] = useState('');

  const popular = popularToolIds
    .slice(0, 8)
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is Tool => Boolean(t));

  const filtered = query.trim()
    ? allTools
        .filter(
          (t) =>
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.desc.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : popular;

  return (
    <div
      style={{
        maxWidth: 760,
        margin: '40px auto',
        padding: '36px 24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        textAlign: 'center',
        boxShadow: '0 8px 32px var(--shadow)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
        }}
      >
        🔍
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>
        {language === 'hi' ? 'टूल नहीं मिला' : 'Tool Not Found'}
      </h1>
      <p style={{ color: 'var(--text-dim)', fontSize: '15px', margin: '0 auto 24px', maxWidth: 480 }}>
        {language === 'hi'
          ? 'यह टूल मौजूद नहीं है या इसका लिंक बदल गया है। आप नीचे सर्च कर सकते हैं या लोकप्रिय टूल्स देख सकते हैं।'
          : 'The requested tool could not be located. Search below or explore our recommended tools.'}
      </p>

      {/* Instant Search Bar */}
      <div style={{ maxWidth: 460, margin: '0 auto 28px', position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'टूल का नाम खोजें (जैसे PDF, Image, Word Counter)...'
              : 'Search 218+ tools (e.g., PDF, Image, Word Counter)...'
          }
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '14px',
            borderRadius: 'var(--radius-m)',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>

      {/* Suggested Tools Grid */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: 12 }}>
          {query.trim()
            ? language === 'hi'
              ? 'सर्च परिणाम'
              : 'Search Results'
            : language === 'hi'
            ? '⚡ लोकप्रिय टूल्स'
            : '⚡ Popular Tools You Might Like'}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
            textAlign: 'left',
          }}
        >
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTool(t.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '12px',
                borderRadius: 'var(--radius-s)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '13px', marginBottom: 4 }}>
                {getToolName(t, language)}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn primary" onClick={onBrowseAll}>
          {language === 'hi' ? 'सभी 218+ टूल्स ब्राउज़ करें' : 'Browse All 218+ Tools'}
        </button>
        <button type="button" className="btn ghost" onClick={onGoHome}>
          {language === 'hi' ? 'होमपेज पर जाएं' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};
