import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { getAllAnnouncementsForAdmin, createAnnouncement, updateAnnouncement } from '../../services/api';
import Spinner from '../Spinner';
import Button from '../Button';
import InputField from '../InputField';
import { PlusIcon } from '../Icons';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Partial<Announcement> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const data = await getAllAnnouncementsForAdmin();
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  const handleSave = async () => {
      if (!isEditing || !isEditing.message) return;
      setIsSaving(true);
      if(isEditing.id) {
          await updateAnnouncement(isEditing.id, isEditing);
      } else {
          await createAnnouncement(isEditing as Omit<Announcement, 'id' | 'createdAt'>);
      }
      document.dispatchEvent(new CustomEvent('announcementsUpdated'));
      setIsSaving(false);
      setIsEditing(null);
      fetchAnnouncements();
  }

  const handleToggleActive = async (annToToggle: Announcement) => {
    // Optimistic UI Update
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(ann =>
        ann.id === annToToggle.id ? { ...ann, isActive: !ann.isActive } : ann
      )
    );

    // API call in the background
    try {
      await updateAnnouncement(annToToggle.id, { isActive: !annToToggle.isActive });
      document.dispatchEvent(new CustomEvent('announcementsUpdated'));
    } catch (error) {
      console.error('Failed to update announcement status:', error);
      // Revert on failure
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(ann =>
          ann.id === annToToggle.id ? { ...ann, isActive: annToToggle.isActive } : ann
        )
      );
      alert('Falha ao atualizar o status do anúncio.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave">Gerenciar Anúncios</h2>
            <Button onClick={() => setIsEditing({ message: '', ctaText: '', ctaLink: '', isActive: true })} variant="primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Anúncio
            </Button>
        </div>

        {isEditing && (
             <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg mb-6 space-y-4">
                <h3 className="font-serif text-lg font-semibold">{isEditing.id ? 'Editando Anúncio' : 'Novo Anúncio'}</h3>
                 <InputField id="message" label="Mensagem" value={isEditing.message || ''} onChange={(e) => setIsEditing({...isEditing, message: e.target.value})} />
                 <InputField id="ctaText" label="Texto do Link (Opcional)" value={isEditing.ctaText || ''} onChange={(e) => setIsEditing({...isEditing, ctaText: e.target.value})} />
                 <InputField id="ctaLink" label="URL do Link (Opcional)" value={isEditing.ctaLink || ''} onChange={(e) => setIsEditing({...isEditing, ctaLink: e.target.value})} />
                 <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setIsEditing(null)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Spinner variant="button" /> : 'Salvar'}</Button>
                 </div>
            </div>
        )}

        <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg space-y-3">
        {announcements.map(ann => (
            <div key={ann.id} className="p-3 border border-marrom-seiva/10 dark:border-creme-velado/10 rounded-lg flex justify-between items-center">
                <div>
                    <p className={`font-semibold ${ann.isActive ? 'text-verde-mata dark:text-creme-velado' : 'text-marrom-seiva/50 dark:text-creme-velado/50'}`}>{ann.message}</p>
                    <p className="text-xs text-marrom-seiva/60 dark:text-creme-velado/60">{ann.ctaText && ann.ctaLink ? `${ann.ctaText} -> ${ann.ctaLink}` : 'Sem link'}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" className="!py-1 !px-3" onClick={() => setIsEditing(ann)}>Editar</Button>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={ann.isActive} onChange={() => handleToggleActive(ann)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${ann.isActive ? 'bg-green-600' : 'bg-marrom-seiva/20 dark:bg-creme-velado/20'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${ann.isActive ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
        ))}
        </div>

    </div>
  );
}