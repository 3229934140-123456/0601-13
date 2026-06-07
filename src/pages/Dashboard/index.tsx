import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Film, Star, Clock, Award, TrendingUp, User, Users, Plus, Minus, X } from 'lucide-react';

export function DashboardPage() {
  const { movies, quotes, rankings, addRewatch, removeLastRewatch, removeAllWatchLogs } = useStore();

  const watchedMovies = useMemo(() => {
    return movies.filter((m) => m.status === 'watched');
  }, [movies]);

  const stats = useMemo(() => {
    const totalRuntime = watchedMovies.reduce((sum, m) => sum + (m.runtime || 0), 0);
    const avgRating = watchedMovies.length > 0
      ? watchedMovies.reduce((sum, m) => sum + m.rating, 0) / watchedMovies.length
      : 0;
    const totalWatchLogs = movies.reduce((sum, m) => sum + m.watchLogs.length, 0);
    const rewatchTotal = Math.max(0, totalWatchLogs - watchedMovies.length);

    return {
      total: movies.length,
      watched: watchedMovies.length,
      wish: movies.filter((m) => m.status === 'wish').length,
      avgRating: avgRating.toFixed(1),
      totalRuntime: Math.round(totalRuntime / 60),
      rewatchTotal,
      totalWatchLogs,
      quotesCount: quotes.length,
      rankingsCount: rankings.length,
    };
  }, [movies, quotes, rankings, watchedMovies]);

  const genreStats = useMemo(() => {
    const genreMap = new Map<string, number>();
    watchedMovies.forEach((movie) => {
      movie.genres.forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    return Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [watchedMovies]);

  const monthlyStats = useMemo(() => {
    const year = new Date().getFullYear();
    const months: { month: string; count: number }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
      const count = movies.reduce((sum, m) => {
        return sum + m.watchLogs.filter((log) => log.date.startsWith(monthKey)).length;
      }, 0);
      months.push({ month: `${i + 1}月`, count });
    }
    return months;
  }, [movies]);

  const directorStats = useMemo(() => {
    const directorMap = new Map<string, number>();
    watchedMovies.forEach((movie) => {
      if (movie.director) {
        directorMap.set(movie.director, (directorMap.get(movie.director) || 0) + 1);
      }
    });
    return Array.from(directorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [watchedMovies]);

  const actorStats = useMemo(() => {
    const actorMap = new Map<string, number>();
    watchedMovies.forEach((movie) => {
      movie.cast.forEach((actor) => {
        actorMap.set(actor, (actorMap.get(actor) || 0) + 1);
      });
    });
    return Array.from(actorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [watchedMovies]);

  const countryStats = useMemo(() => {
    const countryMap = new Map<string, number>();
    watchedMovies.forEach((movie) => {
      const country = movie.country || '未知';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    return Array.from(countryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [watchedMovies]);

  const rewatchMovies = useMemo(() => {
    return movies
      .filter((m) => m.watchLogs.length > 1)
      .sort((a, b) => b.watchLogs.length - a.watchLogs.length)
      .slice(0, 5);
  }, [movies]);

  const GENRE_COLORS = ['#D4AF37', '#C4A030', '#B08828', '#9A7420', '#846018', '#6E4C10', '#583808', '#483006'];
  const COUNTRY_COLORS = ['#D4AF37', '#8B7355', '#6B8E6B', '#8B6914', '#A0522D'];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          数据总览
        </h1>
        <p className="text-sm text-film-400 mt-1">
          全面了解你的观影数据
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530] card-hover">
          <div className="flex items-center justify-between mb-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-film-500">总片数</span>
          </div>
          <p className="text-3xl font-bold text-gold-gradient">{stats.total}</p>
          <p className="text-xs text-film-400 mt-1">已看 {stats.watched} 部</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530] card-hover">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-film-500">平均分</span>
          </div>
          <p className="text-3xl font-bold text-gold-gradient">{stats.avgRating}</p>
          <p className="text-xs text-film-400 mt-1">基于 {watchedMovies.length} 部评分</p>
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
          <p className="text-3xl font-bold text-gold-gradient">{stats.rewatchTotal}</p>
          <p className="text-xs text-film-400 mt-1">共 {rewatchMovies.length} 部影片 · {stats.totalWatchLogs} 次观看</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            月度观影趋势
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
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
                      style={{ width: `${(director.count / directorStats[0].count) * 100}%` }}
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
                      style={{ width: `${(actor.count / actorStats[0].count) * 100}%` }}
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
          <h3 className="text-base font-semibold text-white mb-4">重看片单</h3>
          <div className="space-y-3">
            {rewatchMovies.map((movie) => (
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
                    <p className="text-amber-400 font-bold text-sm">{movie.watchLogs.length}</p>
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
          <h3 className="text-base font-semibold text-white mb-4">国家/地区分布</h3>
          <div className="space-y-3">
            {countryStats.map((country, index) => (
              <div key={country.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length] }}
                />
                <span className="flex-1 text-sm text-white">{country.name}</span>
                <span className="text-sm text-film-400">{country.value} 部</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
