
import React, { useState, useEffect } from 'react';
import { User, Page, PageHeaderConfig, BookLaunchConfig, Comment } from '../types';
import { getAppearanceSettings, getCommunityPostById, addCommentToPost, addReactionToPost, deleteCommentFromPost, addReactionToComment, createCommunityPost } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { ChevronLeftIcon, HeartIcon, ChatBubbleIcon, TrashIcon, PaperAirplaneIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

interface BookLaunchProps {
  user: User | null;
  onNavigate: (page: Page, id?: string) => void;
}

export default function BookLaunch({ user, onNavigate }: BookLaunchProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);
    const [bookConfig, setBookConfig] = useState<BookLaunchConfig | undefined>(undefined);
    
    // UUID válido para o sistema de comentários do livro
    const BOOK_COMMENTS_ID = '00000000-0000-0000-0000-000000000001'; 
    
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
    const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [settings, post] = await Promise.all([
                    getAppearanceSettings(),
                    getCommunityPostById(BOOK_COMMENTS_ID)
                ]);

                if (settings.pageHeaders?.bookLaunch) {
                    setHeaderConfig(settings.pageHeaders.bookLaunch);
                }
                if (settings.bookLaunch) {
                    setBookConfig(settings.bookLaunch);
                }

                if (post) {
                    setComments(post.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                } else if (user) {
                    // Se o post container não existir e tivermos um usuário, criamos ele silenciosamente
                    // para habilitar os comentários.
                    try {
                        await createCommunityPost({
                            id: BOOK_COMMENTS_ID,
                            room: 'estudos', // Usa uma sala existente como bucket
                            title: 'Lançamento do Livro',
                            body: 'Espaço dedicado aos comentários sobre o lançamento do livro.',
                            authorId: user.id
                        });
                    } catch (err) {
                        console.warn("Could not auto-create book comment post", err);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch book launch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]); // Dependência user adicionada para tentar criar o post se logado

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;

        const newComment: Comment = {
            id: crypto.randomUUID(),
            body: commentText,
            author: { id: user.id, fullName: user.fullName, avatarUrl: user.avatarUrl },
            createdAt: new Date().toISOString(),
            reactions: []
        };
        
        // Optimistic Update
        setComments([newComment, ...comments]);
        setCommentText('');

        try {
            await addCommentToPost(BOOK_COMMENTS_ID, newComment.body, user);
        } catch (error) {
            console.error("Failed to post comment", error);
            // Reverter optimistic update em caso de erro seria ideal, mas mantendo simples por enquanto
        }
    };
    
    const handleCommentReaction = async (commentId: string) => {
        if (!user) return;
        
        const updatedComments = comments.map(c => {
            if (c.id === commentId) {
                const reactions = c.reactions || [];
                const hasReacted = reactions.some(r => r.userId === user.id);
                const newReactions = hasReacted 
                    ? reactions.filter(r => r.userId !== user.id) 
                    : [...reactions, { userId: user.id }];
                return { ...c, reactions: newReactions };
            }
            return c;
        });
        setComments(updatedComments);
        
        try {
             await addReactionToComment(BOOK_COMMENTS_ID, commentId, user.id);
        } catch (e) { console.error(e); }
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;
        setComments(comments.filter(c => c.id !== commentToDelete.id));
        setIsConfirmDeleteCommentOpen(false);
        try {
            await deleteCommentFromPost(BOOK_COMMENTS_ID, commentToDelete.id);
        } catch (e) { console.error(e); }
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

    if (isLoading) {
        return <div className="flex justify-center items-center h-full bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
    }

    return (
        <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
             {/* Hero Header */}
            <div className="relative h-[50vh] sm:h-[60vh] w-full">
                <img 
                    src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1470&auto=format&fit=crop"}
                    alt="Lançamento" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 flex flex-col items-center text-center">
                    <h1 className="font-serif text-5xl sm:text-7xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-lg mb-4">
                        {headerConfig?.title || "Lançamento"}
                    </h1>
                    <p className="text-marrom-seiva/90 dark:text-creme-velado/90 text-xl max-w-2xl font-sans font-medium drop-shadow-md">
                        {headerConfig?.subtitle || "Conheça nossa nova obra."}
                    </p>
                </div>
            </div>

            <div className="container mx-auto p-4 sm:p-8 -mt-10 relative z-10">
                {/* Book Details Section */}
                <div className="bg-branco-nevoa dark:bg-verde-mata p-8 rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                    {/* Book Cover with 3D effect */}
                    <div className="relative w-64 sm:w-80 flex-shrink-0 transform hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-black/20 blur-xl rounded-lg translate-y-4 translate-x-4"></div>
                        <img 
                            src={bookConfig?.bookCoverUrl || "https://placehold.co/400x600?text=Capa+do+Livro"} 
                            alt="Capa do Livro" 
                            className="relative w-full rounded-lg shadow-2xl border border-white/10"
                        />
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div>
                            <h2 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-2">{bookConfig?.bookTitle || "Título do Livro"}</h2>
                            <h3 className="font-sans text-xl text-marrom-seiva/80 dark:text-creme-velado/80 italic">{bookConfig?.bookSubtitle}</h3>
                        </div>
                        
                        <div className="text-3xl font-bold text-dourado-suave">
                            R$ {bookConfig?.bookPrice?.toFixed(2).replace('.', ',')}
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-marrom-seiva dark:text-creme-velado/90 leading-relaxed">
                            <p>{bookConfig?.bookSynopsis}</p>
                        </div>

                        <div className="pt-4">
                            <Button onClick={() => onNavigate('checkout', 'book-launch')} className="!py-4 !px-12 !text-lg shadow-xl animate-pulse-slow">
                                Comprar Agora
                            </Button>
                            <p className="text-xs text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">Pagamento seguro via cartão de crédito</p>
                        </div>
                    </div>
                </div>

                {/* Author Section */}
                <div className="mt-16 flex flex-col md:flex-row items-center gap-8 bg-dourado-suave/10 p-8 rounded-2xl border border-dourado-suave/20">
                    <div className="relative w-40 h-40 flex-shrink-0">
                        <img 
                            src={bookConfig?.authorImageUrl || "https://placehold.co/200x200?text=Autora"} 
                            alt={bookConfig?.authorName} 
                            className="w-full h-full rounded-full object-cover border-4 border-dourado-suave shadow-lg"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-creme-velado mb-2">Sobre a Autora</h3>
                        <h4 className="font-sans font-bold text-dourado-suave mb-3">{bookConfig?.authorName}</h4>
                        <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 leading-relaxed">
                            {bookConfig?.authorBio}
                        </p>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave mb-6 text-center">O que estão dizendo</h3>
                    
                    {user && (
                        <form onSubmit={handleComment} className="mb-8 flex items-start gap-3 bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl shadow-md">
                            <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover border border-dourado-suave/50"/>
                            <div className="flex-1 relative">
                                <textarea 
                                    placeholder="Deixe seu comentário sobre o lançamento..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-none rounded-xl p-3 pr-12 text-sm focus:ring-2 focus:ring-dourado-suave placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
                                    rows={2}
                                />
                                <button type="submit" className="absolute right-3 bottom-3 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!commentText.trim()}>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {comments.length > 0 ? comments.map(comment => {
                             const hasReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
                             return (
                            <div key={comment.id} className="group flex items-start space-x-3 animate-fade-in">
                                <img src={comment.author.avatarUrl} alt={comment.author.fullName} className="w-10 h-10 rounded-full object-cover border border-marrom-seiva/10" />
                                <div className="flex-1 bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl shadow-sm border border-marrom-seiva/5 dark:border-creme-velado/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-sans text-sm">
                                                <span className="font-bold text-verde-mata dark:text-creme-velado">{comment.author.fullName}</span>
                                                <span className="text-marrom-seiva/60 dark:text-creme-velado/60 ml-2 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                                            </p>
                                            <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/90 mt-1">{comment.body}</p>
                                        </div>
                                        {user?.id === comment.author.id && (
                                            <button onClick={() => { setCommentToDelete(comment); setIsConfirmDeleteCommentOpen(true); }} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                         <button onClick={() => handleCommentReaction(comment.id)} className={`flex items-center space-x-1 text-xs font-semibold ${hasReacted ? 'text-dourado-suave' : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'}`}>
                                            <HeartIcon className="w-4 h-4" filled={hasReacted} />
                                            <span>{comment.reactions?.length || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}) : (
                             <p className="text-center text-marrom-seiva/60 dark:text-creme-velado/60 italic py-8">Seja a primeira a comentar!</p>
                        )}
                    </div>
                </div>
            </div>
            
             {commentToDelete && (
                <ConfirmationModal
                    isOpen={isConfirmDeleteCommentOpen}
                    onClose={() => setIsConfirmDeleteCommentOpen(false)}
                    onConfirm={handleDeleteComment}
                    title="Excluir Comentário"
                    message="Tem certeza de que deseja excluir este comentário?"
                    confirmText="Excluir"
                />
            )}
        </div>
    );
}
