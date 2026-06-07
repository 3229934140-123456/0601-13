import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Eye, EyeOff, Edit2, X, Check, Film } from 'lucide-react';
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
  const { rankings, movies, addRanking, updateRanking, deleteRanking, reorderRankingMovies, removeMovieFromRanking, addMovieToRanking } = useStore();
  const [selectedRanking, setSelectedRanking] = useState<Ranking | null>(rankings[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [newRankingTitle, setNewRankingTitle] = useState('');
  const [newRankingDesc, setNewRankingDesc] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');

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

  const availableMovies = movies.filter(
    (m) => m.status === 'watched' && !selectedRanking?.movieIds.includes(m.id)
  );

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
    addRanking({
      title: newRankingTitle,
      description: newRankingDesc,
      isPublic: false,
    });
    setNewRankingTitle('');
    setNewRankingDesc('');
    setShowCreateModal(false);
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            榜单编辑
          </h1>
          <p className="text-sm text-film-400 mt-1">
            共 {rankings.length} 个榜单
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
            <button
              key={ranking.id}
              onClick={() => setSelectedRanking(ranking)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                selectedRanking?.id === ranking.id
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-[#15151c] border-[#252530] hover:border-[#353545]'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'font-medium text-sm truncate',
                  selectedRanking?.id === ranking.id ? 'text-amber-400' : 'text-white'
                )}>
                  {ranking.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-film-400">
                <span>{ranking.movieIds.length} 部影片</span>
                {ranking.isPublic ? (
                  <Eye className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </div>
            </button>
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
                    <p className="text-sm mt-1">点击上方按钮添加影片</p>
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
              placeholder="如：年度十佳"
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
          {availableMovies.length > 0 ? (
            availableMovies.map((movie) => (
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
    </div>
  );
}
