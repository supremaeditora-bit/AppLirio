import React, { useState, useEffect, useRef } from 'react';
import { User, Notification, Page, CommunityPost, Event, JournalEntry } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { getNotifications, getCommunityPosts, updateCommunityPost, deleteCommunityPost, getEvents, getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/api';
import { updateUserProfileDocument } from '../services/authService';
import { uploadImage } from '../services/storageService';
import { BookmarkIcon, UserCircleIcon, BellIcon, PrayingHandsIcon, PencilIcon, TrashIcon, CalendarDaysIcon, CameraIcon, MapPinIcon, HomeModernIcon, InstagramIcon, FacebookIcon, JournalIcon, PlusIcon, BookOpenIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import ProgressBar from '../components/ProgressBar';
import { LEVELS } from '../services/gamificationConstants';

interface ProfileProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
    onNavigate: (page: Page, id?: string) => void;
    onViewTestimonial: (id: string) => void;
}

const ProfilePostCard: React.FC<{ post: CommunityPost, onCardClick: () => void }> = ({ post, onCardClick }) => (
    <div onClick={onCardClick} className="group cursor-pointer">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-parchment-light dark:bg-parchment-dark">
            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1518429023537-215d2a1b2413?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white">
                <h3 className="font-serif font-semibold leading-tight">{post.title}</h3>
            </div>
        </div>
    </div>
);

const EventCard: React.FC<{ event: Event, onCardClick: () => void }> = ({ event, onCardClick }) => (
    <div onClick={onCardClick} className="group cursor-pointer">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-parchment-light dark:bg-parchment-dark">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white">
                <h3 className="font-serif font-semibold leading-tight">{event.title}</h3>
                <p className="text-xs font-sans mt-1">{new Date(event.date).toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
    </div>
);

const PrayerRequestCard: React.FC<{ post: CommunityPost; onEdit: (post: CommunityPost) => void; onDelete: (post: CommunityPost) => void; }> = ({ post, onEdit, onDelete }) => (
    <div className="bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl shadow flex justify-between items-start gap-4">
        <div>
            <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado">{post.title}</h3>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-1 line-clamp-2">{post.body}</p>
            {post.isAnonymous && <span className="text-xs italic text-marrom-seiva/60 dark:text-creme-velado/60 mt-1 block">(Publicado anonimamente)</span>}
        </div>
        <div className="flex-shrink-0 flex items-center space-x-1">
            <button onClick={() => onEdit(post)} className="p-2 text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave">
                <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(post)} className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);


const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
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

    return (
        <div className="p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0">
            <p className="font-sans font-semibold text-verde-mata dark:text-creme-velado">{notification.title}</p>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-1">{notification.body}</p>
            <p className="text-xs text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">{formatTimeAgo(notification.createdAt)}</p>
        </div>
    );
};

