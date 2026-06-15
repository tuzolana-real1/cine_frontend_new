import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Compass, Calendar, MapPin, Ticket } from 'lucide-react';
import { eventsApi } from '../api/events';
import { useAuth } from '../hooks/useAuth';

export default function Explore() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await eventsApi.getAll();
        setEvents(response.data || []);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Explorar Catálogo</h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Descubra eventos publicados, sessões de streaming e espetáculos disponíveis para a comunidade.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-2 text-sm text-white/80">
            <Compass size={16} /> {events.length} eventos disponíveis
          </span>
          {user?.role === 'STUDIO' && (
            <Link to="/painel/publicar">
              <Button variant="secondary">Publicar Novo Evento</Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center rounded-3xl border border-white/10 bg-surface">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nenhum evento encontrado"
          description="Ainda não há eventos publicados. Verifique novamente mais tarde."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const id = event.id || event._id || event.eventId;
            const isAvailable = new Date() >= new Date(event.date);

            return (
              <div key={id} className="rounded-3xl border border-white/10 bg-surface p-5 shadow-sm transition hover:-translate-y-1">
                <div className="mb-4 overflow-hidden rounded-3xl bg-black/10">
                  <img
                    src={event.posterUrl || event.poster?.url || `https://via.placeholder.com/600x400?text=${encodeURIComponent(event.title || 'Evento')}`}
                    alt={event.title}
                    className="h-52 w-full object-cover"
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                    <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(event.date).toLocaleDateString('pt-PT')}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{event.synopsis}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>{event.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link to={`/streaming/${id}`} className="flex-1">
                      <Button className="w-full">{isAvailable ? 'Assistir' : 'Ver detalhes'}</Button>
                    </Link>
                    {user?.role === 'STUDIO' && (
                      <Link to={`/painel/publicar/${id}`} className="flex-1">
                        <Button variant="outline" className="w-full">Editar</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
