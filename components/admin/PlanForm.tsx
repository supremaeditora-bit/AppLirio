
import React, { useState, useEffect } from 'react';
import { ReadingPlan, ReadingPlanDay, User } from '../../types';
import { createReadingPlan, updateReadingPlan } from '../../services/api';
import { uploadImage } from '../../services/storageService';
import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ReadingPlan | null;
  user: User;
}

const initialFormData: Omit<ReadingPlan, 'id'> = {
    title: '',
    description: '',
    imageUrl: '',
    durationDays: 1,
    days: [{ day: 1, title: '', passage: '', content: '' }],
};

type ImageSource = 'url' | 'upload';

export default function PlanForm({ isOpen, onClose, plan, user }: PlanFormProps) {
  const [formData, setFormData] = useState<Omit<ReadingPlan, 'id'> | ReadingPlan>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  
  const [imageSource, setImageSource] = useState<ImageSource>('url');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setFormData(plan);
      } else {
        setFormData(initialFormData);
      }
      // Reset image state on open
      setImageSource('url');
      setSelectedImageFile(null);
      setImageUploadProgress(0);
    }
  }, [plan, isOpen]);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [id]: isNumber ? parseInt(value) : value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedImageFile(e.target.files[0]);
    }
  };

  const handleDayChange = (index: number, field: keyof Omit<ReadingPlanDay, 'day'>, value: string) => {
      const newDays = [...formData.days];
      (newDays[index] as any)[field] = value;
      setFormData(prev => ({...prev, days: newDays}));
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = Math.max(1, parseInt(e.target.value) || 1);
      const currentDaysCount = formData.days.length;
      let newDays = [...formData.days];

      if (newDuration > currentDaysCount) {
          for (let i = currentDaysCount + 1; i <= newDuration; i++) {
              newDays.push({ day: i, title: '', passage: '', content: '' });
          }
      } else if (newDuration < currentDaysCount) {
          newDays = newDays.slice(0, newDuration);
      }
      setFormData(prev => ({...prev, durationDays: newDuration, days: newDays}));
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setImageUploadProgress(0);
    let finalImageUrl = 'imageUrl' in formData ? formData.imageUrl : '';

    try {
        if (imageSource === 'upload' && selectedImageFile) {
            finalImageUrl = await uploadImage(selectedImageFile, user.id, setImageUploadProgress);
        }

        const dataToSave = { ...formData, imageUrl: finalImageUrl };

        const isRealEdit = plan && 'id' in plan && !plan.id.startsWith('temp-');

        if (isRealEdit) {
            await updateReadingPlan(dataToSave as ReadingPlan);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...planDataToCreate } = dataToSave as ReadingPlan;
            await createReadingPlan(planDataToCreate);
        }
        onClose();
    } catch (error) {
        console.error("Failed to save plan", error);
    } finally {
        setIsLoading(false);
    }
  };

  const isEditing = plan && 'id' in plan && !plan.id.startsWith('temp-');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Plano de Leitura' : 'Novo Plano de Leitura'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <InputField id="title" label="Título" value={formData.title} onChange={handleMainChange} required />
        <InputField id="description" label="Descrição" type="textarea" value={formData.description} onChange={handleMainChange} required />
        
        <div className="space-y-2 pt-2">
            <h3 className="block font-sans font-semibold text-sm text-marrom-seiva dark:text-creme-velado/80">Imagem de Capa</h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSourcePlan" value="url" checked={imageSource === 'url'} onChange={() => setImageSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL Externa</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSourcePlan" value="upload" checked={imageSource === 'upload'} onChange={() => setImageSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label>
            </div>
            {imageSource === 'url' && <InputField id="imageUrl" label="URL da Imagem" value={formData.imageUrl} onChange={handleMainChange} />}
            {imageSource === 'upload' && (
                <div>
                    <label htmlFor="image-upload-plan" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Arquivo de Imagem</label>
                    <input id="image-upload-plan" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageFileChange} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/>
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
        
        <InputField id="durationDays" label="Duração (dias)" type="number" value={formData.durationDays} onChange={handleDurationChange} min="1" required />
        
        <div className="space-y-4 pt-4 mt-4 border-t border-marrom-seiva/20 dark:border-creme-velado/20">
            <h3 className="font-serif font-semibold text-lg text-verde-mata dark:text-dourado-suave">Conteúdo dos Dias</h3>
            {formData.days.map((day, index) => (
                <div key={index} className="p-4 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg border border-marrom-seiva/10 dark:border-creme-velado/10 space-y-3">
                    <p className="font-bold font-sans text-dourado-suave">Dia {day.day}</p>
                    <InputField id={`day-title-${index}`} label="Título do Dia" value={day.title} onChange={e => handleDayChange(index, 'title', e.target.value)} />
                    <InputField id={`day-passage-${index}`} label="Passagem Bíblica" value={day.passage} onChange={e => handleDayChange(index, 'passage', e.target.value)} />
                    <InputField id={`day-content-${index}`} label="Conteúdo / Reflexão (Markdown)" type="textarea" value={day.content} onChange={e => handleDayChange(index, 'content', e.target.value)} />
                </div>
            ))}
        </div>

      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <Spinner variant="button" /> : 'Salvar Plano'}
        </Button>
      </div>
    </Modal>
  );
}
