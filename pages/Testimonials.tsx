import React, { useState, useEffect } from 'react';
import { getCommunityPosts, addReactionToPost, updateCommunityPost, deleteCommunityPost, getAppearanceSettings } from '../services/api';
import { CommunityPost, User, Page, PageHeaderConfig } from '../types';
import Spinner from '../components/Spinner';
import { HeartIcon, ChatBubbleIcon, BookOpenIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/Icons';
import Button from '../components/Button';
import SearchAndFilter from '../components/SearchAndFilter';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import ConfirmationModal from '../components/ConfirmationModal';

interface TestimonialsProps {
  onViewTestimonial: (id: string) => void;
  onNavigate: (page: Page) => void;
  user: User | null;
}

const TestimonialCard: React.FC<{ 
    post: CommunityPost; 
    onCardClick: () => void; 
    user: User | null;
    onEdit: (post: CommunityPost) => void;
    onDelete: (post: CommunityPost) => void;
}> = ({ post, onCardClick, user, onEdit, onDelete }) => {
    const [reactions, setReactions] = useState(post.reactions);
    const hasReacted = user ? reactions.some(r => r.userId === user.id) : false;
    
    const canManage = user && (user.id === post.authorId || user.role === 'admin' || user.role === 'mentora');

    const handleReaction = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        
        const newReactions = hasReacted
            ? reactions.filter(r => r.userId !== user.id)
            : [...reactions, { userId: user.id }];
        setReactions(newReactions);

        await addReactionToPost(post.id, user.id);
    };

    return (
        <div onClick={onCardClick} className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg cursor-pointer transition-transform hover:scale-[1.02] relative group">
            <div className="flex justify-between items-start mb-4">
                {post.author && (
                    <div className="flex items-center">
                        <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-10 h-10 rounded-full object-cover mr-3" />
                        <span className="font-sans font-semibold text-verde-mata dark:text-creme-velado">{post.author.fullName}</span>
                    </div>
                )}
                
                {canManage && (
                    <div className="flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(post); }} 
                            className="p-2 text-marrom-seiva/70 hover:text-dourado-suave dark:text-creme-velado/70 dark:hover:text-dourado-suave rounded-full hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5"
                            aria-label="Editar testemunho"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(post); }} 
                            className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500 rounded-full hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5"
                            aria-label="Excluir testemunho"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            
            {post.imageUrl && (
                 <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover"/>
                 </div>
            )}
            
            <h2 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">{post.title}</h2>
            <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 line-clamp-3 leading-relaxed">
                {post.body}
            </p>
            <button className="font-sans font-semibold text-sm text-dourado-suave mt-1">Ler mais...</button>

            <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex items-center justify-between text-marrom-seiva/70 dark:text-creme-velado/70">
                <div className="flex items-center space-x-5">
                    <button onClick={handleReaction} className={`flex items-center space-x-1.5 hover:text-dourado-suave transition-colors ${hasReacted ? 'text-dourado-suave' : ''}`}>
                        <HeartIcon className="w-5 h-5" filled={hasReacted} />
                        <span className="font-sans text-sm font-semibold">{reactions.length} Améns</span>
                    </button>
                    <div className="flex items-center space-x-1.5">
                        <ChatBubbleIcon className="w-5 h-5" />
                        <span className="font-sans text-sm font-semibold">{post.comments.length} Comentários</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const filterOptions = [
    { value: 'Recentes', label: 'Mais Recentes' },
    { value: 'Mais Populares', label: 'Mais Populares' },
];

export default function Testimonials({ onViewTestimonial, onNavigate, user }: TestimonialsProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Recentes');

  // Edit/Delete States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

  const fetchItems = async () => {
      setIsLoading(true);
      const [postData, settings] = await Promise.all([
          getCommunityPosts('testemunhos'),
          getAppearanceSettings()
      ]);
      setPosts(postData);
      if (settings.pageHeaders?.testimonials) {
          setHeaderConfig(settings.pageHeaders.testimonials);
      }
      setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let results = [...posts];
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(post => 
            post.title.toLowerCase().includes(lowercasedQuery) ||
            post.body.toLowerCase().includes(lowercasedQuery) ||
            (post.author && post.author.fullName.toLowerCase().includes(lowercasedQuery))
        );
    }

    if (activeFilter === 'Recentes') {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeFilter === 'Mais Populares') {
        results.sort((a, b) => {
            const popularityA = a.reactions.length + a.comments.length;
            const popularityB = b.reactions.length + b.comments.length;
            return popularityB - popularityA;
        });
    }
    setFilteredPosts(results);
  }, [searchQuery, activeFilter, posts]);

  const handleEditClick = (post: CommunityPost) => {
      setEditingPost(post);
      setEditTitle(post.title);
      setEditBody(post.body);
      setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
      if (!editingPost || !editBody.trim()) return;
      setIsSubmitting(true);
      try {
          await updateCommunityPost(editingPost.id, {
              title: editTitle,
              body: editBody
          });
          setIsEditModalOpen(false);
          setEditingPost(null);
          fetchItems(); // Refresh list
      } catch (error) {
          console.error("Failed to update testimonial", error);
          alert("Falha ao atualizar o testemunho. Tente novamente.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteClick = (post: CommunityPost) => {
      setPostToDelete(post);
      setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
      if (!postToDelete) return;
      try {
          await deleteCommunityPost(postToDelete.id);
          setIsConfirmDeleteOpen(false);
          setPostToDelete(null);
          fetchItems(); // Refresh list
      } catch (error) {
          console.error("Failed to delete testimonial", error);
          alert("Falha ao excluir o testemunho. Tente novamente.");
      }
  };

  return (
    <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
         {/* Hero Header */}
        <div className="relative h-[40vh] sm:h-[50vh] w-full">
            <img 
                src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1632&auto=format&fit=crop"}
                alt="Testemunhos" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
            
            <button 
                onClick={() => onNavigate('publishTestimonial')} 
                className="absolute top-4 right-4 bg-white/90 dark:bg-verde-mata/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-20 text-verde-mata dark:text-dourado-suave flex items-center gap-2 font-semibold text-sm"
            >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Adicionar Testemunho</span>
            </button>

            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                <div className="container mx-auto">
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                        {headerConfig?.title || "Testemunhos de Fé"}
                    </h1>
                    <p className="text-marrom-seiva/80 dark:text-creme-velado/90 mt-2 text-lg max-w-xl font-sans font-medium drop-shadow-md">
                        {headerConfig?.subtitle || "Histórias reais de transformação e graça. Compartilhe a sua também."}
                    </p>
                </div>
            </div>
        </div>

        <main className="max-w-3xl mx-auto p-4 sm:p-8">
            <h2 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave mb-6">Feed de Testemunhos</h2>
            
            <div className="mb-6">
                <SearchAndFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    filterOptions={filterOptions}
                    searchPlaceholder="Buscar por testemunhos..."
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20"><Spinner /></div>
            ) : (
                <div className="space-y-8">
                    {filteredPosts.length > 0 ? filteredPosts.map(post => (
                        <TestimonialCard 
                            key={post.id} 
                            post={post} 
                            user={user} 
                            onCardClick={() => onViewTestimonial(post.id)}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    )) : (
                        <div className="text-center py-10 text-marrom-seiva/70 dark:text-creme-velado/70">
                            Nenhum testemunho encontrado.
                        </div>
                    )}
                </div>
            )}
        </main>
        
        <Button onClick={() => onNavigate('publishTestimonial')} className="sm:hidden fixed bottom-20 right-4 rounded-full !p-4 shadow-lg">
            <PlusIcon className="w-6 h-6 !mr-0" />
        </Button>

        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Testemunho">
            <div className="space-y-4">
                <InputField 
                    id="editTitle" 
                    label="Título (opcional)" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                />
                <InputField 
                    id="editBody" 
                    label="Seu Testemunho" 
                    type="textarea" 
                    value={editBody} 
                    onChange={(e) => setEditBody(e.target.value)} 
                    required
                />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="primary" onClick={handleSaveEdit} disabled={isSubmitting}>
                    {isSubmitting ? <Spinner variant="button" /> : 'Salvar Alterações'}
                </Button>
            </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        {postToDelete && (
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Testemunho"
                message={`Tem certeza que deseja excluir o testemunho "${postToDelete.title || 'sem título'}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
            />
        )}
    </div>
  );
}