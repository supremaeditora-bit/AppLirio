
import React, { useState, useEffect } from 'react';
import { User, Role, UserStatus } from '../../types';
import { getAllUsers, updateUserRole, updateUserStatus } from '../../services/api';
import Spinner from '../Spinner';
import SearchAndFilter from '../SearchAndFilter';
import Modal from '../Modal';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import { UserCircleIcon, MapPinIcon, HomeModernIcon, InstagramIcon, FacebookIcon, WhatsAppIcon, ShieldCheckIcon, TrashIcon, LockClosedIcon, EyeIcon, CheckCircleIcon } from '../Icons';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionConfirmOpen, setIsActionConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'ban' | 'activate' | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

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
            user.fullName.toLowerCase().includes(lowercasedQuery) ||
            user.email.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (activeFilter !== 'all') {
        results = results.filter(user => user.role === activeFilter);
    }
    
    setFilteredUsers(results);
  }, [searchQuery, activeFilter, users]);

  const handleUserClick = (user: User) => {
      setSelectedUser(user);
      setIsDetailModalOpen(true);
  };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!selectedUser) return;
      const newRole = e.target.value as Role;
      await updateUserRole(selectedUser.id, newRole);
      
      // Update local state
      const updatedUser = { ...selectedUser, role: newRole };
      setSelectedUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const confirmAction = (type: 'block' | 'ban' | 'activate') => {
      setActionType(type);
      setIsActionConfirmOpen(true);
  };

  const handleStatusAction = async () => {
      if (!selectedUser || !actionType) return;
      
      let newStatus: UserStatus = 'active';
      if (actionType === 'block') newStatus = 'blocked';
      if (actionType === 'ban') newStatus = 'banned';
      if (actionType === 'activate') newStatus = 'active';

      try {
          await updateUserStatus(selectedUser.id, newStatus);
          
          // Update local state
          const updatedUser = { ...selectedUser, status: newStatus };
          setSelectedUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          setIsActionConfirmOpen(false);
          setActionType(null);
      } catch (error) {
          console.error("Failed to update status", error);
          alert("Erro ao atualizar status.");
      }
  };
  
  const getStatusBadge = (status?: string) => {
      switch(status) {
          case 'banned': return <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">BANIDA</span>;
          case 'blocked': return <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">BLOQUEADA</span>;
          default: return <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">ATIVA</span>;
      }
  }

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
              <tr key={user.id} className="border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0 hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5 transition-colors cursor-pointer" onClick={() => handleUserClick(user)}>
                <td className="p-3 flex items-center space-x-3">
                  <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-sans font-medium text-verde-mata dark:text-creme-velado">{user.fullName}</span>
                </td>
                <td className="p-3 font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{user.email}</td>
                <td className="p-3 font-sans text-sm text-marrom-seiva dark:text-creme-velado capitalize">{user.role}</td>
                <td className="p-3">{getStatusBadge(user.status)}</td>
                <td className="p-3">
                    <button className="text-dourado-suave hover:scale-110 transition-transform"><EyeIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* User Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detalhes da Usuária">
        {selectedUser && (
            <div className="space-y-6">
                {/* Header info */}
                <div className="flex flex-col items-center text-center">
                     <img src={selectedUser.avatarUrl} alt={selectedUser.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-dourado-suave mb-3" />
                     <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave">{selectedUser.fullName}</h3>
                     <p className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70 font-sans">{selectedUser.email}</p>
                     <div className="mt-2 flex gap-2">
                        {getStatusBadge(selectedUser.status)}
                        <span className="bg-marrom-seiva/10 dark:bg-creme-velado/10 px-2 py-1 rounded-full text-xs font-bold uppercase text-marrom-seiva dark:text-creme-velado">{selectedUser.role}</span>
                     </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 border-t border-b border-marrom-seiva/10 dark:border-creme-velado/10 py-4">
                     <div className="text-center">
                         <p className="text-xs uppercase text-marrom-seiva/60 dark:text-creme-velado/60 font-bold">Nível</p>
                         <p className="font-serif text-xl font-bold text-dourado-suave">{selectedUser.gardenLevel || 0}</p>
                     </div>
                     <div className="text-center border-l border-r border-marrom-seiva/10 dark:border-creme-velado/10">
                         <p className="text-xs uppercase text-marrom-seiva/60 dark:text-creme-velado/60 font-bold">Streak</p>
                         <p className="font-serif text-xl font-bold text-dourado-suave">{selectedUser.currentStreak || 0} dias</p>
                     </div>
                     <div className="text-center">
                         <p className="text-xs uppercase text-marrom-seiva/60 dark:text-creme-velado/60 font-bold">Conquistas</p>
                         <p className="font-serif text-xl font-bold text-dourado-suave">{selectedUser.unlockedAchievementIds?.length || 0}</p>
                     </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm font-sans text-marrom-seiva/90 dark:text-creme-velado/90">
                    {selectedUser.biography && (
                        <div>
                            <p className="font-bold text-xs uppercase text-marrom-seiva/50 dark:text-creme-velado/50 mb-1">Biografia</p>
                            <p className="italic">"{selectedUser.biography}"</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <p className="font-bold text-xs uppercase text-marrom-seiva/50 dark:text-creme-velado/50 mb-1">Cidade</p>
                             <p className="flex items-center gap-1"><MapPinIcon className="w-4 h-4"/> {selectedUser.cidade || "N/A"}</p>
                        </div>
                        <div>
                             <p className="font-bold text-xs uppercase text-marrom-seiva/50 dark:text-creme-velado/50 mb-1">Igreja</p>
                             <p className="flex items-center gap-1"><HomeModernIcon className="w-4 h-4"/> {selectedUser.igreja || "N/A"}</p>
                        </div>
                    </div>
                     <div className="flex gap-4 pt-2 flex-wrap">
                        {selectedUser.socialLinks?.instagram && <a href={`https://instagram.com/${selectedUser.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="text-dourado-suave hover:underline flex items-center gap-1"><InstagramIcon className="w-4 h-4"/> Instagram</a>}
                        {selectedUser.socialLinks?.facebook && <a href={`https://facebook.com/${selectedUser.socialLinks.facebook}`} target="_blank" rel="noreferrer" className="text-dourado-suave hover:underline flex items-center gap-1"><FacebookIcon className="w-4 h-4"/> Facebook</a>}
                        {selectedUser.socialLinks?.whatsapp && <a href={`https://wa.me/${selectedUser.socialLinks.whatsapp}`} target="_blank" rel="noreferrer" className="text-dourado-suave hover:underline flex items-center gap-1"><WhatsAppIcon className="w-4 h-4"/> WhatsApp</a>}
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-marrom-seiva/5 dark:bg-creme-velado/5 p-4 rounded-lg space-y-4">
                    <h4 className="font-bold text-sm uppercase text-marrom-seiva/70 dark:text-creme-velado/70 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4" /> Ações Administrativas
                    </h4>
                    
                    <div>
                        <label className="block text-xs font-bold mb-1">Alterar Permissão</label>
                        <select 
                            value={selectedUser.role} 
                            onChange={handleRoleChange}
                            className="w-full p-2 rounded border border-marrom-seiva/20 dark:border-creme-velado/20 bg-transparent text-sm"
                        >
                            <option value="aluna">Aluna</option>
                            <option value="mentora">Mentora</option>
                            <option value="mod">Moderadora</option>
                            <option value="admin">Administradora</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        {selectedUser.status === 'active' || !selectedUser.status ? (
                            <>
                                <Button variant="secondary" onClick={() => confirmAction('block')} className="flex-1 !bg-orange-100 hover:!bg-orange-200 text-orange-800 border-orange-200 !py-2 text-sm">
                                    <LockClosedIcon className="w-4 h-4 mr-2" /> Bloquear
                                </Button>
                                <Button variant="secondary" onClick={() => confirmAction('ban')} className="flex-1 !bg-red-100 hover:!bg-red-200 text-red-800 border-red-200 !py-2 text-sm">
                                    <TrashIcon className="w-4 h-4 mr-2" /> Banir
                                </Button>
                            </>
                        ) : (
                             <Button onClick={() => confirmAction('activate')} className="flex-1 !bg-green-600 hover:!bg-green-700 text-white !py-2 text-sm">
                                <CheckCircleIcon className="w-4 h-4 mr-2" /> Reativar Conta
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        )}
      </Modal>

      {/* Confirmation Modal for Ban/Block */}
      <ConfirmationModal
        isOpen={isActionConfirmOpen}
        onClose={() => setIsActionConfirmOpen(false)}
        onConfirm={handleStatusAction}
        title={`Confirmar Ação: ${actionType === 'block' ? 'Bloquear' : actionType === 'ban' ? 'Banir' : 'Reativar'}`}
        message={
            actionType === 'ban' 
            ? `Tem certeza que deseja BANIR ${selectedUser?.fullName}? Ela perderá acesso total à plataforma.` 
            : actionType === 'block' 
            ? `Deseja BLOQUEAR ${selectedUser?.fullName} temporariamente?`
            : `Deseja REATIVAR o acesso de ${selectedUser?.fullName}?`
        }
        confirmText="Confirmar"
      />
    </>
  );
}
