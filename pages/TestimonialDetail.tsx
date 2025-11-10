import React, { useState, useEffect } from 'react';
import { getCommunityPostById, addReactionToPost, addCommentToPost, saveTestimonial, deleteCommentFromPost, addReactionToComment } from '../services/api';
import { CommunityPost, User, Page, Comment } from '../types';
import Spinner from '../components/Spinner';
import { ChevronLeftIcon, HeartIcon, ChatBubbleIcon, ShareIcon, BookmarkIcon, PaperAirplaneIcon, TrashIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

interface TestimonialDetailProps {
  id: string;
  user: User | null;
  onNavigate: (page: Page) => void;
}

export default function TestimonialDetail({ id, user, onNavigate }: TestimonialDetailProps) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  
  const [commentToDelete, setCommentToDelete] = useState<{postId: string, comment: Comment} | null>(null);
  const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] = useState(false);

  const fetchPost = async () => {
    setIsLoading(true);
    const postData = await getCommunityPostById(id);
    if (postData) {
        postData.comments.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    }
    setPost(postData || null);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleReaction = async () => {
    if (!user || !post) return;
    const originalReactions = [...post.reactions];
    const hasReacted = originalReactions.some(r => r.userId === user.id);
    const newReactions = hasReacted
        ? originalReactions.filter(r => r.userId !== user.id)
        : [...originalReactions, { userId: user.id }];
    
    setPost({ ...post, reactions: newReactions });

    try {
        await addReactionToPost(post.id, user.id);
    } catch (error) {
        console.error("Failed to add reaction", error);
        setPost({ ...post, reactions: originalReactions }); // Revert on failure
    }
  };

  const handleSave = async () => {
      if (!user || !post) return;
      const originalSavedBy = [...(post.savedBy || [])];
      const hasSaved = originalSavedBy.includes(user.id);
      const newSavedBy = hasSaved ? originalSavedBy.filter(uid => uid !== user.id) : [...originalSavedBy, user.id];
      setPost({ ...post, savedBy: newSavedBy });
      try {
          await saveTestimonial(post.id, user.id);
      } catch (error) {
          console.error("Failed to save", error);
          setPost({ ...post, savedBy: originalSavedBy });
      }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !post) return;
    const currentComment = commentText;
    setCommentText('');
    await addCommentToPost(post.id, currentComment, user);
    fetchPost(); // Re-fetch to get all comments including the new one
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
      fetchPost();
  };
  
  const handleCommentReaction = async (commentId: string) => {
    if (!user || !post) return;

    const updatedComments = post.comments.map(c => {
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

    setPost({ ...post, comments: updatedComments });

    await addReactionToComment(post.id, commentId, user.id);
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
    return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  }

  if (!post) {
    return <div className="text-center p-8">Testemunho não encontrado.</div>;
  }

  const hasReacted = user ? post.reactions.some(r => r.userId === user.id) : false;
  const hasSaved = user ? post.savedBy?.includes(user.id) : false;

  return (
    <>
    <div className="bg-creme-velado/40 dark:bg-verde-escuro-profundo/40 min-h-full">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-creme-velado/80 dark:bg-verde-mata/80 backdrop-blur-md">
            <button onClick={() => onNavigate('testimonials')} className="p-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-lg font-bold text-verde-mata dark:text-dourado-suave truncate px-4">{post.title}</h1>
            <div className="w-10"></div>
        </header>

        <main className="max-w-3xl mx-auto p-4 sm:p-8">
            <div className="bg-branco-nevoa dark:bg-verde-mata p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                        <p className="font-sans font-semibold text-verde-mata dark:text-creme-velado">{post.author.name}</p>
                        <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>

                {post.imageUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden my-6">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover"/>
                    </div>
                )}
                
                <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave">{post.title}</h2>
                <p className="font-sans text-marrom-seiva dark:text-creme-velado/90 mt-4 whitespace-pre-wrap leading-relaxed">
                    {post.body}
                </p>

                <div className="mt-6 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex items-center justify-between text-marrom-seiva/70 dark:text-creme-velado/70">
                    <div className="flex items-center space-x-6">
                        <button onClick={handleReaction} className={`flex items-center space-x-1.5 hover:text-dourado-suave transition-colors ${hasReacted ? 'text-dourado-suave' : ''}`}>
                            <HeartIcon className="w-5 h-5" filled={hasReacted} />
                            <span className="font-sans text-sm font-semibold">{post.reactions.length} Améns</span>
                        </button>
                        <div className="flex items-center space-x-1.5">
                            <ChatBubbleIcon className="w-5 h-5" />
                            <span className="font-sans text-sm font-semibold">{post.comments.length} Comentários</span>
                        </div>
                    </div>
                     <div className="flex items-center space-x-4">
                        <button onClick={handleSave} className={`hover:text-dourado-suave transition-colors ${hasSaved ? 'text-dourado-suave' : ''}`}>
                            <BookmarkIcon className="w-5 h-5" filled={hasSaved}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave mb-4">Comentários</h3>
                
                {user && (
                    <form onSubmit={handleComment} className="mb-6 flex items-start space-x-3">
                        <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover"/>
                        <div className="flex-1 relative">
                            <textarea 
                                placeholder="Deixe uma palavra de encorajamento..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave"
                                rows={3}
                            />
                             <button type="submit" className="absolute right-3 bottom-3 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!commentText.trim()}>
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    {post.comments.map(comment => {
                        const hasReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
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
                                        <button onClick={() => handleOpenConfirmDeleteComment(post.id, comment)} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
                    )})}
                </div>
            </div>
        </main>
    </div>
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