import React, { useState } from 'react';
import { UserPlaylist } from '../types';
import Modal from './Modal';
import InputField from './InputField';
import Button from './Button';
import { PlusIcon } from './Icons';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: UserPlaylist[];
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: (name: string) => Promise<void>;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose, playlists, onAddToPlaylist, onCreatePlaylist }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    await onCreatePlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar à Playlist">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {playlists.length > 0 && !isCreating && (
          playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => onAddToPlaylist(playlist.id)}
              className="w-full text-left p-3 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg hover:bg-dourado-suave/10"
            >
              <p className="font-semibold font-sans text-verde-mata dark:text-creme-velado">{playlist.name}</p>
              <p className="text-sm font-sans text-marrom-seiva/70 dark:text-creme-velado/70">{playlist.contentIds.length} episódio(s)</p>
            </button>
          ))
        )}

        {isCreating ? (
          <div className="space-y-3">
            <InputField
              id="new-playlist"
              label="Nome da Nova Playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Criar</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setIsCreating(true)} fullWidth>
            <PlusIcon className="w-5 h-5 mr-2" />
            Criar Nova Playlist
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default PlaylistModal;
