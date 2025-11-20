
import React, { useState, useEffect } from 'react';
import { LiveSession, User, Comment } from '../types';
import { getLiveSessions, deleteLiveSession, addReactionToLiveSession, addCommentToLiveSession, addReactionToLiveComment, deleteCommentFromLiveSession } from '../services/api';
import Spinner from '../components/Spinner';
import { PlayCircleIcon, PencilIcon, TrashIcon, PlusIcon, HeartIcon, ChatBubbleIcon, PaperAirplaneIcon } from '../components/Icons';
import VideoPlayer from '../components/VideoPlayer';
import Button from '../components/Button';
import LiveForm from '../components/LiveForm';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchAndFilter from '../components/SearchAndFilter';

interface LiveSessionCardProps {
  session: LiveSession;
  onSelect: (session: LiveSession) => void;
  isSelected: boolean;
  canManage: boolean;
  onEdit: (session: LiveSession) => void;
  onDelete: (session: LiveSession) => void;
}

const LiveSessionCard: React.FC<LiveSessionCardProps> = ({ session, onSelect, isSelected, canManage, onEdit, onDelete }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${session.youtubeId}/mqdefault.jpg`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className={`relative bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-lg overflow-hidden group w-full transition-all duration-300 ${isSelected ? 'ring-2 ring-dourado-suave scale-105' : 'hover:shadow-xl'}`}>
      <button onClick={() => onSelect(session)} className="w-full text-left">
        <div className="relative aspect-video">
          <img src={thumbnailUrl} alt={session.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircleIcon className="w-12 h-12 text-white/80 group-hover:text-white transition-colors" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-serif font-bold text-verde-mata dark:text-dourado-suave line-clamp-2">{session.title}</h3>
          <p className="font-sans text-xs text-marrom-seiva/80 dark:text-creme-velado/80 mt-1">
            {formatDate(session.scheduledAt)}
          </p>
        </div>
      </button>
      {canManage && (
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(session)} className="p-2 bg-creme-velado/80 dark:bg-verde-mata/80 rounded-full text-verde-mata dark:text-creme-velado hover:scale-110">
                <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(session)} className="p-2 bg-creme-velado/80 dark:bg-verde-mata/80 rounded-full text-red-500 hover:scale-110">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
      )}
    </div>
  );
};

interface LivesProps {
  user: User | null;
}

const filterOptions = [
    { value: 'proximas', label: 'Próximas Lives' },
    { value: 'passadas', label: 'Lives Passadas' },
];

export default function Lives({ user }: LivesProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<LiveSession | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('proximas');

  const [commentText, setCommentText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<{sessionId: string, comment: Comment} | null>(null);
  const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  const canManage = user && (user.role === 'admin' || user.role === 'mentora');

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

  const fetchSessions = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const data = await getLiveSessions();
    data.forEach(s => s.comments.sort((a,b) => (b.reactions?.length || 0) - (a.reactions?.length || 0)));
    setSessions(data);

    // Update selectedSession with fresh data if it exists
    if (selectedSession) {
        const freshSelected = data.find(s => s.id === selectedSession.id);
        if (freshSelected) {
            setSelectedSession(freshSelected);
        }
    } else {
        // Only auto-select if nothing is selected
        const liveSession = data.find(s => s.status === 'live');
        if (liveSession) {
            setSelectedSession(liveSession);
        } else {
            const defaultSession = data.find(s => s.status !== 'past') || data[0] || null;
            setSelectedSession(defaultSession);
        }
    }
    
    if (showLoading) setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);
  
  useEffect(() => {
    let results = [...sessions];
    
    if (activeFilter === 'proximas') {
        results = results.filter(s => s.status !== 'past').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    } else if (activeFilter === 'passadas') {
        results = results.filter(s => s.status === 'past').sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    }
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(session => 
            session.title.toLowerCase().includes(lowercasedQuery) ||
            session.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    setFilteredSessions(results);
  }, [searchQuery, activeFilter, sessions]);

  const handleOpenForm = (session: LiveSession | null) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
    fetchSessions();
  };

  const handleOpenConfirm = (session: LiveSession) => {
    setSessionToDelete(session);
    setIsConfirmOpen(true);
  };
  
  const handleDelete = async () => {
    if (sessionToDelete) {
      await deleteLiveSession(sessionToDelete.id);
      setIsConfirmOpen(false);
      if (selectedSession?.id === sessionToDelete.id) {
        setSelectedSession(null);
      }
      setSessionToDelete(null);
      fetchSessions();
    }
  };
  
  const handleReaction = async () => {
    if (!user || !selectedSession) return;
    
    const updatedSession = { ...selectedSession };
    const hasReacted = updatedSession.reactions.some(r => r.userId === user.id);
    if (hasReacted) {
        updatedSession.reactions = updatedSession.reactions.filter(r => r.userId !== user.id);
    } else {
        updatedSession.reactions.push({ userId: user.id });
    }

    setSelectedSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));

    await addReactionToLiveSession(selectedSession.id, user.id);
    // Don't re-fetch immediately to avoid race conditions
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !selectedSession) return;
    
    const currentCommentText = commentText;
    setCommentText(''); // Clear input immediately
    setIsPostingComment(true);

    // 1. Create Optimistic Comment
    const newComment: Comment = {
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

    // 2. Update State Optimistically
    const updatedSession = {
        ...selectedSession,
        comments: [...selectedSession.comments, newComment]
    };
    
    setSelectedSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === selectedSession.id ? updatedSession : s));

    try {
        await addCommentToLiveSession(selectedSession.id, currentCommentText, user);
        // Do NOT re-fetch immediately. 
        // The local state is the "truth" for the user now. 
        // A background re-fetch can happen later or on page reload.
    } catch (error) {
        console.error("Failed to post comment", error);
        // Ideally, show an error toast here and maybe remove the optimistic comment
    } finally {
        setIsPostingComment(false);
    }
  };
  
  const handleCommentReaction = async (commentId: string) => {
    if (!user || !selectedSession) return;

    const updatedSession = { ...selectedSession };
    const commentIndex = updatedSession.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    const comment = { ...updatedSession.comments[commentIndex] };
    const hasReacted = comment.reactions.some(r => r.userId === user.id);
    if (hasReacted) {
        comment.reactions = comment.reactions.filter(r => r.userId !== user.id);
    } else {
        comment.reactions.push({ userId: user.id });
    }
    
    updatedSession.comments[commentIndex] = comment;
    
    setSelectedSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    
    await addReactionToLiveComment(selectedSession.id, commentId, user.id);
  };

  const handleOpenConfirmDeleteComment = (sessionId: string, comment: Comment) => {
    setCommentToDelete({ sessionId, comment });
    setIsConfirmDeleteCommentOpen(true);
  };

  const handleDeleteComment = async () => {
      if (!commentToDelete) return;
      
      // Optimistic update for deletion
      if (selectedSession && selectedSession.id === commentToDelete.sessionId) {
          const updatedSession = {
              ...selectedSession,
              comments: selectedSession.comments.filter(c => c.id !== commentToDelete.comment.id)
          };
          setSelectedSession(updatedSession);
          setSessions(sessions.map(s => s.id === selectedSession.id ? updatedSession : s));
      }

      await deleteCommentFromLiveSession(commentToDelete.sessionId, commentToDelete.comment.id);
      setIsConfirmDeleteCommentOpen(false);
      setCommentToDelete(null);
  };

  if (isLoading && sessions.length === 0) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  const hasReacted = user && selectedSession ? selectedSession.reactions.some(r => r.userId === user.id) : false;

  return (
    <>
      <div className="container mx-auto p-4 sm:p-8 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-2">Lives</h1>
              <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/70">Assista nossas transmissões e reveja as gravações.</p>
            </div>
            {canManage && (
              <Button onClick={() => handleOpenForm(null)} className="mt-4 sm:mt-0">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Nova Live
              </Button>
            )}
        </div>

        {selectedSession && (
          <section>
            <VideoPlayer url={selectedSession.youtubeId} />
            <div className="mt-4 bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                  selectedSession.status === 'past' ? 'bg-marrom-seiva/20 text-marrom-seiva dark:bg-creme-velado/20 dark:text-creme-velado' : 'bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-400'
              }`}>
                  {selectedSession.status === 'past' ? 'Gravada' : selectedSession.status === 'live' ? 'AO VIVO' : 'Agendada'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mt-2">{selectedSession.title}</h2>
              <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">{selectedSession.description}</p>
              
              <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex items-center space-x-4">
                  <button 
                      onClick={handleReaction}
                      className={`flex items-center space-x-2 font-sans text-sm font-semibold transition-colors duration-200 ${ hasReacted ? 'text-dourado-suave' : 'text-marrom-seiva/60 dark:text-creme-velado/60 hover:text-dourado-suave' }`}
                  >
                      <HeartIcon className="w-5 h-5" filled={hasReacted}/>
                      <span>{selectedSession.reactions.length} Apoios</span>
                  </button>
                  <div className="flex items-center space-x-2 font-sans text-sm font-semibold text-marrom-seiva/60 dark:text-creme-velado/60">
                      <ChatBubbleIcon className="w-5 h-5" />
                      <span>{selectedSession.comments.length} Comentários</span>
                  </div>
              </div>

            </div>
             {/* Comments Section */}
            <div className="mt-6">
                <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave mb-4">Comentários</h3>
                {user && (
                    <form onSubmit={handleComment} className="mb-6 flex items-start space-x-3">
                        <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover"/>
                        <div className="flex-1 relative">
                            <textarea 
                                placeholder="Deixe uma mensagem..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
                                rows={2}
                            />
                            <button type="submit" className="absolute right-3 bottom-3 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!commentText.trim() || isPostingComment}>
                                {isPostingComment ? <Spinner variant="button" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                )}
                <div className="space-y-4">
                    {selectedSession.comments.length > 0 ? selectedSession.comments.map(comment => {
                        const hasCommentReacted = user ? comment.reactions?.some(r => r.userId === user.id) : false;
                        return (
                            <div key={comment.id} className="group flex items-start space-x-3 animate-fade-in">
                                <img src={comment.author.avatarUrl} alt={comment.author.fullName} className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-1 bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-sans text-sm">
                                                <span className="font-bold text-verde-mata dark:text-creme-velado">{comment.author.fullName}</span>
                                                <span className="text-marrom-seiva/60 dark:text-creme-velado/60 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                                            </p>
                                            <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/90 mt-1">{comment.body}</p>
                                        </div>
                                        {user?.id === comment.author.id && (
                                            <button onClick={() => handleOpenConfirmDeleteComment(selectedSession.id, comment)} className="p-1 text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
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
                    }) : (
                         <p className="text-marrom-seiva/60 dark:text-creme-velado/60 text-sm italic">Nenhum comentário ainda. Seja a primeira a comentar!</p>
                    )}
                </div>
            </div>
          </section>
        )}

        <section>
             <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filterOptions={filterOptions}
                searchPlaceholder="Buscar por lives..."
            />
            {filteredSessions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredSessions.map(session => (
                        <LiveSessionCard key={session.id} session={session} onSelect={setSelectedSession} isSelected={selectedSession?.id === session.id} canManage={!!canManage} onEdit={handleOpenForm} onDelete={handleOpenConfirm} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
                    <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">Nenhuma live encontrada.</p>
                </div>
            )}
        </section>
      </div>

      {canManage && user && (
        <LiveForm 
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          session={editingSession}
          user={user}
        />
      )}
      
      {sessionToDelete && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a live "${sessionToDelete.title}"?`}
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
