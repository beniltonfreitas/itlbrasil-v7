import { useState } from 'react';
import { Play, Clock, Video, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  videoUrl?: string;
  available: boolean;
}

// Placeholder videos - URLs to be added later
export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: 'intro',
    title: 'Introdução ao Notícias AI',
    description: 'Visão geral das funcionalidades e como começar a usar.',
    duration: '1:20',
    available: false,
  },
  {
    id: 'modo-exclusiva',
    title: 'Usando o Modo EXCLUSIVA',
    description: 'Preserve textos originais de agências oficiais.',
    duration: '0:35',
    available: false,
  },
  {
    id: 'modo-json',
    title: 'Gerando JSON para Importação',
    description: 'Crie JSON formatado para importação automática.',
    duration: '0:45',
    available: false,
  },
  {
    id: 'modo-lote',
    title: 'Processamento em Lote',
    description: 'Processe até 10 URLs simultaneamente.',
    duration: '0:50',
    available: false,
  },
  {
    id: 'upload-imagem',
    title: 'Upload de Imagens',
    description: 'Envie imagens e use as URLs automaticamente.',
    duration: '0:25',
    available: false,
  },
  {
    id: 'importar-noticias',
    title: 'Importando Notícias',
    description: 'Publique artigos diretamente do JSON gerado.',
    duration: '0:40',
    available: false,
  },
  {
    id: 'agendamentos',
    title: 'Configurando Agendamentos',
    description: 'Automatize importações em intervalos regulares.',
    duration: '0:55',
    available: false,
  },
  {
    id: 'fontes',
    title: 'Gerenciando Fontes',
    description: 'Configure templates para diferentes portais.',
    duration: '0:45',
    available: false,
  },
];

interface VideoCardProps {
  video: TutorialVideo;
  onPlay: (video: TutorialVideo) => void;
}

const VideoCard = ({ video, onPlay }: VideoCardProps) => (
  <button
    onClick={() => video.available && onPlay(video)}
    disabled={!video.available}
    className={cn(
      'flex items-start gap-3 p-3 rounded-lg border text-left w-full transition-all',
      video.available
        ? 'hover:bg-muted/50 hover:border-primary/30 cursor-pointer'
        : 'opacity-60 cursor-not-allowed bg-muted/20'
    )}
  >
    {/* Thumbnail */}
    <div className="relative flex-shrink-0 w-20 h-14 rounded-md bg-muted flex items-center justify-center overflow-hidden">
      {video.thumbnail ? (
        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
      ) : (
        <Video className="h-6 w-6 text-muted-foreground" />
      )}
      {video.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
          <Play className="h-6 w-6 text-white fill-white" />
        </div>
      )}
      {!video.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="text-[10px] text-white font-medium">EM BREVE</span>
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm truncate">{video.title}</h4>
        <Badge variant="outline" className="flex-shrink-0 text-[10px] px-1.5 py-0">
          <Clock className="h-2.5 w-2.5 mr-1" />
          {video.duration}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
        {video.description}
      </p>
    </div>
  </button>
);

interface VideoPlayerModalProps {
  video: TutorialVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayerModal = ({ video, isOpen, onClose }: VideoPlayerModalProps) => {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            {video.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {video.videoUrl ? (
            <iframe
              src={video.videoUrl}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Vídeo em produção</p>
              <p className="text-xs opacity-75 mt-1">Disponível em breve</p>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{video.description}</p>
      </DialogContent>
    </Dialog>
  );
};

interface TutorialVideoPlayerProps {
  category?: string;
  compact?: boolean;
}

export const TutorialVideoPlayer = ({ category, compact = false }: TutorialVideoPlayerProps) => {
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePlay = (video: TutorialVideo) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  const displayVideos = category
    ? TUTORIAL_VIDEOS.filter(v => v.id.includes(category))
    : TUTORIAL_VIDEOS;

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {displayVideos.slice(0, 3).map(video => (
          <Button
            key={video.id}
            variant="outline"
            size="sm"
            onClick={() => video.available && handlePlay(video)}
            disabled={!video.available}
            className="text-xs gap-1"
          >
            <Play className="h-3 w-3" />
            {video.title}
            <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">
              {video.duration}
            </Badge>
          </Button>
        ))}
        <VideoPlayerModal video={selectedVideo} isOpen={modalOpen} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Vídeos Tutorial</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {TUTORIAL_VIDEOS.filter(v => v.available).length}/{TUTORIAL_VIDEOS.length} disponíveis
        </Badge>
      </div>

      <div className="grid gap-2">
        {displayVideos.map(video => (
          <VideoCard key={video.id} video={video} onPlay={handlePlay} />
        ))}
      </div>

      <VideoPlayerModal video={selectedVideo} isOpen={modalOpen} onClose={handleClose} />
    </div>
  );
};
