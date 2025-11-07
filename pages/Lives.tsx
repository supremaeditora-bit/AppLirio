import React, { useState, useEffect } from 'react';
import { LiveSession, User } from '../types';
import { getLiveSessions, deleteLiveSession } from '../services/api';
import Spinner from '../components/Spinner';
import { PlayCircleIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';
import VideoPlayer from '../components/VideoPlayer';
import Button from '../components/Button';
import LiveForm from '../components/LiveForm';
import ConfirmationModal from '../components/ConfirmationModal';

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

export default function Lives({ user }: LivesProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  
  // State for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<LiveSession | null>(null);
  
  const canManage = user && (user.role === 'admin' || user.role === 'mentora');

  const fetchSessions = async () => {
    setIsLoading(true);
    const data = await getLiveSessions();
    setSessions(data);
    if (data.length > 0 && !selectedSession) {
      const liveOrUpcoming = data.find(s => s.status !== 'past') || data[0];
      setSelectedSession(liveOrUpcoming);
    } else if (data.length === 0) {
      setSelectedSession(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenForm = (session: LiveSession | null) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
    fetchSessions(); // Refresh data after C/U
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
      // If the deleted session was the selected one, clear selection
      if (selectedSession?.id === sessionToDelete.id) {
        setSelectedSession(null);
      }
      fetchSessions(); // Refresh data after D
    }
  };

  const upcomingSessions = sessions.filter(s => s.status !== 'past').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const pastSessions = sessions.filter(s => s.status === 'past').sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  if (isLoading && sessions.length === 0) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

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
            <VideoPlayer youtubeId={selectedSession.youtubeId} />
            <div className="mt-4">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                  selectedSession.status === 'past' ? 'bg-marrom-seiva/20 text-marrom-seiva dark:bg-creme-velado/20 dark:text-creme-velado' : 'bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-400'
              }`}>
                  {selectedSession.status === 'past' ? 'Gravada' : selectedSession.status === 'live' ? 'AO VIVO' : 'Agendada'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mt-2">{selectedSession.title}</h2>
              <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">{selectedSession.description}</p>
            </div>
          </section>
        )}

        {upcomingSessions.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">Próximas Lives</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {upcomingSessions.map(session => (
                <LiveSessionCard key={session.id} session={session} onSelect={setSelectedSession} isSelected={selectedSession?.id === session.id} canManage={!!canManage} onEdit={handleOpenForm} onDelete={handleOpenConfirm} />
              ))}
            </div>
          </section>
        )}

        {pastSessions.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">Lives Anteriores</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pastSessions.map(session => (
                <LiveSessionCard key={session.id} session={session} onSelect={setSelectedSession} isSelected={selectedSession?.id === session.id} canManage={!!canManage} onEdit={handleOpenForm} onDelete={handleOpenConfirm} />
              ))}
            </div>
          </section>
        )}

        {sessions.length === 0 && !isLoading && (
          <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
              <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">Nenhuma live programada no momento.</p>
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