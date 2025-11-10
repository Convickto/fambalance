import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authService } from '../../services/authService';
import { User, UserRole } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DEFAULT_AVATARS } from '../../constants';

const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const FamilyManagement: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, currentFamily, isAuthenticated, loading: authLoading, updateUser: updateAuthContextUser } = useAuth();
    const [familyMembers, setFamilyMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchFamilyMembers = useCallback(async () => {
        if (currentFamily?.id) {
            setLoading(true);
            const members = await authService.getFamilyMembers(currentFamily.id);
            setFamilyMembers(members);
            setLoading(false);
        }
    }, [currentFamily?.id]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (isAuthenticated) {
            fetchFamilyMembers();
        }
    }, [isAuthenticated, authLoading, navigate, fetchFamilyMembers]);

    const handleOpenEditModal = (member: User) => {
        setSelectedMember(member);
        setShowEditModal(true);
    };
    
    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };
    
    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowAddModal(false);
        setSelectedMember(null);
        setError(null);
    };

    const handleUpdateUser = async (updatedUser: User) => {
        await authService.updateUserProfile(updatedUser);
        updateAuthContextUser(updatedUser);
        await fetchFamilyMembers();
        handleCloseModals();
    };
    
    const handleAddUser = async (newUser: Omit<User, 'id' | 'role' | 'harmonyPoints' | 'connectionPoints' | 'familyId'> & { password?: string }) => {
        if (!currentFamily) return;
        const result = await authService.addMemberToFamily(currentFamily.id, newUser.name, newUser.birthDate, newUser.gender, newUser.avatar, newUser.password);
        if (result.success) {
            await fetchFamilyMembers();
            handleCloseModals();
        } else {
            setError(result.error || "Erro ao adicionar membro.");
        }
    };

    const handleResetApp = () => {
      if (window.confirm("ATENÇÃO: Você tem certeza que deseja apagar TODOS os dados do aplicativo? Esta ação é permanente e não pode ser desfeita.")) {
          // Clear all application-specific data from localStorage
          Object.keys(localStorage).forEach(key => {
              if (key.startsWith('famBalance') || key.startsWith('current')) {
                  localStorage.removeItem(key);
              }
          });
          // Redirect to the welcome screen and force a full page reload.
          // The '/#/' path is specifically for the HashRouter.
          window.location.assign('/#/');
      }
    };

    if (loading || authLoading || !currentUser) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 p-4 md:p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Família & Perfis</h1>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Voltar</Button>
            </div>
            
            {currentUser.role === UserRole.ADMIN && (
                 <Button variant="primary" onClick={handleOpenAddModal} className="mb-6 w-full sm:w-auto">Adicionar Membro</Button>
            )}

            <div className="space-y-4">
                {familyMembers.map(member => (
                    <Card key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-4xl mr-4">{member.avatar}</span>
                            <div>
                                <p className="font-semibold text-lg text-gray-800">{member.name} {member.id === currentUser.id ? '(Você)' : ''}</p>
                                <p className="text-sm text-gray-500">{calculateAge(member.birthDate)} anos - {member.role === UserRole.ADMIN ? 'Admin' : 'Membro'}</p>
                            </div>
                        </div>
                        {(currentUser.role === UserRole.ADMIN || currentUser.id === member.id) && (
                            <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(member)}>Editar</Button>
                        )}
                    </Card>
                ))}
            </div>

            {currentUser.role === UserRole.ADMIN && (
                <Card className="mt-8 border-red-500 border-2 bg-red-50">
                    <h2 className="text-xl font-bold text-red-700">Zona de Perigo</h2>
                    <p className="text-red-600 my-2">Esta ação é irreversível. Todos os dados da família, membros, humores e missões serão permanentemente apagados.</p>
                    <Button
                        variant="outline"
                        onClick={handleResetApp}
                        className="!border-red-500 !text-red-500 hover:!bg-red-100 focus:!ring-red-300"
                    >
                        Resetar App (Apagar Todos os Dados)
                    </Button>
                </Card>
            )}

            {showEditModal && selectedMember && <EditMemberModal member={selectedMember} onSave={handleUpdateUser} onClose={handleCloseModals} />}
            {showAddModal && <AddMemberModal onSave={handleAddUser} onClose={handleCloseModals} error={error} />}
        </div>
    );
};

const EditMemberModal: React.FC<{ member: User; onSave: (user: User) => void; onClose: () => void; }> = ({ member, onSave, onClose }) => {
    const [formData, setFormData] = useState(member);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleAvatarChange = (avatar: string) => {
        setFormData({ ...formData, avatar });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-md flex flex-col max-h-[90vh] !p-0">
                <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Nome" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        <Input label="Data de Nascimento" id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Avatar</label>
                            <div className="flex flex-wrap gap-2 justify-center bg-gray-50 p-2 rounded-lg">
                                {DEFAULT_AVATARS.map(avatar => (
                                    <span key={avatar} onClick={() => handleAvatarChange(avatar)} className={`text-3xl p-2 rounded-full cursor-pointer ${formData.avatar === avatar ? 'bg-[#ADD8E6]' : 'hover:bg-gray-200'}`}>{avatar}</span>
                                ))}
                            </div>
                        </div>
                        {/* Add password change fields if needed */}
                    </form>
                </div>
                
                <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" form="edit-member-form" variant="primary" isLoading={isSaving}>Salvar</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};


const AddMemberModal: React.FC<{ onSave: (user: any) => void; onClose: () => void; error: string | null }> = ({ onSave, onClose, error }) => {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
    const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
    const [addPassword, setAddPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ name, birthDate, gender, avatar, password: addPassword ? password : undefined });
        setIsSaving(false);
    };

    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-md flex flex-col max-h-[90vh] !p-0">
                <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Adicionar Novo Membro</h2>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <form id="add-member-form" onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Nome" id="name" value={name} onChange={e => setName(e.target.value)} required />
                        <Input label="Data de Nascimento" id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
                         <div>
                            <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-1">Gênero</label>
                            <select id="gender" value={gender} onChange={e => setGender(e.target.value as any)} className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADD8E6]">
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Avatar</label>
                            <div className="flex flex-wrap gap-2 justify-center bg-gray-50 p-2 rounded-lg">
                                {DEFAULT_AVATARS.map(a => (
                                    <span key={a} onClick={() => setAvatar(a)} className={`text-3xl p-2 rounded-full cursor-pointer ${avatar === a ? 'bg-[#ADD8E6]' : 'hover:bg-gray-200'}`}>{a}</span>
                                ))}
                            </div>
                        </div>
                         <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="addPasswordModal"
                                checked={addPassword}
                                onChange={() => setAddPassword(!addPassword)}
                                className="form-checkbox h-5 w-5 text-[#3CB371] rounded mt-1"
                            />
                            <div className="flex-1">
                                <label htmlFor="addPasswordModal" className="text-gray-700 text-sm font-medium">
                                    Criar uma senha individual para {name || 'este membro'}
                                </label>
                                <p className="text-xs text-gray-500">
                                    Opcional. Permite que o membro faça login individualmente.
                                </p>
                            </div>
                        </div>
                        {addPassword && (
                            <Input
                                id="memberPasswordModal"
                                label={`Senha para ${name}`}
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={addPassword}
                            />
                        )}
                    </form>
                </div>

                <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
                    {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" form="add-member-form" variant="primary" isLoading={isSaving}>Adicionar</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FamilyManagement;