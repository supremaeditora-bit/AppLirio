import React, { useState, useEffect } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { getAppearanceSettings, updateAppearanceSettings } from '../../services/api';
import { uploadImage } from '../../services/storageService';
import { AppearanceSettings, ThemeColors, LogoSettings, User, FontSettings } from '../../types';

interface AppearanceManagerProps {
  user: User;
}

const defaultSettings: AppearanceSettings = {
    heroData: {
        title: "Jornada da Fé",
        subtitle: "Devocional Diário",
        description: "Comece seu dia com uma reflexão poderosa para fortalecer seu espírito e guiar seus passos.",
        imageUrl: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    isAiDevotionalEnabled: false,
    aiDevotionalScheduleTime: '06:00',
    logoSettings: {
        displayMode: 'image-with-text',
        lightThemeUrl: '',
        darkThemeUrl: '',
        siteTitle: 'ELV | Assistente Espiritual',
    },
    fontSettings: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
    },
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

const fontOptions = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Lato', family: 'Lato, sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Playfair Display', family: 'Playfair Display, serif' },
    { name: 'Lora', family: 'Lora, serif' },
    { name: 'Merriweather', family: 'Merriweather, serif' },
];

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block font-sans font-semibold text-sm mb-1 text-marrom-seiva dark:text-creme-velado/80">{label}</label>
        <div className="flex items-center gap-2 p-2 border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg bg-creme-velado dark:bg-verde-escuro-profundo">
            <input type="color" value={value} onChange={onChange} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer" style={{ appearance: 'none', WebkitAppearance: 'none' }} />
            <input type="text" value={value} onChange={onChange} className="w-full font-mono text-sm bg-transparent focus:outline-none" />
        </div>
    </div>
);

