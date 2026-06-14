import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '../api/events';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { NotificationContext } from '../context/NotificationContext';

const categories = [
  { value: 'musica', label: 'Música' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'cinema', label: 'Cinema' },
  { value: 'exposicao', label: 'Exposição' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'festa', label: 'Festa' },
];

const defaultValues = {
  title: '',
  synopsis: '',
  description: '',
  date: '',
  location: '',
  price: '',
  category: '',
};

export default function Publicar() {
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [loadedEvent, setLoadedEvent] = useState(null);
  const [loadEventId, setLoadEventId] = useState('');

  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const watchTitle = watch('title');
  const watchSynopsis = watch('synopsis');
  const watchDescription = watch('description');
  const watchDate = watch('date');
  const watchLocation = watch('location');
  const watchPrice = watch('price');
  const watchCategory = watch('category');

  useEffect(() => {
    return () => {
      if (posterPreview && posterPreview.startsWith('blob:')) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [posterPreview]);

  useEffect(() => {
    if (paramEventId) {
      setLoadEventId(paramEventId);
      loadEvent(paramEventId);
    }
  }, [paramEventId]);

  const handlePosterChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (posterPreview && posterPreview.startsWith('blob:')) {
      URL.revokeObjectURL(posterPreview);
    }

    setPosterFile(file);
    if (file) {
      setPosterPreview(URL.createObjectURL(file));
      clearErrors('poster');
    } else {
      setPosterPreview(null);
      if (!loadedEvent) {
        setError('poster', { type: 'required', message: 'O cartaz é obrigatório.' });
      }
    }
  };

  const loadEvent = async (id) => {
    if (!id) {
      addNotification('Insira o ID do evento para carregar.', 'error');
      return;
    }

    setIsLoadingEvent(true);

    try {
      const response = await eventsApi.getById(id);
      const event = response.data;
      const posterUrl = event.posterUrl || event.poster?.url || '';

      setLoadedEvent(event);
      reset({
        title: event.title || '',
        synopsis: event.synopsis || '',
        description: event.description || '',
        date: event.date ? event.date.split('T')[0] : '',
        location: event.location || '',
        price: event.price ?? '',
        category: event.category || '',
      });
      setPosterFile(null);
      setPosterPreview(posterUrl || null);
      addNotification('Evento carregado para edição.', 'success');
    } catch (error) {
      const message = error.response?.data?.message || 'Não foi possível carregar o evento. Verifique o ID e tente novamente.';
      addNotification(message, 'error');
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const clearLoadedEvent = () => {
    setLoadedEvent(null);
    setLoadEventId('');
    setPosterFile(null);
    setPosterPreview(null);
    reset(defaultValues);
  };

  const onSubmit = (data) => {
    if (!posterFile && !loadedEvent) {
      setError('poster', { type: 'required', message: 'O cartaz é obrigatório.' });
      return;
    }

    setPendingEvent(data);
    setIsConfirmationOpen(true);
  };

  const handlePublish = async () => {
    if (!pendingEvent) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', pendingEvent.title);
      formData.append('synopsis', pendingEvent.synopsis);
      formData.append('description', pendingEvent.description);
      formData.append('date', pendingEvent.date);
      formData.append('location', pendingEvent.location);
      formData.append('price', pendingEvent.price);
      formData.append('category', pendingEvent.category);
      if (posterFile) {
        formData.append('poster', posterFile);
      }

      if (loadedEvent) {
        await eventsApi.update(loadedEvent.id, formData);
        addNotification('Evento atualizado com sucesso.', 'success');
      } else {
        await eventsApi.create(formData);
        addNotification('Evento publicado com sucesso.', 'success');
      }

      navigate('/painel');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar evento. Tente novamente mais tarde.';
      addNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!loadedEvent) return;

    setIsSubmitting(true);

    try {
      await eventsApi.delete(loadedEvent.id);
      addNotification('Publicação removida com sucesso.', 'success');
      navigate('/painel');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao excluir evento. Tente novamente mais tarde.';
      addNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryLabel = categories.find((item) => item.value === watchCategory)?.label || 'Categoria';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{loadedEvent ? 'Editar Evento' : 'Publicar Evento'}</h1>
        <p className="text-sm text-muted mt-2 max-w-xl">
          {loadedEvent
            ? 'Atualize os detalhes do evento e confirme para salvar as alterações.'
            : 'Crie um evento, confirme os detalhes e publique-o para que toda a comunidade possa descobrir.'}
        </p>
      </div>

      <Card className="mb-8 space-y-6">
        <CardHeader className="space-y-3">
          <CardTitle>Editar publicação existente</CardTitle>
          <p className="text-sm text-muted">Carregue o ID do evento para atualizar ou excluir a publicação.</p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
            <div>
              <label className="text-sm font-medium">ID do Evento</label>
              <input
                value={loadEventId}
                onChange={(event) => setLoadEventId(event.target.value)}
                placeholder="Cole o ID do evento aqui"
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-surface px-3 text-sm text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => loadEvent(loadEventId)} isLoading={isLoadingEvent} disabled={!loadEventId}>
                Carregar
              </Button>
              {loadedEvent && (
                <Button type="button" variant="secondary" onClick={clearLoadedEvent} disabled={isLoadingEvent}>
                  Nova publicação
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-6">
          <CardHeader className="space-y-3">
            <CardTitle>{loadedEvent ? 'Editar Evento' : 'Formulário de Evento'}</CardTitle>
            <p className="text-sm text-muted">Preencha todos os campos obrigatórios antes de enviar.</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4">
                <Input
                  label="Título"
                  placeholder="Nome do evento"
                  error={errors.title?.message}
                  {...register('title', {
                    required: 'O título é obrigatório.',
                    minLength: { value: 5, message: 'Use pelo menos 5 caracteres.' },
                  })}
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Sinopse</label>
                    <textarea
                      className={`min-h-[84px] w-full rounded-md border px-3 py-2 text-sm text-text transition-colors bg-surface border-white/10 placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.synopsis ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      placeholder="Uma breve descrição do evento"
                      {...register('synopsis', {
                        required: 'A sinopse é obrigatória.',
                        minLength: { value: 10, message: 'Use pelo menos 10 caracteres.' },
                      })}
                    />
                    {errors.synopsis && <span className="text-xs text-red-500">{errors.synopsis.message}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Descrição</label>
                    <textarea
                      className={`min-h-[84px] w-full rounded-md border px-3 py-2 text-sm text-text transition-colors bg-surface border-white/10 placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      placeholder="Detalhes completos do evento"
                      {...register('description', {
                        required: 'A descrição é obrigatória.',
                        minLength: { value: 20, message: 'Use pelo menos 20 caracteres.' },
                      })}
                    />
                    {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Input
                    label="Data"
                    type="date"
                    error={errors.date?.message}
                    {...register('date', {
                      required: 'A data é obrigatória.',
                    })}
                  />

                  <Input
                    label="Local"
                    placeholder="Rua, bairro, cidade"
                    error={errors.location?.message}
                    {...register('location', {
                      required: 'O local é obrigatório.',
                      minLength: { value: 5, message: 'Insira um local válido.' },
                    })}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Input
                    label="Preço (AKZ)"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={errors.price?.message}
                    {...register('price', {
                      required: 'O preço é obrigatório.',
                      min: { value: 0, message: 'O preço não pode ser negativo.' },
                    })}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Categoria</label>
                    <select
                      className={`h-11 rounded-md border border-white/10 bg-surface px-3 text-sm text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.category ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      {...register('category', {
                        required: 'A categoria é obrigatória.',
                      })}
                    >
                      <option value="">Escolha a categoria</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Cartaz</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className={`h-11 rounded-md border border-white/10 bg-surface px-3 text-sm text-text transition-colors file:border-0 file:bg-background file:px-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.poster ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.poster && <span className="text-xs text-red-500">{errors.poster.message}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {loadedEvent && (
                  <Button variant="outline" type="button" onClick={handleDelete} isLoading={isSubmitting}>
                    Excluir Publicação
                  </Button>
                )}
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {loadedEvent ? 'Salvar Alterações' : 'Verificar e Publicar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardHeader className="space-y-3">
            <CardTitle>Pré-visualização</CardTitle>
            <p className="text-sm text-muted">Confira o visual do evento antes de publicar.</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-background p-4">
              <div className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-surface">
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="Pré-visualização do cartaz"
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-3xl bg-white/5 text-sm text-muted">
                    Cartaz do evento
                  </div>
                )}
              </div>

              <div className="space-y-3 px-1">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{selectedCategoryLabel}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{watchTitle || 'Título do evento'}</h2>
                  <p className="text-sm text-muted mt-1">{watchSynopsis || 'Sinopse breve do evento aparecerá aqui.'}</p>
                </div>
                <div className="grid gap-2 text-sm text-muted">
                  <p><strong className="text-text">Data:</strong> {watchDate || 'dd/mm/aaaa'}</p>
                  <p><strong className="text-text">Local:</strong> {watchLocation || 'Endereço do evento'}</p>
                  <p><strong className="text-text">Preço:</strong> {watchPrice ? `${watchPrice} AKZ` : 'Gratuito / A definir'}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Descrição</h3>
                  <p className="text-sm text-muted">{watchDescription || 'A descrição completa do evento aparecerá aqui para dar mais contexto aos interessados.'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isConfirmationOpen} onClose={() => setIsConfirmationOpen(false)} title="Confirmar publicação">
        <div className="space-y-4 text-sm text-text">
          <p>Reveja os detalhes do evento antes de enviar. Quando confirmar, o evento será publicado imediatamente.</p>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-surface p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Título</p>
              <p className="mt-1 text-base font-semibold">{pendingEvent?.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Categoria</p>
              <p className="mt-1 text-base">{categories.find((item) => item.value === pendingEvent?.category)?.label || '-'}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Data</p>
                <p className="mt-1">{pendingEvent?.date}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Local</p>
                <p className="mt-1">{pendingEvent?.location}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Preço</p>
              <p className="mt-1">{pendingEvent?.price ? `${pendingEvent.price} AKZ` : 'Gratuito / A definir'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Sinopse</p>
              <p className="mt-1 text-sm text-muted">{pendingEvent?.synopsis}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Descrição</p>
              <p className="mt-1 text-sm text-muted">{pendingEvent?.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <Button variant="secondary" onClick={() => setIsConfirmationOpen(false)} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button onClick={handlePublish} isLoading={isSubmitting}>
            Confirmar Publicação
          </Button>
        </div>
      </Modal>
    </div>
  );
}
