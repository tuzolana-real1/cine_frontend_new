import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../ui/EmptyState';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { eventsApi } from '../api/events';
import { useAuth } from '../hooks/useAuth';
import { NotificationContext } from '../context/NotificationContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useContext(NotificationContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data || []);
    } catch (error) {
      addNotification('Não foi possível carregar eventos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que pretende eliminar esta publicação?')) return;
    setDeleting(id);
    try {
      await eventsApi.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id && e._id !== id));
      addNotification('Publicação removida.', 'success');
    } catch (error) {
      addNotification('Erro ao excluir a publicação.', 'error');
    } finally {
      setDeleting('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do Estúdio</h1>
          <p className="text-sm text-muted mt-2">Gerencie seus eventos e uploads de streaming a partir daqui.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user?.role === 'STUDIO' && (
            <>
              <Link to="/painel/publicar">
                <Button variant="primary">Publicar Evento</Button>
              </Link>
              <Link to="/painel/publicar-video">
                <Button variant="secondary">Upload de Vídeo</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {user?.role === 'STUDIO' ? (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">As suas publicações</h2>
          {loading ? (
            <div className="text-sm text-muted">A carregar eventos...</div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title="Sem publicações"
              description="Ainda não publicou eventos. Utilize o botão de Publicar para criar o primeiro."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => {
                const id = ev.id || ev._id || ev.eventId;
                return (
                  <div key={id} className="rounded-lg border border-white/5 bg-surface p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="h-20 w-32 overflow-hidden rounded-md bg-white/5">
                        <img
                          src={ev.posterUrl || ev.poster?.url || `https://via.placeholder.com/320x200?text=${encodeURIComponent(ev.title || 'Sem+imagem')}`}
                          alt={ev.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{ev.title}</h3>
                        <p className="text-sm text-muted">{ev.date ? new Date(ev.date).toLocaleString() : 'Data não definida'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/painel/publicar/${id}`}>
                        <Button size="sm">Editar</Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(id)} disabled={deleting === id}>
                        {deleting === id ? 'A eliminar...' : 'Excluir'}
                      </Button>
                      <Link to="/painel/publicar-video" className="ml-auto">
                        <Button size="sm" variant="ghost">Upload Vídeo</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <EmptyState
          icon={LayoutDashboard}
          title="Área do Produtor"
          description="Somente contas de Estúdio/Produtor podem publicar, editar ou eliminar eventos."
        />
      )}
    </div>
  );
}
