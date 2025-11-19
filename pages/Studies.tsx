import React, { useState, useEffect } from 'react';
import { getCommunityPosts, createCommunityPost, addReactionToPost, addCommentToPost, deleteCommentFromPost, addReactionToComment, getCommunityPostById } from '../services/api';
import { CommunityPost, User, Comment } from '../types';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import { PrayingHandsIcon, ChatBubbleIcon, PaperAirplaneIcon, TrashIcon, HeartIcon } from '../components/Icons';
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
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostBody, setNewPostBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const postData = await getCommunityPosts('estudos');
        postData.forEach(post => post.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0)));
        setPosts(postData);
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
    };

    const handleCreatePost = async () => {
        if (!newPostTitle || !newPostBody || !user) return;
        
        setIsSubmitting(true);
        try {
            await createCommunityPost({
                room: 'estudos',
                title: newPostTitle,
                body: newPostBody,
                authorId: user.id
            });
            handleCloseModal();
            fetchPosts(); 
        } catch (error) {
            console.error("Failed to create study post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenConfirmDeleteComment = (postId: string, comment: Comment) => {
        setCommentToDelete({ postId, comment });
        setIsConfirmDeleteCommentOpen(true);
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;
        await deleteCommentFromPost(commentToDelete.postId, commentToDelete.comment.id);
        setIsConfirmDeleteCommentOpen(false);
        setCommentToDelete(null);
        
        const updatedPost = await getCommunityPostById(commentToDelete.postId);
        if (updatedPost) {
            updatedPost.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
            setViewingCommentsFor(updatedPost);
            setPosts(posts.map(p => p.id === commentToDelete.postId ? updatedPost : p));
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
            setViewingCommentsFor(updatedPost);
            setPosts(posts.map(p => p.id === postId ? updatedPost : p));
        }
    };

    const handleComment = async (postId: string) => {
        if (!modalComment.trim() || !user) return;
        const currentComment = modalComment;
        setModalComment('');
        await addCommentToPost(postId, currentComment, user);

        const updatedPost = await getCommunityPostById(postId);
        if (updatedPost) {
            updatedPost.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
            setViewingCommentsFor(updatedPost);
            setPosts(posts.map(p => p.id === postId ? updatedPost : p));
        }
    };

    const handleCloseCommentModal = () => {
        setViewingCommentsFor(null);
        setModalComment('');
    }

    return (
        <>
        <div className="container mx-auto p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave">Grupos de Estudo</h1>
                <Button onClick={() => setCreateModalOpen(true)} variant="primary" className="mt-4 sm:mt-0">Iniciar Discussão</Button>
            </div>
            
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
                        return (
                            <div key={post.id} className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
                                {post.author && (
                                    <div className="flex items-start">
                                        <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-12 h-12 rounded-full object-cover mr-4"/>
                                        <div>
                                            <h2 className="font-serif text-xl font-semibold text-verde-mata dark:text-creme-velado">{post.title}</h2>
                                            <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">
                                                Por {post.author.fullName} • {formatTimeAgo(post.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
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
             <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal} title="Criar Tópico de Estudo">
                <div className="space-y-4">
                    <InputField id="postTitle" label="Título" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
                    <InputField id="postBody" label="Mensagem" type="textarea" value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} />
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancelar</Button>
                    <Button variant="primary" onClick={handleCreatePost} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner variant="button" /> : 'Publicar'}
                    </Button>
                </div>
             </Modal>
        </div>
         {viewingCommentsFor && user && (
                <Modal 
                    isOpen={!!viewingCommentsFor} 
                    onClose={handleCloseCommentModal} 
                    title={`Comentários`}
                >
                    <div className="flex flex-col" style={{height: '70vh'}}>
                        {/* Post content */}
                        <div className="p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0">
                            <div className="flex items-start">
                                <img src={viewingCommentsFor.author?.avatarUrl} alt={viewingCommentsFor.author?.fullName} className="w-10 h-10 rounded-full object-cover mr-3"/>
                                <div>
                                    <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado">{viewingCommentsFor.title}</h3>
                                    <p className="font-sans text-sm mt-1 text-marrom-seiva/80 dark:text-creme-velado/80">{viewingCommentsFor.body}</p>
                                </div>
                            </div>
                        </div>

                        {/* Comments list */}
                        <div className="flex-1 overflow-y-auto space-y-4 p-4">
                            {viewingCommentsFor.comments.length > 0 ? viewingCommentsFor.comments.map(comment => {
                                const hasCommentReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
                                return (
                                <div key={comment.id} className="group flex items-start space-x-3">
                                    <img src={comment.author.avatarUrl} alt={comment.author.fullName} className="w-8 h-8 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <div className="bg-creme-velado dark:bg-verde-escuro-profundo p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-sans text-sm">
                                                        <span className="font-bold text-verde-mata dark:text-creme-velado">{comment.author.fullName}</span>
                                                    </p>
                                                    <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/90 mt-1">{comment.body}</p>
                                                </div>
                                                {user?.id === comment.author.id && (
                                                    <button onClick={() => handleOpenConfirmDeleteComment(viewingCommentsFor.id, comment)} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-4">
                                            <span className="text-xs text-marrom-seiva/60 dark:text-creme-velado/60">{formatTimeAgo(comment.createdAt)}</span>
                                            <button onClick={() => handleCommentReaction(viewingCommentsFor.id, comment.id)} className={`flex items-center space-x-1 text-xs font-semibold ${hasCommentReacted ? 'text-dourado-suave' : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'}`}>
                                                <HeartIcon className="w-4 h-4" filled={hasCommentReacted} />
                                                <span>{comment.reactions?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}) : <p className="text-center text-sm text-marrom-seiva/70 dark:text-creme-velado/70 py-8">Nenhum comentário ainda. Seja a primeira a participar!</p>}
                        </div>

                        {/* Comment form */}
                        <div className="p-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0">
                            <form onSubmit={(e) => { e.preventDefault(); handleComment(viewingCommentsFor.id); }} className="flex items-center space-x-3">
                                <img src={user.avatarUrl} alt={user.fullName} className="w-9 h-9 rounded-full object-cover"/>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Participe da conversa..."
                                        value={modalComment}
                                        onChange={(e) => setModalComment(e.target.value)}
                                        className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-full py-2 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
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
        </>
    );
}