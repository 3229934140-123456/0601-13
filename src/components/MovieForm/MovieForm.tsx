import { useState, useEffect } from 'react';
import { Movie, WatchStatus } from '@/types';
import { useStore } from '@/store/useStore';
import { X, Plus } from 'lucide-react';

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
  const { addMovie, updateMovie } = useStore();
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
    watchDate: '',
    shortReview: '',
    longReview: '',
  });
  const [castInput, setCastInput] = useState('');
  const [genreInput, setGenreInput] = useState('');

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
        watchDate: movie.watchDate || '',
        shortReview: movie.shortReview || '',
        longReview: movie.longReview || '',
      });
    }
  }, [movie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (movie) {
      updateMovie(movie.id, formData);
    } else {
      addMovie(formData);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-film-300 mb-1.5">影片标题 *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white placeholder-film-500 text-sm"
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

      {formData.status === 'watched' && (
        <div>
          <label className="block text-sm font-medium text-film-300 mb-1.5">观看日期</label>
          <input
            type="date"
            value={formData.watchDate}
            onChange={(e) => setFormData({ ...formData, watchDate: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
          />
        </div>
      )}

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
