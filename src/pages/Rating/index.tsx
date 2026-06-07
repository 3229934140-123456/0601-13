import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Star, TrendingUp, Award } from 'lucide-react';
import { Movie } from '@/types';

export function RatingPage() {
  const { movies } = useStore();
  const [sortBy, setSortBy] = useState<'rating' | 'title'>('rating');

  const watchedMovies = useMemo(() => {
    return movies.filter((m) => m.status === 'watched' && m.rating > 0);
  }, [movies]);

  const ratingDistribution = useMemo(() => {
    const distribution: { rating: string; count: number; fill: string }[] = [];
    for (let i = 10; i >= 1; i--) {
      const count = watchedMovies.filter((m) => Math.floor(m.rating) === i).length;
      const fill = i >= 8 ? '#D4AF37' : i >= 6 ? '#8B7355' : '#4a4a4a';
      distribution.push({ rating: `${i}分`, count, fill });
    }
    return distribution;
  }, [watchedMovies]);

  const genreRatings = useMemo(() => {
    const genreMap = new Map<string, { total: number; count: number }>();
    
    watchedMovies.forEach((movie) => {
      movie.genres.forEach((genre) => {
        if (!genreMap.has(genre)) {
          genreMap.set(genre, { total: 0, count: 0 });
        }
        const data = genreMap.get(genre)!;
        data.total += movie.rating;
        data.count += 1;
      });
    });

    const result = Array.from(genreMap.entries())
      .map(([genre, data]) => ({
        genre,
        avg: parseFloat((data.total / data.count).toFixed(1)),
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);

    return result;
  }, [watchedMovies]);

  const topRatedMovies = useMemo(() => {
    return [...watchedMovies]
      .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : a.title.localeCompare(b.title))
      .slice(0, 10);
  }, [watchedMovies, sortBy]);

  const stats = useMemo(() => {
    const ratings = watchedMovies.map((m) => m.rating);
    const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0';
    const highCount = watchedMovies.filter((m) => m.rating >= 8).length;
    const lowCount = watchedMovies.filter((m) => m.rating < 5).length;
    return { avg, total: watchedMovies.length, highCount, lowCount };
  }, [watchedMovies]);

  const COLORS = ['#D4AF37', '#C4A030', '#B08828', '#9A7420', '#846018', '#6E4C10', '#583808', '#483006'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            评分矩阵
          </h1>
          <p className="text-sm text-film-400 mt-1">
            共评分 {stats.total} 部影片 · 平均评分 {stats.avg}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gold-gradient">{stats.avg}</p>
              <p className="text-xs text-film-400">平均评分</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.highCount}</p>
              <p className="text-xs text-film-400">8分以上</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.lowCount}</p>
              <p className="text-xs text-film-400">5分以下</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              <p className="text-xs text-film-400">评分总数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4">评分分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#252530" horizontal={false} />
                <XAxis type="number" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis type="category" dataKey="rating" stroke="#666" tick={{ fill: '#aaa', fontSize: 12 }} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4">类型平均评分</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={genreRatings} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#2a2a35" />
                <PolarAngleAxis dataKey="genre" tick={{ fill: '#aaa', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#666', fontSize: 10 }} />
                <Radar
                  name="平均分"
                  dataKey="avg"
                  stroke="#D4AF37"
                  fill="#D4AF37"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#15151c] rounded-xl border border-[#252530] p-5 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">TOP 10 高分影片</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                sortBy === 'rating'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-film-400 hover:text-white'
              }`}
            >
              按评分
            </button>
            <button
              onClick={() => setSortBy('title')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                sortBy === 'title'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-film-400 hover:text-white'
              }`}
            >
              按名称
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {topRatedMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex items-center gap-4 p-3 bg-[#1a1a24] rounded-lg hover:bg-[#1f1f2c] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                index < 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-[#252530] text-film-400'
              }`}>
                {index + 1}
              </div>
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
              ) : (
                <div className="w-10 h-14 bg-[#252530] rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{movie.title}</p>
                <p className="text-xs text-film-400">
                  {movie.year} · {movie.director}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-amber-400">{movie.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
