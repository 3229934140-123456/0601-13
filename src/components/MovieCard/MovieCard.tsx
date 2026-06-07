import { Movie, WatchStatus } from '@/types';
import { Star, Eye, Clock, XCircle, Plus, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  onEdit?: () => void;
  className?: string;
}

const statusConfig: Record<WatchStatus, { label: string; color: string; bg: string; icon: typeof Star }> = {
  wish: { label: '想看', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Plus },
  watching: { label: '在看', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock },
  watched: { label: '已看', color: 'text-green-400', bg: 'bg-green-500/20', icon: Eye },
  dropped: { label: '弃看', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle },
};

export function MovieCard({ movie, onClick, onEdit, className }: MovieCardProps) {
  const status = statusConfig[movie.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-[#15151c] rounded-xl overflow-hidden cursor-pointer card-hover border border-[#1f1f28]',
        className
      )}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-[#1a1a24]">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-film-500">
            <span className="font-display text-4xl text-amber-500/30">🎬</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-transparent opacity-80" />

        <div className="absolute top-2 right-2">
          <span className={cn('px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1', status.bg, status.color)}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        {movie.rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-amber-400">{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {movie.watchLogs.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-medium">
            看过 {movie.watchLogs.length} 遍
          </div>
        )}

        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-amber-500 hover:text-black"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-white truncate mb-1 group-hover:text-amber-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-film-400">
          <span>{movie.year}</span>
          <span className="truncate max-w-[120px]">{movie.director}</span>
        </div>
        {movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="px-1.5 py-0.5 text-[10px] rounded bg-[#1f1f28] text-film-400">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
