import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { MovieForm } from '@/components/MovieForm/MovieForm';
import { Modal } from '@/components/Modal/Modal';
import { Search, Plus, Filter, Upload, X } from 'lucide-react';
import { Movie, WatchStatus } from '@/types';

const statusOptions: { value: WatchStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'watched', label: '已看' },
  { value: 'watching', label: '在看' },
  { value: 'wish', label: '想看' },
  { value: 'dropped', label: '弃看' },
];

export function LibraryPage() {
  const { movies, importMovies, deleteMovie } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetail, setShowDetail] = useState<Movie | null>(null);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => genres.add(g)));
    return Array.from(genres).sort();
  }, [movies]);

  const allYears = useMemo(() => {
    const years = new Set<number>();
    movies.forEach((m) => years.add(m.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !movie.director.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && movie.status !== statusFilter) {
        return false;
      }
      if (genreFilter !== 'all' && !movie.genres.includes(genreFilter)) {
        return false;
      }
      if (yearFilter !== 'all' && movie.year !== parseInt(yearFilter)) {
        return false;
      }
      return true;
    });
  }, [movies, searchQuery, statusFilter, genreFilter, yearFilter]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          importMovies(data);
        } else if (data.movies) {
          importMovies(data.movies);
        }
      } catch (err) {
        alert('文件解析失败，请确保是有效的 JSON 文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = useMemo(() => ({
    total: movies.length,
    watched: movies.filter((m) => m.status === 'watched').length,
    wish: movies.filter((m) => m.status === 'wish').length,
  }), [movies]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            片库导入
          </h1>
          <p className="text-sm text-film-400 mt-1">
            共 {stats.total} 部影片 · 已看 {stats.watched} 部 · 想看 {stats.wish} 部
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg cursor-pointer hover:bg-[#1f1f28] transition-colors text-sm text-film-300">
            <Upload className="w-4 h-4" />
            导入
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => { setEditingMovie(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            添加影片
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-film-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索影片名称或导演..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#15151c] border border-[#252530] rounded-xl text-white placeholder-film-500 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-colors ${
            showFilters
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
              : 'bg-[#15151c] border-[#252530] text-film-400 hover:border-film-500'
          }`}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-[#15151c] border border-[#252530] rounded-xl mb-6 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-film-400 mb-2">观看状态</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WatchStatus | 'all')}
                className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-film-400 mb-2">类型</label>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              >
                <option value="all">全部类型</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-film-400 mb-2">年份</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              >
                <option value="all">全部年份</option>
                {allYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie, index) => (
              <div key={movie.id} style={{ animationDelay: `${index * 30}ms` }} className="animate-fade-in">
                <MovieCard
                  movie={movie}
                  onClick={() => setShowDetail(movie)}
                  onEdit={() => { setEditingMovie(movie); setShowAddModal(true); }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-film-500">
            <div className="w-16 h-16 rounded-full bg-[#15151c] flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-lg">没有找到匹配的影片</p>
            <p className="text-sm mt-1">试试调整筛选条件</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingMovie ? '编辑影片' : '添加影片'}
        size="lg"
      >
        <MovieForm
          movie={editingMovie || undefined}
          onClose={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={showDetail?.title || ''}
        size="xl"
      >
        {showDetail && (
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-40 flex-shrink-0">
                {showDetail.poster ? (
                  <img src={showDetail.poster} alt={showDetail.title} className="w-full rounded-lg" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-[#1a1a24] rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{showDetail.title}</h3>
                  {showDetail.originalTitle && (
                    <span className="text-film-400 text-sm">{showDetail.originalTitle}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {showDetail.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-film-400 w-16">导演</span>
                    <span className="text-white">{showDetail.director}</span>
                  </div>
                  <div className="flex">
                    <span className="text-film-400 w-16">主演</span>
                    <span className="text-white">{showDetail.cast.join(' / ')}</span>
                  </div>
                  <div className="flex">
                    <span className="text-film-400 w-16">年份</span>
                    <span className="text-white">{showDetail.year}</span>
                  </div>
                  {showDetail.runtime && (
                    <div className="flex">
                      <span className="text-film-400 w-16">片长</span>
                      <span className="text-white">{showDetail.runtime} 分钟</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-film-400 w-16">评分</span>
                    <span className="text-amber-400 font-bold text-lg">{showDetail.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {showDetail.shortReview && (
              <div className="p-4 bg-[#1a1a24] rounded-lg border-l-4 border-amber-500">
                <p className="text-sm text-film-200 italic">"{showDetail.shortReview}"</p>
              </div>
            )}

            {showDetail.longReview && (
              <div>
                <h4 className="text-sm font-medium text-film-300 mb-2">详细影评</h4>
                <p className="text-sm text-film-200 leading-relaxed whitespace-pre-wrap">
                  {showDetail.longReview}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[#252530]">
              <button
                onClick={() => { setShowDetail(null); setEditingMovie(showDetail); setShowAddModal(true); }}
                className="flex-1 py-2 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm"
              >
                编辑影片
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要删除这部影片吗？')) {
                    deleteMovie(showDetail.id);
                    setShowDetail(null);
                  }
                }}
                className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                删除
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
