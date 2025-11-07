import React, { useState } from 'react';
import { Page, User } from '../types';
import { createCommunityPost } from '../services/api';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

interface PublishTestimonialProps {
  user: User | null;
  onNavigate: (page: Page) => void;
}

export default function PublishTestimonial({ user, onNavigate }: PublishTestimonialProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const MAX_CHARS = 5000;

  const handlePublish = async () => {
    if (!body.trim() || !user) return;
    setIsLoading(true);
    await createCommunityPost({
        room: 'testemunhos',
        title: title || 'Um testemunho de fé',
        body,
        authorId: user.id
    });
    setIsLoading(false);
    onNavigate('testimonials');
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
                        className="mt-2 w-full text-lg font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-transparent focus:border-dourado-suave focus:ring-dourado-suave rounded-xl p-4 transition"
                    />
                </div>
                <div>
                     <label htmlFor="testimony-body" className="font-sans font-semibold text-marrom-seiva dark:text-creme-velado/80">Seu testemunho</label>
                    <textarea
                        id="testimony-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Comece a escrever aqui a sua história..."
                        className="mt-2 w-full text-lg font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-transparent focus:border-dourado-suave focus:ring-dourado-suave rounded-xl p-4 h-64 resize-none transition"
                        maxLength={MAX_CHARS}
                    />
                    <p className="text-right text-sm font-sans text-marrom-seiva/60 dark:text-creme-velado/60 mt-1">
                        {body.length}/{MAX_CHARS}
                    </p>
                </div>
            </div>
        </main>
    </div>
  );
}