export default function AppearanceManager({ user }: AppearanceManagerProps) {
  const [settings, setSettings] = useState<Partial<AppearanceSettings>>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [heroImageSource, setHeroImageSource] = useState<ImageSource>('url');
  const [selectedHeroImage, setSelectedHeroImage] = useState<File | null>(null);
  
  const [logoLightSource, setLogoLightSource] = useState<ImageSource>('url');
  const [selectedLogoLight, setSelectedLogoLight] = useState<File | null>(null);
  const [logoLightPreview, setLogoLightPreview] = useState<string | null>(null);
  
  const [logoDarkSource, setLogoDarkSource] = useState<ImageSource>('url');
  const [selectedLogoDark, setSelectedLogoDark] = useState<File | null>(null);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(null);
  
  const [faviconSource, setFaviconSource] = useState<ImageSource>('url');
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
        ...prev,
        logoSettings: {
            ...(prev.logoSettings || defaultSettings.logoSettings!),
            [id]: value
        }
    }));
  };

  const handleDisplayModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSettings(prev => ({
        ...prev,
        logoSettings: {
            ...(prev.logoSettings || defaultSettings.logoSettings!),
            displayMode: value as LogoSettings['displayMode']
        }
    }));
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
        ...prev,
        fontSettings: {
            ...(prev.fontSettings || defaultSettings.fontSettings!),
            [id]: value
        }
    }));
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
        const newSettings = JSON.parse(JSON.stringify(settings)) as AppearanceSettings;
        
        if (logoLightSource === 'upload' && selectedLogoLight) {
            const url = await uploadImage(selectedLogoLight, user.id, () => {});
            if(newSettings.logoSettings) newSettings.logoSettings.lightThemeUrl = url;
        }
        if (logoDarkSource === 'upload' && selectedLogoDark) {
            const url = await uploadImage(selectedLogoDark, user.id, () => {});
            if(newSettings.logoSettings) newSettings.logoSettings.darkThemeUrl = url;
        }
        if (faviconSource === 'upload' && selectedFavicon) {
            const url = await uploadImage(selectedFavicon, user.id, () => {});
            newSettings.faviconUrl = url;
        }
        if (heroImageSource === 'upload' && selectedHeroImage) {
            const url = await uploadImage(selectedHeroImage, user.id, () => {});
            if(newSettings.heroData) newSettings.heroData.imageUrl = url;
        }
        if (settings.useBackgroundImage && selectedBgImage) {
            const url = await uploadImage(selectedBgImage, user.id, () => {});
            newSettings.backgroundImageUrl = url;
        }

        await updateAppearanceSettings(newSettings);
        setSettings(newSettings);
        
        document.dispatchEvent(new CustomEvent('settingsUpdated'));

        // Reset file input and preview states
        setSelectedHeroImage(null);
        setSelectedLogoLight(null);
        setLogoLightPreview(null);
        setSelectedLogoDark(null);
        setLogoDarkPreview(null);
        setSelectedFavicon(null);
        setFaviconPreview(null);
        setSelectedBgImage(null);
        setBgImagePreview(null);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
        console.error("Failed to save settings", error);
        alert("Falha ao salvar as configurações. Verifique o console para mais detalhes.")
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
        <div className="space-y-6">
           <div>
                <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Exibição do Logo</label>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="displayMode" value="image-with-text" checked={settings.logoSettings?.displayMode === 'image-with-text'} onChange={handleDisplayModeChange} className="accent-dourado-suave"/>
                        <span className="font-sans text-sm">Imagem e Texto</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="displayMode" value="image-only" checked={settings.logoSettings?.displayMode === 'image-only'} onChange={handleDisplayModeChange} className="accent-dourado-suave"/>
                        <span className="font-sans text-sm">Somente Imagem</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="displayMode" value="text-only" checked={settings.logoSettings?.displayMode === 'text-only'} onChange={handleDisplayModeChange} className="accent-dourado-suave"/>
                        <span className="font-sans text-sm">Somente Texto</span>
                    </label>
                </div>
            </div>

            {(settings.logoSettings?.displayMode === 'image-with-text' || settings.logoSettings?.displayMode === 'text-only') && (
                <InputField id="siteTitle" label="Texto do Logo / Título do Site" value={settings.logoSettings?.siteTitle || ''} onChange={handleLogoChange} />
            )}

            {(settings.logoSettings?.displayMode === 'image-with-text' || settings.logoSettings?.displayMode === 'image-only') && (
                <>
                    <div>
                        <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Logo (Modo Claro)</label>
                        <div className="flex items-center gap-x-6 mb-2"><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="logoLightSource" value="url" checked={logoLightSource === 'url'} onChange={() => setLogoLightSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="logoLightSource" value="upload" checked={logoLightSource === 'upload'} onChange={() => setLogoLightSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label></div>
                        {logoLightSource === 'url' ? <InputField id="lightThemeUrl" label="" value={settings.logoSettings?.lightThemeUrl || ''} onChange={handleLogoChange} /> : <div><div className="flex items-center gap-4"><div className="w-16 h-16 flex-shrink-0 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center overflow-hidden"><img src={logoLightPreview || settings.logoSettings?.lightThemeUrl} alt="Preview" className="w-full h-full object-contain" /></div><input type="file" accept="image/png, image/svg+xml, image/jpeg, image/webp" onChange={handleFileChange(setSelectedLogoLight, setLogoLightPreview)} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/></div></div>}
                    </div>
                    <div>
                        <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Logo (Modo Escuro)</label>
                        <div className="flex items-center gap-x-6 mb-2"><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="logoDarkSource" value="url" checked={logoDarkSource === 'url'} onChange={() => setLogoDarkSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="logoDarkSource" value="upload" checked={logoDarkSource === 'upload'} onChange={() => setLogoDarkSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label></div>
                        {logoDarkSource === 'url' ? <InputField id="darkThemeUrl" label="" value={settings.logoSettings?.darkThemeUrl || ''} onChange={handleLogoChange} /> : <div><div className="flex items-center gap-4"><div className="w-16 h-16 flex-shrink-0 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center overflow-hidden"><img src={logoDarkPreview || settings.logoSettings?.darkThemeUrl} alt="Preview" className="w-full h-full object-contain" /></div><input type="file" accept="image/png, image/svg+xml, image/jpeg, image/webp" onChange={handleFileChange(setSelectedLogoDark, setLogoDarkPreview)} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/></div></div>}
                    </div>
                </>
            )}
            
            <div>
                <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Favicon do Site</label>
                <div className="flex items-center gap-x-6 mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="faviconSource" value="url" checked={faviconSource === 'url'} onChange={() => setFaviconSource('url')} className="accent-dourado-suave"/>
                        <span className="font-sans text-sm">URL</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="faviconSource" value="upload" checked={faviconSource === 'upload'} onChange={() => setFaviconSource('upload')} className="accent-dourado-suave"/>
                        <span className="font-sans text-sm">Upload</span>
                    </label>
                </div>
                {faviconSource === 'url' ? (
                    <InputField id="faviconUrl" label="" value={settings.faviconUrl || ''} onChange={handleChange} />
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center overflow-hidden">
                            <img src={faviconPreview || settings.faviconUrl} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                        <input type="file" accept="image/x-icon, image/png, image/svg+xml" onChange={handleFileChange(setSelectedFavicon, setFaviconPreview)} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/>
                    </div>
                )}
            </div>
        </div>
      </div>

       <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Tipografia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="headingFont" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Fonte dos Títulos</label>
                <select id="headingFont" value={settings.fontSettings?.headingFont || ''} onChange={handleFontChange} className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave">
                    {fontOptions.map(font => (
                        <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>{font.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="bodyFont" className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Fonte do Corpo do Texto</label>
                <select id="bodyFont" value={settings.fontSettings?.bodyFont || ''} onChange={handleFontChange} className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave">
                    {fontOptions.map(font => (
                        <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>{font.name}</option>
                    ))}
                </select>
            </div>
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
            <label htmlFor="useBackgroundImage" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="useBackgroundImage" className="sr-only" checked={settings.useBackgroundImage || false} onChange={handleToggleChange} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${settings.useBackgroundImage ? 'bg-green-600' : 'bg-marrom-seiva/20 dark:bg-creme-velado/20'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.useBackgroundImage ? 'translate-x-6' : ''}`}></div>
                </div>
            </label>
        </div>
        {settings.useBackgroundImage && (
          <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
            <div><label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Imagem de Fundo</label><div className="flex items-center gap-4"><div className="w-16 h-16 flex-shrink-0 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center overflow-hidden"><img src={bgImagePreview || settings.backgroundImageUrl} alt="Preview" className="w-full h-full object-contain" /></div><input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange(setSelectedBgImage, setBgImagePreview)} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/></div></div>
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
            <div className="flex items-center gap-x-6"><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="heroImageSource" value="url" checked={heroImageSource === 'url'} onChange={() => setHeroImageSource('url')} className="accent-dourado-suave"/> <span className="font-sans text-sm">URL Externa</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="heroImageSource" value="upload" checked={heroImageSource === 'upload'} onChange={() => setHeroImageSource('upload')} className="accent-dourado-suave"/> <span className="font-sans text-sm">Upload</span></label></div>
            {heroImageSource === 'url' && <InputField id="imageUrl" label="" value={settings.heroData?.imageUrl || ''} onChange={handleChange} />}
            {heroImageSource === 'upload' && <div><div className="flex items-center gap-4"><div className="w-16 h-16 flex-shrink-0 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center overflow-hidden"><img src={(selectedHeroImage ? URL.createObjectURL(selectedHeroImage) : null) || settings.heroData?.imageUrl} alt="Preview" className="w-full h-full object-contain" /></div><input type="file" accept="image/*" onChange={handleFileChange(setSelectedHeroImage, ()=>{})} className="w-full text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dourado-suave/20 file:text-dourado-suave hover:file:bg-dourado-suave/30"/></div></div>}
          </div>
        </div>
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Funcionalidades Inteligentes</h2>
        <div className="flex items-start justify-between">
          <div><h3 className="font-sans font-semibold text-verde-mata dark:text-creme-velado">Devocional Diário por IA</h3><p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80">Permite que as usuárias acessem um devocional único a cada dia.</p></div>
          <label htmlFor="isAiDevotionalEnabled" className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" id="isAiDevotionalEnabled" className="sr-only" checked={settings.isAiDevotionalEnabled || false} onChange={handleToggleChange}/>
                <div className={`block w-14 h-8 rounded-full transition-colors ${settings.isAiDevotionalEnabled ? 'bg-green-600' : 'bg-marrom-seiva/20 dark:bg-creme-velado/20'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.isAiDevotionalEnabled ? 'translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>
        {settings.isAiDevotionalEnabled && (
            <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                <InputField id="aiDevotionalScheduleTime" label="Horário da Geração Diária" type="time" value={settings.aiDevotionalScheduleTime || '06:00'} onChange={handleChange} />
                 <p className="text-xs font-sans text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">Nota: O devocional é gerado na primeira vez que uma usuária abre o app após este horário a cada dia.</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-end items-center gap-4 mt-8">
        {saveSuccess && <p className="text-sm font-semibold text-green-600 dark:text-green-400">Alterações salvas com sucesso!</p>}
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner variant="button" /> : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}