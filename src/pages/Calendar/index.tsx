import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Film, TrendingUp, Plus, Search, X, Eye, Edit, Calendar, Trash2 } from 'lucide-react';
import { Movie, WatchLog } from '@/types';
import { Modal } from '@/components/Modal/Modal';
import { MovieForm } from '@/components/MovieForm/MovieForm';

export function CalendarPage() {
  const { movies, addWatchLog, deleteWatchLog, deleteMovie } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'heatmap'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailMovieId, setDetailMovieId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const detailMovie = useMemo(() => {
    if (!detailMovieId) return null;
    return movies.find((m) => m.id === detailMovieId) || null;
  }, [movies, detailMovieId]);

  const allWatchLogs = useMemo(() => {
    const logs: WatchLog[] = [];
    movies.forEach((movie) => {
      movie.watchLogs.forEach((log) => logs.push(log));
    });
    return logs;
  }, [movies]);

  const watchLogMap = useMemo(() => {
    const map = new Map<string, WatchLog[]>();
    allWatchLogs.forEach((log) => {
      if (!map.has(log.date)) {
        map.set(log.date, []);
      }
      map.get(log.date)!.push(log);
    });
    return map;
  }, [allWatchLogs]);

  const getMovieById = (movieId: string): Movie | undefined => {
    return movies.find((m) => m.id === movieId);
  };

  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    let count = 0;
    watchLogMap.forEach((logs, date) => {
      if (date.startsWith(monthKey)) {
        count += logs.length;
      }
    });
    return count;
  }, [currentDate, watchLogMap]);

  const yearStats = useMemo(() => {
    const year = currentDate.getFullYear();
    let count = 0;
    watchLogMap.forEach((logs, date) => {
      if (date.startsWith(String(year))) {
        count += logs.length;
      }
    });
    return count;
  }, [currentDate, watchLogMap]);

  const uniqueWatchedMovies = useMemo(() => {
    const year = currentDate.getFullYear();
    const movieIds = new Set<string>();
    allWatchLogs.forEach((log) => {
      if (log.date.startsWith(String(year))) {
        movieIds.add(log.movieId);
      }
    });
    return movieIds.size;
  }, [currentDate, allWatchLogs]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [currentDate]);

  const heatmapData = useMemo(() => {
    const year = currentDate.getFullYear();
    const data: { date: string; count: number; level: number }[] = [];
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const logs = watchLogMap.get(dateStr) || [];
      const count = logs.length;
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 2) level = 2;
      if (count >= 4) level = 3;
      if (count >= 6) level = 4;
      
      data.push({ date: dateStr, count, level });
    }
    
    return data;
  }, [currentDate, watchLogMap]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const selectedLogs = selectedDate ? watchLogMap.get(selectedDate) || [] : [];

  const levelColors = [
    'bg-[#1a1a24]',
    'bg-amber-900/40',
    'bg-amber-700/50',
    'bg-amber-500/60',
    'bg-amber-400/80',
  ];

  const watchedMoviesForAdd = useMemo(() => {
    return movies
      .filter((m) => m.status === 'watched' || m.status === 'watching')
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        return (
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.director.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [movies, searchQuery]);

  const handleAddWatchLog = (movieId: string) => {
    if (!selectedDate) return;
    addWatchLog(movieId, selectedDate);
  };

  const handleDeleteLog = (logId: string, movieId: string) => {
    if (confirm('确定删除这条观影记录吗？')) {
      deleteWatchLog(movieId, logId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            观影日历
          </h1>
          <p className="text-sm text-film-400 mt-1">
            {currentDate.getFullYear()} 年共观看 {yearStats} 次 · {uniqueWatchedMovies} 部影片
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-[#15151c] text-film-400 border border-[#252530] hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            月历视图
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-[#15151c] text-film-400 border border-[#252530] hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            热力图
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <p className="text-sm text-film-400 mb-1">本月观影次数</p>
          <p className="text-3xl font-bold text-gold-gradient">{monthStats}</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <p className="text-sm text-film-400 mb-1">年度总观看次数</p>
          <p className="text-3xl font-bold text-gold-gradient">{yearStats}</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <p className="text-sm text-film-400 mb-1">月均观影次数</p>
          <p className="text-3xl font-bold text-gold-gradient">
            {Math.round(yearStats / Math.max(currentDate.getMonth() + 1, 1))}
          </p>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="flex gap-6 flex-1">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-[#1a1a24] text-film-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-white">
                {currentDate.getFullYear()} 年 {monthNames[currentDate.getMonth()]}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-[#1a1a24] text-film-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs text-film-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayLogs = watchLogMap.get(dateStr) || [];
                const hasLogs = dayLogs.length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold'
                        : hasLogs
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'text-film-400 hover:bg-[#1a1a24]'
                    } ${isToday && !isSelected ? 'ring-2 ring-amber-500/50' : ''}`}
                  >
                    <span>{day}</span>
                    {hasLogs && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayLogs.slice(0, 3).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-amber-500'}`} />
                        ))}
                        {dayLogs.length > 3 && (
                          <span className={`text-[8px] ${isSelected ? 'text-black/70' : 'text-amber-500/70'}`}>+{dayLogs.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-72 bg-[#15151c] rounded-xl border border-[#252530] p-4 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-film-300">
                {selectedDate ? `${selectedDate} 观影记录` : '选择日期查看详情'}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-1.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {selectedDate && selectedLogs.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {[...selectedLogs]
                  .sort((a, b) => {
                    const movieA = getMovieById(a.movieId);
                    const movieB = getMovieById(b.movieId);
                    return (movieA?.title || '').localeCompare(movieB?.title || '');
                  })
                  .map((log) => {
                    const movie = getMovieById(log.movieId);
                    if (!movie) return null;
                    
                    const sortedLogs = [...movie.watchLogs].sort((a, b) => a.date.localeCompare(b.date));
                    const watchIndex = sortedLogs.findIndex(l => l.id === log.id) + 1;
                    const watchCount = movie.watchLogs.length;
                    
                    return (
                      <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-[#1a1a24] group">
                        {movie.poster ? (
                          <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-16 bg-[#252530] rounded flex items-center justify-center flex-shrink-0">
                            <Film className="w-6 h-6 text-film-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                            <span className="text-amber-400 text-xs font-bold flex-shrink-0">★ {movie.rating}</span>
                          </div>
                          <p className="text-xs text-film-400">{movie.year} · {movie.director}</p>
                          {watchCount > 1 && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">
                              第 {watchIndex} 遍观看
                            </span>
                          )}
                          {log.note && (
                            <p className="text-xs text-film-300 mt-1.5 italic">"{log.note}"</p>
                          )}
                          {movie.shortReview && !log.note && (
                            <p className="text-xs text-film-400 mt-1.5 line-clamp-2">
                              💬 {movie.shortReview}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={() => {
                                setDetailMovieId(movie.id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-[#252530] text-film-300 rounded hover:bg-[#2f2f3d] hover:text-white transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              详情
                            </button>
                            <button
                              onClick={() => {
                                setDetailMovieId(movie.id);
                                setShowEditModal(true);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              编辑
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteLog(log.id, movie.id)}
                          className="p-1 text-film-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity self-start"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-film-500 text-center">
                  {selectedDate ? '这一天没有观影记录\n点击 + 添加记录' : '点击日历上的日期'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {currentDate.getFullYear()} 年度观影热力图
              </h2>
              <div className="flex items-center gap-2 text-xs text-film-400">
                <span>少</span>
                {levelColors.map((color, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                ))}
                <span>多</span>
              </div>
            </div>
            
            <div className="grid grid-cols-[repeat(53,1fr)] gap-1">
              {Array.from({ length: 7 }).map((_, row) => (
                <div key={row}>
                  {heatmapData
                    .filter((_, i) => i % 7 === row)
                    .map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} 次观看`}
                        className={`aspect-square rounded-sm ${levelColors[day.level]} hover:ring-2 hover:ring-amber-500/50 cursor-pointer`}
                        onClick={() => { setSelectedDate(day.date); setViewMode('month'); }}
                      />
                    ))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-1 mt-4 text-xs text-film-500">
              {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map((m) => (
                <div key={m}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`添加观影记录 - ${selectedDate}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-film-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索影片..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {watchedMoviesForAdd.map((movie) => {
              const alreadyLoggedToday = movie.watchLogs.some((log) => log.date === selectedDate);
              const watchCount = movie.watchLogs.length;
              
              return (
                <div
                  key={movie.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    alreadyLoggedToday ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-[#1a1a24] hover:bg-[#252530]'
                  }`}
                >
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-14 bg-[#252530] rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                    <p className="text-xs text-film-400">{movie.year} · {movie.director}</p>
                    {watchCount > 0 && (
                      <p className="text-xs text-amber-400 mt-0.5">已看过 {watchCount} 次</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddWatchLog(movie.id)}
                    disabled={alreadyLoggedToday}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      alreadyLoggedToday
                        ? 'bg-film-500/20 text-film-500 cursor-not-allowed'
                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    }`}
                  >
                    {alreadyLoggedToday ? '已添加' : '添加'}
                  </button>
                </div>
              );
            })}
            {watchedMoviesForAdd.length === 0 && (
              <p className="text-center text-film-500 py-8 text-sm">
                {searchQuery ? '没有找到匹配的影片' : '暂无在看/已看影片'}
              </p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!detailMovie && !showEditModal}
        onClose={() => setDetailMovieId(null)}
        title={detailMovie?.title || ''}
        size="xl"
      >
        {detailMovie && (
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-40 flex-shrink-0">
                {detailMovie.poster ? (
                  <img src={detailMovie.poster} alt={detailMovie.title} className="w-full rounded-lg" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-[#1a1a24] rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{detailMovie.title}</h3>
                  {detailMovie.originalTitle && (
                    <span className="text-film-400 text-sm">{detailMovie.originalTitle}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {detailMovie.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-film-400 w-16">导演</span>
                    <span className="text-white">{detailMovie.director}</span>
                  </div>
                  <div className="flex">
                    <span className="text-film-400 w-16">主演</span>
                    <span className="text-white">{detailMovie.cast.join(' / ')}</span>
                  </div>
                  <div className="flex">
                    <span className="text-film-400 w-16">年份</span>
                    <span className="text-white">{detailMovie.year}</span>
                  </div>
                  {detailMovie.runtime && (
                    <div className="flex">
                      <span className="text-film-400 w-16">片长</span>
                      <span className="text-white">{detailMovie.runtime} 分钟</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-film-400 w-16">评分</span>
                    <span className="text-amber-400 font-bold text-lg">{detailMovie.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-film-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                观影记录（{detailMovie.watchLogs.length} 次）
              </h4>
              {detailMovie.watchLogs.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {[...detailMovie.watchLogs]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2.5 bg-[#1a1a24] rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 font-medium">{log.date}</span>
                          {log.note && <span className="text-film-400 text-xs">— {log.note}</span>}
                        </div>
                        <button
                          onClick={() => deleteWatchLog(detailMovie.id, log.id)}
                          className="p-1 text-film-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-film-500 text-sm mb-3">暂无观影记录</p>
              )}
            </div>

            {detailMovie.shortReview && (
              <div className="p-4 bg-[#1a1a24] rounded-lg border-l-4 border-amber-500">
                <p className="text-sm text-film-200 italic">"{detailMovie.shortReview}"</p>
              </div>
            )}

            {detailMovie.longReview && (
              <div>
                <h4 className="text-sm font-medium text-film-300 mb-2">详细影评</h4>
                <p className="text-sm text-film-200 leading-relaxed whitespace-pre-wrap">
                  {detailMovie.longReview}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[#252530]">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 py-2 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm"
              >
                编辑影片
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要删除这部影片吗？')) {
                    deleteMovie(detailMovie.id);
                    setDetailMovieId(null);
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

      <Modal
        isOpen={showEditModal && !!detailMovie}
        onClose={() => {
          setShowEditModal(false);
          setDetailMovieId(null);
        }}
        title="编辑影片"
        size="lg"
      >
        {detailMovie && (
          <MovieForm
            movie={detailMovie}
            onClose={() => {
              setShowEditModal(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
