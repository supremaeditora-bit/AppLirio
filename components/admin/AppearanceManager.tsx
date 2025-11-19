
import React, { useState, useEffect } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { getAppearanceSettings, updateAppearanceSettings, createContentItem } from '../../services/api';
import { generateDevotional } from '../../services/geminiService';
import { uploadImage } from '../../services/storageService';
import { AppearanceSettings, ThemeColors, GeneratedDevotional } from '../../types';

const defaultSettings: Partial<AppearanceSettings> = {
    isAiDevotionalEnabled: false,
    aiDevotionalScheduleTime: '06:00',
    logoSettings: {
      siteTitle: 'ELV | Assistente Espiritual',
      logoLightUrl: '',
      logoDarkUrl: '',
      logoDisplayMode: 'image-and-text'
    },
    faviconUrl: '/favicon.ico',
    themeColors: {
      lightBg: '#FBF8F1',
      lightComponentBg: '#FAF9F6',
      lightText: '#5C3D2E',
      darkComponentBg: '#2C3E2A',
      darkBg: '#1A2918',
      lightAccent: '#C0A063',
      darkAccent: '#D9C7A6',
      lightButtonBg: '#C0A063',
      lightButtonText: '#2C3E2A',
      darkButtonBg: '#D9C7A6',
      darkButtonText: '#2C3E2A',
    },
    useBackgroundImage: false,
    backgroundImageUrlLight: '',
    backgroundImageUrlDark: '',
    componentBackgroundImageUrlLight: '',
    componentBackgroundImageUrlDark: '',
};

const formatDevotionalToContentBody = (devotional: GeneratedDevotional): string => {
    return `
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Contexto Bíblico</h2>
        <p>${devotional.context}</p>
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Reflexão</h2>
        <p>${devotional.reflection}</p>
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Aplicação Prática</h2>
        <ul class="list-disc list-inside">
            ${devotional.application.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Oração</h2>
        <p class="!italic">${devotional.prayer}</p>
    `;
};


