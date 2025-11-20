import React, { useState, useEffect, useRef } from 'react';
import { ContentItem, ContentType, User } from '../../types';
import { createContentItem, updateContentItem } from '../../services/api';
import { uploadAudio, uploadImage } from '../../services/storageService';
import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { MicrophoneIcon } from '../Icons';

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  user: User;
  defaultType?: ContentType;
}

type AudioSource = 'url' | 'upload' | 'record';
type ImageSource = 'url' | 'upload';

// 50MB limit in bytes
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function ContentForm({ isOpen, onClose, item, user, defaultType }: ContentFormProps) {
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!item;

  // Image-specific state
  const [imageSource, setImageSource] = useState<ImageSource>('url');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Podcast-specific state
  const [audioSource, setAudioSource] = useState<AudioSource>('url');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData(item);
        if (item.type === 'Podcast' || item.type === 'Devocional') {
            setAudioSource('url');
        }
      } else {
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          imageUrl: '',
          type: defaultType || 'Devocional',
          contentBody: '',
          audioUrl: '',
          actionUrl: '',
          downloadableResource: { url: '' },
          duration: 0,
        });
      }
      // Reset all file/upload states
      setSelectedImageFile(null);
      setImageUploadProgress(0);
      setImageSource('url');
      setSelectedAudioFile(null);
      setAudioUploadProgress(0);
      setIsRecording(false);
      setRecordedAudioUrl(null);
      setRecordedBlob(null);
    }
  }, [item, isOpen, defaultType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'downloadUrl') {
        setFormData(prev => ({
            ...prev,
            downloadableResource: { ...(prev.downloadableResource || { url: '' }), url: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > MAX_FILE_SIZE) {
              alert("O arquivo de imagem é muito grande (limite de 50MB). Por favor, escolha um arquivo menor.");
              e.target.value = ''; // Clear input
              return;
          }
          setSelectedImageFile(file);
      }
  };
  
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > MAX_FILE_SIZE) {
              alert("O arquivo de áudio é muito grande (limite de 50MB). Por favor, escolha um arquivo menor.");
              e.target.value = ''; // Clear input
              return;
          }

          setSelectedAudioFile(file);
          setRecordedAudioUrl(null);
          setRecordedBlob(null);
          const audio = document.createElement('audio');
          audio.src = URL.createObjectURL(file);
          audio.onloadedmetadata = () => {
              setFormData(prev => ({...prev, duration: Math.round(audio.duration)}));
          }
      }
  };
  
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
        }

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };
        
        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current!.mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            setRecordedAudioUrl(audioUrl);
            setRecordedBlob(audioBlob);
            setSelectedAudioFile(null);
            const audio = document.createElement('audio');
            audio.src = audioUrl;
            audio.onloadedmetadata = () => {
              setFormData(prev => ({...prev, duration: Math.round(audio.duration)}));
            }
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Não foi possível acessar o microfone. Verifique se você permitiu o acesso nas configurações do navegador ou do sistema.");
    }
  };
  
  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setImageUploadProgress(0);
    setAudioUploadProgress(0);
    
    let finalImageUrl = formData.imageUrl || '';
    let finalAudioUrl = formData.audioUrl || '';
    
    try {
        if (imageSource === 'upload' && selectedImageFile) {
            finalImageUrl = await uploadImage(selectedImageFile, user.id, setImageUploadProgress);
        }

        if (formData.type === 'Podcast' || formData.type === 'Devocional') {
            if (audioSource === 'upload' && selectedAudioFile) {
                finalAudioUrl = await uploadAudio(selectedAudioFile, user.id, setAudioUploadProgress);
            } else if (audioSource === 'record' && recordedBlob) {
                finalAudioUrl = await uploadAudio(recordedBlob, user.id, setAudioUploadProgress);
            }
        }
        
        const dataToSave = { ...formData, imageUrl: finalImageUrl, audioUrl: finalAudioUrl };

        if (isEditing) {
            await updateContentItem(dataToSave as ContentItem);
        } else {
            await createContentItem(dataToSave as Omit<ContentItem, 'id' | 'createdAt' | 'comments' | 'reactions'>);
        }
        onClose();
    } catch (error: any) {
        console.error("Failed to save content", error);
        let errorMessage = "Falha ao salvar o conteúdo. Tente novamente.";
        if (error.message) {
            if (error.message.includes("violates row-level security policy")) {
                errorMessage = "Falha ao salvar: Permissão negada. Verifique se sua conta tem a permissão ('admin' ou 'mentora') e se as regras de segurança (RLS) da tabela 'content' estão corretas.";
            } else {
                errorMessage = `Falha ao salvar o conteúdo: ${error.message}`;
            }
        }
        alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderAudioOptions = () => (
      <div className="space-y-4 pt-4 border-t border-marrom-seiva/20 dark:border-creme-velado/20 mt-4">
        <h3 className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Fonte do Áudio</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="audioSource" value="url" checked={audioSource === 'url'} onChange={() => setAudioSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL Externa</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="audioSource" value="upload" checked={audioSource === 'upload'} onChange={() => setAudioSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload MP3</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="audioSource" value="record" checked={audioSource === 'record'} onChange={() => setAudioSource('record')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Gravar Áudio</span></label>
        </div>
        {audioSource === 'url' && <InputField id="audioUrl" label="URL do Áudio" value={formData.audioUrl || ''} onChange={handleChange} />}
        {audioSource === 'upload' && (
            <div>
                <label htmlFor="audio-upload" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Arquivo MP3</label>
                <input id="audio-upload" type="file" accept=".mp3,audio/mpeg" onChange={handleAudioFileChange} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/>
                {selectedAudioFile && <p className="text-sm mt-2 text-marrom-seiva/80 dark:text-creme-velado/80">Selecionado: {selectedAudioFile.name}</p>}
            </div>
        )}
        {audioSource === 'record' && (
            <div className="space-y-3">
                <Button onClick={isRecording ? stopRecording : startRecording} variant="secondary" className="w-full"><MicrophoneIcon className="w-5 h-5 mr-2"/> {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}</Button>
                {recordedAudioUrl && (
                    <div>
                        <p className="font-sans text-sm font-semibold mb-2">Prévia:</p>
                        <audio controls src={recordedAudioUrl} className="w-full"></audio>
                    </div>
                )}
            </div>
        )}
        {(audioUploadProgress > 0 && audioUploadProgress < 100) && (
            <div>
                <p className="font-sans text-sm mb-1">Enviando áudio...</p>
                <div className="w-full bg-marrom-seiva/20 rounded-full h-2.5"><div className="bg-dourado-suave h-2.5 rounded-full" style={{ width: `${audioUploadProgress}%` }}></div></div>
            </div>
        )}
         <InputField id="duration" label="Duração (em segundos)" type="number" value={formData.duration || ''} onChange={handleChange} />
      </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <InputField id="title" label="Título" value={formData.title || ''} onChange={handleChange} />
        <InputField id="subtitle" label="Subtítulo" value={formData.subtitle || ''} onChange={handleChange} />
        <InputField id="description" label="Descrição Curta" type="textarea" value={formData.description || ''} onChange={handleChange} />
        
        <div className="space-y-4 pt-4 border-t border-marrom-seiva/20 dark:border-creme-velado/20 mt-4">
            <h3 className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Imagem de Capa</h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSource" value="url" checked={imageSource === 'url'} onChange={() => setImageSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL Externa</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSource" value="upload" checked={imageSource === 'upload'} onChange={() => setImageSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label>
            </div>
             {imageSource === 'url' && <InputField id="imageUrl" label="URL da Imagem" value={formData.imageUrl || ''} onChange={handleChange} />}
             {imageSource === 'upload' && (
                <div>
                    <label htmlFor="image-upload" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Arquivo de Imagem</label>
                    <input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageFileChange} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/>
                    {selectedImageFile && <p className="text-sm mt-2 text-marrom-seiva/80 dark:text-creme-velado/80">Selecionado: {selectedImageFile.name}</p>}
                </div>
             )}
             {(imageUploadProgress > 0 && imageUploadProgress < 100) && (
                <div>
                    <p className="font-sans text-sm mb-1">Enviando imagem...</p>
                    <div className="w-full bg-marrom-seiva/20 rounded-full h-2.5"><div className="bg-dourado-suave h-2.5 rounded-full" style={{ width: `${imageUploadProgress}%` }}></div></div>
                </div>
            )}
        </div>
        
        <div>
          <label htmlFor="type" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Tipo</label>
          <select 
            id="type" 
            value={formData.type || 'Devocional'} 
            onChange={handleChange}
            className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave focus:border-dourado-suave transition-colors"
          >
            <option value="Devocional">Devocional</option>
            <option value="Live">Live</option>
            <option value="Podcast">Podcast</option>
            <option value="Estudo">Estudo</option>
            <option value="Mentoria">Mentoria</option>
          </select>
        </div>

        {formData.type === 'Mentoria' && (
            <div className="space-y-4 pt-4 border-t border-marrom-seiva/20 dark:border-creme-velado/20 mt-4">
                <h3 className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Recursos da Mentoria</h3>
                <InputField id="actionUrl" label="URL do Vídeo (YouTube)" value={formData.actionUrl || ''} onChange={handleChange} />
                 <InputField id="downloadUrl" label="URL do Material para Download (opcional)" value={formData.downloadableResource?.url || ''} onChange={handleChange} />
            </div>
        )}
        
        {(formData.type === 'Podcast' || formData.type === 'Devocional') && renderAudioOptions()}

        <InputField id="contentBody" label="Corpo do Conteúdo (Opcional, aceita HTML)" type="textarea" value={formData.contentBody || ''} onChange={handleChange} />
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <Spinner variant="button" /> : 'Salvar'}
        </Button>
      </div>
    </Modal>
  );
}