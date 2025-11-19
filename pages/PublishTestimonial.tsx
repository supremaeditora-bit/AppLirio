import React, { useState } from 'react';
import { Page, User } from '../types';
import { createCommunityPost, getUserProfile } from '../services/api';
import { uploadImage } from '../services/storageService';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { processActivity } from '../services/gamificationService';

interface PublishTestimonialProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

export default function PublishTestimonial({ user, onNavigate, onUserUpdate }: PublishTestimonialProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_CHARS = 5000;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!body.trim() || !user) return;
    setIsLoading(true);
    setUploadProgress(0);
    
    let imageUrl: string | undefined = undefined;

    try {
        if (selectedImageFile) {
            imageUrl = await uploadImage(selectedImageFile, user.id, setUploadProgress);
        }

        await createCommunityPost({
            room: 'testemunhos',
            title: title || 'Um testemunho de fé',
            body,
            authorId: user.id,
            imageUrl: imageUrl
        });
        
        // Gamification
        const gamificationUpdate = processActivity(user, 'testemunho_compartilhado');
        await onUserUpdate(gamificationUpdate);
        
        onNavigate('testimonials');
    } catch (error: any) {
        console.error("Failed to publish testimonial", error);
        let errorMessage = "Ocorreu um erro ao publicar. Tente novamente.";
        if (error.message) {
            if (error.message.includes("violates row-level security policy")) {
                errorMessage = "Falha ao publicar: Permissão negada. Verifique as regras de segurança (RLS) da tabela 'community_posts' no Supabase.";
            } else if (error.message.includes("foreign key constraint")) {
                errorMessage = "Falha ao publicar: O perfil do autor não foi encontrado. Verifique se o gatilho 'on_auth_user_created' está funcionando corretamente no Supabase.";
            } else {
                errorMessage = `Ocorreu um erro ao publicar: ${error.message}`;
            }
        }
        alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-creme-velado/40 dark:bg-verde-escuro-profundo/40 min-h-full">
        <header className="flex items-center justify-between p-4 bg-creme-velado dark:bg-verde-mata">
             <div className="w-24">
                <button onClick={() => onNavigate('testimonials')} className="font-sans font-semibold text-sm hover:text-dourado-suave">
                    Cancelar
                </button>
            </div>
            <h1 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">Testemunhos de Fé</h1>
            <div className="w-24 flex justify-end">
                <Button onClick={handlePublish} disabled={isLoading || !body.trim()} className="!py-2 !px-5">
                    {isLoading ? <Spinner variant="button" /> : 'Publicar'}
                </Button>
            </div>
        </header>

        <main className="max-w-3xl mx-auto p-4 sm:p-8">
            <div className="text-center mb-10">
                 <h2 className="font-serif text-4xl sm:text-5xl font-bold text-verde-mata dark:text-dourado-suave">Compartilhe seu Testemunho</h2>
                 <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">Conte-nos como Deus agiu em sua vida.</p>
            </div>
            <div className="space-y-8">
                <div>
                    <label htmlFor="testimony-title" className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Título (opcional)</label>
                    <input
                        id="testimony-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Um resumo da sua bênção"
                        className="mt-2 w-full text-lg font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-transparent focus:border-dourado-suave focus:ring-dourado-suave rounded-xl p-4 transition placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
                    />
                </div>
                <div>
                     <label htmlFor="testimony-body" className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Seu testemunho</label>
                    <textarea
                        id="testimony-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Comece a escrever aqui a sua história..."
                        className="mt-2 w-full text-lg font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-transparent focus:border-dourado-suave focus:ring-dourado-suave rounded-xl p-4 h-64 resize-none transition placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
                        maxLength={MAX_CHARS}
                    />
                    <p className="text-right text-sm font-sans text-marrom-seiva/60 dark:text-creme-velado/60 mt-1">
                        {body.length}/{MAX_CHARS}
                    </p>
                </div>
                <div>
                    <label className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Adicionar Imagem (opcional)</label>
                    <div className="mt-2 flex items-center justify-center w-full">
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-marrom-seiva/30 dark:border-creme-velado/30 border-dashed rounded-lg cursor-pointer bg-branco-nevoa/50 dark:bg-verde-mata/50 hover:bg-creme-velado/80 dark:hover:bg-verde-escuro-profundo/80">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Pré-visualização" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-marrom-seiva/70 dark:text-creme-velado/70">
                                    <PhotoIcon className="w-10 h-10 mb-3" />
                                    <p className="mb-2 text-sm"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                                    <p className="text-xs">PNG, JPG ou WEBP</p>
                                </div>
                            )}
                            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                     {(uploadProgress > 0 && uploadProgress < 100) && (
                        <div className="mt-2">
                            <div className="w-full bg-marrom-seiva/20 rounded-full h-1.5"><div className="bg-dourado-suave h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}