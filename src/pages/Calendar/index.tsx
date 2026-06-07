import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Film, TrendingUp } from 'lucide-react';
import { Movie } from '@/types';

export function CalendarPage() {
  const { movies } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'heatmap'>('month');

  const watchedMovies = useMemo(() => {
    return movies.filter((m) => m.status === 'watched' && m.watchDate);
  }, [movies]);

  const watchDateMap = useMemo(() => {
    const map = new Map<string, Movie[]>();
    watchedMovies.forEach((movie) => {
      if (movie.watchDate) {
        const date = movie.watchDate;
        if (!map.has(date)) {
          map.set(date, []);
        }
        map.get(date)!.push(movie);
      }
    });
    return map;
  }, [watchedMovies]);

  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    let count = 0;
    watchDateMap.forEach((movies, date) => {
      if (date.startsWith(monthKey)) {
        count += movies.length;
      }
    });
    return count;
  }, [currentDate, watchDateMap]);

  const yearStats = useMemo(() => {
    const year = currentDate.getFullYear();
    let count = 0;
    watchDateMap.forEach((movies, date) => {
      if (date.startsWith(String(year))) {
        count += movies.length;
      }
    });
    return count;
  }, [currentDate, watchDateMap]);

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
      const movies = watchDateMap.get(dateStr) || [];
      const count = movies.length;
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 2) level = 2;
      if (count >= 4) level = 3;
      if (count >= 6) level = 4;
      
      data.push({ date: dateStr, count, level });
    }
    
    return data;
  }, [currentDate, watchDateMap]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const selectedMovies = selectedDate ? watchDateMap.get(selectedDate) || [] : [];

  const levelColors = [
    'bg-[#1a1a24]',
    'bg-amber-900/40',
    'bg-amber-700/50',
    'bg-amber-500/60',
    'bg-amber-400/80',
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            观影日历
          </h1>
          <p className="text-sm text-film-400 mt-1">
            {currentDate.getFullYear()} 年已观看 {yearStats} 部影片
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
          <p className="text-sm text-film-400 mb-1">本月观影</p>
          <p className="text-3xl font-bold text-gold-gradient">{monthStats}</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <p className="text-sm text-film-400 mb-1">年度总计</p>
          <p className="text-3xl font-bold text-gold-gradient">{yearStats}</p>
        </div>
        <div className="p-4 bg-[#15151c] rounded-xl border border-[#252530]">
          <p className="text-sm text-film-400 mb-1">月均观影</p>
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
                const dayMovies = watchDateMap.get(dateStr) || [];
                const hasMovies = dayMovies.length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold'
                        : hasMovies
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'text-film-400 hover:bg-[#1a1a24]'
                    } ${isToday && !isSelected ? 'ring-2 ring-amber-500/50' : ''}`}
                  >
                    <span>{day}</span>
                    {hasMovies && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayMovies.slice(0, 3).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-amber-500'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-72 bg-[#15151c] rounded-xl border border-[#252530] p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-film-300 mb-3">
              {selectedDate ? `${selectedDate} 观影记录` : '选择日期查看详情'}
            </h3>
            {selectedDate && selectedMovies.length > 0 ? (
              <div className="space-y-3">
                {selectedMovies.map((movie) => (
                  <div key={movie.id} className="flex gap-3 p-2 rounded-lg bg-[#1a1a24]">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-16 bg-[#252530] rounded flex items-center justify-center">
                        <Film className="w-6 h-6 text-film-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                      <p className="text-xs text-film-400">{movie.year} · {movie.director}</p>
                      <p className="text-xs text-amber-400 mt-0.5">★ {movie.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-film-500 text-center py-8">
                {selectedDate ? '这一天没有观影记录' : '点击日历上的日期'}
              </p>
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
                <>
                  {heatmapData
                    .filter((_, i) => i % 7 === row)
                    .map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} 部`}
                        className={`aspect-square rounded-sm ${levelColors[day.level]} hover:ring-2 hover:ring-amber-500/50 cursor-pointer`}
                        onClick={() => { setSelectedDate(day.date); setViewMode('month'); }}
                      />
                    ))}
                </>
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
    </div>
  );
}
