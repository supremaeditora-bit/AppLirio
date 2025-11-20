import React, { useState, useEffect } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { getAppearanceSettings, updateAppearanceSettings, createContentItem } from '../../services/api';
import { generateDevotional } from '../../services/geminiService';
import { uploadImage } from '../../services/storageService';
import { AppearanceSettings, ThemeColors, GeneratedDevotional, PageHeaderConfig, BookLaunchConfig } from '../../types';

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
    termsOfUse: '',
    privacyPolicy: '',
    contactInfo: '',
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

const PAGE_OPTIONS = [
    { id: 'mentorships', label: 'Mentorias' },
    { id: 'prayers', label: 'Pedidos de Oração' },
    { id: 'studies', label: 'Grupos de Estudo' },
    { id: 'testimonials', label: 'Testemunhos' },
    { id: 'readingPlans', label: 'Planos de Leitura' },
    { id: 'events', label: 'Eventos' },
    { id: 'podcasts', label: 'Podcasts' },
    { id: 'journal', label: 'Diário (Lista)' },
    { id: 'bookLaunch', label: 'Lançamento (Hero)' },
];

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

  // Page Headers State
  const [selectedPageId, setSelectedPageId] = useState<string>(PAGE_OPTIONS[0].id);
  const [selectedHeaderImage, setSelectedHeaderImage] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);

  // Book Launch State
  const [selectedBookCover, setSelectedBookCover] = useState<File | null>(null);
  const [bookCoverPreview, setBookCoverPreview] = useState<string | null>(null);
  const [selectedAuthorPhoto, setSelectedAuthorPhoto] = useState<File | null>(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState<string | null>(null);

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

  const handleLogoSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  // Page Header Handlers
  const handlePageHeaderChange = (field: keyof PageHeaderConfig, value: string) => {
      setSettings(prev => ({
          ...prev,
          pageHeaders: {
              ...(prev.pageHeaders || {}),
              [selectedPageId]: {
                  ...(prev.pageHeaders?.[selectedPageId] || { title: '', subtitle: '', imageUrl: '' }),
                  [field]: value
              }
          }
      }));
  };
  
  const handlePageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedPageId(e.target.value);
      setSelectedHeaderImage(null);
      setHeaderImagePreview(null);
  }

  // Book Launch Handlers
  const handleBookChange = (field: keyof BookLaunchConfig, value: string | number) => {
      setSettings(prev => ({
          ...prev,
          bookLaunch: {
              ...(prev.bookLaunch || {}),
              [field]: value
          }
      } as any));
  };

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
        
        // Handle Page Header Image Upload (Only uploads for the currently selected page to save bandwidth/complexity)
        if (selectedHeaderImage) {
            uploads.push(uploadImage(selectedHeaderImage, 'appearance', () => {}).then(url => {
                finalSettings.pageHeaders = {
                    ...(finalSettings.pageHeaders || {}),
                    [selectedPageId]: {
                         ...(finalSettings.pageHeaders?.[selectedPageId] || { title: '', subtitle: '', imageUrl: '' }),
                        imageUrl: url
                    }
                };
            }));
        }

        // Handle Book Launch Images
        if (selectedBookCover) {
            uploads.push(uploadImage(selectedBookCover, 'bookLaunch', () => {}).then(url => {
                finalSettings.bookLaunch = { ...finalSettings.bookLaunch!, bookCoverUrl: url };
            }));
        }
        if (selectedAuthorPhoto) {
            uploads.push(uploadImage(selectedAuthorPhoto, 'bookLaunch', () => {}).then(url => {
                finalSettings.bookLaunch = { ...finalSettings.bookLaunch!, authorImageUrl: url };
            }));
        }

        await Promise.all(uploads);
        await updateAppearanceSettings(finalSettings);
        setSaveSuccess(true);
        
        // Reset local file states after save
        setSelectedHeaderImage(null);
        setHeaderImagePreview(null);
        setSelectedBookCover(null);
        setBookCoverPreview(null);
        setSelectedAuthorPhoto(null);
        setAuthorPhotoPreview(null);

        setTimeout(() => setSaveSuccess(false), 3000);
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

  const currentHeader = settings.pageHeaders?.[selectedPageId] || { title: '', subtitle: '', imageUrl: '' };
  const currentBook = settings.bookLaunch || {} as BookLaunchConfig;

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
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Personalização do Tema</h2>
        
        {/* Background Images */}
        <div className="space-y-4 mb-8 border-b border-marrom-seiva/10 dark:border-creme-velado/10 pb-6">
            <div className="flex items-center mb-4">
                <input type="checkbox" id="useBackgroundImage" checked={settings.useBackgroundImage || false} onChange={handleToggleChange} className="mr-2 h-5 w-5 accent-dourado-suave" />
                <label htmlFor="useBackgroundImage" className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Usar Imagens de Fundo</label>
            </div>
            
            {settings.useBackgroundImage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUpload label="Fundo Global (Claro)" file={selectedBgImageLight} preview={bgImagePreviewLight} onFileChange={handleFileChange(setSelectedBgImageLight, setBgImagePreviewLight)} currentUrl={settings.backgroundImageUrlLight} accept="image/*" />
                    <FileUpload label="Fundo Global (Escuro)" file={selectedBgImageDark} preview={bgImagePreviewDark} onFileChange={handleFileChange(setSelectedBgImageDark, setBgImagePreviewDark)} currentUrl={settings.backgroundImageUrlDark} accept="image/*" />
                </div>
            )}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FileUpload label="Fundo de Cards (Claro)" file={selectedCompBgImageLight} preview={compBgImagePreviewLight} onFileChange={handleFileChange(setSelectedCompBgImageLight, setCompBgImagePreviewLight)} currentUrl={settings.componentBackgroundImageUrlLight} accept="image/*" />
                <FileUpload label="Fundo de Cards (Escuro)" file={selectedCompBgImageDark} preview={compBgImagePreviewDark} onFileChange={handleFileChange(setSelectedCompBgImageDark, setCompBgImagePreviewDark)} currentUrl={settings.componentBackgroundImageUrlDark} accept="image/*" />
            </div>
        </div>

        {/* Colors */}
        <h3 className="font-sans font-bold text-lg text-marrom-seiva dark:text-creme-velado mb-4">Paleta de Cores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <ColorInput label="Fundo (Claro)" value={settings.themeColors?.lightBg || '#FBF8F1'} onChange={(e) => handleColorChange('lightBg', e.target.value)} onSetTransparent={() => handleSetTransparent('lightBg')} />
             <ColorInput label="Fundo (Escuro)" value={settings.themeColors?.darkBg || '#1A2918'} onChange={(e) => handleColorChange('darkBg', e.target.value)} onSetTransparent={() => handleSetTransparent('darkBg')} />
             
             <ColorInput label="Componentes (Claro)" value={settings.themeColors?.lightComponentBg || '#FAF9F6'} onChange={(e) => handleColorChange('lightComponentBg', e.target.value)} onSetTransparent={() => handleSetTransparent('lightComponentBg')} />
             <ColorInput label="Componentes (Escuro)" value={settings.themeColors?.darkComponentBg || '#2C3E2A'} onChange={(e) => handleColorChange('darkComponentBg', e.target.value)} onSetTransparent={() => handleSetTransparent('darkComponentBg')} />
             
             <ColorInput label="Texto Principal" value={settings.themeColors?.lightText || '#5C3D2E'} onChange={(e) => handleColorChange('lightText', e.target.value)} onSetTransparent={() => handleSetTransparent('lightText')} />
             
             <ColorInput label="Destaque/Botões (Claro)" value={settings.themeColors?.lightAccent || '#C0A063'} onChange={(e) => handleColorChange('lightAccent', e.target.value)} onSetTransparent={() => handleSetTransparent('lightAccent')} />
             <ColorInput label="Destaque/Botões (Escuro)" value={settings.themeColors?.darkAccent || '#D9C7A6'} onChange={(e) => handleColorChange('darkAccent', e.target.value)} onSetTransparent={() => handleSetTransparent('darkAccent')} />
        </div>
      </div>
      
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Cabeçalhos das Páginas</h2>
        <p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mb-4">Personalize a imagem e os textos da área de destaque (Hero) de cada página.</p>
        
        <div className="space-y-4">
            <div>
                <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Selecionar Página</label>
                <select 
                    value={selectedPageId} 
                    onChange={handlePageSelectChange}
                    className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-lg p-3 text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave focus:border-dourado-suave transition-colors"
                >
                    {PAGE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
            </div>

            <InputField 
                id="headerTitle" 
                label="Título Principal" 
                value={currentHeader.title} 
                onChange={(e) => handlePageHeaderChange('title', e.target.value)} 
            />
            <InputField 
                id="headerSubtitle" 
                label="Subtítulo / Descrição" 
                type="textarea"
                value={currentHeader.subtitle} 
                onChange={(e) => handlePageHeaderChange('subtitle', e.target.value)} 
            />
            <FileUpload 
                label="Imagem de Capa" 
                file={selectedHeaderImage} 
                preview={headerImagePreview} 
                onFileChange={handleFileChange(setSelectedHeaderImage, setHeaderImagePreview)} 
                currentUrl={currentHeader.imageUrl} 
                accept="image/jpeg, image/png, image/webp" 
            />
        </div>
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Lançamento de Livro</h2>
        <div className="space-y-4">
            <InputField 
                id="bookTitle" 
                label="Título do Livro" 
                value={currentBook.bookTitle || ''} 
                onChange={(e) => handleBookChange('bookTitle', e.target.value)} 
            />
             <InputField 
                id="bookSubtitle" 
                label="Subtítulo / Frase de Efeito" 
                value={currentBook.bookSubtitle || ''} 
                onChange={(e) => handleBookChange('bookSubtitle', e.target.value)} 
            />
            <InputField 
                id="bookPrice" 
                label="Preço (R$)" 
                type="number"
                value={currentBook.bookPrice || 0} 
                onChange={(e) => handleBookChange('bookPrice', parseFloat(e.target.value))} 
            />
            <FileUpload 
                label="Capa do Livro (Vertical)" 
                file={selectedBookCover} 
                preview={bookCoverPreview} 
                onFileChange={handleFileChange(setSelectedBookCover, setBookCoverPreview)} 
                currentUrl={currentBook.bookCoverUrl} 
                accept="image/jpeg, image/png, image/webp" 
            />
            <InputField 
                id="bookSynopsis" 
                label="Sinopse do Livro" 
                type="textarea"
                value={currentBook.bookSynopsis || ''} 
                onChange={(e) => handleBookChange('bookSynopsis', e.target.value)} 
                className="h-32"
            />
             <div className="pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                 <h3 className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado mb-4">Sobre a Autora</h3>
                 <InputField 
                    id="authorName" 
                    label="Nome da Autora" 
                    value={currentBook.authorName || ''} 
                    onChange={(e) => handleBookChange('authorName', e.target.value)} 
                />
                <FileUpload 
                    label="Foto da Autora" 
                    file={selectedAuthorPhoto} 
                    preview={authorPhotoPreview} 
                    onFileChange={handleFileChange(setSelectedAuthorPhoto, setAuthorPhotoPreview)} 
                    currentUrl={currentBook.authorImageUrl} 
                    accept="image/jpeg, image/png, image/webp" 
                />
                 <InputField 
                    id="authorBio" 
                    label="Biografia Curta" 
                    type="textarea"
                    value={currentBook.authorBio || ''} 
                    onChange={(e) => handleBookChange('authorBio', e.target.value)} 
                />
             </div>
        </div>
      </div>

      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Legal & Rodapé</h2>
        <p className="text-sm font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mb-4">Edite os textos que aparecem nos popups do rodapé.</p>
        <div className="space-y-4">
            <InputField 
                id="termsOfUse" 
                label="Termos de Uso" 
                type="textarea" 
                value={settings.termsOfUse || ''} 
                onChange={handleChange} 
                className="min-h-[300px]"
            />
            <InputField 
                id="privacyPolicy" 
                label="Política de Privacidade" 
                type="textarea" 
                value={settings.privacyPolicy || ''} 
                onChange={handleChange} 
                 className="min-h-[300px]"
            />
             <InputField 
                id="contactInfo" 
                label="Informações de Contato" 
                type="textarea" 
                value={settings.contactInfo || ''} 
                onChange={handleChange} 
                 className="min-h-[300px]"
            />
        </div>
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