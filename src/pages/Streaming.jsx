import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { VideoPlayer } from '../ui/VideoPlayer';
import { CommentSection } from '../ui/CommentSection';
import { eventsApi } from '../api/events';

export default function Streaming() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await eventsApi.getById(eventId);
        setEvent(response.data);
        const releaseDate = new Date(response.data.date);
        setIsAvailable(new Date() >= releaseDate);
      } catch (error) {
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Evento não encontrado"
          description="Não foi possível localizar o evento solicitado."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-sm text-muted mt-2">{event.synopsis}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-2 text-sm text-text hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle>Streaming do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {isAvailable ? (
              <VideoPlayer src={event.videoUrl || event.video || event.streamUrl} poster={event.posterUrl || event.poster || event.imageUrl} />
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-surface p-10 text-center">
                <p className="text-xl font-semibold">Streaming disponível em:</p>
                <p className="mt-2 text-lg text-muted">{new Date(event.date).toLocaleString('pt-PT')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-6">
            <CardHeader>
              <CardTitle>Detalhes do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Data:</strong> {new Date(event.date).toLocaleString('pt-PT')}</p>
              <p><strong>Local:</strong> {event.location}</p>
              <p><strong>Preço:</strong> {event.price ? `${event.price} AKZ` : 'Gratuito'}</p>
              <p><strong>Categoria:</strong> {event.category}</p>
            </CardContent>
          </Card>

          <CommentSection eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
