import React, { useState, useEffect } from 'react';
import { Event, User } from '../../types';
import { createEvent, updateEvent } from '../../services/api';
import { uploadImage } from '../../services/storageService';
import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  user: User;
}

const initialFormData = {
    title: '',
    description: '',
    imageUrl: '',
    location: '',
    date: new Date().toISOString().substring(0, 16),
    price: 0,
};

type ImageSource = 'url' | 'upload';

export default function EventForm({ isOpen, onClose, event, user }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<Event>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!event;

  const [imageSource, setImageSource] = useState<ImageSource>('url');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        const eventDate = new Date(event.date);
        const formattedDate = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000)).toISOString().substring(0, 16);
        setFormData({ ...event, date: formattedDate });
      } else {
        setFormData(initialFormData);
      }
      setImageSource('url');
      setSelectedImageFile(null);
      setImageUploadProgress(0);
    }
  }, [event, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [id]: type === 'number' ? parseFloat(value) : value 
    }));
  };

   const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setImageUploadProgress(0);
    let finalImageUrl = formData.imageUrl || '';

    try {
      if (imageSource === 'upload' && selectedImageFile) {
        finalImageUrl = await uploadImage(selectedImageFile, user.id, setImageUploadProgress);
      }

      if (isEditing && event) {
        const dataToSave = {
          ...formData,
          imageUrl: finalImageUrl,
          date: new Date(formData.date!).toISOString(),
        };
        await updateEvent({ ...event, ...dataToSave });
      } else {
        const dataToCreate: Omit<Event, 'id' | 'attendeeIds'> = {
          title: formData.title || '',
          description: formData.description || '',
          imageUrl: finalImageUrl,
          date: new Date(formData.date!).toISOString(),
          location: formData.location || '',
          price: formData.price || 0,
        };
        await createEvent(dataToCreate);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save event", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Evento' : 'Novo Evento'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <InputField id="title" label="Título" value={formData.title || ''} onChange={handleChange} required />
        <InputField id="description" label="Descrição" type="textarea" value={formData.description || ''} onChange={handleChange} required />
        
        <div className="space-y-2 pt-2">
            <h3 className="block font-sans font-semibold text-sm text-marrom-seiva dark:text-creme-velado/80">Imagem de Capa</h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSourceEvent" value="url" checked={imageSource === 'url'} onChange={() => setImageSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL Externa</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSourceEvent" value="upload" checked={imageSource === 'upload'} onChange={() => setImageSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label>
            </div>
            {imageSource === 'url' && <InputField id="imageUrl" label="URL da Imagem" value={formData.imageUrl || ''} onChange={handleChange} />}
            {imageSource === 'upload' && (
                <div>
                    <label htmlFor="image-upload-event" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Arquivo de Imagem</label>
                    <input id="image-upload-event" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageFileChange} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/>
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
        
        <InputField id="location" label="Local (ou 'Online')" value={formData.location || ''} onChange={handleChange} required />
        <InputField id="date" label="Data e Hora" type="datetime-local" value={formData.date || ''} onChange={handleChange} required />
        <InputField id="price" label="Preço (R$)" type="number" placeholder="Deixe 0 para gratuito" value={formData.price || ''} onChange={handleChange} />
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