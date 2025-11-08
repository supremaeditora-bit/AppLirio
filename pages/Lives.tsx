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
import { POINTS_AWARD } from '../services/gamificationConstants';

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
          {session.status === 'live' && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold uppercase px-2 py-1 rounded-full">AO VIVO</div>}
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
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const filterOptions = [
    { value: 'proximas', label: 'Próximas Lives' },
    { value: 'passadas', label: 'Lives Passadas' },
];

export default function Lives({ user, onUserUpdate }: LivesProps) {
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

  const fetchSessions = async () => {
    setIsLoading(true);
    const data = await getLiveSessions();
    data.forEach(s => s.comments.sort((a,b) => (b.reactions?.length || 0) - (a.reactions?.length || 0)));
    setSessions(data);

    const liveSession = data.find(s => s.status === 'live');
    
    if (liveSession) {
        setSelectedSession(liveSession);
    } else {
        const currentSelectedIsValid = selectedSession && data.some(s => s.id === selectedSession.id);
        if (!currentSelectedIsValid) {
            const defaultSession = data.find(s => s.status !== 'past') || data[0] || null;
            setSelectedSession(defaultSession);
        }
    }
    
    setIsLoading(false);
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
      setEditingSession(null);
      setIsFormOpen(false);
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
          setSessionToDelete(null);
          fetchSessions();
      }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !selectedSession) return;
    await addCommentToLiveSession(selectedSession.id, commentText, user);
    const updatedUser = {...user, points: user.points + POINTS_AWARD.POST_COMMENT };
    onUserUpdate(updatedUser);
    setCommentText('');
    fetchSessions();
  };

  const handleCommentReaction = async (commentId: string) => {
      if (!user || !selectedSession) return;
      await addReactionToLiveComment(selectedSession.id, commentId, user.id);
      fetchSessions();
  };

  const handleOpenDeleteConfirmComment = (comment: Comment) => {
      if (!selectedSession) return;
      setCommentToDelete({ sessionId: selectedSession.id, comment });
      setIsConfirmDeleteCommentOpen(true);
  };

  const handleDeleteComment = async () => {
      if (!commentToDelete) return;
      await deleteCommentFromLiveSession(commentToDelete.sessionId, commentToDelete.comment.id);
      setIsConfirmDeleteCommentOpen(false);
      setCommentToDelete(null);
      fetchSessions();
  };

  return (
    <>
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-gradient">Lives</h1>
            {canManage && (
                <Button onClick={() => handleOpenForm(null)} className="mt-4 sm:mt-0">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Agendar Live
                </Button>
            )}
        </div>
        
        <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filterOptions={filterOptions}
            searchPlaceholder="Buscar por lives..."
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {selectedSession ? (
              <div className="lg:col-span-3">
                <div className="bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-xl overflow-hidden mb-6">
                  <VideoPlayer youtubeId={selectedSession.youtubeId} />
                  <div className="p-6">
                    {selectedSession.status === 'live' && <p className="font-sans font-bold text-red-500 uppercase text-sm mb-2">● AO VIVO</p>}
                    <h2 className="font-serif text-3xl font-bold text-gradient">{selectedSession.title}</h2>
                    <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">{selectedSession.description}</p>
                  </div>
                </div>

                {/* Chat Section */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-gradient mb-4">Chat</h3>
                  {user && (
                      <form onSubmit={handleCommentSubmit} className="mb-6 flex items-start space-x-3">
                          <img src={user.avatarUrl} alt={user.displayName} className="w-10 h-10 rounded-full object-cover"/>
                          <div className="flex-1 relative">
                              <textarea placeholder="Participe do chat..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full font-sans bg-branco-nevoa dark:bg-verde-mata border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave" rows={2}/>
                              <button type="submit" className="absolute right-3 bottom-3 p-2 rounded-full text-dourado-suave hover:bg-dourado-suave/10 disabled:opacity-50" disabled={!commentText.trim()}><PaperAirplaneIcon className="w-5 h-5" /></button>
                          </div>
                      </form>
                  )}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedSession.comments.map(comment => (
                        <div key={comment.id} className="group flex items-start space-x-3">
                           {/* ... comment structure ... */}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-3 flex items-center justify-center h-full bg-branco-nevoa dark:bg-verde-mata rounded-2xl p-8">
                <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70 text-center">Nenhuma live encontrada ou selecionada.</p>
              </div>
            )}
            
            <div className="lg:col-span-1 space-y-4">
              {filteredSessions.map(session => (
                <LiveSessionCard
                  key={session.id}
                  session={session}
                  onSelect={setSelectedSession}
                  isSelected={selectedSession?.id === session.id}
                  canManage={!!canManage}
                  onEdit={handleOpenForm}
                  onDelete={handleOpenConfirm}
                />
              ))}
            </div>

          </div>
        )}
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
    </>
  );
}