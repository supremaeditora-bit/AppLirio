import React, { useState, useEffect } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { getAppearanceSettings, updateAppearanceSettings } from '../../services/api';
import { uploadImage } from '../../services/storageService';
import { AppearanceSettings, ThemeColors } from '../../types';

const defaultSettings: AppearanceSettings = {
    heroData: {
        title: "Jornada da Fé",
        subtitle: "Devocional Diário",
        description: "Comece seu dia com uma reflexão poderosa para fortalecer seu espírito e guiar seus passos.",
        imageUrl: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    isAiDevotionalEnabled: false,
    aiDevotionalScheduleTime: '06:00',
    siteTitle: 'ELV | Assistente Espiritual',
    logoUrl: '',
    faviconUrl: '/favicon.ico',
    themeColors: {
      lightBg: '#FBF8F1',
      lightComponentBg: '#FAF9F6',
      lightText: '#5C3D2E',
      darkComponentBg: '#2C3E2A',
      darkBg: '#1A2918',
      accent: '#C0A063',
    },
    useBackgroundImage: false,
    backgroundImageUrl: '',
};

type ImageSource = 'url' | 'upload';

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">{label}</label>
        <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
            <input type="color" value={value} onChange={onChange} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
            <input type="text" value={value} onChange={onChange} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
        </div>
    </div>
);

const FileUpload: React.FC<{ label: string; file: File | null; preview: string | null; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; currentUrl: string | undefined, accept: string }> = ({ label, file, preview, onFileChange, currentUrl, accept }) => (
    <div>
        <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">{label}</label>
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center overflow-hidden">
                <img src={preview || currentUrl} alt="Preview" className="w-full h-full object-contain" />
            </div>
            <input type="file" accept={accept} onChange={onFileChange} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/>
        </div>
    </div>
);

