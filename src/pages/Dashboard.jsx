import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../ui/EmptyState';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { contentsApi } from '../api/contents';
import { useAuth } from '../hooks/useAuth';
import { USER_TYPE } from '../constants/enums';

export default function Dashboard() {
  const { user } = useAuth();

  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState('');

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    try {
      const response = await contentsApi.getAll();
      setContents(response.data?.contents ?? response.data ?? []);
    } catch (error) {
      console.error('Não foi possível carregar conteúdos.', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que pretende eliminar esta publicação?')) return;
    setDeleting(id);
    try {
      await contentsApi.delete(id);
      setContents((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    } catch (error) {
      console.error('Erro ao excluir a publicação.', error);
    } finally {
      setDeleting('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do Estúdio</h1>
          <p className="text-sm text-muted mt-2">Gerencie seus conteúdos e uploads de streaming a partir daqui.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user?.role === USER_TYPE.STUDIO && (
            <>
              <Link to="/painel/publicar">
                <Button variant="primary">Publicar Conteúdo</Button>
              </Link>
              <Link to="/painel/publicar-video">
                <Button variant="secondary">Upload de Vídeo</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {user?.role === USER_TYPE.STUDIO ? (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">As suas publicações</h2>
          {loading ? (
            <div className="text-sm text-muted">A carregar conteúdos...</div>
          ) : contents.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title="Sem publicações"
              description="Ainda não publicou conteúdos. Utilize o botão de Publicar para criar o primeiro."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((content) => {
                const id = content.id || content._id || content.contentId;
                return (
                  <div key={id} className="rounded-lg border border-white/5 bg-surface p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="h-20 w-32 overflow-hidden rounded-md bg-white/5">
                        <img
                          src={content.coverUrl || content.poster?.url || `https://via.placeholder.com/320x200?text=${encodeURIComponent(content.title || 'Sem+imagem')}`}
                          alt={content.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{content.title}</h3>
                        <p className="text-sm text-muted">{content.eventDate ? new Date(content.eventDate).toLocaleString() : 'Data não definida'}</p>
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
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Conteúdos disponíveis</h2>
          <p className="mb-6 text-sm text-muted">Veja abaixo os conteúdos publicados na plataforma. Pode aceder ao streaming sempre que estiver disponível.</p>
          {loading ? (
            <div className="text-sm text-muted">A carregar conteúdos...</div>
          ) : contents.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title="Nenhum conteúdo disponível"
              description="Ainda não há conteúdos publicados. Verifique novamente mais tarde."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((content) => {
                const id = content.id || content._id || content.contentId;
                const isAvailable = new Date() >= new Date(content.eventDate);
                return (
                  <div key={id} className="rounded-lg border border-white/5 bg-surface p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="h-20 w-32 overflow-hidden rounded-md bg-white/5">
                        <img
                          src={content.coverUrl || content.poster?.url || `https://via.placeholder.com/320x200?text=${encodeURIComponent(content.title || 'Sem+imagem')}`}
                          alt={content.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{content.title}</h3>
                        <p className="text-sm text-muted">{content.eventDate ? new Date(content.eventDate).toLocaleString() : 'Data não definida'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm text-white/80">
                        <span>{content.category}</span>
                      </div>
                      <Link to={`/streaming/${id}`}>
                        <Button className="w-full">{isAvailable ? 'Assistir' : 'Ver detalhes'}</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
