import React, { useState, useEffect, useRef } from 'react';
import { User, Notification, Page, CommunityPost, Event, UserNotificationSettings, ReadingPlan, UserReadingPlanProgress, UserPlaylist, ContentItem } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { getNotifications, getCommunityPosts, updateCommunityPost, deleteCommunityPost, getEvents, getReadingPlans, getAllUserReadingProgress, getContentItem } from '../services/api';
import { updateUserProfileDocument } from '../services/authService';
import { uploadImage } from '../services/storageService';
import { BookmarkIcon, UserCircleIcon, BellIcon, PrayingHandsIcon, PencilIcon, TrashIcon, CalendarDaysIcon, CameraIcon, MapPinIcon, HomeModernIcon, InstagramIcon, FacebookIcon, WhatsAppIcon, Cog8ToothIcon, SparklesIcon, QueueListIcon, AcademicCapIcon, PlayCircleIcon, UsersIcon, ChatBubbleIcon, HeartIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import ProgressBar from '../components/ProgressBar';
import * as pushService from '../services/pushService';
import { LEVELS } from '../services/gamificationService';
import PlanCard from '../components/PlanCard';

interface ProfileProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
    onNavigate: (page: Page, id?: string) => void;
    onViewTestimonial: (id: string) => void;
}

