import { useEffect, useMemo, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { NotificationContext } from '../context/NotificationContext';
import { eventsApi } from '../api/events';

function formatDateLabel(value) {
  if (!value) return 'Data não definida';
  return new Date(value).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PublicarVideo() {
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingData, setPendingData] = useState(null);

  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      eventId: '',
      eventDate: '',
    },
  });

  const watchEventDate = watch('eventDate');
  const isStreamAvailable = useMemo(() => {
    if (!watchEventDate) return false;
    return new Date() >= new Date(watchEventDate);
  }, [watchEventDate]);

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [posterPreview, videoPreview]);

  const handlePosterChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (posterPreview) URL.revokeObjectURL(posterPreview);

    if (file && file.type !== 'image/png') {
      setPosterFile(null);
      setPosterPreview(null);
      setError('poster', { type: 'type', message: 'Cartaz precisa ser PNG.' });
      return;
    }

    clearErrors('poster');
    setPosterFile(file);
    setPosterPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    if (file && file.type !== 'video/mp4') {
      setVideoFile(null);
      setVideoPreview(null);
      setError('video', { type: 'type', message: 'O vídeo precisa ser MP4.' });
      return;
    }

    clearErrors('video');
    setVideoFile(file);
    setVideoPreview(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = (data) => {
    if (!posterFile) {
      setError('poster', { type: 'required', message: 'Cartaz em PNG obrigatório.' });
      return;
    }

    if (!videoFile) {
      setError('video', { type: 'required', message: 'Vídeo em MP4 obrigatório.' });
      return;
    }

    setPendingData(data);
    setIsConfirmationOpen(true);
  };

  const handleUpload = async () => {
    if (!pendingData) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('poster', posterFile);
    formData.append('video', videoFile);

    try {
      await eventsApi.uploadVideo(pendingData.eventId, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        },
      });

      addNotification('Mídia carregada com sucesso.', 'success');
      setIsConfirmationOpen(false);
      navigate('/painel');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao carregar mídia. Tente novamente.';
      addNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload de Vídeo do Evento</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">Faça upload do cartaz PNG e do vídeo MP4 via Cloudinary e atualize o evento existente.</p>
        </div>
        <Link to="/painel/publicar" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-2 text-sm text-text hover:bg-white/5 transition-colors">
          <ArrowLeft size={16} /> Voltar ao formulário de evento
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-6">
          <CardHeader className="space-y-3">
            <CardTitle>Dados de Upload</CardTitle>
            <p className="text-sm text-muted">Informe o ID do evento e selecione os ficheiros válidos.</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="ID do Evento"
                placeholder="123456"
                error={errors.eventId?.message}
                {...register('eventId', {
                  required: 'O ID do evento é obrigatório.',
                })}
              />

              <Input
                label="Data do Evento"
                type="date"
                error={errors.eventDate?.message}
                {...register('eventDate', {
                  required: 'A data do evento é obrigatória.',
                })}
              />

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Cartaz PNG</label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handlePosterChange}
                    className={`h-11 rounded-md border border-white/10 bg-surface px-3 text-sm text-text transition-colors file:border-0 file:bg-background file:px-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.poster ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.poster && <span className="text-xs text-red-500">{errors.poster.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Vídeo MP4</label>
                  <input
                    type="file"
                    accept="video/mp4"
                    onChange={handleVideoChange}
                    className={`h-11 rounded-md border border-white/10 bg-surface px-3 text-sm text-text transition-colors file:border-0 file:bg-background file:px-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.video ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.video && <span className="text-xs text-red-500">{errors.video.message}</span>}
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Verificar e Enviar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardHeader className="space-y-3">
            <CardTitle>Pré-visualização de Upload</CardTitle>
            <p className="text-sm text-muted">Veja o estado dos ficheiros e o desbloqueio do streaming.</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-3xl border border-white/10 bg-background p-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3">
                <div>
                  <p className="text-sm text-muted">Data do evento</p>
                  <p className="text-base font-semibold">{formatDateLabel(watchEventDate)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isStreamAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-300'}`}>
                  {isStreamAvailable ? 'Streaming disponível' : 'Streaming bloqueado'}
                </span>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-surface p-4">
                  <p className="text-sm text-muted">Cartaz selecionado</p>
                  {posterPreview ? (
                    <img src={posterPreview} alt="Cartaz preview" className="mt-3 h-48 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="mt-3 flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-background text-sm text-muted">
                      Ainda não foi selecionado
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted">Vídeo selecionado</p>
                      <p className="mt-1 text-sm text-text">{videoFile?.name ?? 'Nenhum ficheiro selecionado'}</p>
                    </div>
                    <Upload size={18} />
                  </div>

                  {videoPreview && (
                    <div className="mt-3">
                      {isStreamAvailable ? (
                        <video controls className="w-full rounded-2xl bg-black" src={videoPreview} />
                      ) : (
                        <div className="mt-3 flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-background px-4 text-center text-sm text-muted">
                          Streaming ficará disponível somente após <strong>{formatDateLabel(watchEventDate)}</strong>.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>Progresso de upload</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isConfirmationOpen} onClose={() => setIsConfirmationOpen(false)} title="Confirmar upload">
        <div className="space-y-4 text-sm text-text">
          <p>Confirme o upload dos ficheiros para o evento especificado. Esta ação enviará o PNG e o MP4 via Cloudinary para o backend.</p>

          <div className="rounded-2xl border border-white/10 bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Evento</p>
            <p className="mt-1 text-base font-semibold">{pendingData?.eventId}</p>
            <p className="mt-1 text-sm text-muted">Data do evento: {formatDateLabel(pendingData?.eventDate)}</p>
            <p className="mt-2 text-sm">Cartaz: {posterFile?.name ?? 'Nenhum'}</p>
            <p className="text-sm">Vídeo: {videoFile?.name ?? 'Nenhum'}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <Button variant="secondary" onClick={() => setIsConfirmationOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} isLoading={isSubmitting}>
            Confirmar Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
}
