import { useEffect } from 'react';
import type { PageView, Tool, Language } from '../types';
import { categories, toolSlugs } from '../data/tools';

interface SeoProps {
  view: PageView;
  tool: Tool | null;
  activeCat: string;
  searchQuery: string;
  language: Language;
}

const BASE_URL = 'https://www.toolkit-pro.in';

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setDynamicJsonLd(id: string, data: object | null) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function useSeoMetadata({ view, tool, activeCat, searchQuery, language }: SeoProps) {
  useEffect(() => {
    let title = 'Toolkit Pro — 218 Free Online Tools, No AI, No Sign-Up';
    let description =
      '218 free browser-based tools for text, images, calculators, converters, security and developers. No AI, no accounts, no file uploads — runs instantly and privately in your browser.';
    let canonical = BASE_URL + '/';
    let dynamicLd: object | null = null;

    if (view === 'tool' && tool) {
      const slug = toolSlugs[tool.id] || tool.id;
      const catObj = categories[tool.cat];
      const catName = catObj ? catObj.label : 'Utility';

      title = `${tool.name} — Free Online Tool | Toolkit Pro`;
      description = `${tool.desc} Fast, free browser tool with zero server upload, 100% privacy, and instant results.`;
      canonical = `${BASE_URL}/tools/tool-${slug}.html`;

      dynamicLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            '@id': `${canonical}#app`,
            name: `${tool.name} - Toolkit Pro`,
            url: canonical,
            description: tool.desc,
            applicationCategory: catName,
            operatingSystem: 'All',
            browserRequirements: 'Requires JavaScript and HTML5-capable web browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              tool.name,
              'Client-side processing',
              'No sign-up required',
              'No file uploads to server',
            ],
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${BASE_URL}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: catName,
                item: `${BASE_URL}/#cat=${tool.cat}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: tool.name,
                item: canonical,
              },
            ],
          },
        ],
      };
    } else if (view === 'all') {
      if (searchQuery) {
        title = `Search: "${searchQuery}" — Toolkit Pro`;
        description = `Search results for "${searchQuery}" across 218+ free browser-based developer and utility tools.`;
        canonical = `${BASE_URL}/#search=${encodeURIComponent(searchQuery)}`;
      } else if (activeCat !== 'all' && categories[activeCat]) {
        const catObj = categories[activeCat];
        title = `${catObj.label} Tools — 100% Free & Browser-Based | Toolkit Pro`;
        description = `Browse free online ${catObj.label.toLowerCase()} tools. Run calculations, transformations, and conversions instantly with complete privacy.`;
        canonical = `${BASE_URL}/#cat=${activeCat}`;
      } else {
        title = 'All 218+ Free Online Tools — Fast, Private & Browser-Based | Toolkit Pro';
        description =
          'Browse the complete collection of 218+ online tools for text, images, calculations, PDF manipulation, and developer utilities.';
        canonical = `${BASE_URL}/tools/`;
      }
    } else if (view === 'about') {
      title = 'About Toolkit Pro — Fast, Private & Deterministic Web Utilities';
      description =
        'Learn about Toolkit Pro’s mission: providing 218+ high-speed, private, browser-based tools without AI hallucinations, tracking, or server uploads.';
      canonical = `${BASE_URL}/about.html`;
    } else if (view === 'contact') {
      title = 'Contact Us — Toolkit Pro Support & Feature Requests';
      description = 'Get in touch with the Toolkit Pro team for inquiries, feedback, or tool suggestions.';
      canonical = `${BASE_URL}/contact.html`;
    } else if (view === 'privacy') {
      title = 'Privacy Policy — Zero Data Collection Guarantee | Toolkit Pro';
      description =
        'Toolkit Pro privacy policy: learn how all processing is strictly client-side with zero file uploads or tracking.';
      canonical = `${BASE_URL}/privacy.html`;
    } else if (view === 'terms') {
      title = 'Terms of Service — Toolkit Pro';
      description = 'Read the terms of service governing usage of Toolkit Pro free web utilities.';
      canonical = `${BASE_URL}/terms.html`;
    } else if (view === 'disclaimer') {
      title = 'Disclaimer — Toolkit Pro';
      description = 'Important disclaimers regarding calculated results, unit conversions, and usage of Toolkit Pro tools.';
      canonical = `${BASE_URL}/disclaimer.html`;
    }

    // Update document title
    document.title = title;

    // Update standard meta description
    setMetaTag('name', 'description', description);

    // Update OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonical);

    // Update Twitter
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    // Update Canonical
    setCanonical(canonical);

    // Update or clear dynamic structured data
    setDynamicJsonLd('tp-dynamic-jsonld', dynamicLd);
  }, [view, tool, activeCat, searchQuery, language]);
}
