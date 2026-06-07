import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Movie, WatchStatus, WatchLog } from '@/types';
import { X, Plus, Calendar, Trash2 } from 'lucide-react';

interface MovieFormProps {
  movie?: Movie;
  onClose: () => void;
}

const statusOptions: { value: WatchStatus; label: string }[] = [
  { value: 'wish', label: '想看' },
  { value: 'watching', label: '在看' },
  { value: 'watched', label: '已看' },
  { value: 'dropped', label: '弃看' },
];

const genreOptions = [
  '剧情', '喜剧', '动作', '爱情', '科幻', '悬疑', '惊悚', '恐怖',
  '犯罪', '传记', '历史', '战争', '动画', '奇幻', '冒险', '灾难',
  '纪录片', '音乐', '家庭', '西部',
];

export function MovieForm({ movie, onClose }: MovieFormProps) {
  const { addMovie, updateMovie, addWatchLog, deleteWatchLog } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    year: new Date().getFullYear(),
    genres: [] as string[],
    director: '',
    cast: [] as string[],
    runtime: undefined as number | undefined,
    poster: '',
    country: '',
    rating: 0,
    status: 'wish' as WatchStatus,
    shortReview: '',
    longReview: '',
  });
  const [watchLogs, setWatchLogs] = useState<WatchLog[]>([]);
  const [newLogDate, setNewLogDate] = useState('');
  const [newLogNote, setNewLogNote] = useState('');
  const [castInput, setCastInput] = useState('');

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        originalTitle: movie.originalTitle || '',
        year: movie.year,
        genres: movie.genres,
        director: movie.director,
        cast: movie.cast,
        runtime: movie.runtime,
        poster: movie.poster || '',
        country: movie.country || '',
        rating: movie.rating,
        status: movie.status,
        shortReview: movie.shortReview || '',
        longReview: movie.longReview || '',
      });
      setWatchLogs([...movie.watchLogs].sort((a, b) => a.date.localeCompare(b.date)));
    }
  }, [movie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (movie) {
      updateMovie(movie.id, formData);
      const existingIds = movie.watchLogs.map(l => l.id);
      watchLogs.forEach(log => {
        if (!existingIds.includes(log.id)) {
          addWatchLog(movie.id, log.date, log.note);
        }
      });
      movie.watchLogs.forEach(log => {
        if (!watchLogs.find(l => l.id === log.id)) {
          deleteWatchLog(movie.id, log.id);
        }
      });
    } else {
      addMovie({
        ...formData,
        initialWatchLogs: watchLogs.length > 0 
          ? watchLogs.map((log) => ({ date: log.date, note: log.note }))
          : undefined,
      });
    }
    onClose();
  };

  const addCast = () => {
    if (castInput.trim() && !formData.cast.includes(castInput.trim())) {
      setFormData({ ...formData, cast: [...formData.cast, castInput.trim()] });
      setCastInput('');
    }
  };

  const removeCast = (name: string) => {
    setFormData({ ...formData, cast: formData.cast.filter((c) => c !== name) });
  };

  const toggleGenre = (genre: string) => {
    if (formData.genres.includes(genre)) {
      setFormData({ ...formData, genres: formData.genres.filter((g) => g !== genre) });
    } else if (formData.genres.length < 5) {
      setFormData({ ...formData, genres: [...formData.genres, genre] });
    }
  };

  const addLog = () => {
    if (!newLogDate) return;
    const newLog: WatchLog = {
      id: `temp-${Date.now()}`,
      movieId: movie?.id || '',
      date: newLogDate,
      note: newLogNote || undefined,
      createdAt: new Date().toISOString(),
    };
    setWatchLogs([...watchLogs, newLog].sort((a, b) => a.date.localeCompare(b.date)));
    setNewLogDate('');
    setNewLogNote('');
    if (formData.status !== 'watched') {
      setFormData({ ...formData, status: 'watched' });
    }
  };

  const removeLog = (logId: string) => {
    setWatchLogs(watchLogs.filter((l) => l.id !== logId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">影片标题 *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
          placeholder="输入影片名称"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-film-300 mb-1.5">年份</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-film-300 mb-1.5">评分</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="text-amber-400 font-bold w-10 text-right">{formData.rating}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-film-300 mb-1.5">导演</label>
          <input
            type="text"
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
            placeholder="导演姓名"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-film-300 mb-1.5">国家/地区</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
            placeholder="如：美国、中国"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">类型标签（最多5个）</label>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                formData.genres.includes(genre)
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-[#1a1a24] border-[#2a2a35] text-film-400 hover:border-film-500'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">演员</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={castInput}
            onChange={(e) => setCastInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
            className="flex-1 px-4 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
            placeholder="输入演员名后回车添加"
          />
          <button
            type="button"
            onClick={addCast}
            className="px-4 py-2 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.cast.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#1f1f28] text-film-300 text-xs rounded"
            >
              {name}
              <button type="button" onClick={() => removeCast(name)} className="text-film-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">观看状态</label>
        <div className="grid grid-cols-4 gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, status: opt.value })}
              className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                formData.status === opt.value
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-[#1a1a24] border-[#2a2a35] text-film-400 hover:border-film-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          观影记录（{watchLogs.length}次）
        </label>
        
        {watchLogs.length > 0 && (
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {watchLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 bg-[#1a1a24] rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-medium">{log.date}</span>
                  {log.note && <span className="text-film-400 text-xs">— {log.note}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => removeLog(log.id)}
                  className="p-1 text-film-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="date"
            value={newLogDate}
            onChange={(e) => setNewLogDate(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
          />
          <input
            type="text"
            value={newLogNote}
            onChange={(e) => setNewLogNote(e.target.value)}
            placeholder="备注（可选）"
            className="flex-1 px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
          />
          <button
            type="button"
            onClick={addLog}
            className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">海报链接</label>
        <input
          type="text"
          value={formData.poster}
          onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
          placeholder="图片URL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">短评</label>
        <textarea
          value={formData.shortReview}
          onChange={(e) => setFormData({ ...formData, shortReview: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm resize-none"
          placeholder="一句话影评..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">长评</label>
        <textarea
          value={formData.longReview}
          onChange={(e) => setFormData({ ...formData, longReview: e.target.value })}
          rows={4}
          className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm resize-none"
          placeholder="详细影评..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
        >
          {movie ? '保存修改' : '添加影片'}
        </button>
      </div>
    </form>
  );
}
