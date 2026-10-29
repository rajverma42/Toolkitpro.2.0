import {
  TOOLS,
  CATS,
  TOOL_SLUGS,
  TRENDING_IDS,
  ICONS,
  onToolCleanup,
  runToolCleanup,
} from './toolsEngine.js';
import type { Tool, Category } from '../types';

/**
 * Top high-traffic, in-demand utility tools across categories.
 * Curated for quick access, viral utility, and daily productivity.
 */
export const popularToolIds: string[] = [
  // PDF Tools (Top in-demand utilities)
  'p01', // PDF Merger
  'p02', // PDF Splitter
  'p03', // PDF Compressor
  'p04', // PDF to JPG Converter
  'p05', // Image to PDF Converter

  // Image & Design (Viral & frequent web use)
  'i01', // Image Resizer
  'i02', // Image Compressor
  'i03', // Image Format Converter
  'i04', // Image Cropper
  'i05', // Color Picker from Image
  'i06', // Color Converter (HEX/RGB/HSL)
  'i07', // Color Palette Generator
  'i09', // Image to Base64
  'i26', // Image Background Color Remover
  'i28', // Meme Generator
  'i32', // Image Upscaler

  // Text & Writing (Universal utility)
  't01', // Word Counter & Character Stats
  't02', // Case Converter
  't05', // Find and Replace
  't06', // Text Diff Checker
  't07', // Duplicate Line Remover
  't09', // Lorem Ipsum Generator
  't28', // Text to Speech Reader
  't31', // Voice Typewriter (Speech to Text)

  // Calculators & Converters (Financial & Daily Math)
  'c04', // Age Calculator
  'c05', // BMI Calculator
  'c06', // Percentage Calculator
  'c07', // EMI & Loan Calculator
  'c09', // Compound Interest Calculator
  'c10', // Discount Calculator
  'c14', // Date Difference Calculator
  'c22', // Number to Words Converter
  'c45', // World Clock
  'c46', // Stopwatch & Lap Timer

  // Developer & Security Tools
  'd01', // JSON Formatter & Validator
  'd02', // JSON to CSV Converter
  'd03', // Base64 Encoder / Decoder
  'd04', // URL Encoder / Decoder
  'd06', // Regex Tester
  'd07', // UUID / GUID Generator
  'd08', // Strong Password Generator
  'd09', // Hash Generator (MD5 / SHA-256)
  'd19', // JWT Decoder
  'd20', // Unix Timestamp Converter
  's01', // Password Strength Checker
  's02', // PIN Generator

  // Productivity, CSS & SEO
  'pr01', // Pomodoro Timer
  'pr02', // To-Do List
  'pr07', // Typing Speed Test
  'pr12', // Printable Invoice Generator
  'cl01', // CSS Flexbox Generator
  'se01', // Meta Tag Generator
  'se04', // Robots.txt Generator
  'se05', // XML Sitemap Generator
];

// Mark isPopular on tools for easy runtime checks
export const allTools: Tool[] = (TOOLS as Tool[]).map((t) => ({
  ...t,
  isPopular: popularToolIds.includes(t.id),
}));

export const categories: Record<string, Category> = CATS;
export const toolSlugs: Record<string, string> = TOOL_SLUGS;
export const trendingIds: string[] = popularToolIds;
export const icons: Record<string, string> = ICONS;
export { onToolCleanup, runToolCleanup };

export function isPopularTool(id: string): boolean {
  return popularToolIds.includes(id);
}

export function getToolById(id: string): Tool | undefined {
  return allTools.find((t) => t.id === id);
}

export function getToolBySlugOrId(query: string): Tool | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();

  // 1. Direct ID match (e.g. "t01", "c05")
  const byId = allTools.find((t) => t.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Direct slug match (e.g. "word-counter")
  for (const [id, slug] of Object.entries(toolSlugs)) {
    if (slug.toLowerCase() === clean) {
      return getToolById(id);
    }
  }

  // 3. Clean up input: remove leading path, "tool-", and trailing ".html"
  const normalized = clean
    .replace(/^.*[\\/]/, '')
    .replace(/^tool-/, '')
    .replace(/\.html$/, '');

  for (const [id, slug] of Object.entries(toolSlugs)) {
    if (slug.toLowerCase() === normalized) {
      return getToolById(id);
    }
  }

  // 4. Fuzzy match slugified tool name
  return allTools.find((t) => {
    const s = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return s === normalized || s === clean;
  });
}

export function getRelatedTools(tool: Tool, count: number = 4): Tool[] {
  const pool = allTools.filter((t) => t.cat === tool.cat && t.id !== tool.id);
  // deterministic or pseudo-random slice
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
