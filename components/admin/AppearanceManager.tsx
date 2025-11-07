import React, { useState, useEffect } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { getAppearanceSettings, updateAppearanceSettings } from '../../services/api';
import { AppearanceSettings } from '../../types';

const defaultHeroData = {
    title: "Jornada da Fé",
    subtitle: "Devocional Diário",
    description: "Comece seu dia com uma reflexão poderosa para fortalecer seu espírito e guiar seus passos.",
    imageUrl: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
};

export default function AppearanceManager() {
  const [settings, setSettings] = useState<Partial<AppearanceSettings>>({
      heroData: defaultHeroData,
      isAiDevotionalEnabled: false,
      aiDevotionalScheduleTime: '06:00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
        setIsLoading(true);
        const data = await getAppearanceSettings();
        if (data) {
            setSettings({
                heroData: data.heroData || defaultHeroData,
                isAiDevotionalEnabled: data.isAiDevotionalEnabled || false,
                aiDevotionalScheduleTime: data.aiDevotionalScheduleTime || '06:00',
            });
        }
        setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    if (id in (settings.heroData || {})) {
        setSettings(prev => ({ 
            ...prev, 
            heroData: { 
                ...(prev.heroData || defaultHeroData), 
                [id]: value 
            } 
        }));
    } else {
        setSettings(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, isAiDevotionalEnabled: e.target.checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await updateAppearanceSettings(settings);
    } catch (error) {
        console.error("Failed to save settings", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
      return <div className="flex justify-center py-10"><Spinner/></div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Banner da Página Inicial</h2>
        <div className="space-y-4">
          <InputField id="subtitle" label="Subtítulo (texto pequeno)" value={settings.heroData?.subtitle || ''} onChange={handleChange} />
          <InputField id="title" label="Título Principal" value={settings.heroData?.title || ''} onChange={handleChange} />
          <InputField id="description" label="Descrição" type="textarea" value={settings.heroData?.description || ''} onChange={handleChange} />
          <InputField id="imageUrl" label="URL da Imagem de Fundo" value={settings.heroData?.imageUrl || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Funcionalidades Inteligentes</h2>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-sans font-semibold text-verde-mata dark:text-creme-velado">Devocional Diário por IA</h3>
            <p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80">
              Permite que as usuárias acessem um devocional único a cada dia.
            </p>
          </div>
          <label htmlFor="ai-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                id="ai-toggle" 
                className="sr-only" 
                checked={settings.isAiDevotionalEnabled}
                onChange={handleToggleChange}
              />
              <div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.isAiDevotionalEnabled ? 'translate-x-6 bg-dourado-suave' : ''}`}></div>
            </div>
          </label>
        </div>
        {settings.isAiDevotionalEnabled && (
            <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                <InputField
                    id="aiDevotionalScheduleTime"
                    label="Horário da Geração Diária"
                    type="time"
                    value={settings.aiDevotionalScheduleTime || '06:00'}
                    onChange={handleChange}
                />
                 <p className="text-xs font-sans text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">
                    Nota: O devocional é gerado na primeira vez que uma usuária abre o app após este horário a cada dia.
                 </p>
            </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner variant="button" /> : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}