export default function AppearanceManager() {
  const [settings, setSettings] = useState<Partial<AppearanceSettings>>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [heroImageSource, setHeroImageSource] = useState<ImageSource>('url');
  const [selectedHeroImage, setSelectedHeroImage] = useState<File | null>(null);
  
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [selectedBgImage, setSelectedBgImage] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        setIsLoading(true);
        const data = await getAppearanceSettings();
        setSettings({ ...defaultSettings, ...data });
        setIsLoading(false);
    };
    fetchSettings();
  }, []);
  
  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setter(file);
          previewSetter(URL.createObjectURL(file));
      }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id in (settings.heroData || {})) {
        setSettings(prev => ({ ...prev, heroData: { ...(prev.heroData!), [id]: value } }));
    } else {
        setSettings(prev => ({ ...prev, [id]: value }));
    }
  };
  
  const handleColorChange = (colorName: keyof ThemeColors, value: string) => {
      setSettings(prev => ({ ...prev, themeColors: { ...(prev.themeColors!), [colorName]: value } }))
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
        let finalSettings = { ...settings };
        
        const uploads: Promise<void>[] = [];
        
        if (heroImageSource === 'upload' && selectedHeroImage) {
            uploads.push(uploadImage(selectedHeroImage, 'appearance', () => {}).then(url => {
                finalSettings.heroData!.imageUrl = url;
            }));
        }
        if (selectedLogo) {
            uploads.push(uploadImage(selectedLogo, 'appearance', () => {}).then(url => {
                finalSettings.logoUrl = url;
            }));
        }
        if (selectedFavicon) {
            uploads.push(uploadImage(selectedFavicon, 'appearance', () => {}).then(url => {
                finalSettings.faviconUrl = url;
            }));
        }
        if (selectedBgImage) {
            uploads.push(uploadImage(selectedBgImage, 'appearance', () => {}).then(url => {
                finalSettings.backgroundImageUrl = url;
            }));
        }

        await Promise.all(uploads);
        await updateAppearanceSettings(finalSettings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Optionally refresh page to see all changes applied
        // window.location.reload();
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
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Identidade Visual</h2>
        <div className="space-y-4">
          <InputField id="siteTitle" label="Título do Site" value={settings.siteTitle || ''} onChange={handleChange} />
          <FileUpload label="Logo do Site (para o menu)" file={selectedLogo} preview={logoPreview} onFileChange={handleFileChange(setSelectedLogo, setLogoPreview)} currentUrl={settings.logoUrl} accept="image/png, image/svg+xml, image/jpeg, image/webp" />
          <FileUpload label="Favicon do Site" file={selectedFavicon} preview={faviconPreview} onFileChange={handleFileChange(setSelectedFavicon, setFaviconPreview)} currentUrl={settings.faviconUrl} accept="image/x-icon, image/png, image/svg+xml" />
        </div>
      </div>
      
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Paleta de Cores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ColorInput label="Fundo (Claro)" value={settings.themeColors?.lightBg || '#000000'} onChange={(e) => handleColorChange('lightBg', e.target.value)} />
          <ColorInput label="Componentes (Claro)" value={settings.themeColors?.lightComponentBg || '#000000'} onChange={(e) => handleColorChange('lightComponentBg', e.target.value)} />
          <ColorInput label="Texto (Claro)" value={settings.themeColors?.lightText || '#000000'} onChange={(e) => handleColorChange('lightText', e.target.value)} />
          <ColorInput label="Fundo (Escuro)" value={settings.themeColors?.darkBg || '#000000'} onChange={(e) => handleColorChange('darkBg', e.target.value)} />
          <ColorInput label="Componentes (Escuro)" value={settings.themeColors?.darkComponentBg || '#000000'} onChange={(e) => handleColorChange('darkComponentBg', e.target.value)} />
          <ColorInput label="Cor de Destaque" value={settings.themeColors?.accent || '#000000'} onChange={(e) => handleColorChange('accent', e.target.value)} />
        </div>
      </div>
      
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Plano de Fundo Global</h2>
        <div className="flex items-center justify-between">
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">Usar imagem de fundo em vez de cor sólida.</p>
            <label htmlFor="useBackgroundImage" className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" id="useBackgroundImage" className="sr-only" checked={settings.useBackgroundImage || false} onChange={handleToggleChange} /><div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.useBackgroundImage ? 'translate-x-6 bg-dourado-suave' : ''}`}></div></div></label>
        </div>
        {settings.useBackgroundImage && (
          <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
            <FileUpload label="Imagem de Fundo" file={selectedBgImage} preview={bgImagePreview} onFileChange={handleFileChange(setSelectedBgImage, setBgImagePreview)} currentUrl={settings.backgroundImageUrl} accept="image/jpeg, image/png, image/webp" />
          </div>
        )}
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Banner da Página Inicial</h2>
        <div className="space-y-4">
          <InputField id="subtitle" label="Subtítulo (texto pequeno)" value={settings.heroData?.subtitle || ''} onChange={handleChange} />
          <InputField id="title" label="Título Principal" value={settings.heroData?.title || ''} onChange={handleChange} />
          <InputField id="description" label="Descrição" type="textarea" value={settings.heroData?.description || ''} onChange={handleChange} />
          <div className="space-y-2 pt-2">
            <h3 className="block font-sans font-semibold text-sm text-marrom-seiva dark:text-creme-velado/80">Imagem de Fundo do Banner</h3>
            <div className="flex items-center gap-x-6"><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSource" value="url" checked={heroImageSource === 'url'} onChange={() => setHeroImageSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL Externa</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="imageSource" value="upload" checked={heroImageSource === 'upload'} onChange={() => setHeroImageSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label></div>
            {heroImageSource === 'url' && <InputField id="imageUrl" label="URL da Imagem" value={settings.heroData?.imageUrl || ''} onChange={handleChange} />}
            {heroImageSource === 'upload' && <FileUpload label="" file={selectedHeroImage} preview={selectedHeroImage ? URL.createObjectURL(selectedHeroImage) : null} onFileChange={handleFileChange(setSelectedHeroImage, ()=>{})} currentUrl={settings.heroData?.imageUrl} accept="image/*" />}
          </div>
        </div>
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Funcionalidades Inteligentes</h2>
        <div className="flex items-start justify-between">
          <div><h3 className="font-sans font-semibold text-verde-mata dark:text-creme-velado">Devocional Diário por IA</h3><p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80">Permite que as usuárias acessem um devocional único a cada dia.</p></div>
          <label htmlFor="isAiDevotionalEnabled" className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" id="isAiDevotionalEnabled" className="sr-only" checked={settings.isAiDevotionalEnabled || false} onChange={handleToggleChange}/><div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.isAiDevotionalEnabled ? 'translate-x-6 bg-dourado-suave' : ''}`}></div></div></label>
        </div>
        {settings.isAiDevotionalEnabled && (
            <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                <InputField id="aiDevotionalScheduleTime" label="Horário da Geração Diária" type="time" value={settings.aiDevotionalScheduleTime || '06:00'} onChange={handleChange} />
                 <p className="text-xs font-sans text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">Nota: O devocional é gerado na primeira vez que uma usuária abre o app após este horário a cada dia.</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-end items-center gap-4">
        {saveSuccess && <p className="text-sm font-semibold text-green-600 dark:text-green-400">Alterações salvas com sucesso!</p>}
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner variant="button" /> : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}