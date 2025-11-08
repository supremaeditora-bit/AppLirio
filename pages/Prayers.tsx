import React, { useState, useEffect } from 'react';
// FIX: Added 'prayForPost' to imports to resolve missing member error.
import { getCommunityPosts, createCommunityPost, addReactionToPost, addCommentToPost, updateCommunityPost, deleteCommunityPost, deleteCommentFromPost, addReactionToComment, prayForPost } from '../services/api';
import { CommunityPost, User, Comment } from '../types';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import { PrayingHandsIcon, ChatBubbleIcon, PencilIcon, TrashIcon, PaperAirplaneIcon, HeartIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchAndFilter from '../components/SearchAndFilter';

interface PrayersProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const filterOptions = [
    { value: 'recentes', label: 'Mais Recentes' },
    { value: 'populares', label: 'Mais Populares' },
];

export default function Prayers({ user, onUserUpdate }: PrayersProps) {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostBody, setNewPostBody] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [commentText, setCommentText] = useState('');
    
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
    const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
    const [isConfirmDeletePostOpen, setIsConfirmDeletePostOpen] = useState(false);
    
    const [commentToDelete, setCommentToDelete] = useState<{postId: string, comment: Comment} | null>(null);
    const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('recentes');

    const ANONYMOUS_AVATAR = `https://api.dicebear.com/8.x/initials/svg?seed=A`;

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
        const postData = await getCommunityPosts('oracao');
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
            results.sort((a, b) => ((b.prayedBy?.length || 0) + b.comments.length) - ((a.prayedBy?.length || 0) + a.comments.length));
        }
        
        setFilteredPosts(results);
    }, [searchQuery, activeFilter, posts]);

    const handleOpenForm = (post: CommunityPost | null) => {
        setEditingPost(post);
        if (post) {
            setNewPostTitle(post.title);
            setNewPostBody(post.body);
            setIsAnonymous(post.isAnonymous || false);
        } else {
            setNewPostTitle('');
            setNewPostBody('');
            setIsAnonymous(false);
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPost(null);
        setNewPostTitle('');
        setNewPostBody('');
        setIsAnonymous(false);
    };

    const handleFormSubmit = async () => {
        if (!newPostTitle || !newPostBody || !user) return;
        
        setIsSubmitting(true);
        try {
            if (editingPost) {
                await updateCommunityPost(editingPost.id, {
                    title: newPostTitle,
                    body: newPostBody,
                    isAnonymous: isAnonymous
                });
            } else {
                const updatedUser = await createCommunityPost({
                    room: 'oracao',
                    title: newPostTitle,
                    body: newPostBody,
                    authorId: user.id,
                    isAnonymous: isAnonymous
                });
                if(updatedUser) onUserUpdate(updatedUser);
            }
            handleCloseForm();
            fetchPosts();
        } catch (error) {
            console.error("Failed to submit post", error);
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
        await deleteCommentFromPost(commentToDelete.postId, commentToDelete.comment.id);
        setIsConfirmDeleteCommentOpen(false);
        setCommentToDelete(null);
        fetchPosts();
    };


    const handlePray = async (postId: string) => {
        if (!user) return;

        const updatedUser = await prayForPost(postId, user.id);
        if(updatedUser) onUserUpdate(updatedUser);
        
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const alreadyPrayed = p.prayedBy?.includes(user.id);
                if (alreadyPrayed) return p; // Can only pray once
                return { ...p, prayedBy: [...(p.prayedBy || []), user.id] };
            }
            return p;
        }));
    };

    const handleComment = async (postId: string) => {
        if (!commentText.trim() || !user) return;
        const currentComment = commentText;
        setCommentText('');
        const updatedUser = await addCommentToPost(postId, currentComment, user);
        if(updatedUser) onUserUpdate(updatedUser);
        fetchPosts();
    };

    const handleCommentReaction = async (postId: string, commentId: string) => {
        if (!user) return;
        
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                const updatedComments = p.comments.map(c => {
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
                updatedComments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
                return { ...p, comments: updatedComments };
            }
            return p;
        });
        setPosts(updatedPosts);

        await addReactionToComment(postId, commentId, user.id);
    };

    return (
        <>
            <div className="container mx-auto p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave">Pedidos de Oração</h1>
                    <Button onClick={() => handleOpenForm(null)} variant="primary" className="mt-4 sm:mt-0">Fazer um Pedido</Button>
                </div>

                <SearchAndFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    filterOptions={filterOptions}
                    searchPlaceholder="Buscar por pedidos..."
                />

                {isLoading ? (
                    <div className="flex justify-center items-center py-20"><Spinner /></div>
                ) : (
                    <div className="space-y-6">
                        {filteredPosts.length > 0 ? filteredPosts.map(post => {
                            const hasPrayed = user ? post.prayedBy?.includes(user.id) : false;
                            const canManage = user && (user.id === post.author.id || user.role === 'admin' || user.role === 'mentora');
                            const postAuthor = post.isAnonymous ? { name: 'Usuária Anônima', avatarUrl: ANONYMOUS_AVATAR } : post.author;

                            return (
                                <div key={post.id} className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <img src={postAuthor.avatarUrl} alt={postAuthor.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                                            <div>
                                                <h2 className="font-serif text-xl font-semibold text-verde-mata dark:text-creme-velado">{post.title}</h2>
                                                <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">
                                                    Por {postAuthor.name} • {formatTimeAgo(post.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleOpenForm(post)} className="p-2 text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave">
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
                                            onClick={() => handlePray(post.id)}
                                            disabled={hasPrayed}
                                            className={`flex items-center space-x-2 font-sans text-sm font-semibold transition-colors duration-200 ${
                                                hasPrayed 
                                                ? 'text-dourado-suave' 
                                                : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <PrayingHandsIcon className="w-5 h-5" />
                                            <span>{post.prayedBy?.length || 0} Orações</span>
                                        </button>
                                        <div className="flex items-center space-x-2 font-sans text-sm font-semibold text-marrom-seiva/60 dark:text-creme-velado/60">
                                            <ChatBubbleIcon className="w-5 h-5" />
                                            <span>{post.comments.length} Comentários</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {post.comments.map(comment => {
                                            const hasCommentReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
                                            return (
                                            <div key={comment.id} className="group flex items-start space-x-3 bg-creme-velado dark:bg-verde-escuro-profundo p-3 rounded-lg">
                                                <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-sans text-sm">
                                                                <span className="font-bold text-verde-mata dark:text-creme-velado">{comment.author.name}</span>
                                                                <span className="text-marrom-seiva/60 dark:text-creme-velado/60 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                                                            </p>
                                                            <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/90">{comment.body}</p>
                                                        </div>
                                                        {user?.id === comment.author.id && (
                                                            <button onClick={() => handleOpenConfirmDeleteComment(post.id, comment)} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <button onClick={() => handleCommentReaction(post.id, comment.id)} className={`flex items-center space-x-1 text-xs font-semibold ${hasCommentReacted ? 'text-dourado-suave' : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave'}`}>
                                                            <HeartIcon className="w-4 h-4" filled={hasCommentReacted} />
                                                            <span>{comment.reactions?.length || 0}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                    {user && (
                                        <form onSubmit={(e) => { e.preventDefault(); handleComment(post.id); }} className="mt-4 flex items-center space-x-3">
                                            <img src={user.avatarUrl} alt={user.displayName} className="w-9 h-9 rounded-full object-cover"/>
                                            <div className="flex-1 relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="Deixe uma palavra de encorajamento..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    className="w-full font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-full py-2 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave"
                                                />
                                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!commentText.trim()}>
                                                    <PaperAirplaneIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )
                        }) : (
                            <div className="text-center py-10 text-marrom-seiva/70 dark:text-creme-velado/70">
                                Nenhum pedido de oração encontrado.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingPost ? 'Editar Pedido de Oração' : 'Criar Pedido de Oração'}>
                <div className="space-y-4">
                    <InputField id="postTitle" label="Título do Pedido" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
                    <InputField id="postBody" label="Descreva seu pedido" type="textarea" value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} />
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isAnonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-dourado-suave focus:ring-dourado-suave"
                        />
                        <label htmlFor="isAnonymous" className="ml-2 block text-sm font-sans text-marrom-seiva dark:text-creme-velado/80">
                            Publicar anonimamente
                        </label>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={handleCloseForm} disabled={isSubmitting}>Cancelar</Button>
                    <Button variant="primary" onClick={handleFormSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner variant="button" /> : (editingPost ? 'Salvar Alterações' : 'Publicar')}
                    </Button>
                </div>
            </Modal>
            
            {postToDelete && (
                <ConfirmationModal
                    isOpen={isConfirmDeletePostOpen}
                    onClose={() => setIsConfirmDeletePostOpen(false)}
                    onConfirm={handleDeletePost}
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir o pedido "${postToDelete.title}"?`}
                    confirmText="Excluir"
                />
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