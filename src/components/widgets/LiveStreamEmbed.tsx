import React from 'react';
import { LiveStream } from '@/hooks/useLiveStreams';

interface LiveStreamEmbedProps {
  stream: LiveStream;
}

export const LiveStreamEmbed: React.FC<LiveStreamEmbedProps> = ({ stream }) => {
  const getEmbedUrl = (url: string) => {
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    
    // YouTube live stream
    if (url.includes('youtube.com/embed/live_stream')) {
      return url + '?autoplay=1&rel=0';
    }
    
    // Facebook live
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
    }
    
    // Twitch
    if (url.includes('twitch.tv')) {
      const channel = url.split('twitch.tv/')[1];
      return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true`;
    }
    
    // Return original URL if no conversion needed
    return url;
  };

  // If embed_code is provided, use it directly
  if (stream.embed_code) {
    return (
      <div 
        className="aspect-video w-full rounded-lg overflow-hidden"
        dangerouslySetInnerHTML={{ __html: stream.embed_code }}
      />
    );
  }

  // Otherwise, create iframe embed
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <iframe
        src={getEmbedUrl(stream.stream_url)}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={stream.title}
      />
    </div>
  );
};
