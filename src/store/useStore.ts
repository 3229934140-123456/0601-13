import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie, Ranking, Quote, AppSettings, WatchStatus } from '@/types';
import { mockMovies, mockRankings, mockQuotes, mockSettings } from '@/utils/mock';
import { nanoid } from 'nanoid';

interface AppState {
  movies: Movie[];
  rankings: Ranking[];
  quotes: Quote[];
  settings: AppSettings;
  addMovie: (movie: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'rewatchCount'>) => void;
  updateMovie: (id: string, updates: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  addRanking: (ranking: Omit<Ranking, 'id' | 'createdAt' | 'updatedAt' | 'movieIds'>) => void;
  updateRanking: (id: string, updates: Partial<Ranking>) => void;
  deleteRanking: (id: string) => void;
  reorderRankingMovies: (rankingId: string, movieIds: string[]) => void;
  addMovieToRanking: (rankingId: string, movieId: string) => void;
  removeMovieFromRanking: (rankingId: string, movieId: string) => void;
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  importMovies: (movies: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  exportData: () => string;
  importData: (data: string) => void;
  resetData: () => void;
  updateWatchStatus: (movieId: string, status: WatchStatus, watchDate?: string) => void;
  incrementRewatch: (movieId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      movies: mockMovies,
      rankings: mockRankings,
      quotes: mockQuotes,
      settings: mockSettings,

      addMovie: (movieData) => {
        const now = new Date().toISOString();
        const newMovie: Movie = {
          ...movieData,
          id: nanoid(),
          rewatchCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ movies: [newMovie, ...state.movies] }));
      },

      updateMovie: (id, updates) => {
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
          ),
        }));
      },

      deleteMovie: (id) => {
        set((state) => ({
          movies: state.movies.filter((m) => m.id !== id),
          quotes: state.quotes.filter((q) => q.movieId !== id),
          rankings: state.rankings.map((r) => ({
            ...r,
            movieIds: r.movieIds.filter((mid) => mid !== id),
          })),
        }));
      },

      addRanking: (rankingData) => {
        const now = new Date().toISOString();
        const newRanking: Ranking = {
          ...rankingData,
          id: nanoid(),
          movieIds: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ rankings: [newRanking, ...state.rankings] }));
      },

      updateRanking: (id, updates) => {
        set((state) => ({
          rankings: state.rankings.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deleteRanking: (id) => {
        set((state) => ({
          rankings: state.rankings.filter((r) => r.id !== id),
        }));
      },

      reorderRankingMovies: (rankingId, movieIds) => {
        set((state) => ({
          rankings: state.rankings.map((r) =>
            r.id === rankingId ? { ...r, movieIds, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      addMovieToRanking: (rankingId, movieId) => {
        set((state) => ({
          rankings: state.rankings.map((r) =>
            r.id === rankingId && !r.movieIds.includes(movieId)
              ? { ...r, movieIds: [...r.movieIds, movieId], updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      removeMovieFromRanking: (rankingId, movieId) => {
        set((state) => ({
          rankings: state.rankings.map((r) =>
            r.id === rankingId
              ? { ...r, movieIds: r.movieIds.filter((id) => id !== movieId), updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      addQuote: (quoteData) => {
        const newQuote: Quote = {
          ...quoteData,
          id: nanoid(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ quotes: [newQuote, ...state.quotes] }));
      },

      updateQuote: (id, updates) => {
        set((state) => ({
          quotes: state.quotes.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));
      },

      deleteQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      importMovies: (moviesData) => {
        const now = new Date().toISOString();
        const newMovies = moviesData.map((m) => ({
          ...m,
          id: nanoid(),
          rewatchCount: 0,
          createdAt: now,
          updatedAt: now,
        }));
        set((state) => ({ movies: [...newMovies, ...state.movies] }));
      },

      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            movies: state.movies,
            rankings: state.rankings,
            quotes: state.quotes,
            settings: state.settings,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },

      importData: (dataStr) => {
        try {
          const data = JSON.parse(dataStr);
          if (data.movies && data.rankings && data.quotes && data.settings) {
            set({
              movies: data.movies,
              rankings: data.rankings,
              quotes: data.quotes,
              settings: data.settings,
            });
          }
        } catch (e) {
          console.error('Import failed:', e);
        }
      },

      resetData: () => {
        set({
          movies: mockMovies,
          rankings: mockRankings,
          quotes: mockQuotes,
          settings: mockSettings,
        });
      },

      updateWatchStatus: (movieId, status, watchDate) => {
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === movieId
              ? {
                  ...m,
                  status,
                  watchDate: watchDate || m.watchDate,
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        }));
      },

      incrementRewatch: (movieId) => {
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === movieId
              ? { ...m, rewatchCount: m.rewatchCount + 1, updatedAt: new Date().toISOString() }
              : m
          ),
        }));
      },
    }),
    {
      name: 'film-tracker-data',
    }
  )
);
