import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStreams } from '@/hooks/useLiveStreams';
import { LiveStreamEmbed } from './LiveStreamEmbed';
import { Radio, Tv, Mic, Calendar, Clock } from 'lucide-react';

export const LiveStreamWidget = () => {
  const { data: streams, isLoading } = useLiveStreams();

  const liveStreams = streams?.filter(stream => stream.status === 'live') || [];
  const scheduledStreams = streams?.filter(stream => stream.status === 'scheduled') || [];
  const activeStream = liveStreams[0];
  const nextStream = scheduledStreams[0];

  const getStreamIcon = (type: string) => {
    switch (type) {
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'radio': return <Radio className="h-4 w-4" />;
      case 'podcast': return <Mic className="h-4 w-4" />;
      default: return <Tv className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-full h-4" />
      </div>
    );
  }

  if (activeStream) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {getStreamIcon(activeStream.stream_type)}
              {activeStream.title}
            </CardTitle>
            <Badge className={`${getStatusColor(activeStream.status)} text-white animate-pulse`}>
              AO VIVO
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <LiveStreamEmbed stream={activeStream} />
          {activeStream.description && (
            <p className="text-muted-foreground mt-4 text-sm">
              {activeStream.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {activeStream.viewer_count} assistindo
            </span>
            {activeStream.chat_enabled && (
              <Button variant="outline" size="sm">
                Abrir Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (nextStream) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próxima Transmissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Transmissão em breve</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{nextStream.title}</h3>
              {nextStream.description && (
                <p className="text-muted-foreground text-sm mb-3">
                  {nextStream.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStreamIcon(nextStream.stream_type)}
                  {nextStream.stream_type.toUpperCase()}
                </Badge>
                {nextStream.scheduled_at && (
                  <span className="text-muted-foreground">
                    {new Date(nextStream.scheduled_at).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transmissões ao Vivo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma transmissão ativa no momento</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Acompanhe nossas transmissões ao vivo com análises geopolíticas e discussões sobre os principais acontecimentos internacionais.
        </p>
      </CardContent>
    </Card>
  );
};