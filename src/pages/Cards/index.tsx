import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Download, Image, Palette, LayoutGrid, Type, Film, Quote as QuoteIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Movie } from '@/types';

const templates = [
  { id: 'movie-grid', name: '影片九宫格', icon: LayoutGrid },
  { id: 'quote-card', name: '台词卡片', icon: QuoteIcon },
  { id: 'rank-list', name: '榜单海报', icon: Film },
];

const colorSchemes = [
  { id: 'gold-dark', name: '金黑暗黑', bg: 'from-[#0F0F12] to-[#1a1a1f]', text: 'text-amber-400', accent: 'bg-amber-500' },
  { id: 'rose-dark', name: '玫瑰暗红', bg: 'from-[#1a0a0f] to-[#2a1520]', text: 'text-rose-400', accent: 'bg-rose-500' },
  { id: 'ocean-dark', name: '深海蓝调', bg: 'from-[#0a0f1a] to-[#152030]', text: 'text-cyan-400', accent: 'bg-cyan-500' },
  { id: 'forest-dark', name: '森林墨绿', bg: 'from-[#0a1a0f] to-[#152520]', text: 'text-emerald-400', accent: 'bg-emerald-500' },
];

export function CardsPage() {
  const { movies, quotes, rankings } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('movie-grid');
  const [selectedColor, setSelectedColor] = useState('gold-dark');
  const [cardTitle, setCardTitle] = useState('我的年度观影');
  const [cardSubtitle, setCardSubtitle] = useState('2024年度十佳');
  const [selectedRanking, setSelectedRanking] = useState(rankings[0]?.id || '');

  const colorScheme = colorSchemes.find((c) => c.id === selectedColor) || colorSchemes[0];

  const watchedMovies = movies.filter((m) => m.status === 'watched').slice(0, 9);
  const selectedRankingData = rankings.find((r) => r.id === selectedRanking);
  const rankingMovies = selectedRankingData
    ? selectedRankingData.movieIds
        .map((id) => movies.find((m) => m.id === id))
        .filter((m): m is Movie => m !== undefined)
        .slice(0, 9)
    : [];

  const randomQuotes = quotes.slice(0, 3);

  const handleExport = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('导出失败，请重试');
    }
  };

  const renderMovieGrid = () => (
    <div className="grid grid-cols-3 gap-2">
      {(selectedTemplate === 'rank-list' ? rankingMovies : watchedMovies).map((movie, index) => (
        <div key={movie.id} className="relative aspect-[2/3] overflow-hidden rounded-lg group">
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black/30 flex items-center justify-center">
              <Film className="w-8 h-8 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs font-medium truncate">{movie.title}</p>
            <p className={`text-[10px] ${colorScheme.text}`}>★ {movie.rating}</p>
          </div>
          {selectedTemplate === 'rank-list' && (
            <div className={`absolute top-2 left-2 w-6 h-6 ${colorScheme.accent} rounded-full flex items-center justify-center text-black text-xs font-bold`}>
              {index + 1}
            </div>
          )}
        </div>
      ))}
      {Array.from({ length: Math.max(0, 9 - (selectedTemplate === 'rank-list' ? rankingMovies.length : watchedMovies.length)) }).map((_, i) => (
        <div key={`empty-${i}`} className="aspect-[2/3] bg-white/5 rounded-lg" />
      ))}
    </div>
  );

  const renderQuoteCard = () => (
    <div className="space-y-4">
      {randomQuotes.map((quote) => {
        const movie = movies.find((m) => m.id === quote.movieId);
        return (
          <div key={quote.id} className="p-4 bg-black/20 rounded-xl backdrop-blur-sm">
            <p className="text-white text-sm italic leading-relaxed">
              "{quote.content}"
            </p>
            <div className="mt-3 flex items-center gap-2">
              {movie?.poster && (
                <img src={movie.poster} alt={movie.title} className="w-6 h-8 object-cover rounded" />
              )}
              <span className={`text-xs ${colorScheme.text}`}>— {movie?.title || '未知影片'}</span>
            </div>
          </div>
        );
      })}
      {randomQuotes.length === 0 && (
        <div className="p-8 text-center text-white/30">
          <QuoteIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">暂无台词数据</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            图文卡片
          </h1>
          <p className="text-sm text-film-400 mt-1">
            生成精美的观影分享卡片
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          导出图片
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-72 flex-shrink-0 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              选择模板
            </h3>
            <div className="space-y-2">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedTemplate === template.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-[#15151c] border-[#252530] text-film-300 hover:border-[#353545]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{template.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              配色方案
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedColor(scheme.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedColor === scheme.id
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-[#252530] hover:border-[#353545]'
                  }`}
                >
                  <div className={`h-8 rounded bg-gradient-to-br ${scheme.bg} mb-2`} />
                  <p className="text-xs text-film-300">{scheme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              文字内容
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-film-400 mb-1">主标题</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-film-400 mb-1">副标题</label>
                <input
                  type="text"
                  value={cardSubtitle}
                  onChange={(e) => setCardSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>

          {selectedTemplate === 'rank-list' && (
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                选择榜单
              </h3>
              <select
                value={selectedRanking}
                onChange={(e) => setSelectedRanking(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              >
                {rankings.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center bg-[#0a0a0d] rounded-xl border border-[#1a1a20] p-8 overflow-auto">
          <div
            ref={cardRef}
            className={`w-[360px] bg-gradient-to-br ${colorScheme.bg} rounded-2xl p-6 shadow-2xl`}
            style={{ aspectRatio: '9/16' }}
          >
            <div className="text-center mb-4">
              <p className={`text-xs uppercase tracking-widest ${colorScheme.text} mb-1`}>
                CineTrack
              </p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                {cardTitle}
              </h2>
              <p className={`text-sm ${colorScheme.text} mt-1`}>
                {cardSubtitle}
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

            {selectedTemplate === 'quote-card' ? renderQuoteCard() : renderMovieGrid()}

            <div className="mt-auto pt-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">@电影博主</span>
                <span className={colorScheme.text}>CineTrack 看板</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
