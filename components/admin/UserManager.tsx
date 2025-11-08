import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser } from '../../services/api';
import Spinner from '../Spinner';
import SearchAndFilter from '../SearchAndFilter';
import { TrashIcon, BlockIcon } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoles, setEditingRoles] = useState<Record<string, Role>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'Todas as Permissões' },
    { value: 'aluna', label: 'Aluna' },
    { value: 'mentora', label: 'Mentora' },
    { value: 'mod', label: 'Mod' },
    { value: 'admin', label: 'Admin' },
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    const userList = await getAllUsers();
    setUsers(userList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let results = [...users];
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(user => 
            user.displayName.toLowerCase().includes(lowercasedQuery) ||
            user.email.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (activeFilter !== 'all') {
        results = results.filter(user => user.role === activeFilter);
    }
    
    setFilteredUsers(results);
  }, [searchQuery, activeFilter, users]);

  const handleRoleChange = (userId: string, newRole: Role) => {
    setEditingRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleSaveRole = async (userId: string) => {
    const newRole = editingRoles[userId];
    if (newRole) {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      const newEditingRoles = { ...editingRoles };
      delete newEditingRoles[userId];
      setEditingRoles(newEditingRoles);
    }
  };
  
  const handleOpenBlockConfirm = (user: User) => {
    setUserToAction(user);
    setIsBlockConfirmOpen(true);
  };

  const handleOpenDeleteConfirm = (user: User) => {
    setUserToAction(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!userToAction) return;
    const newStatus = userToAction.status === 'active' ? 'blocked' : 'active';
    await updateUserStatus(userToAction.id, newStatus);
    setIsBlockConfirmOpen(false);
    setUserToAction(null);
    fetchUsers();
  };

  const handleConfirmDelete = async () => {
    if (!userToAction) return;
    await deleteUser(userToAction.id);
    setIsDeleteConfirmOpen(false);
    setUserToAction(null);
    fetchUsers();
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <>
      <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Gerenciar Usuárias</h2>
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filterOptions={filterOptions}
        searchPlaceholder="Buscar por nome ou email..."
      />
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-marrom-seiva/20 dark:border-creme-velado/20">
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Usuária</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Email</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Permissão</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Status</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={`border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0 ${user.status === 'blocked' ? 'opacity-60 bg-red-500/5 dark:bg-red-500/10' : ''}`}>
                <td className="p-3 flex items-center space-x-3">
                  <img src={user.avatarUrl} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-sans font-medium text-verde-mata dark:text-creme-velado">{user.displayName}</span>
                </td>
                <td className="p-3 font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{user.email}</td>
                <td className="p-3">
                  <select
                    value={editingRoles[user.id] || user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                    className="font-sans bg-creme-velado dark:bg-verde-escuro-profundo border-2 border-marrom-seiva/20 dark:border-creme-velado/20 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-dourado-suave"
                  >
                    <option value="aluna">Aluna</option>
                    <option value="mentora">Mentora</option>
                    <option value="mod">Mod</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-3">
                   <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                    {user.status === 'active' ? 'Ativa' : 'Bloqueada'}
                   </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    {editingRoles[user.id] && editingRoles[user.id] !== user.role && (
                      <button
                        onClick={() => handleSaveRole(user.id)}
                        className="bg-dourado-suave text-verde-mata font-bold py-1 px-3 rounded-md text-xs hover:opacity-90"
                      >
                        Salvar
                      </button>
                    )}
                     <button
                        onClick={() => handleOpenBlockConfirm(user)}
                        className="p-2 text-marrom-seiva/70 hover:text-orange-500 dark:text-creme-velado/70 dark:hover:text-orange-500"
                        title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    >
                        <BlockIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleOpenDeleteConfirm(user)}
                        className="p-2 text-marrom-seiva/70 hover:text-red-500 dark:text-creme-velado/70 dark:hover:text-red-500"
                        title="Excluir"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userToAction && (
        <>
            <ConfirmationModal
                isOpen={isBlockConfirmOpen}
                onClose={() => setIsBlockConfirmOpen(false)}
                onConfirm={handleConfirmBlock}
                title={`${userToAction.status === 'active' ? 'Bloquear' : 'Desbloquear'} Usuária`}
                message={`Tem certeza que deseja ${userToAction.status === 'active' ? 'bloquear' : 'desbloquear'} a usuária ${userToAction.displayName}?`}
                confirmText={userToAction.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                confirmVariant={userToAction.status === 'active' ? 'danger' : 'primary'}
            />
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Usuária"
                message={`Tem certeza que deseja excluir ${userToAction.displayName}? Esta ação é irreversível e todos os dados da usuária serão perdidos.`}
                confirmText="Excluir"
                confirmVariant="danger"
            />
        </>
      )}
    </>
  );
}