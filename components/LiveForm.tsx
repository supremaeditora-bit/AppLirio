import React, { useState, useEffect } from 'react';
import { LiveSession, User } from '../types';
import { createLiveSession, updateLiveSession } from '../services/api';
import Modal from './Modal';
import InputField from './InputField';
import Button from './Button';
import Spinner from './Spinner';

interface LiveFormProps {
  isOpen: boolean;
  onClose: () => void;
  session: LiveSession | null;
  user: User;
}

const initialFormData = {
    title: '',
    description: '',
    youtubeId: '',
    status: 'upcoming' as 'upcoming' | 'live' | 'past',
    scheduledAt: new Date().toISOString().substring(0, 16), // Format for datetime-local
};

export default function LiveForm({ isOpen, onClose, session, user }: LiveFormProps) {
  const [formData, setFormData] = useState<Partial<LiveSession>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!session;

  useEffect(() => {
    if (isOpen) {
      if (session) {
        // Ensure scheduledAt is in the correct format for the input
        const scheduledDate = new Date(session.scheduledAt);
        const formattedDate = isNaN(scheduledDate.getTime()) 
            ? initialFormData.scheduledAt 
            : new Date(scheduledDate.getTime() - (scheduledDate.getTimezoneOffset() * 60000)).toISOString().substring(0, 16);
        setFormData({ ...session, scheduledAt: formattedDate });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [session, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
        const dataToSave = {
            ...formData,
            // Convert local datetime string back to UTC ISO string for storing
            scheduledAt: new Date(formData.scheduledAt!).toISOString(),
        };

        if (isEditing && session) {
            await updateLiveSession(session.id, dataToSave);
        } else {
            await createLiveSession({
                ...initialFormData,
                ...dataToSave,
                createdBy: user.id
            } as Omit<LiveSession, 'id'>);
        }
        onClose();
    } catch (error) {
        console.error("Failed to save live session", error);
        // Here you could set an error state to show in the modal
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Live' : 'Agendar Nova Live'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <InputField id="title" label="Título" value={formData.title || ''} onChange={handleChange} required />
        <InputField id="description" label="Descrição" type="textarea" value={formData.description || ''} onChange={handleChange} required />
        <InputField id="youtubeId" label="ID do Vídeo do YouTube" placeholder="Ex: L_LUpnjgPso" value={formData.youtubeId || ''} onChange={handleChange} required />
        <InputField id="scheduledAt" label="Data e Hora" type="datetime-local" value={formData.scheduledAt || ''} onChange={handleChange} required />

        <div>
            <label htmlFor="status" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Status</label>
            <select
                id="status"
                value={formData.status || 'upcoming'}
                onChange={handleChange}
                className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave focus:border-dourado-suave transition-colors"
            >
                <option value="upcoming">Agendada</option>
                <option value="live">Ao Vivo</option>
                <option value="past">Encerrada (VOD)</option>
            </select>
        </div>
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