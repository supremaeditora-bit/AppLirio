import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../../types';
import { getAllCommunityPostsForAdmin, deleteCommunityPost } from '../../services/api';
import Spinner from '../Spinner';
import ConfirmationModal from '../ConfirmationModal';
import { TrashIcon } from '../Icons';

export default function ModerationManager() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    const postList = await getAllCommunityPostsForAdmin();
    setPosts(postList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenConfirm = (post: CommunityPost) => {
    setPostToDelete(post);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (postToDelete) {
      await deleteCommunityPost(postToDelete.id);
      setIsConfirmOpen(false);
      setPostToDelete(null);
      fetchPosts();
    }
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
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <>
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Moderar Posts da Comunidade</h2>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border border-marrom-seiva/10 dark:border-creme-velado/10 p-4 rounded-lg flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-verde-mata dark:text-creme-velado">{post.author.name}</p>
                    <p className="text-xs text-marrom-seiva/70 dark:text-creme-velado/70">{formatTimeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <h3 className="font-serif font-semibold mt-2">{post.title}</h3>
                <p className="font-sans text-sm text-marrom-seiva/90 dark:text-creme-velado/90 mt-1">{post.body}</p>
              </div>
              <button
                onClick={() => handleOpenConfirm(post)}
                className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500"
                aria-label="Excluir post"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {postToDelete && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Confirmar Exclusão de Post"
          message={`Tem certeza que deseja excluir o post "${postToDelete.title}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
        />
      )}
    </>
  );
}
