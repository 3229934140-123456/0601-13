import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie, Ranking, Quote, AppSettings, WatchStatus, WatchLog } from '@/types';
import { mockMovies, mockRankings, mockQuotes, mockSettings } from '@/utils/mock';
import { nanoid } from 'nanoid';

const migrateMovieData = (movie: any): Movie => {
  if (movie.watchLogs && Array.isArray(movie.watchLogs)) {
    return movie as Movie;
  }
  const watchLogs: WatchLog[] = [];
  const now = new Date().toISOString();
  if (movie.watchDate) {
    watchLogs.push({
      id: nanoid(),
      movieId: movie.id,
      date: movie.watchDate,
      createdAt: now,
    });
  }
  if (movie.rewatchCount && movie.rewatchCount > 0) {
    for (let i = 0; i < movie.rewatchCount; i++) {
      watchLogs.push({
        id: nanoid(),
        movieId: movie.id,
        date: movie.watchDate || now.split('T')[0],
        note: `第${i + 2}次观看`,
        createdAt: now,
      });
    }
  }
  return {
    ...movie,
    watchLogs,
  };
};

interface AppState {
  movies: Movie[];
  rankings: Ranking[];
  quotes: Quote[];
  settings: AppSettings;

  addMovie: (movie: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'watchLogs'> & { watchDate?: string; initialWatchLogs?: Array<{ date: string; note?: string }> }) => void;
  updateMovie: (id: string, updates: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  getRewatchCount: (movieId: string) => number;
  getLatestWatchDate: (movieId: string) => string | undefined;

  addWatchLog: (movieId: string, date: string, note?: string) => void;
  updateWatchLog: (movieId: string, logId: string, updates: Partial<WatchLog>) => void;
  deleteWatchLog: (movieId: string, logId: string) => void;
  addRewatch: (movieId: string, date?: string, note?: string) => void;
  removeLastRewatch: (movieId: string) => void;
  removeAllWatchLogs: (movieId: string) => void;

  addRanking: (ranking: Omit<Ranking, 'id' | 'createdAt' | 'updatedAt' | 'movieIds'>) => void;
  updateRanking: (id: string, updates: Partial<Ranking>) => void;
  deleteRanking: (id: string) => void;
  reorderRankingMovies: (rankingId: string, movieIds: string[]) => void;
  addMovieToRanking: (rankingId: string, movieId: string) => void;
  removeMovieFromRanking: (rankingId: string, movieId: string) => void;
  batchAddToRanking: (rankingId: string, movieIds: string[]) => void;
  generateYearlyTop: (year: number, count?: number) => string[];

  addQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  updateSettings: (updates: Partial<AppSettings>) => void;

  importMovies: (movies: Array<Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'watchLogs'> & { watchDate?: string }>) => void;
  exportData: () => string;
  importData: (data: string) => void;
  resetData: () => void;

  updateWatchStatus: (movieId: string, status: WatchStatus, watchDate?: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      movies: mockMovies,
      rankings: mockRankings,
      quotes: mockQuotes,
      settings: mockSettings,

      getRewatchCount: (movieId) => {
        const movie = get().movies.find((m) => m.id === movieId);
        return movie ? Math.max(0, movie.watchLogs.length - 1) : 0;
      },

      getLatestWatchDate: (movieId) => {
        const movie = get().movies.find((m) => m.id === movieId);
        if (!movie || movie.watchLogs.length === 0) return undefined;
        return [...movie.watchLogs].sort((a, b) => b.date.localeCompare(a.date))[0].date;
      },

      addMovie: (movieData) => {
        const now = new Date().toISOString();
        const watchLogs: WatchLog[] = [];
        if (movieData.initialWatchLogs && movieData.initialWatchLogs.length > 0) {
          movieData.initialWatchLogs.forEach((log) => {
            watchLogs.push({
              id: nanoid(),
              movieId: '',
              date: log.date,
              note: log.note,
              createdAt: now,
            });
          });
        } else if (movieData.watchDate) {
          watchLogs.push({
            id: nanoid(),
            movieId: '',
            date: movieData.watchDate,
            createdAt: now,
          });
        }
        const newMovie: Movie = {
          ...movieData,
          id: nanoid(),
          watchLogs: watchLogs.sort((a, b) => a.date.localeCompare(b.date)),
          createdAt: now,
          updatedAt: now,
        };
        newMovie.watchLogs = newMovie.watchLogs.map((log) => ({ ...log, movieId: newMovie.id }));
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

      addWatchLog: (movieId, date, note) => {
        const now = new Date().toISOString();
        const newLog: WatchLog = {
          id: nanoid(),
          movieId,
          date,
          note,
          createdAt: now,
        };
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === movieId
              ? {
                  ...m,
                  watchLogs: [...m.watchLogs, newLog].sort((a, b) => a.date.localeCompare(b.date)),
                  status: 'watched' as WatchStatus,
                  updatedAt: now,
                }
              : m
          ),
        }));
      },

      updateWatchLog: (movieId, logId, updates) => {
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === movieId
              ? {
                  ...m,
                  watchLogs: m.watchLogs.map((log) =>
                    log.id === logId ? { ...log, ...updates } : log
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        }));
      },

      deleteWatchLog: (movieId, logId) => {
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === movieId
              ? {
                  ...m,
                  watchLogs: m.watchLogs.filter((log) => log.id !== logId),
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        }));
      },

      addRewatch: (movieId, date, note) => {
        const watchDate = date || new Date().toISOString().split('T')[0];
        get().addWatchLog(movieId, watchDate, note || `第${get().getRewatchCount(movieId) + 2}次观看`);
      },

      removeLastRewatch: (movieId) => {
        const movie = get().movies.find((m) => m.id === movieId);
        if (!movie || movie.watchLogs.length <= 1) return;
        
        const sortedLogs = [...movie.watchLogs].sort((a, b) => b.date.localeCompare(a.date));
        const lastLogId = sortedLogs[0].id;
        get().deleteWatchLog(movieId, lastLogId);
      },

      removeAllWatchLogs: (movieId) => {
        const movie = get().movies.find((m) => m.id === movieId);
        if (!movie || movie.watchLogs.length <= 1) return;
        
        const sortedLogs = [...movie.watchLogs].sort((a, b) => a.date.localeCompare(b.date));
        const firstLogId = sortedLogs[0].id;
        
        set((state) => ({
          movies: state.movies.map((m) =>
            m.id === movieId
              ? {
                  ...m,
                  watchLogs: m.watchLogs.filter((log) => log.id === firstLogId),
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
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

      batchAddToRanking: (rankingId, movieIds) => {
        set((state) => {
          const ranking = state.rankings.find((r) => r.id === rankingId);
          if (!ranking) return state;
          
          const newIds = movieIds.filter((id) => !ranking.movieIds.includes(id));
          return {
            rankings: state.rankings.map((r) =>
              r.id === rankingId
                ? { ...r, movieIds: [...r.movieIds, ...newIds], updatedAt: new Date().toISOString() }
                : r
            ),
          };
        });
      },

      generateYearlyTop: (year, count = 10) => {
        const watched = get().movies.filter(
          (m) => m.status === 'watched' && m.year === year && m.rating > 0
        );
        const sorted = [...watched].sort((a, b) => b.rating - a.rating);
        return sorted.slice(0, count).map((m) => m.id);
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
        const newMovies = moviesData.map((m) => {
          let movie: Movie;
          if ((m as any).watchLogs && Array.isArray((m as any).watchLogs)) {
            movie = {
              ...m,
              id: nanoid(),
              createdAt: now,
              updatedAt: now,
            } as Movie;
            movie.watchLogs = movie.watchLogs.map(log => ({
              ...log,
              id: log.id || nanoid(),
              movieId: movie.id,
              createdAt: log.createdAt || now,
            }));
          } else {
            movie = {
              ...m,
              id: nanoid(),
              watchLogs: [],
              createdAt: now,
              updatedAt: now,
            } as Movie;
            const legacy = m as any;
            if (legacy.watchDate) {
              movie.watchLogs.push({
                id: nanoid(),
                movieId: movie.id,
                date: legacy.watchDate,
                createdAt: now,
              });
              if (legacy.rewatchCount && legacy.rewatchCount > 0) {
                for (let i = 0; i < legacy.rewatchCount; i++) {
                  movie.watchLogs.push({
                    id: nanoid(),
                    movieId: movie.id,
                    date: legacy.watchDate,
                    note: `第${i + 2}次观看`,
                    createdAt: now,
                  });
                }
              }
            }
          }
          return movie;
        });
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
            const migratedMovies = data.movies.map((m: any) => migrateMovieData(m));
            set({
              movies: migratedMovies,
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
          movies: state.movies.map((m) => {
            if (m.id !== movieId) return m;
            
            let watchLogs = m.watchLogs;
            if (status === 'watched' && watchDate && m.watchLogs.length === 0) {
              watchLogs = [
                {
                  id: nanoid(),
                  movieId,
                  date: watchDate,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
            
            return {
              ...m,
              status,
              watchLogs,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'film-tracker-data',
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState;
        if (persistedState.movies && Array.isArray(persistedState.movies)) {
          persistedState.movies = persistedState.movies.map((m: any) => migrateMovieData(m));
        }
        return persistedState;
      },
    }
  )
);
