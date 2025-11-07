import React, { useState, useEffect } from 'react';
import { getMentorships, getCommunityPosts } from '../services/api';
import { ContentItem, User, CommunityPost } from '../types';
import Spinner from '../components/Spinner';
import ContentCard from '../components/ContentCard';

interface MentorshipProps {
  onViewDetail: (id: string) => void; // UPDATED: from number to string
  user: User | null;
}

interface PostCardProps {
    post: CommunityPost;
}
const PostCard: React.FC<PostCardProps> = ({ post }) => {
    return (
        <div className="bg-branco-nevoa dark:bg-verde-mata p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full mr-3"/>
                <span className="font-sans font-semibold text-sm">{post.author.name}</span>
            </div>
            <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado">{post.title}</h3>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-1 line-clamp-2">{post.body}</p>
        </div>
    )
}

export default function Mentorship({ onViewDetail, user }: MentorshipProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const [data, postData] = await Promise.all([
          getMentorships(),
          getCommunityPosts('mentoria')
      ]);
      setItems(data);
      setPosts(postData);
      setIsLoading(false);
    };
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-12">
      <div>
        <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-2">Mentoria</h1>
        <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/70">Cursos e conteúdos para guiar sua jornada.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Spinner /></div>
      ) : (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map(item => (
                <ContentCard 
                key={item.id} 
                item={item} 
                onClick={() => onViewDetail(item.id)} 
                isCompleted={user?.completedContentIds?.includes(item.id)}
                />
            ))}
            </div>

            <div>
                <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mb-4">Discussões da Mentoria</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                 </div>
            </div>
        </>
      )}
    </div>
  );
}