const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onSetTransparent: () => void; }> = ({ label, value, onChange, onSetTransparent }) => (
    <div>
        <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">{label}</label>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo flex-1">
                <input type="color" value={value === 'transparent' ? '#ffffff' : value} onChange={onChange} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={value} onChange={onChange} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
            </div>
            <Button variant="secondary" onClick={onSetTransparent} className="!py-2 !px-3 text-xs">Transparente</Button>
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
  const [isGeneratingDevotional, setIsGeneratingDevotional] = useState(false);
  
  const [selectedLogoLight, setSelectedLogoLight] = useState<File | null>(null);
  const [logoLightPreview, setLogoLightPreview] = useState<string | null>(null);
  const [selectedLogoDark, setSelectedLogoDark] = useState<File | null>(null);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  
  const [selectedBgImageLight, setSelectedBgImageLight] = useState<File | null>(null);
  const [bgImagePreviewLight, setBgImagePreviewLight] = useState<string | null>(null);
  const [selectedBgImageDark, setSelectedBgImageDark] = useState<File | null>(null);
  const [bgImagePreviewDark, setBgImagePreviewDark] = useState<string | null>(null);

  const [selectedCompBgImageLight, setSelectedCompBgImageLight] = useState<File | null>(null);
  const [compBgImagePreviewLight, setCompBgImagePreviewLight] = useState<string | null>(null);
  const [selectedCompBgImageDark, setSelectedCompBgImageDark] = useState<File | null>(null);
  const [compBgImagePreviewDark, setCompBgImagePreviewDark] = useState<string | null>(null);

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
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
        ...prev,
        logoSettings: {
            ...(prev.logoSettings || {}),
            [id]: value
        }
    }));
  };
  
  const handleColorChange = (colorName: keyof ThemeColors, value: string) => {
      setSettings(prev => ({ ...prev, themeColors: { ...(prev.themeColors!), [colorName]: value } }))
  };

  const handleSetTransparent = (colorName: keyof ThemeColors) => {
    handleColorChange(colorName, 'transparent');
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setSettings(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleGenerateNow = async () => {
    setIsGeneratingDevotional(true);
    try {
        const devotional = await generateDevotional();
        if (devotional) {
            await createContentItem({
                type: 'Devocional',
                title: devotional.title,
                subtitle: devotional.verseReference,
                description: devotional.reflection.substring(0, 150) + '...',
                imageUrl: 'https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80',
                contentBody: formatDevotionalToContentBody(devotional),
                audioUrl: devotional.audioUrl,
            });
            alert('Novo devocional gerado e publicado com sucesso!');
        } else {
            alert('Falha ao gerar o devocional. A IA pode estar indisponível. Tente novamente.');
        }
    } catch (error) {
        console.error("Failed to manually generate devotional", error);
        alert('Ocorreu um erro ao gerar e publicar o devocional.');
    } finally {
        setIsGeneratingDevotional(false);
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
        let finalSettings = { ...settings };
        
        const uploads: Promise<void>[] = [];
        
        if (selectedLogoLight) {
            uploads.push(uploadImage(selectedLogoLight, 'appearance', () => {}).then(url => {
                finalSettings.logoSettings = { ...finalSettings.logoSettings, logoLightUrl: url };
            }));
        }
        if (selectedLogoDark) {
            uploads.push(uploadImage(selectedLogoDark, 'appearance', () => {}).then(url => {
                finalSettings.logoSettings = { ...finalSettings.logoSettings, logoDarkUrl: url };
            }));
        }
        if (selectedFavicon) {
            uploads.push(uploadImage(selectedFavicon, 'appearance', () => {}).then(url => {
                finalSettings.faviconUrl = url;
            }));
        }
        if (selectedBgImageLight) {
            uploads.push(uploadImage(selectedBgImageLight, 'appearance', () => {}).then(url => {
                finalSettings.backgroundImageUrlLight = url;
            }));
        }
        if (selectedBgImageDark) {
            uploads.push(uploadImage(selectedBgImageDark, 'appearance', () => {}).then(url => {
                finalSettings.backgroundImageUrlDark = url;
            }));
        }
        if (selectedCompBgImageLight) {
            uploads.push(uploadImage(selectedCompBgImageLight, 'appearance', () => {}).then(url => {
                finalSettings.componentBackgroundImageUrlLight = url;
            }));
        }
        if (selectedCompBgImageDark) {
            uploads.push(uploadImage(selectedCompBgImageDark, 'appearance', () => {}).then(url => {
                finalSettings.componentBackgroundImageUrlDark = url;
            }));
        }

        await Promise.all(uploads);
        await updateAppearanceSettings(finalSettings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Optionally refresh page to see all changes applied
        // window.location.reload();
    } catch (error: any) {
        console.error("Failed to save settings", error);
        let errorMessage = "Falha ao salvar as configurações. Tente novamente.";
        if (error.message) {
            if (error.message.includes("violates row-level security policy")) {
                errorMessage = "Falha ao salvar: Permissão negada. Apenas administradores podem alterar a aparência. Verifique as regras de segurança (RLS) da tabela 'appearance_settings'.";
            } else {
                 errorMessage = `Falha ao salvar configurações: ${error.message}`;
            }
        }
        alert(errorMessage);
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
          <InputField id="siteTitle" label="Título do Site" value={settings.logoSettings?.siteTitle || ''} onChange={handleLogoSettingsChange} />
          <FileUpload label="Logo (Tema Claro)" file={selectedLogoLight} preview={logoLightPreview} onFileChange={handleFileChange(setSelectedLogoLight, setLogoLightPreview)} currentUrl={settings.logoSettings?.logoLightUrl} accept="image/png, image/svg+xml, image/jpeg, image/webp" />
          <FileUpload label="Logo (Tema Escuro)" file={selectedLogoDark} preview={logoDarkPreview} onFileChange={handleFileChange(setSelectedLogoDark, setLogoDarkPreview)} currentUrl={settings.logoSettings?.logoDarkUrl} accept="image/png, image/svg+xml, image/jpeg, image/webp" />
          <div>
            <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Exibição do Logo</label>
            <select 
                id="logoDisplayMode" 
                value={settings.logoSettings?.logoDisplayMode || 'image-and-text'} 
                onChange={handleLogoSettingsChange}
                className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave focus:border-dourado-suave transition-colors"
            >
                <option value="image-and-text">Imagem e Título</option>
                <option value="image-only">Apenas Imagem</option>
            </select>
          </div>
          <FileUpload label="Favicon do Site" file={selectedFavicon} preview={faviconPreview} onFileChange={handleFileChange(setSelectedFavicon, setFaviconPreview)} currentUrl={settings.faviconUrl} accept="image/x-icon, image/png, image/svg+xml" />
        </div>
      </div>
      
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Paleta de Cores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ColorInput label="Fundo (Claro)" value={settings.themeColors?.lightBg || '#000000'} onChange={(e) => handleColorChange('lightBg', e.target.value)} onSetTransparent={() => handleSetTransparent('lightBg')} />
          <ColorInput label="Componentes (Claro)" value={settings.themeColors?.lightComponentBg || '#000000'} onChange={(e) => handleColorChange('lightComponentBg', e.target.value)} onSetTransparent={() => handleSetTransparent('lightComponentBg')} />
          <div>
            <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Texto (Claro)</label>
            <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.lightText} onChange={(e) => handleColorChange('lightText', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.lightText} onChange={(e) => handleColorChange('lightText', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
            </div>
          </div>
          <ColorInput label="Fundo (Escuro)" value={settings.themeColors?.darkBg || '#000000'} onChange={(e) => handleColorChange('darkBg', e.target.value)} onSetTransparent={() => handleSetTransparent('darkBg')} />
          <ColorInput label="Componentes (Escuro)" value={settings.themeColors?.darkComponentBg || '#000000'} onChange={(e) => handleColorChange('darkComponentBg', e.target.value)} onSetTransparent={() => handleSetTransparent('darkComponentBg')} />
          
          <div>
             <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Cor de Destaque (Claro)</label>
             <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.lightAccent} onChange={(e) => handleColorChange('lightAccent', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.lightAccent} onChange={(e) => handleColorChange('lightAccent', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
             </div>
          </div>
           <div>
             <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Cor de Destaque (Escuro)</label>
             <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.darkAccent} onChange={(e) => handleColorChange('darkAccent', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.darkAccent} onChange={(e) => handleColorChange('darkAccent', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
             </div>
          </div>

          {/* Button Colors */}
           <div>
             <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Botão - Fundo (Claro)</label>
             <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.lightButtonBg || '#C0A063'} onChange={(e) => handleColorChange('lightButtonBg', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.lightButtonBg || '#C0A063'} onChange={(e) => handleColorChange('lightButtonBg', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
             </div>
          </div>
          <div>
             <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Botão - Texto (Claro)</label>
             <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.lightButtonText || '#2C3E2A'} onChange={(e) => handleColorChange('lightButtonText', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.lightButtonText || '#2C3E2A'} onChange={(e) => handleColorChange('lightButtonText', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
             </div>
          </div>
          <div>
             <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Botão - Fundo (Escuro)</label>
             <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.darkButtonBg || '#D9C7A6'} onChange={(e) => handleColorChange('darkButtonBg', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.darkButtonBg || '#D9C7A6'} onChange={(e) => handleColorChange('darkButtonBg', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
             </div>
          </div>
          <div>
             <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">Botão - Texto (Escuro)</label>
             <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
                <input type="color" value={settings.themeColors?.darkButtonText || '#2C3E2A'} onChange={(e) => handleColorChange('darkButtonText', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
                <input type="text" value={settings.themeColors?.darkButtonText || '#2C3E2A'} onChange={(e) => handleColorChange('darkButtonText', e.target.value)} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
             </div>
          </div>

        </div>
      </div>
      
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Plano de Fundo Global</h2>
        <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">Usar imagem de fundo em vez de cor sólida.</p>
            <label htmlFor="useBackgroundImage" className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" id="useBackgroundImage" className="sr-only" checked={settings.useBackgroundImage || false} onChange={handleToggleChange} /><div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.useBackgroundImage ? 'translate-x-6 bg-dourado-suave' : ''}`}></div></div></label>
        </div>
        {settings.useBackgroundImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
            <FileUpload label="Imagem (Tema Claro)" file={selectedBgImageLight} preview={bgImagePreviewLight} onFileChange={handleFileChange(setSelectedBgImageLight, setBgImagePreviewLight)} currentUrl={settings.backgroundImageUrlLight} accept="image/jpeg, image/png, image/webp" />
            <FileUpload label="Imagem (Tema Escuro)" file={selectedBgImageDark} preview={bgImagePreviewDark} onFileChange={handleFileChange(setSelectedBgImageDark, setBgImagePreviewDark)} currentUrl={settings.backgroundImageUrlDark} accept="image/jpeg, image/png, image/webp" />
          </div>
        )}
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Fundo de Componentes</h2>
        <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mb-4">Substitui a cor de fundo dos cartões e painéis por uma textura ou imagem.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload label="Textura (Tema Claro)" file={selectedCompBgImageLight} preview={compBgImagePreviewLight} onFileChange={handleFileChange(setSelectedCompBgImageLight, setCompBgImagePreviewLight)} currentUrl={settings.componentBackgroundImageUrlLight} accept="image/jpeg, image/png, image/webp" />
            <FileUpload label="Textura (Tema Escuro)" file={selectedCompBgImageDark} preview={compBgImagePreviewDark} onFileChange={handleFileChange(setSelectedCompBgImageDark, setCompBgImagePreviewDark)} currentUrl={settings.componentBackgroundImageUrlDark} accept="image/jpeg, image/png, image/webp" />
        </div>
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Funcionalidades Inteligentes</h2>
        <div className="flex items-start justify-between">
          <div><h3 className="font-sans font-semibold text-verde-mata dark:text-creme-velado">Devocional Diário por IA</h3><p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80">Permite que as usuárias acessem um devocional único a cada dia.</p></div>
          <label htmlFor="isAiDevotionalEnabled" className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" id="isAiDevotionalEnabled" className="sr-only" checked={settings.isAiDevotionalEnabled || false} onChange={handleToggleChange}/><div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.isAiDevotionalEnabled ? 'translate-x-6 bg-dourado-suave' : ''}`}></div></div></label>
        </div>
        {settings.isAiDevotionalEnabled && (
            <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 space-y-4">
                <InputField id="aiDevotionalScheduleTime" label="Horário da Geração Diária" type="time" value={settings.aiDevotionalScheduleTime || '06:00'} onChange={handleChange} />
                <p className="text-xs font-sans text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">Nota: O devocional é gerado na primeira vez que uma usuária abre o app após este horário a cada dia.</p>
                
                <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                    <h4 className="font-sans font-semibold text-verde-mata dark:text-creme-velado mb-2">Geração Manual</h4>
                    <p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mb-3">
                        Force a criação de um novo devocional que será publicado imediatamente para todas as usuárias.
                    </p>
                    <Button onClick={handleGenerateNow} disabled={isGeneratingDevotional}>
                        {isGeneratingDevotional ? <Spinner variant="button" /> : 'Gerar Novo Devocional Agora'}
                    </Button>
                </div>
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
