import React, { useState, useEffect, useCallback } from 'react';
import type { PageView, Theme, Language, Tool } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { HomeSections } from './components/HomeSections';
import { AllToolsView } from './components/AllToolsView';
import { ToolView } from './components/ToolView';
import { StaticPageView } from './components/StaticPageView';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer, ToastMessage } from './components/Toast';
import { allTools, categories, getToolById, getToolBySlugOrId, runToolCleanup } from './data/tools';
import { useSeoMetadata } from './hooks/useSeoMetadata';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToolNotFoundView } from './components/ToolNotFoundView';

const FAV_KEY = 'tp-favorites';
const PIN_KEY = 'tp-pinned';
const RECENT_KEY = 'tp-recent';
const RECENT_MAX = 12;

export const App: React.FC = () => {
  const [view, setView] = useState<PageView>('home');
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);
  const [prevViewWasAll, setPrevViewWasAll] = useState<boolean>(false);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((id) => allTools.some((t) => t.id === id)) : [];
    } catch {
      return [];
    }
  });

  // Manually Pinned Tools (hoisted to the top of Home and All Tools)
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((id) => allTools.some((t) => t.id === id)) : [];
    } catch {
      return [];
    }
  });

  // Recently used tools
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((id) => allTools.some((t) => t.id === id)) : [];
    } catch {
      return [];
    }
  });

  // Theme
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('tp-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    } catch {}
    return 'auto';
  });

  // Language
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tp-lang');
      if (saved === 'en' || saved === 'hi') return saved;
    } catch {}
    return 'en';
  });

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const ACCENT = {
      light: { a: '#2563EB', s: '#DCE9FF', t: '#FFFFFF' },
      dark: { a: '#5B9DFF', s: '#1B2C4D', t: '#0B1220' },
    };

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    try {
      localStorage.setItem('tp-theme', theme);
    } catch {}

    const isDark =
      theme === 'dark' ||
      (theme === 'auto' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const c = ACCENT[isDark ? 'dark' : 'light'];
    root.style.setProperty('--accent', c.a);
    root.style.setProperty('--accent-soft', c.s);
    root.style.setProperty('--accent-text', c.t);
  }, [theme]);

  // Apply Language to root element
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    try {
      localStorage.setItem('tp-lang', language);
    } catch {}
  }, [language]);

  // Track Recent Tool
  const trackRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((x) => x !== id);
      const updated = [id, ...filtered].slice(0, RECENT_MAX);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Toggle Favorite
  const toggleFavorite = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setFavorites((prev) => {
        const isFav = prev.includes(id);
        const next = isFav ? prev.filter((x) => x !== id) : [id, ...prev];
        try {
          localStorage.setItem(FAV_KEY, JSON.stringify(next));
        } catch {}
        showToast(
          isFav ? 'Removed from favorites' : 'Added to favorites ⭐',
          isFav ? 'info' : 'success'
        );
        return next;
      });
    },
    [showToast]
  );

  // Toggle Pin (manually pin tool to top of Home and All Tools)
  const togglePin = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setPinned((prev) => {
        const isPinned = prev.includes(id);
        const next = isPinned ? prev.filter((x) => x !== id) : [id, ...prev];
        try {
          localStorage.setItem(PIN_KEY, JSON.stringify(next));
        } catch {}
        showToast(
          isPinned ? 'Unpinned tool from top' : 'Pinned tool to top 📌',
          isPinned ? 'info' : 'success'
        );
        return next;
      });
    },
    [showToast]
  );

  // Open Tool
  const handleSelectTool = useCallback(
    (id: string) => {
      const tool = getToolBySlugOrId(id) || getToolById(id);
      if (!tool) return;
      trackRecent(tool.id);
      setPrevViewWasAll(view === 'all');
      setCurrentToolId(tool.id);
      setView('tool');
      window.location.hash = `#tool=${tool.id}`;
      window.scrollTo(0, 0);
    },
    [view, trackRecent]
  );

  // Navigate Views
  const handleNavigate = useCallback((targetView: PageView) => {
    runToolCleanup();
    setView(targetView);
    setCurrentToolId(null);
    if (targetView === 'home') {
      window.location.hash = '';
    } else if (targetView === 'all') {
      window.location.hash = '#all-tools';
    } else {
      window.location.hash = `#${targetView}`;
    }
    window.scrollTo(0, 0);
  }, []);

  // Back from Tool View
  const handleBackFromTool = useCallback(() => {
    runToolCleanup();
    handleNavigate(prevViewWasAll ? 'all' : 'home');
  }, [prevViewWasAll, handleNavigate]);

  // Parse Hash, Pathname & Search on mount & navigation
  useEffect(() => {
    const handleUrlState = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const pathname = window.location.pathname;

      // 1. Check query parameter e.g. ?tool=xyz or ?cat=xyz or ?search=xyz
      if (search) {
        const params = new URLSearchParams(search);
        const qTool = params.get('tool');
        const qCat = params.get('cat');
        const qSearch = params.get('q') || params.get('search');
        if (qTool) {
          const t = getToolBySlugOrId(qTool);
          if (t) {
            trackRecent(t.id);
            setCurrentToolId(t.id);
            setView('tool');
            return;
          }
        }
        if (qCat && (categories[qCat] || qCat === 'popular')) {
          setActiveCat(qCat);
          setView('all');
          return;
        }
        if (qSearch) {
          setSearchQuery(qSearch.trim());
          setView('all');
          return;
        }
      }

      // 2. Check hash
      const toolMatch = hash.match(/^#tool=([a-zA-Z0-9_-]+)$/);
      const catMatch = hash.match(/^#cat=(\w+)$/);
      const searchMatch = hash.match(/^#search=(.+)$/);

      if (toolMatch) {
        const t = getToolBySlugOrId(toolMatch[1]);
        if (t) {
          trackRecent(t.id);
          setCurrentToolId(t.id);
          setView('tool');
          return;
        }
      } else if (catMatch && (categories[catMatch[1]] || catMatch[1] === 'popular')) {
        setActiveCat(catMatch[1]);
        setView('all');
        return;
      } else if (hash === '#popular' || hash === '#popular-tools') {
        setActiveCat('popular');
        setView('all');
        return;
      } else if (searchMatch) {
        try {
          setSearchQuery(decodeURIComponent(searchMatch[1]).trim());
        } catch {
          setSearchQuery(searchMatch[1].trim());
        }
        setView('all');
        return;
      } else if (hash === '#all-tools') {
        setActiveCat('all');
        setView('all');
        return;
      } else if (
        hash === '#about' ||
        hash === '#contact' ||
        hash === '#privacy' ||
        hash === '#terms' ||
        hash === '#disclaimer'
      ) {
        setView(hash.slice(1) as PageView);
        return;
      }

      // 3. Check pathname (e.g. sitemap direct URLs like /tools/tool-age-calculator.html or /about.html)
      const toolPatMatch = pathname.match(/\/(?:tools\/)?tool-([a-zA-Z0-9_-]+)(?:\.html)?$/);
      if (toolPatMatch) {
        const t = getToolBySlugOrId(toolPatMatch[1]);
        if (t) {
          trackRecent(t.id);
          setCurrentToolId(t.id);
          setView('tool');
          return;
        }
      }

      const staticMatch = pathname.match(/\/(about|contact|privacy|terms|disclaimer)(?:\.html)?$/);
      if (staticMatch) {
        setView(staticMatch[1] as PageView);
        return;
      }

      if (pathname.includes('/tools/')) {
        setView('all');
        return;
      }

      if (!hash || hash === '#') {
        setView('home');
      }
    };

    handleUrlState();
    window.addEventListener('hashchange', handleUrlState);
    window.addEventListener('popstate', handleUrlState);
    return () => {
      window.removeEventListener('hashchange', handleUrlState);
      window.removeEventListener('popstate', handleUrlState);
    };
  }, [trackRecent]);

  // Global Keyboard Shortcuts (Ctrl+K or / to open Command Palette, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is currently in an input, textarea or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === '/' && !isInput && !isCommandPaletteOpen) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (view === 'tool') {
          handleBackFromTool();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isCommandPaletteOpen, handleBackFromTool]);

  const currentTool: Tool | undefined = currentToolId
    ? getToolById(currentToolId)
    : undefined;

  // SEO & Social OpenGraph dynamic synchronization
  useSeoMetadata({
    view,
    tool: currentTool || null,
    activeCat,
    searchQuery,
    language,
  });

  return (
    <div className="app-shell">
      <Header
        currentView={view}
        onNavigate={handleNavigate}
        activeCat={activeCat}
        onSelectCat={(cat) => {
          setActiveCat(cat);
          handleNavigate('all');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onThemeChange={setTheme}
        language={language}
        onLanguageChange={setLanguage}
        favoritesCount={favorites.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <main className="stage">
        {view === 'home' && (
          <>
            <Hero
              language={language}
              onSearch={(query) => {
                setSearchQuery(query);
                handleNavigate('all');
              }}
              onSelectTool={handleSelectTool}
            />
            <StatsBar language={language} />
            <HomeSections
              language={language}
              favorites={favorites}
              pinned={pinned}
              recent={recent}
              onToggleFav={toggleFavorite}
              onTogglePin={togglePin}
              onSelectTool={handleSelectTool}
              onBrowseAll={() => handleNavigate('all')}
            />
          </>
        )}

        {view === 'all' && (
          <AllToolsView
            language={language}
            activeCat={activeCat}
            searchQuery={searchQuery}
            favorites={favorites}
            pinned={pinned}
            recent={recent}
            onToggleFav={toggleFavorite}
            onTogglePin={togglePin}
            onSelectTool={handleSelectTool}
            onSelectCat={setActiveCat}
            onClearSearch={() => setSearchQuery('')}
          />
        )}

        {view === 'tool' && (
          <ErrorBoundary
            fallbackTitle="Tool Error"
            onReset={() => {
              if (currentTool) handleSelectTool(currentTool.id);
            }}
          >
            {currentTool ? (
              <ToolView
                tool={currentTool}
                language={language}
                isFav={favorites.includes(currentTool.id)}
                isPinned={pinned.includes(currentTool.id)}
                onToggleFav={() => toggleFavorite(currentTool.id)}
                onTogglePin={() => togglePin(currentTool.id)}
                onBack={handleBackFromTool}
                onSelectTool={handleSelectTool}
                onSelectCat={(cat) => {
                  setActiveCat(cat);
                  handleNavigate('all');
                }}
                onShowToast={showToast}
              />
            ) : (
              <ToolNotFoundView
                language={language}
                onSelectTool={handleSelectTool}
                onBrowseAll={() => handleNavigate('all')}
                onGoHome={() => handleNavigate('home')}
              />
            )}
          </ErrorBoundary>
        )}

        {(view === 'about' ||
          view === 'contact' ||
          view === 'privacy' ||
          view === 'terms' ||
          view === 'disclaimer') && (
          <StaticPageView
            page={view}
            language={language}
            onBack={() => handleNavigate('home')}
          />
        )}
      </main>

      <Footer
        language={language}
        onNavigate={handleNavigate}
        onSelectCat={(cat) => {
          setActiveCat(cat);
          handleNavigate('all');
        }}
      />

      <CookieBanner
        language={language}
        onOpenPrivacy={() => handleNavigate('privacy')}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
        language={language}
        favorites={favorites}
        pinned={pinned}
        recent={recent}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
