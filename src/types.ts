export interface Tool {
  id: string;
  cat: string;
  name: string;
  desc: string;
  keywords?: string;
  isPopular?: boolean;
  mount: (container: HTMLElement) => void;
}

export interface Category {
  label: string;
  icon: string;
  varName: string;
}

export type PageView =
  | 'home'
  | 'all'
  | 'tool'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'hi';
