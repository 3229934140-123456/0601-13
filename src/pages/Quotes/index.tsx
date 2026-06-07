import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Quote as QuoteIcon, Film, Trash2, Edit2, X, Save } from 'lucide-react';
import { Modal } from '@/components/Modal/Modal';
import { Quote, Movie } from '@/types';

export function QuotesPage() {
  const { quotes, movies, addQuote, updateQuote, deleteQuote } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [quoteContent, setQuoteContent] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [quoteScreenshot, setQuoteScreenshot] = useState<string>('');
  const [filterMovie, setFilterMovie] = useState<string>('all');

  const filteredQuotes = filterMovie === 'all'
    ? quotes
    : quotes.filter((q) => q.movieId === filterMovie);

  const getMovie = (movieId: string): Movie | undefined => {
    return movies.find((m) => m.id === movieId);
  };

  const handleOpenAdd = () => {
    setEditingQuote(null);
    setSelectedMovie('');
    setQuoteContent('');
    setQuoteNote('');
    setQuoteScreenshot('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setSelectedMovie(quote.movieId);
    setQuoteContent(quote.content);
    setQuoteNote(quote.note || '');
    setQuoteScreenshot(quote.screenshot || '');
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!quoteContent.trim() || !selectedMovie) return;

    if (editingQuote) {
      updateQuote(editingQuote.id, {
        movieId: selectedMovie,
        content: quoteContent,
        note: quoteNote || undefined,
        screenshot: quoteScreenshot || undefined,
      });
    } else {
      addQuote({
        movieId: selectedMovie,
        content: quoteContent,
        note: quoteNote || undefined,
        screenshot: quoteScreenshot || undefined,
      });
    }
    setShowAddModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setQuoteScreenshot(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            台词摘录
          </h1>
          <p className="text-sm text-film-400 mt-1">
            共收藏 {quotes.length} 条台词
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          添加台词
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filterMovie}
          onChange={(e) => setFilterMovie(e.target.value)}
          className="px-4 py-2 bg-[#15151c] border border-[#252530] rounded-lg text-white text-sm"
        >
          <option value="all">全部影片</option>
          {movies.filter((m) => quotes.some((q) => q.movieId === m.id)).map((movie) => (
            <option key={movie.id} value={movie.id}>{movie.title}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredQuotes.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredQuotes.map((quote, index) => {
              const movie = getMovie(quote.movieId);
              return (
                <div
                  key={quote.id}
                  className="break-inside-avoid bg-[#15151c] rounded-xl border border-[#252530] overflow-hidden card-hover group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {quote.screenshot && (
                    <div className="relative">
                      <img
                        src={quote.screenshot}
                        alt="台词截图"
                        className="w-full object-cover max-h-48"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#15151c] via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <QuoteIcon className="w-6 h-6 text-amber-500/50 flex-shrink-0 mt-1" />
                      <p className="text-film-200 leading-relaxed italic">
                        "{quote.content}"
                      </p>
                    </div>

                    {quote.note && (
                      <p className="text-sm text-film-400 mb-3 pl-9 border-l-2 border-amber-500/30 ml-1">
                        {quote.note}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#252530]">
                      <div className="flex items-center gap-2 pl-9">
                        {movie?.poster ? (
                          <img src={movie.poster} alt={movie.title} className="w-6 h-8 object-cover rounded" />
                        ) : (
                          <Film className="w-5 h-5 text-film-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{movie?.title || '未知影片'}</p>
                          <p className="text-xs text-film-500">{movie?.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(quote)}
                          className="p-1.5 text-film-400 hover:text-amber-400 hover:bg-amber-500/10 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这条台词吗？')) {
                              deleteQuote(quote.id);
                            }
                          }}
                          className="p-1.5 text-film-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-film-500">
            <QuoteIcon className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">还没有收藏台词</p>
            <p className="text-sm mt-1">点击上方按钮添加你喜欢的台词</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingQuote ? '编辑台词' : '添加台词'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-film-300 mb-1.5">关联影片 *</label>
            <select
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
            >
              <option value="">选择影片</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title} ({movie.year})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-film-300 mb-1.5">台词内容 *</label>
            <textarea
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm resize-none"
              placeholder="输入精彩台词..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-film-300 mb-1.5">备注</label>
            <input
              type="text"
              value={quoteNote}
              onChange={(e) => setQuoteNote(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              placeholder="场景、人物、感受..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-film-300 mb-1.5">截图</label>
            {quoteScreenshot ? (
              <div className="relative inline-block">
                <img src={quoteScreenshot} alt="预览" className="max-h-40 rounded-lg" />
                <button
                  onClick={() => setQuoteScreenshot('')}
                  className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full py-8 border-2 border-dashed border-[#2a2a35] rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors">
                <div className="text-center">
                  <Film className="w-8 h-8 mx-auto text-film-500 mb-2" />
                  <p className="text-sm text-film-400">点击上传截图</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
