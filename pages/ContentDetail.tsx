import React, { useState, useEffect, useRef } from 'react';
import { 
    getContentItem, 
    markContentAsComplete, 
    unmarkContentAsComplete, 
    getAppearanceSettings,
    addReactionToContent,
    addCommentToContent,
    addReactionToContentComment,
    deleteCommentFromContent
} from '../services/api';
import { ContentItem, User, GeneratedDevotional, Comment, Page } from '../types';
import Spinner from '../components/Spinner';
import { PlayIcon, CheckCircleIcon, HeartIcon, ChatBubbleIcon, PaperAirplaneIcon, TrashIcon, DownloadIcon, JournalIcon } from '../components/Icons';
import AudioPlayer from '../components/AudioPlayer';
import VideoPlayer from '../components/VideoPlayer';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';
import JournalPanel from '../components/JournalPanel';

interface ContentDetailProps {
  id: string;
  user: User | null;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const extractYoutubeId = (url: string): string => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

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


export default function ContentDetail({ id, user, onUserUpdate }: ContentDetailProps) {
  const [item, setItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  const fetchItem = async () => {
    setIsLoading(true);
    
    let data: ContentItem | undefined | null = null;
    
    if (id === 'daily-devotional') {
        const settings = await getAppearanceSettings();
        const devotional = settings.dailyDevotional?.content;
        if (devotional) {
            data = {
                id: 'daily-devotional',
                type: 'Devocional',
                title: devotional.title,
                subtitle: devotional.verseReference,
                description: devotional.reflection.substring(0, 150) + '...',
                imageUrl: 'https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80',
                contentBody: formatDevotionalToContentBody(devotional),
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder audio
                comments: [],
                reactions: [],
            };
        }
    } else {
        data = await getContentItem(id);
    }
    
    if(data) {
        data.comments.sort((a,b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
        setItem(data);
        if (user) {
          setIsCompleted(user.completedContentIds.includes(data.id));
        }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItem();
  }, [id, user]);
  
  const handleToggleComplete = async () => {
    if (!user || !item) return;
    setIsUpdating(true);

    try {
      if (isCompleted) {
        await unmarkContentAsComplete(user.id, item.id);
        onUserUpdate({ 
          completedContentIds: user.completedContentIds.filter(cid => cid !== item.id),
        });
        setIsCompleted(false);
      } else {
        const updatedUser = await markContentAsComplete(user.id, item.id);
        if (updatedUser) onUserUpdate(updatedUser);
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Failed to update completion status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStart = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
   const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `agora`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.round(hours / 24);
    return `há ${days}d`;
  };

  // --- INTERACTION HANDLERS ---
  const handleReaction = async () => {
      if (!user || !item) return;
      const originalReactions = [...item.reactions];
      const hasReacted = originalReactions.some(r => r.userId === user.id);
      const newReactions = hasReacted ? originalReactions.filter(r => r.userId !== user.id) : [...originalReactions, { userId: user.id }];
      setItem({ ...item, reactions: newReactions });
      try {
          await addReactionToContent(item.id, user.id);
      } catch (e) {
          setItem({ ...item, reactions: originalReactions }); // Revert on fail
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim() || !user || !item) return;
      const updatedUser = await addCommentToContent(item.id, commentText, user);
      if(updatedUser) onUserUpdate(updatedUser);
      setCommentText('');
      fetchItem(); // Re-fetch to get new comments
  };

  const handleCommentReaction = async (commentId: string) => {
      if (!user || !item) return;
      const originalComments = [...item.comments];
      const newComments = item.comments.map(c => {
          if (c.id === commentId) {
              const hasReacted = c.reactions.some(r => r.userId === user.id);
              const newReactions = hasReacted ? c.reactions.filter(r => r.userId !== user.id) : [...c.reactions, { userId: user.id }];
              return { ...c, reactions: newReactions };
          }
          return c;
      });
      newComments.sort((a,b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
      setItem({ ...item, comments: newComments });
      try {
          await addReactionToContentComment(item.id, commentId, user.id);
      } catch (e) {
          setItem({ ...item, comments: originalComments });
      }
  };
  
  const handleOpenDeleteConfirm = (comment: Comment) => {
      setCommentToDelete(comment);
      setIsConfirmDeleteOpen(true);
  };

  const handleDeleteComment = async () => {
      if (!item || !commentToDelete) return;
      await deleteCommentFromContent(item.id, commentToDelete.id);
      setIsConfirmDeleteOpen(false);
      setCommentToDelete(null);
      fetchItem();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  if (!item) {
    return <div className="text-center p-8">Conteúdo não encontrado.</div>;
  }
  
  const hasStartableContent = item.contentBody || (item.type === 'Live' && item.actionUrl) || item.audioUrl || (item.type === 'Mentoria' && item.actionUrl);
  const hasReacted = user ? item.reactions.some(r => r.userId === user.id) : false;

  return (
    <>
    <div className="relative">
        <div className="h-[40vh] sm:h-[50vh] w-full relative">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-creme-velado via-creme-velado/70 to-transparent dark:from-verde-escuro-profundo dark:via-verde-escuro-profundo/70"></div>
        </div>
        <div className="container mx-auto p-4 sm:p-8 -mt-24 relative z-10">
            <div className="max-w-4xl mx-auto">
                <span className="font-sans text-dourado-suave font-semibold tracking-wider">{item.type}</span>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold my-2 text-gradient">
                    {item.title}
                </h1>
                <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80">{item.subtitle}</p>

                <div className="flex flex-wrap items-center gap-4 my-8">
                    {hasStartableContent && (
                        <button onClick={handleStart} className="flex items-center justify-center bg-dourado-suave text-verde-mata font-bold py-3 px-8 rounded-full text-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105">
                            <PlayIcon />
                            <span>Iniciar</span>
                        </button>
                    )}
                    <Button onClick={handleToggleComplete} variant={isCompleted ? 'secondary' : 'primary'} disabled={isUpdating}>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {isCompleted ? 'Concluído' : 'Marcar como Concluído'}
                    </Button>
                     <Button onClick={() => setIsJournalOpen(true)} variant="secondary">
                        <JournalIcon className="w-5 h-5 mr-2" />
                        Meu Diário
                    </Button>
                    {item.downloadableResource?.url && (
                        <a href={item.downloadableResource.url} download target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                {item.downloadableResource.label || 'Baixar Material'}
                            </Button>
                        </a>
                    )}
                </div>

                <div className="font-sans text-base leading-relaxed space-y-4 text-marrom-seiva dark:text-creme-velado/90">
                    <p>{item.description}</p>
                </div>

                {hasStartableContent && (
                    <div ref={contentRef} className="mt-8 space-y-8">
                        {item.contentBody && (
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.contentBody }} />
                        )}
                        
                        {(item.type === 'Live' || item.type === 'Mentoria') && item.actionUrl && (
                            <div>
                                <h2 className="font-serif text-3xl font-bold text-gradient mb-4">
                                    {item.type === 'Live' ? 'Assista a Gravação' : 'Assista à Aula'}
                                </h2>
                                <VideoPlayer youtubeId={extractYoutubeId(item.actionUrl)} />
                            </div>
                        )}

                        {item.audioUrl && (
                            <div>
                                <AudioPlayer src={item.audioUrl} />
                            </div>
                        )}
                    </div>
                )}
                 {/* Reações e Comentários para Mentoria */}
                {item.type === 'Mentoria' && (
                    <div className="mt-8 pt-6 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                        <div className="flex items-center space-x-6">
                             <button onClick={handleReaction} className={`flex items-center space-x-1.5 hover:text-dourado-suave transition-colors ${hasReacted ? 'text-dourado-suave' : 'text-marrom-seiva/70 dark:text-creme-velado/70'}`}>
                                <HeartIcon className="w-5 h-5" filled={hasReacted} />
                                <span className="font-sans text-sm font-semibold">{item.reactions.length} Apoios</span>
                            </button>
                            <div className="flex items-center space-x-1.5 text-marrom-seiva/70 dark:text-creme-velado/70">
                                <ChatBubbleIcon className="w-5 h-5" />
                                <span className="font-sans text-sm font-semibold">{item.comments.length} Comentários</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-serif text-2xl font-bold text-gradient mb-4">Discussão</h3>
                            {user && (
                                <form onSubmit={handleCommentSubmit} className="mb-6 flex items-start space-x-3">
                                    <img src={user.avatarUrl} alt={user.displayName} className="w-10 h-10 rounded-full object-cover"/>
                                    <div className="flex-1 relative">
                                        <textarea placeholder="Deixe sua dúvida ou comentário..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave" rows={3}/>
                                        <button type="submit" className="absolute right-3 bottom-3 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!commentText.trim()}><PaperAirplaneIcon className="w-5 h-5" /></button>
                                    </div>
                                </form>
                            )}
                            <div className="space-y-4">
                                {item.comments.map(comment => {
                                    const hasCommentReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
                                    return (
                                        <div key={comment.id} className="group flex items-start space-x-3">
                                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div className="flex-1 bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-sans text-sm">
                                                            <span className="font-bold text-verde-mata dark:text-creme-velado">{comment.author.name}</span>
                                                            <span className="text-marrom-seiva/60 dark:text-creme-velado/60 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                                                        </p>
                                                        <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/90 mt-1">{comment.body}</p>
                                                    </div>
                                                    {user?.id === comment.author.id && (
                                                        <button onClick={() => handleOpenDeleteConfirm(comment)} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <button onClick={() => handleCommentReaction(comment.id)} className={`flex items-center space-x-1 text-xs font-semibold ${hasCommentReacted ? 'text-dourado-suave' : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'}`}>
                                                        <HeartIcon className="w-4 h-4" filled={hasCommentReacted} />
                                                        <span>{comment.reactions?.length || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {commentToDelete && (
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleDeleteComment}
                title="Excluir Comentário"
                message="Tem certeza de que deseja excluir este comentário?"
                confirmText="Excluir"
            />
        )}
    </div>
    {user && (
      <JournalPanel 
        isOpen={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        user={user} 
        relatedContent={{id: item.id, title: item.title}}
        onUserUpdate={onUserUpdate}
      />
    )}
    </>
  );
}