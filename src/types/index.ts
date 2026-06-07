export type WatchStatus = 'wish' | 'watching' | 'watched' | 'dropped';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  genres: string[];
  director: string;
  cast: string[];
  runtime?: number;
  poster?: string;
  country?: string;
  rating: number;
  status: WatchStatus;
  watchDate?: string;
  rewatchCount: number;
  shortReview?: string;
  longReview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ranking {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  movieIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  movieId: string;
  content: string;
  screenshot?: string;
  note?: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultYear: number;
  privacy: 'public' | 'private';
}

export interface AppState {
  movies: Movie[];
  rankings: Ranking[];
  quotes: Quote[];
  settings: AppSettings;
}

export interface WatchLog {
  date: string;
  movieIds: string[];
  count: number;
}

export type TabType = 'library' | 'calendar' | 'rating' | 'rankings' | 'quotes' | 'cards' | 'dashboard' | 'settings';
