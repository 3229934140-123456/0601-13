import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Film, Star, Clock, Award, TrendingUp, User, Users, Plus, Minus, X, Search, ChevronDown, ChevronUp, Calendar, Edit, Eye } from 'lucide-react';
import { Modal } from '@/components/Modal/Modal';
import { Movie, WatchLog } from '@/types';

interface MonthlyWatchItem {
  log: WatchLog;
  movie: Movie;
}

export function DashboardPage() {
  const { movies, quotes, rankings, addRewatch, removeLastRewatch, removeAllWatchLogs, addWatchLog } = useStore();
  const [showAddRewatchModal, setShowAddRewatchModal] = useState(false);
  const [rewatchSearchQuery, setRewatchSearchQuery] = useState('');
  const [selectedRewatchDate, setSelectedRewatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    movies.forEach((m) => {
      m.watchLogs.forEach((log) => {
        const year = parseInt(log.date.split('-')[0], 10);
        if (year) years.add(year);
      });
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [movies]);

  const yearWatchLogs = useMemo(() => {
    const items: { log: WatchLog; movie: Movie }[] = [];
    movies.forEach((movie) => {
      movie.watchLogs.forEach((log) => {
        if (log.date.startsWith(String(selectedYear))) {
          items.push({ log, movie });
        }
      });
    });
    return items.sort((a, b) => b.log.date.localeCompare(a.log.date));
  }, [movies, selectedYear]);

  const yearMovies = useMemo(() => {
    const movieIds = new Set(yearWatchLogs.map((item) => item.movie.id));
    return movies.filter((m) => movieIds.has(m.id));
  }, [movies, yearWatchLogs]);

  const stats = useMemo(() => {
    const totalWatchCount = yearWatchLogs.length;
    const totalMovies = yearMovies.length;
    const avgRating = totalMovies > 0
      ? yearMovies.reduce((sum, m) => sum + m.rating, 0) / totalMovies
      : 0;
    const rewatchCount = Math.max(0, totalWatchCount - totalMovies);
    const totalRuntime = yearMovies.reduce((sum, m) => sum + (m.runtime || 0), 0);

    return {
      totalWatchCount,
      totalMovies,
      avgRating: avgRating.toFixed(1),
      rewatchCount,
      totalRuntime: Math.round(totalRuntime / 60),
    };
  }, [yearWatchLogs, yearMovies]);

  const genreStats = useMemo(() => {
    const genreMap = new Map<string, number>();
    yearMovies.forEach((movie) => {
      movie.genres.forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    return Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [yearMovies]);

  const monthlyStats = useMemo(() => {
    const months: { month: string; monthNum: number; count: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const monthKey = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
      const count = yearWatchLogs.filter((item) => item.log.date.startsWith(monthKey)).length;
      months.push({ month: `${i + 1}月`, monthNum: i + 1, count });
    }
    return months;
  }, [yearWatchLogs, selectedYear]);

  const getMonthlyItems = (monthNum: number): MonthlyWatchItem[] => {
    const monthKey = `${selectedYear}-${String(monthNum).padStart(2, '0')}`;
    return yearWatchLogs
      .filter((item) => item.log.date.startsWith(monthKey))
      .sort((a, b) => b.log.date.localeCompare(a.log.date));
  };

  const directorStats = useMemo(() => {
    const directorMap = new Map<string, number>();
    yearMovies.forEach((movie) => {
      if (movie.director) {
        directorMap.set(movie.director, (directorMap.get(movie.director) || 0) + 1);
      }
    });
    return Array.from(directorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [yearMovies]);

  const actorStats = useMemo(() => {
    const actorMap = new Map<string, number>();
    yearMovies.forEach((movie) => {
      movie.cast.forEach((actor) => {
        actorMap.set(actor, (actorMap.get(actor) || 0) + 1);
      });
    });
    return Array.from(actorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [yearMovies]);

  const rewatchMovies = useMemo(() => {
    const movieRewatchCount = new Map<string, number>();
    yearWatchLogs.forEach((item) => {
      const current = movieRewatchCount.get(item.movie.id) || 0;
      movieRewatchCount.set(item.movie.id, current + 1);
    });
    return yearMovies
      .filter((m) => (movieRewatchCount.get(m.id) || 0) > 1)
      .map((m) => ({ movie: m, count: movieRewatchCount.get(m.id) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [yearMovies, yearWatchLogs]);

  const watchedMoviesAll = useMemo(() => {
    return movies.filter((m) => m.status === 'watched');
  }, [movies]);

  const GENRE_COLORS = ['#D4AF37', '#C4A030', '#B08828', '#9A7420', '#846018', '#6E4C10', '#583808', '#483006'];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            数据总览
          </h1>
          <p className="text-sm text-film-400 mt-1">
            全面了解你的观影数据
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(parseInt(e.target.value, 10));
              setExpandedMonth(null);
            }}
            className="px-4 py-2 bg-[#15151c] border border-[#252530] rounded-lg text-white text-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year} 年度复盘</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530] card-hover">
          <div className="flex items-center justify-between mb-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-film-500">观看次数</span>
          </div>
          <p className="text-3xl font-bold text-gold-gradient">{stats.totalWatchCount}</p>
          <p className="text-xs text-film-400 mt-1">{stats.totalMovies} 部影片</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530] card-hover">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-film-500">平均分</span>
          </div>
          <p className="text-3xl font-bold text-gold-gradient">{stats.avgRating}</p>
          <p className="text-xs text-film-400 mt-1">基于 {stats.totalMovies} 部评分</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530] card-hover">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-film-500">总时长</span>
          </div>
          <p className="text-3xl font-bold text-gold-gradient">{stats.totalRuntime}<span className="text-lg">h</span></p>
          <p className="text-xs text-film-400 mt-1">约 {Math.round(stats.totalRuntime / 24)} 天</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530] card-hover">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-film-500">重看次数</span>
          </div>
          <p className="text-3xl font-bold text-gold-gradient">{stats.rewatchCount}</p>
          <p className="text-xs text-film-400 mt-1">共 {rewatchMovies.length} 部影片重看</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            {selectedYear}年月度观影趋势
            <span className="text-xs text-film-500 font-normal ml-2">点击月份查看影片</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyStats}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    const monthNum = data.activePayload[0].payload.monthNum;
                    setExpandedMonth(expandedMonth === monthNum ? null : monthNum);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#252530" vertical={false} />
                <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                />
                <Bar dataKey="count" name="观看次数" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {expandedMonth && (
            <div className="mt-4 pt-4 border-t border-[#252530]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedYear}年{expandedMonth}月 · {getMonthlyItems(expandedMonth).length} 次观看
                </h4>
                <button
                  onClick={() => setExpandedMonth(null)}
                  className="text-xs text-film-400 hover:text-white transition-colors"
                >
                  收起
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {getMonthlyItems(expandedMonth).map((item) => (
                  <div
                    key={item.log.id}
                    className="flex items-center gap-3 p-2.5 bg-[#1a1a24] rounded-lg group"
                  >
                    {item.movie.poster ? (
                      <img src={item.movie.poster} alt={item.movie.title} className="w-8 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-12 bg-[#252530] rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{item.movie.title}</p>
                        <span className="text-amber-400 text-xs font-bold">{item.movie.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-film-400 mt-0.5">
                        <span>{item.log.date}</span>
                        {item.log.note && <span className="truncate">· {item.log.note}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            类型分布
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genreStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {genreStats.slice(0, 4).map((genre, i) => (
              <div key={genre.name} className="flex items-center gap-1 text-xs text-film-300">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GENRE_COLORS[i] }} />
                {genre.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            最爱的导演
          </h3>
          <div className="space-y-3">
            {directorStats.map((director, index) => (
              <div key={director.name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{director.name}</span>
                    <span className="text-xs text-amber-400">{director.count} 部</span>
                  </div>
                  <div className="h-1.5 bg-[#252530] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: `${directorStats[0] ? (director.count / directorStats[0].count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {directorStats.length === 0 && (
              <p className="text-center text-film-500 py-4 text-sm">暂无数据</p>
            )}
          </div>
        </div>

        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            最爱的演员
          </h3>
          <div className="space-y-3">
            {actorStats.map((actor, index) => (
              <div key={actor.name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{actor.name}</span>
                    <span className="text-xs text-amber-400">{actor.count} 部</span>
                  </div>
                  <div className="h-1.5 bg-[#252530] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: `${actorStats[0] ? (actor.count / actorStats[0].count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {actorStats.length === 0 && (
              <p className="text-center text-film-500 py-4 text-sm">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">年度重看影片</h3>
            <button
              onClick={() => setShowAddRewatchModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <Plus className="w-3 h-3" />
              添加重看
            </button>
          </div>
          <div className="space-y-3">
            {rewatchMovies.map(({ movie, count }) => (
              <div key={movie.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#1a1a24] group">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                ) : (
                  <div className="w-10 h-14 bg-[#252530] rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                  <p className="text-xs text-film-400">{movie.director}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => removeLastRewatch(movie.id)}
                    title="减少一次重看"
                    className="p-1.5 rounded bg-[#252530] text-film-400 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="text-center min-w-[40px]">
                    <p className="text-amber-400 font-bold text-sm">{count}</p>
                    <p className="text-xs text-film-500">次观看</p>
                  </div>
                  <button
                    onClick={() => addRewatch(movie.id)}
                    title="增加一次重看"
                    className="p-1.5 rounded bg-[#252530] text-film-400 hover:text-amber-400 hover:bg-amber-500/20 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要将这部影片移出自重看片单吗？将保留首次观看记录。')) {
                        removeAllWatchLogs(movie.id);
                      }
                    }}
                    title="移出自重看片单"
                    className="p-1.5 rounded bg-[#252530] text-film-400 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {rewatchMovies.length === 0 && (
              <p className="text-center text-film-500 py-4 text-sm">暂无重看影片</p>
            )}
          </div>
        </div>

        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4">年度 Top 5 高分</h3>
          <div className="space-y-3">
            {[...yearMovies]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((movie, index) => (
                <div key={movie.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#1a1a24]">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} className="w-8 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-12 bg-[#252530] rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                    <p className="text-xs text-film-400">{movie.director}</p>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">{movie.rating}</span>
                </div>
              ))}
            {yearMovies.length === 0 && (
              <p className="text-center text-film-500 py-4 text-sm">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddRewatchModal}
        onClose={() => setShowAddRewatchModal(false)}
        title="添加重看记录"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-film-500" />
              <input
                type="text"
                value={rewatchSearchQuery}
                onChange={(e) => setRewatchSearchQuery(e.target.value)}
                placeholder="搜索已看影片..."
                className="w-full pl-9 pr-4 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm placeholder-film-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedRewatchDate}
                onChange={(e) => setSelectedRewatchDate(e.target.value)}
                className="px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {watchedMoviesAll
              .filter((m) => {
                if (!rewatchSearchQuery.trim()) return true;
                const q = rewatchSearchQuery.toLowerCase();
                return m.title.toLowerCase().includes(q) || m.director.toLowerCase().includes(q);
              })
              .map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center gap-3 p-2.5 bg-[#1a1a24] rounded-lg hover:bg-[#1f1f2b] transition-colors cursor-pointer group"
                  onClick={() => {
                    if (movie.watchLogs.length === 0) {
                      addWatchLog(movie.id, selectedRewatchDate);
                    } else {
                      addRewatch(movie.id, selectedRewatchDate);
                    }
                    setShowAddRewatchModal(false);
                    setRewatchSearchQuery('');
                  }}
                >
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-14 bg-[#252530] rounded flex items-center justify-center">
                      <Film className="w-4 h-4 text-film-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                    <p className="text-xs text-film-400">
                      {movie.director} · 已看 {movie.watchLogs.length} 次
                    </p>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (movie.watchLogs.length === 0) {
                        addWatchLog(movie.id, selectedRewatchDate);
                      } else {
                        addRewatch(movie.id, selectedRewatchDate);
                      }
                      setShowAddRewatchModal(false);
                      setRewatchSearchQuery('');
                    }}
                  >
                    {movie.watchLogs.length === 0 ? '首次观看' : '添加重看'}
                  </button>
                </div>
              ))}
            {watchedMoviesAll.filter((m) => {
              if (!rewatchSearchQuery.trim()) return true;
              const q = rewatchSearchQuery.toLowerCase();
              return m.title.toLowerCase().includes(q) || m.director.toLowerCase().includes(q);
            }).length === 0 && (
              <p className="text-center text-film-500 py-8 text-sm">没有找到匹配的影片</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
