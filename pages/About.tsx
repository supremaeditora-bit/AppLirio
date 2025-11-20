import React, { useState, useEffect } from 'react';
import { User, AboutPageContent } from '../types';
import { getAppearanceSettings, updateAppearanceSettings } from '../services/api';
import { uploadImage } from '../services/storageService';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { PencilIcon, CameraIcon } from '../components/Icons';

interface AboutProps {
    user: User | null;
}

const defaultAboutContent: AboutPageContent = {
    title: "Nossa História",
    content: `A Escola Lírios do Vale nasceu de um sonho profundo de restaurar a identidade feminina à luz da Palavra de Deus. 

Acreditamos que cada mulher é um jardim fechado, uma fonte selada, desenhada pelo Criador para florescer mesmo nos vales mais áridos. Nossa missão é oferecer sabedoria prática, acolhimento espiritual e ferramentas para que você possa edificar sua casa, sua vida e sua comunidade.

Somos mais que uma plataforma; somos um ecossistema de cura e crescimento. Aqui, a teologia encontra a vida diária, e a oração se torna o fôlego de cada passo.`,
    imageUrl: "https://images.unsplash.com/photo-1523665733679-997589f72a72?q=80&w=1470&auto=format&fit=crop"
};

export default function About({ user }: AboutProps) {
    const [content, setContent] = useState<AboutPageContent>(defaultAboutContent);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Edit states
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

    const isAdmin = user && (user.role === 'admin');

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const settings = await getAppearanceSettings();
                if (settings.aboutPage) {
                    setContent(settings.aboutPage);
                }
            } catch (error) {
                console.error("Failed to fetch about page content", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleEditClick = () => {
        setEditTitle(content.title);
        setEditContent(content.content);
        setEditImagePreview(content.imageUrl);
        setIsEditing(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditImageFile(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let imageUrl = content.imageUrl;
            
            if (editImageFile && user) {
                imageUrl = await uploadImage(editImageFile, 'system', () => {});
            }

            const newContent: AboutPageContent = {
                title: editTitle,
                content: editContent,
                imageUrl
            };

            await updateAppearanceSettings({ aboutPage: newContent });
            setContent(newContent);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save about page", error);
            alert("Erro ao salvar as alterações. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditImageFile(null);
        setEditImagePreview(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (isEditing) {
        return (
            <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mb-6">Editar Página Sobre</h1>
                
                <div className="space-y-6 bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg">
                    <div>
                        <label className="block font-sans font-semibold text-sm mb-2 text-marrom-seiva dark:text-creme-velado/80">Imagem de Capa</label>
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-verde-escuro-profundo group cursor-pointer">
                            <img src={editImagePreview || content.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/50 text-white p-3 rounded-full">
                                    <CameraIcon className="w-8 h-8" />
                                </div>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <InputField 
                        id="title" 
                        label="Título" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                    />

                    <InputField 
                        id="content" 
                        label="Texto (Markdown suportado)" 
                        type="textarea" 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)} 
                        className="h-64"
                    />

                    <div className="flex justify-end space-x-4 pt-4">
                        <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Spinner variant="button" /> : 'Salvar Alterações'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
            {/* Hero Section with Image */}
            <div className="relative h-[50vh] w-full">
                <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
                
                {isAdmin && (
                    <button 
                        onClick={handleEditClick}
                        className="absolute top-4 right-4 bg-white/90 dark:bg-verde-mata/90 p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-20 text-verde-mata dark:text-dourado-suave"
                        aria-label="Editar página"
                    >
                        <PencilIcon className="w-6 h-6" />
                    </button>
                )}

                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                    <div className="container mx-auto">
                        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                            {content.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto p-6 sm:p-12 -mt-8 relative z-10">
                <div className="bg-branco-nevoa dark:bg-verde-mata p-8 sm:p-12 rounded-2xl shadow-xl">
                    <div className="prose prose-lg dark:prose-invert max-w-none font-sans leading-relaxed text-marrom-seiva dark:text-creme-velado/90 whitespace-pre-wrap">
                        {content.content}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-marrom-seiva/10 dark:border-creme-velado/10 text-center">
                        <p className="font-serif italic text-xl text-verde-mata dark:text-dourado-suave">
                            "Floresça no Vale, terra santa, regada pelo céu."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}