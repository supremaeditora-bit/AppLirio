import React, { useState, useEffect } from 'react';
import { getCommunityPosts, addReactionToPost } from '../services/api';
import { CommunityPost, User, Page } from '../types';
import Spinner from '../components/Spinner';
import { SearchIcon, BellIcon, UserCircleIcon, HeartIcon, ChatBubbleIcon, ShareIcon, BookOpenIcon, PlusIcon } from '../components/Icons';
import Button from '../components/Button';

interface TestimonialsProps {
  onViewTestimonial: (id: string) => void;
  onNavigate: (page: Page) => void;
  user: User | null;
}

const TestimonialCard: React.FC<{ post: CommunityPost; onCardClick: () => void; user: User | null }> = ({ post, onCardClick, user }) => {
    const [reactions, setReactions] = useState(post.reactions);
    const hasReacted = user ? reactions.some(r => r.userId === user.id) : false;

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
        <div onClick={onCardClick} className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="flex items-center mb-4">
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                <span className="font-sans font-semibold text-verde-mata dark:text-creme-velado">{post.author.name}</span>
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
                <button className="hover:text-dourado-suave transition-colors">
                    <ShareIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
}

export default function Testimonials({ onViewTestimonial, onNavigate, user }: TestimonialsProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Recentes');

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const postData = await getCommunityPosts('testemunhos');
      setPosts(postData);
      setIsLoading(false);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let sortedPosts = [...posts];
    if (activeFilter === 'Recentes') {
        sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeFilter === 'Mais Populares') {
        sortedPosts.sort((a, b) => {
            const popularityA = a.reactions.length + a.comments.length;
            const popularityB = b.reactions.length + b.comments.length;
            return popularityB - popularityA;
        });
    }
    setFilteredPosts(sortedPosts);
  }, [activeFilter, posts]);

  return (
    <div className="bg-creme-velado/40 dark:bg-verde-escuro-profundo/40 min-h-full">
        {/* Custom Header for Testimonials */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-creme-velado/80 dark:bg-verde-mata/80 backdrop-blur-md border-b border-marrom-seiva/10 dark:border-creme-velado/10">
            <div className="flex items-center space-x-2">
                <BookOpenIcon className="w-7 h-7 text-verde-mata dark:text-dourado-suave" />
                <h1 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">Testemunhos de Fé</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-marrom-seiva/50 dark:text-creme-velado/50"/>
                    <input type="text" placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-2 bg-marrom-seiva/5 dark:bg-creme-velado/5 rounded-full font-sans text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave"/>
                </div>
                <Button onClick={() => onNavigate('publishTestimonial')} className="!py-2 !px-4">Adicionar Testemunho</Button>
            </div>
        </header>

        <main className="max-w-3xl mx-auto p-4 sm:p-8">
            <h2 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave">Feed de Testemunhos</h2>
            
            <div className="my-6 flex items-center space-x-2 border-b border-marrom-seiva/10 dark:border-creme-velado/10">
                {['Recentes', 'Mais Populares'].map(filter => (
                     <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`py-2 px-4 font-sans font-semibold text-sm rounded-t-lg transition-colors ${
                            activeFilter === filter 
                            ? 'bg-creme-velado dark:bg-verde-mata border-b-2 border-dourado-suave text-dourado-suave'
                            : 'text-marrom-seiva/70 dark:text-creme-velado/70 hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5'
                        }`}
                     >
                        {filter}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20"><Spinner /></div>
            ) : (
                <div className="space-y-8">
                    {filteredPosts.map(post => (
                        <TestimonialCard key={post.id} post={post} user={user} onCardClick={() => onViewTestimonial(post.id)} />
                    ))}
                </div>
            )}
        </main>
        
        <Button onClick={() => onNavigate('publishTestimonial')} className="sm:hidden fixed bottom-20 right-4 rounded-full !p-4 shadow-lg">
            <PlusIcon className="w-6 h-6 !mr-0" />
        </Button>
    </div>
  );
}