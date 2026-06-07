import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Eye, EyeOff, Edit2, X, Check, Film, Search, Filter, Sparkles, Layers } from 'lucide-react';
import { Modal } from '@/components/Modal/Modal';
import { Ranking, Movie } from '@/types';
import { cn } from '@/lib/utils';

interface SortableMovieItemProps {
  movie: Movie;
  rank: number;
  onRemove: () => void;
}

function SortableMovieItem({ movie, rank, onRemove }: SortableMovieItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: movie.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg border border-[#2a2a35]',
        isDragging && 'shadow-lg border-amber-500/50'
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-film-500 hover:text-amber-400">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
        {rank}
      </div>
      {movie.poster ? (
        <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
      ) : (
        <div className="w-10 h-14 bg-[#252530] rounded flex items-center justify-center">
          <Film className="w-5 h-5 text-film-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">{movie.title}</p>
        <p className="text-xs text-film-400">{movie.year} · {movie.director}</p>
        <div className="flex gap-1 mt-1">
          {movie.genres.slice(0, 2).map((g) => (
            <span key={g} className="px-1.5 py-0.5 text-[10px] bg-[#252530] text-film-400 rounded">
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="text-amber-400 font-bold text-sm">★ {movie.rating}</div>
      <button
        onClick={onRemove}
        className="p-1.5 text-film-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function RankingsPage() {
  const { rankings, movies, addRanking, updateRanking, deleteRanking, reorderRankingMovies, removeMovieFromRanking, addMovieToRanking, batchAddToRanking, generateYearlyTop } = useStore();
  const [selectedRanking, setSelectedRanking] = useState<Ranking | null>(rankings[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [newRankingTitle, setNewRankingTitle] = useState('');
  const [newRankingDesc, setNewRankingDesc] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [batchYearFilter, setBatchYearFilter] = useState<string>('all');
  const [batchGenreFilter, setBatchGenreFilter] = useState<string>('all');
  const [batchRatingFilter, setBatchRatingFilter] = useState<string>('all');
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [yearlyTopYear, setYearlyTopYear] = useState<number>(new Date().getFullYear() - 1);
  const [yearlyTopCount, setYearlyTopCount] = useState<number>(10);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const rankingMovies = selectedRanking
    ? selectedRanking.movieIds
        .map((id) => movies.find((m) => m.id === id))
        .filter((m): m is Movie => m !== undefined)
    : [];

  const watchedMovies = movies.filter((m) => m.status === 'watched');
  
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    watchedMovies.forEach((m) => m.genres.forEach((g) => genres.add(g)));
    return Array.from(genres).sort();
  }, [watchedMovies]);

  const allYears = useMemo(() => {
    const years = new Set<number>();
    watchedMovies.forEach((m) => years.add(m.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [watchedMovies]);

  const availableMovies = watchedMovies.filter(
    (m) => !selectedRanking?.movieIds.includes(m.id)
  );

  const filteredBatchMovies = useMemo(() => {
    return availableMovies.filter((movie) => {
      if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !movie.director.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (batchYearFilter !== 'all' && movie.year !== parseInt(batchYearFilter)) {
        return false;
      }
      if (batchGenreFilter !== 'all' && !movie.genres.includes(batchGenreFilter)) {
        return false;
      }
      if (batchRatingFilter !== 'all') {
        const minRating = parseFloat(batchRatingFilter);
        if (movie.rating < minRating) return false;
      }
      return true;
    }).sort((a, b) => b.rating - a.rating);
  }, [availableMovies, searchQuery, batchYearFilter, batchGenreFilter, batchRatingFilter]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!selectedRanking || !over || active.id === over.id) return;

    const oldIndex = selectedRanking.movieIds.indexOf(String(active.id));
    const newIndex = selectedRanking.movieIds.indexOf(String(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(selectedRanking.movieIds, oldIndex, newIndex);
      reorderRankingMovies(selectedRanking.id, newOrder);
      setSelectedRanking({ ...selectedRanking, movieIds: newOrder });
    }
  };

  const handleCreateRanking = () => {
    if (!newRankingTitle.trim()) return;
    const newRanking = {
      title: newRankingTitle,
      description: newRankingDesc,
      isPublic: false,
    };
    addRanking(newRanking);
    setNewRankingTitle('');
    setNewRankingDesc('');
    setShowCreateModal(false);
    setTimeout(() => {
      const freshRankings = useStore.getState().rankings;
      if (freshRankings.length > 0) {
        setSelectedRanking(freshRankings[0]);
      }
    }, 0);
  };

  const togglePrivacy = (ranking: Ranking) => {
    updateRanking(ranking.id, { isPublic: !ranking.isPublic });
    if (selectedRanking?.id === ranking.id) {
      setSelectedRanking({ ...ranking, isPublic: !ranking.isPublic });
    }
  };

  const startEditTitle = () => {
    if (selectedRanking) {
      setEditTitle(selectedRanking.title);
      setEditingTitle(true);
    }
  };

  const saveTitle = () => {
    if (selectedRanking && editTitle.trim()) {
      updateRanking(selectedRanking.id, { title: editTitle.trim() });
      setSelectedRanking({ ...selectedRanking, title: editTitle.trim() });
    }
    setEditingTitle(false);
  };

  const toggleMovieSelection = (movieId: string) => {
    if (selectedMovieIds.includes(movieId)) {
      setSelectedMovieIds(selectedMovieIds.filter((id) => id !== movieId));
    } else {
      setSelectedMovieIds([...selectedMovieIds, movieId]);
    }
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredBatchMovies.map((m) => m.id);
    setSelectedMovieIds(filteredIds);
  };

  const clearSelection = () => {
    setSelectedMovieIds([]);
  };

  const handleBatchAdd = () => {
    if (!selectedRanking || selectedMovieIds.length === 0) return;
    batchAddToRanking(selectedRanking.id, selectedMovieIds);
    setSelectedRanking({
      ...selectedRanking,
      movieIds: [...selectedRanking.movieIds, ...selectedMovieIds.filter((id) => !selectedRanking.movieIds.includes(id))],
    });
    setSelectedMovieIds([]);
    setShowBatchModal(false);
  };

  const handleGenerateYearlyTop = () => {
    if (!selectedRanking) return;
    const topMovieIds = generateYearlyTop(yearlyTopYear, yearlyTopCount);
    batchAddToRanking(selectedRanking.id, topMovieIds);
    setSelectedRanking({
      ...selectedRanking,
      movieIds: [...topMovieIds, ...selectedRanking.movieIds.filter((id) => !topMovieIds.includes(id))],
    });
    setShowBatchModal(false);
  };

  const handleDeleteRanking = (ranking: Ranking) => {
    if (confirm(`确定要删除榜单「${ranking.title}」吗？`)) {
      deleteRanking(ranking.id);
      if (selectedRanking?.id === ranking.id) {
        setSelectedRanking(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            榜单编辑
          </h1>
          <p className="text-sm text-film-400 mt-1">
            共 {rankings.length} 个榜单 · 公开 {rankings.filter((r) => r.isPublic).length} 个
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          新建榜单
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-64 flex-shrink-0 space-y-2 overflow-y-auto">
          {rankings.map((ranking) => (
            <div
              key={ranking.id}
              className={cn(
                'rounded-xl border transition-all overflow-hidden',
                selectedRanking?.id === ranking.id
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-[#15151c] border-[#252530] hover:border-[#353545]'
              )}
            >
              <button
                onClick={() => setSelectedRanking(ranking)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'font-medium text-sm truncate flex-1',
                    selectedRanking?.id === ranking.id ? 'text-amber-400' : 'text-white'
                  )}>
                    {ranking.title}
                  </span>
                  {ranking.isPublic ? (
                    <Eye className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-film-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-film-400">
                  <span>{ranking.movieIds.length} 部影片</span>
                </div>
              </button>
              <div className="flex border-t border-[#252530]">
                <button
                  onClick={(e) => { e.stopPropagation(); togglePrivacy(ranking); }}
                  className={cn(
                    'flex-1 py-2 text-xs transition-colors flex items-center justify-center gap-1',
                    ranking.isPublic
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-film-400 hover:bg-[#1f1f28]'
                  )}
                  title={ranking.isPublic ? '设为私密' : '设为公开'}
                >
                  {ranking.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {ranking.isPublic ? '公开' : '私密'}
                </button>
                <div className="w-px bg-[#252530]" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteRanking(ranking); }}
                  className="flex-1 py-2 text-xs text-film-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-[#15151c] rounded-xl border border-[#252530] p-5 overflow-hidden flex flex-col">
          {selectedRanking ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                        className="px-3 py-1 bg-[#1a1a24] border border-amber-500/50 rounded text-white text-lg font-bold focus:outline-none"
                        autoFocus
                      />
                      <button onClick={saveTitle} className="p-1 text-green-400 hover:bg-green-500/10 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingTitle(false)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-white">{selectedRanking.title}</h2>
                      <button
                        onClick={startEditTitle}
                        className="p-1 text-film-500 hover:text-amber-400 hover:bg-amber-500/10 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePrivacy(selectedRanking)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      selectedRanking.isPublic
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-[#1f1f28] text-film-400'
                    )}
                  >
                    {selectedRanking.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {selectedRanking.isPublic ? '公开' : '私密'}
                  </button>
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#1f1f28] text-film-300 rounded-lg text-sm hover:bg-[#2a2a38] transition-colors"
                  >
                    <Layers className="w-4 h-4" />
                    批量添加
                  </button>
                  <button
                    onClick={() => setShowAddMovieModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加影片
                  </button>
                </div>
              </div>

              {selectedRanking.description && (
                <p className="text-sm text-film-400 mb-4">{selectedRanking.description}</p>
              )}

              <div className="flex-1 overflow-y-auto">
                {rankingMovies.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={selectedRanking.movieIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {rankingMovies.map((movie, index) => (
                          <SortableMovieItem
                            key={movie.id}
                            movie={movie}
                            rank={index + 1}
                            onRemove={() => {
                              removeMovieFromRanking(selectedRanking.id, movie.id);
                              setSelectedRanking({
                                ...selectedRanking,
                                movieIds: selectedRanking.movieIds.filter((id) => id !== movie.id),
                              });
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-film-500">
                    <Film className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-lg">榜单为空</p>
                    <p className="text-sm mt-1 mb-4">点击上方按钮添加影片或试试一键生成</p>
                    <button
                      onClick={() => setShowBatchModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      一键生成年度十佳
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-film-500">
              <p className="text-lg">选择或创建一个榜单</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="新建榜单">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-film-300 mb-1.5">榜单名称 *</label>
            <input
              type="text"
              value={newRankingTitle}
              onChange={(e) => setNewRankingTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
              placeholder="如：2024年度十佳"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-film-300 mb-1.5">描述</label>
            <textarea
              value={newRankingDesc}
              onChange={(e) => setNewRankingDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm resize-none"
              placeholder="简单介绍一下这个榜单..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 py-2.5 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleCreateRanking}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
            >
              创建
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddMovieModal} onClose={() => setShowAddMovieModal(false)} title="添加影片到榜单" size="lg">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-film-500" />
            <input
              type="text"
              placeholder="搜索影片..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
            />
          </div>
          {availableMovies.length > 0 ? (
            availableMovies.slice(0, 20).map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg hover:bg-[#1f1f28] cursor-pointer transition-colors"
                onClick={() => {
                  if (selectedRanking) {
                    addMovieToRanking(selectedRanking.id, movie.id);
                    setSelectedRanking({
                      ...selectedRanking,
                      movieIds: [...selectedRanking.movieIds, movie.id],
                    });
                  }
                }}
              >
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                ) : (
                  <div className="w-10 h-14 bg-[#252530] rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{movie.title}</p>
                  <p className="text-xs text-film-400">{movie.year} · {movie.director}</p>
                </div>
                <div className="text-amber-400 font-bold text-sm">★ {movie.rating}</div>
                <Plus className="w-5 h-5 text-amber-400" />
              </div>
            ))
          ) : (
            <p className="text-center text-film-500 py-8">没有可添加的影片</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={showBatchModal} onClose={() => { setShowBatchModal(false); setSelectedMovieIds([]); setSearchQuery(''); }} title="批量添加影片" size="xl">
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-amber-400">一键生成年度榜单</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-film-400 mb-1">选择年份</label>
                <select
                  value={yearlyTopYear}
                  onChange={(e) => setYearlyTopYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                >
                  {allYears.map((y) => (
                    <option key={y} value={y}>{y} 年</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-film-400 mb-1">数量</label>
                <select
                  value={yearlyTopCount}
                  onChange={(e) => setYearlyTopCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                >
                  {[5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>Top {n}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateYearlyTop}
                className="self-end px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm"
              >
                生成
              </button>
            </div>
          </div>

          <div className="border-t border-[#252530] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-film-400" />
              <span className="font-medium text-film-300 text-sm">筛选条件</span>
              <span className="text-xs text-film-500 ml-auto">
                共 {filteredBatchMovies.length} 部符合条件 · 已选 {selectedMovieIds.length} 部
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-film-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索影片名或导演..."
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <select
                  value={batchYearFilter}
                  onChange={(e) => setBatchYearFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                >
                  <option value="all">全部年份</option>
                  {allYears.map((y) => (
                    <option key={y} value={y}>{y} 年</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={batchGenreFilter}
                  onChange={(e) => setBatchGenreFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-lg text-white text-sm"
                >
                  <option value="all">全部类型</option>
                  {allGenres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-film-400">评分筛选：</span>
              <div className="flex gap-2">
                {[
                  { label: '全部', value: 'all' },
                  { label: '≥ 7分', value: '7' },
                  { label: '≥ 8分', value: '8' },
                  { label: '≥ 9分', value: '9' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBatchRatingFilter(opt.value)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      batchRatingFilter === opt.value
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-[#1a1a24] border-[#2a2a35] text-film-400 hover:border-film-500'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={selectAllFiltered}
                  className="px-3 py-1 text-xs text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                >
                  全选
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-xs text-film-400 hover:bg-[#1f1f28] rounded transition-colors"
                >
                  清空
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredBatchMovies.map((movie) => {
                const isSelected = selectedMovieIds.includes(movie.id);
                return (
                  <div
                    key={movie.id}
                    onClick={() => toggleMovieSelection(movie.id)}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-amber-500/10 border border-amber-500/50'
                        : 'bg-[#1a1a24] hover:bg-[#1f1f28] border border-transparent'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-amber-500 border-amber-500' : 'border-film-500'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-black" />}
                    </div>
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="w-8 h-11 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-11 bg-[#252530] rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{movie.title}</p>
                      <p className="text-xs text-film-400">{movie.year} · {movie.director}</p>
                    </div>
                    <div className="flex gap-1">
                      {movie.genres.slice(0, 2).map((g) => (
                        <span key={g} className="px-1.5 py-0.5 text-[10px] bg-[#252530] text-film-400 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="text-amber-400 font-bold text-sm w-12 text-right">★ {movie.rating}</div>
                  </div>
                );
              })}
              {filteredBatchMovies.length === 0 && (
                <p className="text-center text-film-500 py-8 text-sm">没有符合条件的影片</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#252530]">
            <button
              onClick={() => { setShowBatchModal(false); setSelectedMovieIds([]); }}
              className="flex-1 py-2.5 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleBatchAdd}
              disabled={selectedMovieIds.length === 0}
              className={cn(
                'flex-1 py-2.5 text-black font-medium rounded-lg transition-all text-sm',
                selectedMovieIds.length > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500'
                  : 'bg-film-500/30 text-film-500 cursor-not-allowed'
              )}
            >
              添加 {selectedMovieIds.length} 部影片
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