export default function Profile({ user, onUserUpdate, onNavigate, onViewTestimonial }: ProfileProps) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'meus' | 'salvos' | 'notificacoes' | 'oracoes' | 'eventos' | 'diario'>('meus');
  
  // Data States
  const [allTestimonials, setAllTestimonials] = useState<CommunityPost[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Prayer Request management
  const [isPrayerFormOpen, setIsPrayerFormOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<CommunityPost | null>(null);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerBody, setPrayerBody] = useState('');
  const [isPrayerAnonymous, setIsPrayerAnonymous] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Journal management
  const [isJournalFormOpen, setIsJournalFormOpen] = useState(false);
  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalEntryToDelete, setJournalEntryToDelete] = useState<JournalEntry | null>(null);
  const [isConfirmJournalDeleteOpen, setIsConfirmJournalDeleteOpen] = useState(false);


  const fetchProfileData = async () => {
      if (!user) return;
      setIsLoadingData(true);
      const [posts, notifs, prayers, allEvents, journalData] = await Promise.all([
          getCommunityPosts('testemunhos'),
          getNotifications(),
          getCommunityPosts('oracao'),
          getEvents(),
          getJournalEntries(user.id),
      ]);
      setAllTestimonials(posts);
      setNotifications(notifs);
      setPrayerRequests(prayers);
      setMyEvents(allEvents.filter(e => e.attendeeIds.includes(user.id)));
      setJournalEntries(journalData);
      setIsLoadingData(false);
  }

  useEffect(() => {
    if (user) {
      setEditedUser({
        displayName: user.displayName,
        cidade: user.cidade,
        igreja: user.igreja,
        bio: user.bio,
        socialLinks: user.socialLinks || {},
      });
      fetchProfileData();
    }
  }, [user]);
  
  const myTestimonials = user ? allTestimonials.filter(p => p.author.id === user.id) : [];
  const savedTestimonials = user ? allTestimonials.filter(p => p.savedBy?.includes(user.id)) : [];
  const myPrayerRequests = user ? prayerRequests.filter(p => p.author.id === user.id) : [];

  const handleOpenEditModal = () => {
    if (user) {
      setEditedUser({
        displayName: user.displayName,
        cidade: user.cidade,
        igreja: user.igreja,
        bio: user.bio,
        socialLinks: user.socialLinks || {},
      });
      setEditModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
        await updateUserProfileDocument(user.id, editedUser);
        await onUserUpdate(editedUser);
    } catch (error) {
        console.error("Failed to update profile", error);
    } finally {
        setIsUpdating(false);
        setEditModalOpen(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
        setIsUploadingAvatar(true);
        try {
            const file = e.target.files[0];
            const newAvatarUrl = await uploadImage(file, user.id, () => {});
            await updateUserProfileDocument(user.id, { avatarUrl: newAvatarUrl });
            await onUserUpdate({ avatarUrl: newAvatarUrl });
        } catch (error) {
            console.error("Failed to upload avatar", error);
        } finally {
            setIsUploadingAvatar(false);
        }
    }
  };


  const handleOpenPrayerForm = (post: CommunityPost) => {
      setEditingPrayer(post);
      setPrayerTitle(post.title);
      setPrayerBody(post.body);
      setIsPrayerAnonymous(post.isAnonymous || false);
      setIsPrayerFormOpen(true);
  };

  const handleUpdatePrayer = async () => {
      if (!editingPrayer) return;
      setIsSubmitting(true);
      await updateCommunityPost(editingPrayer.id, {
          title: prayerTitle,
          body: prayerBody,
          isAnonymous: isPrayerAnonymous,
      });
      setIsPrayerFormOpen(false);
      setEditingPrayer(null);
      fetchProfileData();
      setIsSubmitting(false);
  };

  const handleOpenConfirmDelete = (post: CommunityPost) => {
      setPostToDelete(post);
      setIsConfirmDeleteOpen(true);
  };

  const handleDeletePost = async () => {
      if (!postToDelete) return;
      await deleteCommunityPost(postToDelete.id);
      setIsConfirmDeleteOpen(false);
      setPostToDelete(null);
      fetchProfileData();
  };

    const handleOpenJournalForm = (entry: JournalEntry | null) => {
        setEditingJournalEntry(entry);
        if (entry) {
            setJournalTitle(entry.title);
            setJournalContent(entry.content);
        } else {
            setJournalTitle('');
            setJournalContent('');
        }
        setIsJournalFormOpen(true);
    };

    const handleSaveJournalEntry = async () => {
        if (!journalTitle.trim() || !journalContent.trim() || !user) return;
        setIsSubmitting(true);
        try {
            if (editingJournalEntry) {
                await updateJournalEntry(editingJournalEntry.id, journalContent, journalTitle);
            } else {
                await createJournalEntry({ userId: user.id, title: journalTitle, content: journalContent });
            }
        } catch(error) {
            console.error("Failed to save journal entry", error);
        } finally {
            setIsJournalFormOpen(false);
            setEditingJournalEntry(null);
            await fetchProfileData();
            setIsSubmitting(false);
        }
    };
    
    const handleOpenConfirmJournalDelete = (entry: JournalEntry) => {
        setJournalEntryToDelete(entry);
        setIsConfirmJournalDeleteOpen(true);
    };

    const handleDeleteJournalEntry = async () => {
        if (!journalEntryToDelete) return;
        await deleteJournalEntry(journalEntryToDelete.id);
        setIsConfirmJournalDeleteOpen(false);
        setJournalEntryToDelete(null);
        await fetchProfileData();
    };
  
  if (!user) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }
  
  const userLevelInfo = LEVELS[user.level] || LEVELS['Árvore Frutífera'];

  const JournalEntryCard: React.FC<{
        entry: JournalEntry;
        onEdit: (entry: JournalEntry) => void;
        onDelete: (entry: JournalEntry) => void;
    }> = ({ entry, onEdit, onDelete }) => (
        <div className="bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl shadow flex justify-between items-start gap-4 cursor-pointer" onClick={() => onEdit(entry)}>
            <div>
                <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado">{entry.title}</h3>
                <p className="font-sans text-xs text-marrom-seiva/60 dark:text-creme-velado/60 mt-1">
                    {new Date(entry.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 line-clamp-2">{entry.content}</p>
                 {entry.relatedContentTitle && <p className="text-xs text-dourado-suave mt-2 flex items-center gap-1"><BookOpenIcon className="w-3 h-3"/> Relacionado a: {entry.relatedContentTitle}</p>}
            </div>
            <div className="flex-shrink-0 flex items-center space-x-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className="p-2 text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(entry); }} className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

  return (
    <>
    <div className="bg-creme-velado/40 dark:bg-verde-escuro-profundo/40 min-h-full">
        <div className="container mx-auto p-4 sm:p-8">
            <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                    <div className="relative group flex-shrink-0">
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} hidden accept="image/*" />
                        <img src={user.avatarUrl} alt={user.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-dourado-suave" />
                        <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" disabled={isUploadingAvatar}>
                            {isUploadingAvatar ? <Spinner variant='button' /> : <CameraIcon className="w-8 h-8"/>}
                        </button>
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <h1 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave">{user.displayName}</h1>
                            <Button onClick={handleOpenEditModal} variant="secondary" className="mt-2 sm:mt-0 !py-2 !px-4">
                                <PencilIcon className="w-4 h-4 mr-2" /> Editar Perfil
                            </Button>
                        </div>
                        <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 text-sm leading-relaxed">
                            {user.bio || 'Uma breve biografia sobre a jornada de fé do usuário e seus interesses.'}
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-marrom-seiva dark:text-creme-velado/90">
                            {user.cidade && <p className="flex items-center justify-center sm:justify-start gap-2"><MapPinIcon className="w-4 h-4 text-marrom-seiva/60 dark:text-creme-velado/60"/> {user.cidade}</p>}
                            {user.igreja && <p className="flex items-center justify-center sm:justify-start gap-2"><HomeModernIcon className="w-4 h-4 text-marrom-seiva/60 dark:text-creme-velado/60"/> {user.igreja}</p>}
                        </div>
                         <div className="mt-4 flex justify-center sm:justify-start items-center gap-4">
                            {user.socialLinks?.instagram && <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave"><InstagramIcon className="w-6 h-6" /></a>}
                            {user.socialLinks?.facebook && <a href={`https://facebook.com/${user.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave"><FacebookIcon className="w-6 h-6" /></a>}
                        </div>
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                    <div className="flex justify-between items-center font-sans text-sm font-semibold text-marrom-seiva/80 dark:text-creme-velado/80">
                        <span>Nível: {user.level}</span>
                        <span>💧 {user.points} / {userLevelInfo.points}</span>
                    </div>
                    <div className="mt-2">
                        <ProgressBar current={user.points} max={userLevelInfo.points} />
                    </div>
                </div>
            </div>

            <main>
                <div className="mb-6">
                    <nav className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
                        <button onClick={() => setActiveTab('meus')} className={`flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-full font-sans font-semibold text-sm transition-colors duration-200 ${activeTab === 'meus' ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata' : 'bg-marrom-seiva/5 text-marrom-seiva/80 hover:bg-marrom-seiva/10 dark:bg-creme-velado/5 dark:text-creme-velado/80 dark:hover:bg-creme-velado/10'}`}>
                            <UserCircleIcon className="w-5 h-5" /> Meus Testemunhos
                        </button>
                        <button onClick={() => setActiveTab('oracoes')} className={`flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-full font-sans font-semibold text-sm transition-colors duration-200 ${activeTab === 'oracoes' ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata' : 'bg-marrom-seiva/5 text-marrom-seiva/80 hover:bg-marrom-seiva/10 dark:bg-creme-velado/5 dark:text-creme-velado/80 dark:hover:bg-creme-velado/10'}`}>
                            <PrayingHandsIcon className="w-5 h-5" /> Meus Pedidos
                        </button>
                         <button onClick={() => setActiveTab('diario')} className={`flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-full font-sans font-semibold text-sm transition-colors duration-200 ${activeTab === 'diario' ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata' : 'bg-marrom-seiva/5 text-marrom-seiva/80 hover:bg-marrom-seiva/10 dark:bg-creme-velado/5 dark:text-creme-velado/80 dark:hover:bg-creme-velado/10'}`}>
                            <JournalIcon className="w-5 h-5" /> Diário
                        </button>
                        <button onClick={() => setActiveTab('salvos')} className={`flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-full font-sans font-semibold text-sm transition-colors duration-200 ${activeTab === 'salvos' ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata' : 'bg-marrom-seiva/5 text-marrom-seiva/80 hover:bg-marrom-seiva/10 dark:bg-creme-velado/5 dark:text-creme-velado/80 dark:hover:bg-creme-velado/10'}`}>
                            <BookmarkIcon className="w-5 h-5" /> Testemunhos Salvos
                        </button>
                        <button onClick={() => setActiveTab('eventos')} className={`flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-full font-sans font-semibold text-sm transition-colors duration-200 ${activeTab === 'eventos' ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata' : 'bg-marrom-seiva/5 text-marrom-seiva/80 hover:bg-marrom-seiva/10 dark:bg-creme-velado/5 dark:text-creme-velado/80 dark:hover:bg-creme-velado/10'}`}>
                            <CalendarDaysIcon className="w-5 h-5" /> Meus Eventos
                        </button>
                        <button onClick={() => setActiveTab('notificacoes')} className={`flex items-center gap-2 whitespace-nowrap py-2 px-4 rounded-full font-sans font-semibold text-sm transition-colors duration-200 ${activeTab === 'notificacoes' ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata' : 'bg-marrom-seiva/5 text-marrom-seiva/80 hover:bg-marrom-seiva/10 dark:bg-creme-velado/5 dark:text-creme-velado/80 dark:hover:bg-creme-velado/10'}`}>
                            <BellIcon className="w-5 h-5" /> Notificações
                        </button>
                    </nav>
                </div>

                {isLoadingData && <Spinner />}
                
                {!isLoadingData && activeTab === 'meus' && (
                    myTestimonials.length > 0 ?
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myTestimonials.map(post => <ProfilePostCard key={post.id} post={post} onCardClick={() => onViewTestimonial(post.id)} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Você ainda não publicou nenhum testemunho.</p>
                )}

                {!isLoadingData && activeTab === 'oracoes' && (
                    myPrayerRequests.length > 0 ?
                    <div className="space-y-4">
                        {myPrayerRequests.map(post => <PrayerRequestCard key={post.id} post={post} onEdit={handleOpenPrayerForm} onDelete={handleOpenConfirmDelete} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Você ainda não fez nenhum pedido de oração.</p>
                )}

                {!isLoadingData && activeTab === 'diario' && (
                    <div className="space-y-4">
                        <div className="text-right">
                            <Button onClick={() => handleOpenJournalForm(null)} variant="primary">
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Nova Anotação
                            </Button>
                        </div>
                        {journalEntries.length > 0 ? (
                            journalEntries.map(entry => (
                                <JournalEntryCard 
                                    key={entry.id} 
                                    entry={entry} 
                                    onEdit={handleOpenJournalForm} 
                                    onDelete={handleOpenConfirmJournalDelete} 
                                />
                            ))
                        ) : (
                            <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Você ainda não escreveu nenhuma anotação no diário.</p>
                        )}
                    </div>
                )}

                {!isLoadingData && activeTab === 'salvos' && (
                    savedTestimonials.length > 0 ?
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedTestimonials.map(post => <ProfilePostCard key={post.id} post={post} onCardClick={() => onViewTestimonial(post.id)} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Você ainda não salvou nenhum testemunho.</p>
                )}
                
                {!isLoadingData && activeTab === 'eventos' && (
                    myEvents.length > 0 ?
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myEvents.map(event => <EventCard key={event.id} event={event} onCardClick={() => onNavigate('eventDetail', event.id)} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Você ainda não se inscreveu em nenhum evento.</p>
                )}

                {!isLoadingData && activeTab === 'notificacoes' && (
                        <div className="bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-lg">
                        {notifications.length > 0 ? (
                            notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
                        ) : (
                            <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Nenhuma notificação por aqui.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    </div>
    
    <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Perfil">
        <div className="space-y-4">
            <InputField id="displayName" label="Nome" value={editedUser.displayName || ''} onChange={(e) => setEditedUser({...editedUser, displayName: e.target.value})} />
            <InputField id="bio" label="Sua Bio" type="textarea" value={editedUser.bio || ''} onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})} />
            <InputField id="cidade" label="Cidade e Estado" placeholder="Ex: São Paulo, SP" value={editedUser.cidade || ''} onChange={(e) => setEditedUser({...editedUser, cidade: e.target.value})} />
            <InputField id="igreja" label="Sua Igreja" placeholder="Ex: Igreja da Cidade" value={editedUser.igreja || ''} onChange={(e) => setEditedUser({...editedUser, igreja: e.target.value})} />
            <InputField id="instagram" label="Instagram (usuário)" value={editedUser.socialLinks?.instagram || ''} onChange={(e) => setEditedUser({...editedUser, socialLinks: {...(editedUser.socialLinks || {}), instagram: e.target.value}})} />
            <InputField id="facebook" label="Facebook (usuário)" value={editedUser.socialLinks?.facebook || ''} onChange={(e) => setEditedUser({...editedUser, socialLinks: {...(editedUser.socialLinks || {}), facebook: e.target.value}})} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={isUpdating}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? <Spinner variant="button" /> : 'Salvar'}
            </Button>
        </div>
    </Modal>
    
    <Modal isOpen={isPrayerFormOpen} onClose={() => setIsPrayerFormOpen(false)} title="Editar Pedido de Oração">
        <div className="space-y-4">
            <InputField id="prayerTitle" label="Título do Pedido" value={prayerTitle} onChange={(e) => setPrayerTitle(e.target.value)} />
            <InputField id="prayerBody" label="Descrição" type="textarea" value={prayerBody} onChange={(e) => setPrayerBody(e.target.value)} />
            <div className="flex items-center">
                <input type="checkbox" id="isPrayerAnonymous" checked={isPrayerAnonymous} onChange={(e) => setIsPrayerAnonymous(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-dourado-suave focus:ring-dourado-suave"/>
                <label htmlFor="isPrayerAnonymous" className="ml-2 block text-sm font-sans text-marrom-seiva dark:text-creme-velado/80">Publicar anonimamente</label>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsPrayerFormOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdatePrayer} disabled={isSubmitting}>
                {isSubmitting ? <Spinner variant="button" /> : 'Salvar'}
            </Button>
        </div>
    </Modal>
    
    <Modal isOpen={isJournalFormOpen} onClose={() => setIsJournalFormOpen(false)} title={editingJournalEntry ? 'Editar Anotação' : 'Nova Anotação'}>
        <div className="space-y-4">
            <InputField id="journalTitle" label="Título" value={journalTitle} onChange={(e) => setJournalTitle(e.target.value)} />
            <InputField id="journalContent" label="Conteúdo" type="textarea" value={journalContent} onChange={(e) => setJournalContent(e.target.value)} rows={10} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsJournalFormOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveJournalEntry} disabled={isSubmitting}>
                {isSubmitting ? <Spinner variant="button" /> : 'Salvar'}
            </Button>
        </div>
    </Modal>

    {postToDelete && (
        <ConfirmationModal
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            onConfirm={handleDeletePost}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir o post "${postToDelete.title}"?`}
            confirmText="Excluir"
        />
    )}

    {journalEntryToDelete && (
        <ConfirmationModal
            isOpen={isConfirmJournalDeleteOpen}
            onClose={() => setIsConfirmJournalDeleteOpen(false)}
            onConfirm={handleDeleteJournalEntry}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir a anotação "${journalEntryToDelete.title}"?`}
            confirmText="Excluir"
        />
    )}
    </>
  );
}