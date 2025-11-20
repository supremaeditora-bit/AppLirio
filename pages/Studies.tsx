import React, { useState, useEffect } from 'react';
import { getCommunityPosts, createCommunityPost, addReactionToPost, addCommentToPost, deleteCommentFromPost, addReactionToComment, getCommunityPostById, updateCommunityPost, deleteCommunityPost, getAppearanceSettings } from '../services/api';
import { CommunityPost, User, Comment, PageHeaderConfig } from '../types';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import { PrayingHandsIcon, ChatBubbleIcon, PaperAirplaneIcon, TrashIcon, HeartIcon, PencilIcon, PlusIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchAndFilter from '../components/SearchAndFilter';

interface StudiesProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
    setHasNotifications: (has: boolean) => void;
}

const filterOptions = [
    { value: 'recentes', label: 'Mais Recentes' },
    { value: 'populares', label: 'Mais Populares' },
];

export default function Studies({ user }: StudiesProps) {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);
    
    // Create/Edit Modal State
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostBody, setNewPostBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Delete Post State
    const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
    const [isConfirmDeletePostOpen, setIsConfirmDeletePostOpen] = useState(false);

    // States for comment modal
    const [viewingCommentsFor, setViewingCommentsFor] = useState<CommunityPost | null>(null);
    const [modalComment, setModalComment] = useState('');

    const [commentToDelete, setCommentToDelete] = useState<{postId: string, comment: Comment} | null>(null);
    const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('recentes');

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

    const fetchPosts = async () => {
        setIsLoading(true);
        const [postData, settings] = await Promise.all([
            getCommunityPosts('estudos'),
            getAppearanceSettings()
        ]);
        postData.forEach(post => post.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0)));
        setPosts(postData);
        if (settings.pageHeaders?.studies) {
            setHeaderConfig(settings.pageHeaders.studies);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        let results = [...posts];
        
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            results = results.filter(post => 
                post.title.toLowerCase().includes(lowercasedQuery) ||
                post.body.toLowerCase().includes(lowercasedQuery)
            );
        }

        if (activeFilter === 'recentes') {
            results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (activeFilter === 'populares') {
            results.sort((a, b) => (b.reactions.length + b.comments.length) - (a.reactions.length + a.comments.length));
        }
        
        setFilteredPosts(results);
    }, [searchQuery, activeFilter, posts]);

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setNewPostTitle('');
        setNewPostBody('');
        setEditingPost(null);
    };
    
    const handleOpenEdit = (post: CommunityPost) => {
        setEditingPost(post);
        setNewPostTitle(post.title);
        setNewPostBody(post.body);
        setCreateModalOpen(true);
    };

    const handleSubmitPost = async () => {
        if (!newPostTitle || !newPostBody || !user) return;
        
        setIsSubmitting(true);
        try {
            if (editingPost) {
                 await updateCommunityPost(editingPost.id, {
                    title: newPostTitle,
                    body: newPostBody
                });
            } else {
                await createCommunityPost({
                    room: 'estudos',
                    title: newPostTitle,
                    body: newPostBody,
                    authorId: user.id
                });
            }
            handleCloseModal();
            fetchPosts(); 
        } catch (error) {
            console.error("Failed to save study post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenConfirmDeletePost = (post: CommunityPost) => {
        setPostToDelete(post);
        setIsConfirmDeletePostOpen(true);
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;
        await deleteCommunityPost(postToDelete.id);
        setIsConfirmDeletePostOpen(false);
        setPostToDelete(null);
        fetchPosts();
    };

    const handleOpenConfirmDeleteComment = (postId: string, comment: Comment) => {
        setCommentToDelete({ postId, comment });
        setIsConfirmDeleteCommentOpen(true);
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;
        
        // Optimistic update for comment deletion
        if (viewingCommentsFor && viewingCommentsFor.id === commentToDelete.postId) {
            setViewingCommentsFor(prev => prev ? ({
                ...prev,
                comments: prev.comments.filter(c => c.id !== commentToDelete.comment.id)
            }) : null);
        }

        // Also update main posts list optimistically
        setPosts(prev => prev.map(p => {
            if (p.id === commentToDelete.postId) {
                return { ...p, comments: p.comments.filter(c => c.id !== commentToDelete.comment.id) };
            }
            return p;
        }));

        await deleteCommentFromPost(commentToDelete.postId, commentToDelete.comment.id);
        setIsConfirmDeleteCommentOpen(false);
        setCommentToDelete(null);
        
        // Re-fetch silently
        const updatedPost = await getCommunityPostById(commentToDelete.postId);
        if (updatedPost) {
            updatedPost.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
             // Sync state if needed, but usually optimistic is enough for UX
        }
    };

    const handleReaction = async (postId: string) => {
        if (!user) return;
        
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const hasReacted = p.reactions.some(r => r.userId === user.id);
                const newReactions = hasReacted 
                    ? p.reactions.filter(r => r.userId !== user.id)
                    : [...p.reactions, { userId: user.id }];
                return { ...p, reactions: newReactions };
            }
            return p;
        }));
        await addReactionToPost(postId, user.id);
    };
    
    const handleCommentReaction = async (postId: string, commentId: string) => {
        if (!user) return;
        
        await addReactionToComment(postId, commentId, user.id);

        const updatedPost = await getCommunityPostById(postId);
        if (updatedPost) {
            updatedPost.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
            if (viewingCommentsFor?.id === postId) {
                setViewingCommentsFor(updatedPost);
            }
            setPosts(posts.map(p => p.id === postId ? updatedPost : p));
        }
    };

    const handleComment = async (postId: string) => {
        if (!modalComment.trim() || !user) return;
        const currentCommentText = modalComment;
        setModalComment(''); // Clear input immediately to show responsiveness

        // 1. Create Optimistic Comment
        const optimisticComment: Comment = {
            id: crypto.randomUUID(), // Temporary ID
            body: currentCommentText,
            author: {
                id: user.id,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl
            },
            createdAt: new Date().toISOString(),
            reactions: []
        };

        // 2. Update Modal State (Optimistic)
        // Use functional update to ensure we are working with the latest state
        if (viewingCommentsFor && viewingCommentsFor.id === postId) {
            setViewingCommentsFor(prev => prev ? ({
                ...prev,
                comments: [...prev.comments, optimisticComment]
            }) : null);
        }

        // 3. Update List State (Optimistic)
        setPosts(prevPosts => prevPosts.map(p => {
             if (p.id === postId) {
                 return { ...p, comments: [...p.comments, optimisticComment] };
             }
             return p;
        }));

        // 4. Send to Backend
        try {
            await addCommentToPost(postId, currentCommentText, user);

            // 5. Background Re-fetch to get real ID
            // We don't await this to unblock the UI, but it will update eventually
            getCommunityPostById(postId).then(updatedPost => {
                if (updatedPost) {
                    updatedPost.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
                    
                    // Only update if we are still viewing the same post to avoid glitches
                    setViewingCommentsFor(current => current?.id === postId ? updatedPost : current);
                    
                    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
                }
            });

        } catch (error) {
            console.error("Failed to post comment", error);
            // Ideally show error toast here
        }
    };

    const handleCloseCommentModal = () => {
        setViewingCommentsFor(null);
        setModalComment('');
    }

    return (
        <>
        <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
            {/* Hero Header */}
            <div className="relative h-[40vh] sm:h-[50vh] w-full">
                <img 
                    src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1373&auto=format&fit=crop"}
                    alt="Estudos Bíblicos" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
                
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-verde-mata/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-20 text-verde-mata dark:text-dourado-suave flex items-center gap-2 font-semibold text-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Iniciar Discussão</span>
                </button>

                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                    <div className="container mx-auto">
                        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                            {headerConfig?.title || "Grupos de Estudo"}
                        </h1>
                        <p className="text-marrom-seiva/80 dark:text-creme-velado/90 mt-2 text-lg max-w-xl font-sans font-medium drop-shadow-md">
                            {headerConfig?.subtitle || "Debata a Palavra, compartilhe insights e cresça em comunhão."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 sm:p-8">
                <SearchAndFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    filterOptions={filterOptions}
                    searchPlaceholder="Buscar por tópicos de estudo..."
                />

                {isLoading ? (
                    <div className="flex justify-center items-center py-20"><Spinner /></div>
                ) : (
                    <div className="space-y-6">
                        {filteredPosts.length > 0 ? filteredPosts.map(post => {
                            const hasReacted = user ? post.reactions.some(r => r.userId === user.id) : false;
                            const canManage = user && (user.id === post.authorId || user.role === 'admin' || user.role === 'mentora');
                            
                            return (
                                <div key={post.id} className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            {post.author && (
                                                <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-12 h-12 rounded-full object-cover mr-4"/>
                                            )}
                                            <div>
                                                <h2 className="font-serif text-xl font-semibold text-verde-mata dark:text-creme-velado">{post.title}</h2>
                                                {post.author && (
                                                    <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">
                                                        Por {post.author.fullName} • {formatTimeAgo(post.createdAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleOpenEdit(post)} className="p-2 text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleOpenConfirmDeletePost(post)} className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="mt-4 font-sans text-marrom-seiva dark:text-creme-velado/90 leading-relaxed">{post.body}</p>
                                    <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex items-center space-x-4">
                                        <button 
                                            onClick={() => handleReaction(post.id)}
                                            className={`flex items-center space-x-2 font-sans text-sm font-semibold transition-colors duration-200 ${
                                                hasReacted 
                                                ? 'text-dourado-suave' 
                                                : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'
                                            }`}
                                        >
                                            <PrayingHandsIcon className="w-5 h-5" />
                                            <span>{post.reactions.length} Apoios</span>
                                        </button>
                                         <button onClick={() => setViewingCommentsFor(post)} className="flex items-center space-x-2 font-sans text-sm font-semibold text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave">
                                            <ChatBubbleIcon className="w-5 h-5" />
                                            <span>{post.comments.length > 0 ? `Ver ${post.comments.length} comentário(s)` : 'Comentar'}</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        }) : (
                             <div className="text-center py-10 text-marrom-seiva/70 dark:text-creme-velado/70">
                                Nenhuma discussão encontrada.
                            </div>
                        )}
                    </div>
                )}
                 <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal} title={editingPost ? "Editar Tópico" : "Criar Tópico de Estudo"}>
                    <div className="space-y-4">
                        <InputField id="postTitle" label="Título" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
                        <InputField id="postBody" label="Mensagem" type="textarea" value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSubmitPost} disabled={isSubmitting}>
                            {isSubmitting ? <Spinner variant="button" /> : (editingPost ? 'Salvar Alterações' : 'Publicar')}
                        </Button>
                    </div>
                 </Modal>
            </div>
        </div>
         {viewingCommentsFor && user && (
                <Modal 
                    isOpen={!!viewingCommentsFor} 
                    onClose={handleCloseCommentModal} 
                    title={`Comentários`}
                >
                    <div className="flex flex-col h-[70vh] -m-6 sm:-m-8 bg-creme-velado dark:bg-verde-escuro-profundo">
                        {/* Post content / Header - Fixed at top */}
                        <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0 bg-branco-nevoa dark:bg-verde-mata z-10">
                            <div className="flex items-start">
                                <img src={viewingCommentsFor.author?.avatarUrl} alt={viewingCommentsFor.author?.fullName} className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"/>
                                <div className="overflow-hidden">
                                    <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado truncate">{viewingCommentsFor.title}</h3>
                                    <p className="font-sans text-sm mt-1 text-marrom-seiva/80 dark:text-creme-velado/80 line-clamp-2">{viewingCommentsFor.body}</p>
                                </div>
                            </div>
                        </div>

                        {/* Comments list - Scrollable Middle */}
                        {/* Added min-h-0 to ensure flex child scrolls properly inside flex parent */}
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 sm:px-8 space-y-4 bg-creme-velado/50 dark:bg-verde-escuro-profundo/50">
                            {viewingCommentsFor.comments.length > 0 ? viewingCommentsFor.comments.map(comment => {
                                const hasCommentReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
                                return (
                                <div key={comment.id} className="group flex items-start space-x-3">
                                    <img src={comment.author.avatarUrl} alt={comment.author.fullName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-branco-nevoa dark:bg-verde-mata p-3 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-sans text-sm">
                                                        <span className="font-bold text-verde-mata dark:text-creme-velado">{comment.author.fullName}</span>
                                                    </p>
                                                    <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/90 mt-1 whitespace-pre-wrap break-words">{comment.body}</p>
                                                </div>
                                                {user?.id === comment.author.id && (
                                                    <button onClick={() => handleOpenConfirmDeleteComment(viewingCommentsFor.id, comment)} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-4 px-1">
                                            <span className="text-xs text-marrom-seiva/60 dark:text-creme-velado/60">{formatTimeAgo(comment.createdAt)}</span>
                                            <button onClick={() => handleCommentReaction(viewingCommentsFor.id, comment.id)} className={`flex items-center space-x-1 text-xs font-semibold ${hasCommentReacted ? 'text-dourado-suave' : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'}`}>
                                                <HeartIcon className="w-3.5 h-3.5" filled={hasCommentReacted} />
                                                <span>{comment.reactions?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}) : <p className="text-center text-sm text-marrom-seiva/70 dark:text-creme-velado/70 py-8">Nenhum comentário ainda. Seja a primeira a participar!</p>}
                        </div>

                        {/* Comment form - Fixed at bottom */}
                        <div className="px-6 py-4 sm:px-8 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0 bg-branco-nevoa dark:bg-verde-mata rounded-b-2xl z-10">
                            <form onSubmit={(e) => { e.preventDefault(); handleComment(viewingCommentsFor.id); }} className="flex items-center space-x-3">
                                <img src={user.avatarUrl} alt={user.fullName} className="w-9 h-9 rounded-full object-cover flex-shrink-0"/>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Participe da conversa..."
                                        value={modalComment}
                                        onChange={(e) => setModalComment(e.target.value)}
                                        className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-full py-2.5 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!modalComment.trim()}>
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            )}

         {commentToDelete && (
            <ConfirmationModal
                isOpen={isConfirmDeleteCommentOpen}
                onClose={() => setIsConfirmDeleteCommentOpen(false)}
                onConfirm={handleDeleteComment}
                title="Excluir Comentário"
                message="Tem certeza de que deseja excluir este comentário? Esta ação não pode ser desfeita."
                confirmText="Excluir"
            />
        )}
        
        {postToDelete && (
            <ConfirmationModal
                isOpen={isConfirmDeletePostOpen}
                onClose={() => setIsConfirmDeletePostOpen(false)}
                onConfirm={handleDeletePost}
                title="Excluir Tópico"
                message={`Tem certeza de que deseja excluir o tópico "${postToDelete.title}"?`}
                confirmText="Excluir"
            />
        )}
        </>
    );
}