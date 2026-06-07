export type WatchStatus = 'wish' | 'watching' | 'watched' | 'dropped';

export interface WatchLog {
  id: string;
  movieId: string;
  date: string;
  note?: string;
  createdAt: string;
}

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
  watchLogs: WatchLog[];
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

export type TabType = 'library' | 'calendar' | 'rating' | 'rankings' | 'quotes' | 'cards' | 'dashboard' | 'settings';

export type CardSource = 'all' | 'ranking' | 'rewatch' | 'yearly';

export interface CardConfig {
  source: CardSource;
  rankingId?: string;
  year?: number;
  showRating: boolean;
  showWatchDate: boolean;
  showReview: boolean;
  movieCount: number;
}