const ProfilePostCard: React.FC<{ post: CommunityPost, onCardClick: () => void }> = ({ post, onCardClick }) => (
    <div onClick={onCardClick} className="group cursor-pointer">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-parchment-light dark:bg-parchment-dark">
            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1518429023537-215d2a1b2413?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG9otby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
             <div className="flex items-center gap-3 mt-2 text-xs text-marrom-seiva/60 dark:text-creme-velado/60">
                <span className="flex items-center gap-1"><PrayingHandsIcon className="w-3 h-3" /> {post.reactions.length}</span>
                <span className="flex items-center gap-1"><ChatBubbleIcon className="w-3 h-3" /> {post.comments.length}</span>
            </div>
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

const StudyCard: React.FC<{ post: CommunityPost; onEdit: (post: CommunityPost) => void; onDelete: (post: CommunityPost) => void; }> = ({ post, onEdit, onDelete }) => (
    <div className="bg-branco-nevoa dark:bg-verde-mata p-5 rounded-xl shadow border border-marrom-seiva/5 dark:border-creme-velado/5 flex justify-between items-start gap-4">
        <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="bg-dourado-suave/20 text-dourado-suave text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Estudo</span>
                <span className="text-xs text-marrom-seiva/50 dark:text-creme-velado/50">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <h3 className="font-serif font-semibold text-lg text-verde-mata dark:text-creme-velado">{post.title}</h3>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-1 line-clamp-2">{post.body}</p>
            <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-marrom-seiva/60 dark:text-creme-velado/60">
                <span className="flex items-center gap-1"><HeartIcon className="w-3.5 h-3.5" /> {post.reactions.length} Apoios</span>
                <span className="flex items-center gap-1"><ChatBubbleIcon className="w-3.5 h-3.5" /> {post.comments.length} Comentários</span>
            </div>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-1">
            <button onClick={() => onEdit(post)} className="p-2 text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave rounded-lg hover:bg-marrom-seiva/5">
                <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(post)} className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500 rounded-lg hover:bg-marrom-seiva/5">
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
  const [updateError, setUpdateError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'meus' | 'salvos' | 'notificacoes' | 'oracoes' | 'estudos' | 'eventos' | 'configuracoes' | 'planos' | 'playlists'>('meus');
  
  // Data States
  const [allTestimonials, setAllTestimonials] = useState<CommunityPost[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<CommunityPost[]>([]);
  const [myStudies, setMyStudies] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myPlans, setMyPlans] = useState<ReadingPlan[]>([]);
  const [plansProgress, setPlansProgress] = useState<UserReadingPlanProgress[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Playlist View State
  const [viewingPlaylist, setViewingPlaylist] = useState<UserPlaylist | null>(null);
  const [playlistItems, setPlaylistItems] = useState<ContentItem[]>([]);
  const [isLoadingPlaylistItems, setIsLoadingPlaylistItems] = useState(false);

  // Prayer/Study Request management
  const [isPrayerFormOpen, setIsPrayerFormOpen] = useState(false);
  const [isStudyFormOpen, setIsStudyFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Push notification state
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(true);
  

  const fetchProfileData = async () => {
      if (!user) return;
      setIsLoadingData(true);
      const [posts, notifs, prayers, studies, allEvents, allPlans, allProgress] = await Promise.all([
          getCommunityPosts('testemunhos'),
          getNotifications(),
          getCommunityPosts('oracao'),
          getCommunityPosts('estudos'),
          getEvents(),
          getReadingPlans(),
          getAllUserReadingProgress(user.id)
      ]);
      setAllTestimonials(posts);
      setNotifications(notifs);
      setPrayerRequests(prayers);
      setMyStudies(studies.filter(p => p.author.id === user.id));
      setMyEvents(allEvents.filter(e => e.attendeeIds.includes(user.id)));
      
      // Filter plans where user has made progress
      const startedPlanIds = allProgress.map(p => p.planId);
      const startedPlans = allPlans.filter(p => startedPlanIds.includes(p.id));
      setMyPlans(startedPlans);
      setPlansProgress(allProgress);

      setIsLoadingData(false);
  }

  useEffect(() => {
    if (user) {
      setEditedUser({
        fullName: user.fullName,
        cidade: user.cidade,
        igreja: user.igreja,
        biography: user.biography,
        socialLinks: user.socialLinks || {},
      });
      fetchProfileData();

      // Check push notification status from browser
      setIsPushLoading(true);
      pushService.getSubscription().then(subscription => {
        const hasEnabledInSettings = user.notificationSettings?.pushNotificationsEnabled;
        // If browser has subscription AND user setting is true, it's enabled.
        setIsPushEnabled(!!subscription && !!hasEnabledInSettings);
        setIsPushLoading(false);
      });
    }
  }, [user]);
  
  const myTestimonials = user ? allTestimonials.filter(p => p.author.id === user.id) : [];
  const savedTestimonials = user ? allTestimonials.filter(p => p.savedBy?.includes(user.id)) : [];
  const myPrayerRequests = user ? prayerRequests.filter(p => p.author.id === user.id) : [];

  const handleOpenEditModal = () => {
    if (user) {
      setEditedUser({
        fullName: user.fullName,
        cidade: user.cidade,
        igreja: user.igreja,
        biography: user.biography,
        socialLinks: user.socialLinks || {},
      });
      setUpdateError('');
      setEditModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    if (!editedUser.fullName || editedUser.fullName.trim() === '') {
        setUpdateError("O nome não pode ficar em branco.");
        return;
    }

    setIsUpdating(true);
    setUpdateError('');
    try {
        await updateUserProfileDocument(user.id, editedUser);
        await onUserUpdate(editedUser);
        setEditModalOpen(false);
    } catch (error: any) {
        let errorMessage = "Falha ao atualizar o perfil. Tente novamente mais tarde.";
        if (error.message && error.message.includes("violates row-level security policy")) {
            errorMessage = "Permissão negada. Você só pode editar o seu próprio perfil. Verifique as políticas de segurança (RLS) da tabela 'profiles'.";
        } else if (error.message) {
            errorMessage = `Falha ao atualizar o perfil: ${error.message}`;
        }
        setUpdateError(errorMessage);
        console.error("Failed to update profile:", error);
    } finally {
        setIsUpdating(false);
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
        } catch (error: any) {
            console.error("Failed to upload avatar", error);
            alert(`Falha ao enviar avatar: ${error.message || 'Ocorreu um erro desconhecido.'}`);
        } finally {
            setIsUploadingAvatar(false);
        }
    }
  };


  const handleOpenPrayerForm = (post: CommunityPost) => {
      setEditingPost(post);
      setPostTitle(post.title);
      setPostBody(post.body);
      setIsAnonymous(post.isAnonymous || false);
      setIsPrayerFormOpen(true);
  };
  
  const handleOpenStudyForm = (post: CommunityPost) => {
      setEditingPost(post);
      setPostTitle(post.title);
      setPostBody(post.body);
      setIsStudyFormOpen(true);
  };

  const handleUpdatePost = async () => {
      if (!editingPost) return;
      setIsSubmitting(true);
      await updateCommunityPost(editingPost.id, {
          title: postTitle,
          body: postBody,
          isAnonymous: isAnonymous, // Ignored for studies, but harmless
      });
      setIsPrayerFormOpen(false);
      setIsStudyFormOpen(false);
      setEditingPost(null);
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
  
  const handlePushToggle = async () => {
    if (!user) return;
    setIsPushLoading(true);
    
    try {
      if (isPushEnabled) { // User wants to disable
        await pushService.unsubscribeUser();
        setIsPushEnabled(false);
        
        // Update DB setting
        const newSettings = { ...user.notificationSettings, pushNotificationsEnabled: false };
        await onUserUpdate({ notificationSettings: newSettings });
        await updateUserProfileDocument(user.id, { notificationSettings: newSettings });
        
      } else { // User wants to enable
        if (Notification.permission === 'denied') {
          alert("As notificações foram bloqueadas nas configurações do seu navegador. Você precisa habilitá-las manualmente para recebê-las.");
          setIsPushLoading(false);
          return;
        }
        
        await pushService.subscribeUser(user.id);
        setIsPushEnabled(true);
        
        // Update DB setting
        const newSettings = { ...user.notificationSettings, pushNotificationsEnabled: true };
        await onUserUpdate({ notificationSettings: newSettings });
        await updateUserProfileDocument(user.id, { notificationSettings: newSettings });
      }
    } catch (error: any) {
      console.error("Failed to toggle push notifications", error);
      alert(`Não foi possível ${isPushEnabled ? 'desativar' : 'ativar'} as notificações: ${error.message}`);
      // Don't change state on error
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleToggleNotificationSetting = async (key: keyof UserNotificationSettings) => {
      if (!user) return;
      
      const defaultSettings: UserNotificationSettings = {
          commentsOnMyPost: true,
          newLives: true,
          newPodcasts: true,
          newDevotionals: true,
          newPrayerRequests: true,
          newStudies: true,
          newMentorships: true,
          newTestimonials: true,
          newReadingPlans: true,
          newEvents: true,
          pushNotificationsEnabled: false
      };

      const currentSettings = { ...defaultSettings, ...(user.notificationSettings || {}) };
      const newSettings = { ...currentSettings, [key]: !currentSettings[key] };
      
      // Optimistically update UI
      await onUserUpdate({ notificationSettings: newSettings });
      
      // Save to DB
      try {
          await updateUserProfileDocument(user.id, { notificationSettings: newSettings });
      } catch (e) {
          console.error("Failed to save notification settings", e);
          // Revert on error (optional, but good practice)
      }
  };

  const handleOpenPlaylist = async (playlist: UserPlaylist) => {
      setViewingPlaylist(playlist);
      setIsLoadingPlaylistItems(true);
      try {
          // Fetch items in parallel. 
          const items = await Promise.all(playlist.contentIds.map(id => getContentItem(id)));
          // Filter out undefined (if item was deleted)
          setPlaylistItems(items.filter((i): i is ContentItem => !!i));
      } catch (e) {
          console.error("Error loading playlist items", e);
      } finally {
          setIsLoadingPlaylistItems(false);
      }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
      if (!user) return;
      if (confirm("Tem certeza que deseja excluir esta playlist?")) {
          const newPlaylists = user.playlists.filter(p => p.id !== playlistId);
          await updateUserProfileDocument(user.id, { playlists: newPlaylists });
          await onUserUpdate({ playlists: newPlaylists });
          if (viewingPlaylist?.id === playlistId) setViewingPlaylist(null);
      }
  };


  if (!user) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }
  
  // Gamification calculations for profile
  const nextLevel = LEVELS.find(l => l.nivel === (user.gardenLevel || 0) + 1);
  const currentLevel = LEVELS.find(l => l.nivel === (user.gardenLevel || 0)) || LEVELS[0];
  const progressToNext = nextLevel ? nextLevel.xp - currentLevel.xp : 1;
  const currentProgress = nextLevel ? (user.experience || 0) - currentLevel.xp : 1;


  return (
    <>
    <div className="min-h-full">
        <div className="container mx-auto p-4 sm:p-8">
            <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                    <div className="relative group flex-shrink-0">
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} hidden accept="image/*" />
                        <img src={user.avatarUrl} alt={user.fullName} className="w-32 h-32 rounded-full object-cover border-4 border-dourado-suave" />
                        <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" disabled={isUploadingAvatar}>
                            {isUploadingAvatar ? <Spinner variant='button' /> : <CameraIcon className="w-8 h-8"/>}
                        </button>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <h1 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave">{user.fullName}</h1>
                            <Button onClick={handleOpenEditModal} variant="secondary" className="mt-2 sm:mt-0 !py-2 !px-4">
                                <PencilIcon className="w-4 h-4 mr-2" /> Editar Perfil
                            </Button>
                        </div>
                        <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 text-sm leading-relaxed">
                            {user.biography || 'Uma breve biografia sobre a jornada de fé do usuário e seus interesses.'}
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-marrom-seiva dark:text-creme-velado/90">
                            {user.cidade && <p className="flex items-center justify-center sm:justify-start gap-2"><MapPinIcon className="w-4 h-4 text-marrom-seiva/60 dark:text-creme-velado/60"/> {user.cidade}</p>}
                            {user.igreja && <p className="flex items-center justify-center sm:justify-start gap-2"><HomeModernIcon className="w-4 h-4 text-marrom-seiva/60 dark:text-creme-velado/60"/> {user.igreja}</p>}
                        </div>
                         <div className="mt-4 flex justify-center sm:justify-start items-center gap-4">
                            {user.socialLinks?.instagram && <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave"><InstagramIcon className="w-6 h-6" /></a>}
                            {user.socialLinks?.facebook && <a href={`https://facebook.com/${user.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave"><FacebookIcon className="w-6 h-6" /></a>}
                            {user.socialLinks?.whatsapp && (
                                <a 
                                    href={`https://wa.me/${
                                        user.socialLinks.whatsapp.replace(/\D/g, '').length <= 11 
                                        ? '55' + user.socialLinks.whatsapp.replace(/\D/g, '') 
                                        : user.socialLinks.whatsapp.replace(/\D/g, '')
                                    }`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave"
                                >
                                    <WhatsAppIcon className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Garden Summary Section */}
                 <div className="mt-8 pt-6 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-dourado-suave" />
                            <h3 className="font-serif font-bold text-verde-mata dark:text-dourado-suave">Meu Jardim Secreto</h3>
                        </div>
                        <button onClick={() => onNavigate('myGarden')} className="text-sm font-semibold text-dourado-suave hover:underline">Ver completo</button>
                    </div>
                    <div className="p-4 rounded-lg border border-marrom-seiva/5 dark:border-creme-velado/5">
                         <div className="flex justify-between items-center font-sans text-sm font-semibold text-marrom-seiva/80 dark:text-creme-velado/80 mb-2">
                            <span>{user.gardenLevelName || "Semente Plantada"}</span>
                            <span>{user.experience || 0} XP</span>
                        </div>
                        <ProgressBar current={nextLevel ? currentProgress : 100} max={nextLevel ? progressToNext : 100} />
                         <div className="flex justify-between text-xs text-marrom-seiva/60 dark:text-creme-velado/60 mt-2">
                             <span>{user.currentStreak || 0} dias seguidos de orvalho</span>
                             <span>{user.unlockedAchievementIds?.length || 0} sementes plantadas</span>
                         </div>
                    </div>
                </div>
            </div>

            <main>
                {/* Navigation Chips/Pills - Scrollable */}
                <div className="relative group mb-8">
                    {/* Fade effect on the right to indicate scrollability */}
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-creme-velado dark:from-verde-escuro-profundo to-transparent pointer-events-none md:hidden z-10"></div>
                    
                    <nav className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
                        <button onClick={() => setActiveTab('meus')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'meus' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <UserCircleIcon className="w-4 h-4" /> Meus Testemunhos
                        </button>
                        <button onClick={() => setActiveTab('oracoes')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'oracoes' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <PrayingHandsIcon className="w-4 h-4" /> Meus Pedidos
                        </button>
                        <button onClick={() => setActiveTab('estudos')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'estudos' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <UsersIcon className="w-4 h-4" /> Meus Estudos
                        </button>
                        <button onClick={() => setActiveTab('planos')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'planos' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <AcademicCapIcon className="w-4 h-4" /> Meus Planos
                        </button>
                        <button onClick={() => setActiveTab('playlists')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'playlists' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <QueueListIcon className="w-4 h-4" /> Minhas Playlists
                        </button>
                        <button onClick={() => setActiveTab('salvos')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'salvos' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <BookmarkIcon className="w-4 h-4" /> Salvos
                        </button>
                        <button onClick={() => setActiveTab('eventos')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'eventos' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <CalendarDaysIcon className="w-4 h-4" /> Eventos
                        </button>
                        <button onClick={() => setActiveTab('notificacoes')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'notificacoes' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <BellIcon className="w-4 h-4" /> Notificações
                        </button>
                        <button onClick={() => setActiveTab('configuracoes')} className={`snap-center flex-shrink-0 flex items-center gap-2 whitespace-nowrap py-2 px-5 rounded-full font-sans font-semibold text-sm transition-all duration-200 border ${activeTab === 'configuracoes' ? 'bg-dourado-suave text-verde-mata border-dourado-suave shadow-md' : 'bg-branco-nevoa dark:bg-verde-mata/50 text-marrom-seiva/70 dark:text-creme-velado/70 border-marrom-seiva/10 dark:border-creme-velado/10 hover:bg-dourado-suave/20 hover:border-dourado-suave/30'}`}>
                            <Cog8ToothIcon className="w-4 h-4" /> Configurações
                        </button>
                    </nav>
                </div>

                {isLoadingData && <Spinner />}
                
                {!isLoadingData && activeTab === 'meus' && (
                    myTestimonials.length > 0 ?
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {myTestimonials.map(post => <ProfilePostCard key={post.id} post={post} onCardClick={() => onViewTestimonial(post.id)} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não publicou nenhum testemunho.</p>
                )}

                {!isLoadingData && activeTab === 'oracoes' && (
                    myPrayerRequests.length > 0 ?
                    <div className="space-y-4 animate-fade-in-up">
                        {myPrayerRequests.map(post => <PrayerRequestCard key={post.id} post={post} onEdit={handleOpenPrayerForm} onDelete={handleOpenConfirmDelete} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não fez nenhum pedido de oração.</p>
                )}
                
                {!isLoadingData && activeTab === 'estudos' && (
                    myStudies.length > 0 ?
                    <div className="space-y-4 animate-fade-in-up">
                        {myStudies.map(post => <StudyCard key={post.id} post={post} onEdit={handleOpenStudyForm} onDelete={handleOpenConfirmDelete} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não iniciou nenhum grupo de estudo.</p>
                )}

                {!isLoadingData && activeTab === 'planos' && (
                    myPlans.length > 0 ?
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {myPlans.map(plan => {
                             const progress = plansProgress.find(p => p.planId === plan.id);
                             return (
                                <PlanCard 
                                    key={plan.id} 
                                    plan={plan} 
                                    progress={progress} 
                                    onClick={() => onNavigate('planDetail', plan.id)} 
                                />
                             );
                        })}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não iniciou nenhum plano de leitura.</p>
                )}

                {!isLoadingData && activeTab === 'playlists' && (
                    user.playlists.length > 0 ?
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {user.playlists.map(playlist => (
                            <div key={playlist.id} onClick={() => handleOpenPlaylist(playlist)} className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-verde-mata dark:text-creme-velado">{playlist.name}</h3>
                                        <p className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70 font-sans mt-1">{playlist.contentIds.length} itens</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }} className="text-marrom-seiva/50 hover:text-red-500 dark:text-creme-velado/50 dark:hover:text-red-500">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="mt-4 flex -space-x-2 overflow-hidden">
                                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-verde-escuro-profundo bg-dourado-suave/20 flex items-center justify-center text-xs font-bold text-dourado-suave">
                                        <QueueListIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não criou nenhuma playlist.</p>
                )}

                {!isLoadingData && activeTab === 'salvos' && (
                    savedTestimonials.length > 0 ?
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {savedTestimonials.map(post => <ProfilePostCard key={post.id} post={post} onCardClick={() => onViewTestimonial(post.id)} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não salvou nenhum testemunho.</p>
                )}
                
                {!isLoadingData && activeTab === 'eventos' && (
                    myEvents.length > 0 ?
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {myEvents.map(event => <EventCard key={event.id} event={event} onCardClick={() => onNavigate('eventDetail', event.id)} />)}
                    </div> :
                    <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70 animate-fade-in">Você ainda não se inscreveu em nenhum evento.</p>
                )}

                {!isLoadingData && activeTab === 'notificacoes' && (
                        <div className="bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-lg animate-fade-in-up">
                        {notifications.length > 0 ? (
                            notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
                        ) : (
                            <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">Nenhuma notificação por aqui.</p>
                        )}
                    </div>
                )}
                
                {!isLoadingData && activeTab === 'configuracoes' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-lg p-6">
                            <h3 className="font-serif text-xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Notificações Push</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-sans font-semibold text-verde-mata dark:text-creme-velado">Receber notificações no dispositivo</p>
                                    <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">Ative para receber alertas importantes.</p>
                                </div>
                                <label htmlFor="pushToggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id="pushToggle" className="sr-only" checked={isPushEnabled} onChange={handlePushToggle} disabled={isPushLoading} />
                                        <div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-14 h-8 rounded-full"></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPushEnabled ? 'translate-x-6 bg-dourado-suave' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-lg p-6">
                            <h3 className="font-serif text-xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Preferências de Notificação</h3>
                            <div className="space-y-4">
                                {[
                                    { key: 'newDevotionals', label: 'Novos Devocionais' },
                                    { key: 'newPrayerRequests', label: 'Novos Pedidos de Oração' },
                                    { key: 'newStudies', label: 'Novos Estudos' },
                                    { key: 'newMentorships', label: 'Novas Mentorias' },
                                    { key: 'newTestimonials', label: 'Novos Testemunhos' },
                                    { key: 'newReadingPlans', label: 'Novos Planos de Leitura' },
                                    { key: 'newEvents', label: 'Novos Eventos' },
                                    { key: 'newLives', label: 'Novas Lives' },
                                    { key: 'newPodcasts', label: 'Novos Podcasts' },
                                    { key: 'commentsOnMyPost', label: 'Comentários em meus posts' },
                                ].map((setting) => (
                                    <div key={setting.key} className="flex items-center justify-between">
                                        <span className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80">{setting.label}</span>
                                        <label className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only" 
                                                    checked={user.notificationSettings?.[setting.key as keyof UserNotificationSettings] ?? true} 
                                                    onChange={() => handleToggleNotificationSetting(setting.key as keyof UserNotificationSettings)} 
                                                />
                                                <div className="block bg-marrom-seiva/20 dark:bg-creme-velado/20 w-10 h-6 rounded-full"></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(user.notificationSettings?.[setting.key as keyof UserNotificationSettings] ?? true) ? 'translate-x-4 bg-dourado-suave' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
    
    <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Perfil">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <InputField id="fullName" label="Nome" value={editedUser.fullName || ''} onChange={(e) => setEditedUser({...editedUser, fullName: e.target.value})} />
            <InputField id="biography" label="Sua Bio" type="textarea" value={editedUser.biography || ''} onChange={(e) => setEditedUser({...editedUser, biography: e.target.value})} />
            <InputField id="cidade" label="Cidade e Estado" placeholder="Ex: São Paulo, SP" value={editedUser.cidade || ''} onChange={(e) => setEditedUser({...editedUser, cidade: e.target.value})} />
            <InputField id="igreja" label="Sua Igreja" placeholder="Ex: Igreja da Cidade" value={editedUser.igreja || ''} onChange={(e) => setEditedUser({...editedUser, igreja: e.target.value})} />
            <InputField id="instagram" label="Instagram (usuário)" value={editedUser.socialLinks?.instagram || ''} onChange={(e) => setEditedUser({...editedUser, socialLinks: {...(editedUser.socialLinks || {}), instagram: e.target.value}})} />
            <InputField id="facebook" label="Facebook (usuário)" value={editedUser.socialLinks?.facebook || ''} onChange={(e) => setEditedUser({...editedUser, socialLinks: {...(editedUser.socialLinks || {}), facebook: e.target.value}})} />
            <InputField id="whatsapp" label="WhatsApp (apenas números)" value={editedUser.socialLinks?.whatsapp || ''} onChange={(e) => setEditedUser({...editedUser, socialLinks: {...(editedUser.socialLinks || {}), whatsapp: e.target.value.replace(/\D/g, '')}})} />
        </div>
        {updateError && <p className="text-red-500 text-sm text-center mt-4">{updateError}</p>}
        <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={isUpdating}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? <Spinner variant="button" /> : 'Salvar'}
            </Button>
        </div>
    </Modal>
    
    {/* ... rest of modals ... */}
    <Modal isOpen={isPrayerFormOpen} onClose={() => setIsPrayerFormOpen(false)} title="Editar Pedido de Oração">
        <div className="space-y-4">
            <InputField id="prayerTitle" label="Título do Pedido" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            <InputField id="prayerBody" label="Descrição" type="textarea" value={postBody} onChange={(e) => setPostBody(e.target.value)} />
            <div className="flex items-center">
                <input type="checkbox" id="isPrayerAnonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-dourado-suave focus:ring-dourado-suave"/>
                <label htmlFor="isPrayerAnonymous" className="ml-2 block text-sm font-sans text-marrom-seiva dark:text-creme-velado/80">Publicar anonimamente</label>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsPrayerFormOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdatePost} disabled={isSubmitting}>
                {isSubmitting ? <Spinner variant="button" /> : 'Salvar'}
            </Button>
        </div>
    </Modal>
    
     <Modal isOpen={isStudyFormOpen} onClose={() => setIsStudyFormOpen(false)} title="Editar Tópico de Estudo">
        <div className="space-y-4">
            <InputField id="studyTitle" label="Título do Tópico" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            <InputField id="studyBody" label="Conteúdo" type="textarea" value={postBody} onChange={(e) => setPostBody(e.target.value)} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsStudyFormOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdatePost} disabled={isSubmitting}>
                {isSubmitting ? <Spinner variant="button" /> : 'Salvar'}
            </Button>
        </div>
    </Modal>
    
    {/* Playlist Content Modal */}
    <Modal isOpen={!!viewingPlaylist} onClose={() => setViewingPlaylist(null)} title={viewingPlaylist?.name || "Playlist"}>
        <div className="max-h-[70vh] overflow-y-auto">
            {isLoadingPlaylistItems ? <Spinner /> : 
            playlistItems.length > 0 ? (
                <div className="space-y-3">
                    {playlistItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => onNavigate('contentDetail', item.id)}
                            className="flex items-center gap-3 p-3 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg cursor-pointer hover:bg-dourado-suave/10"
                        >
                            <div className="relative w-12 h-12 flex-shrink-0">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                    <PlayCircleIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-serif font-semibold text-sm text-verde-mata dark:text-creme-velado line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-marrom-seiva/70 dark:text-creme-velado/70 uppercase">{item.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-marrom-seiva/70 dark:text-creme-velado/70 p-4">Esta playlist está vazia.</p>
            )}
        </div>
        <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={() => setViewingPlaylist(null)}>Fechar</Button>
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
    </>
  );
}