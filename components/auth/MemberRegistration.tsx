import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from './AuthContext';
import { DEFAULT_AVATARS } from '../../constants';

const MemberRegistration: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  const { addMemberToFamily, joinFamilyWithCode, loading } = useAuth();

  const [memberName, setMemberName] = useState('');
  const [memberBirthDate, setMemberBirthDate] = useState('');
  const [memberGender, setMemberGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [memberAvatar, setMemberAvatar] = useState(DEFAULT_AVATARS[0]);
  const [memberPassword, setMemberPassword] = useState('');
  const [addPassword, setAddPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isJoiningExistingFamily, setIsJoiningExistingFamily] = useState(false);

  useEffect(() => {
    if (familyId === 'join') {
      setIsJoiningExistingFamily(true);
    }
  }, [familyId]);

  const validateAndSubmit = async (handler: () => Promise<any>) => {
    setError(null);

    if (!memberName || !memberBirthDate) {
      setError('Por favor, preencha o nome e a data de nascimento do membro.');
      return;
    }

    if (addPassword && !memberPassword) {
      setError('Por favor, crie uma senha para o membro.');
      return;
    }
    
    await handler();
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateAndSubmit(async () => {
      if (!familyId || familyId === 'join') {
        setError('ID da família não encontrado. Por favor, volte para a criação da família.');
        return;
      }

      const result = await addMemberToFamily(familyId, memberName, memberBirthDate, memberGender, memberAvatar, addPassword ? memberPassword : undefined);

      if (result.success) {
        setMemberName('');
        setMemberBirthDate('');
        setMemberPassword('');
        setAddPassword(false);
        setMemberAvatar(DEFAULT_AVATARS[0]);
        alert('Membro adicionado com sucesso!');
      } else {
        setError(result.error || 'Erro ao adicionar membro.');
      }
    });
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateAndSubmit(async () => {
      if (!inviteCode) {
        setError('Por favor, preencha o código de convite.');
        return;
      }

      const result = await joinFamilyWithCode(inviteCode, memberName, memberBirthDate, memberGender, memberAvatar, addPassword ? memberPassword : undefined);

      if (result.success) {
        alert('Você se juntou à família com sucesso!');
        navigate('/dashboard'); // Will be redirected by AuthProvider upon login
      } else {
        setError(result.error || 'Erro ao entrar na família. Verifique o código de convite.');
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-2 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isJoiningExistingFamily ? 'Entrar em uma Família' : 'Adicionar Membros da Família'}
        </h2>
        <p className="text-gray-600 max-w-sm mx-auto">
          {isJoiningExistingFamily ? 'Use um código de convite para se juntar a uma família existente.' : 'Você poderá adicionar mais tarde se preferir.'}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto px-6 py-4">
        <form onSubmit={isJoiningExistingFamily ? handleJoinFamily : handleAddMember} className="w-full max-w-sm mx-auto space-y-4">
          {isJoiningExistingFamily && (
            <Input
              id="inviteCode"
              label="Código de Convite da Família"
              placeholder="ABC123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          )}
          <Input
            id="memberName"
            label="Nome do Membro"
            placeholder="Isabelly"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            required
          />
          <Input
            id="memberBirthDate"
            label="Data de Nascimento"
            type="date"
            value={memberBirthDate}
            onChange={(e) => setMemberBirthDate(e.target.value)}
            required
          />
          <div>
            <label htmlFor="memberGender" className="block text-gray-700 text-sm font-medium mb-1">Gênero</label>
            <select
              id="memberGender"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADD8E6] transition duration-200"
              value={memberGender}
              onChange={(e) => setMemberGender(e.target.value as 'Feminino' | 'Masculino' | 'Outro')}
              required
            >
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="memberAvatar" className="block text-gray-700 text-sm font-medium mb-1">Emoji/Avatar</label>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEFAULT_AVATARS.map((avatar) => (
                <span
                  key={avatar}
                  className={`text-3xl p-2 rounded-full cursor-pointer ${memberAvatar === avatar ? 'bg-[#ADD8E6] shadow-md' : 'hover:bg-gray-100'}`}
                  onClick={() => setMemberAvatar(avatar)}
                >
                  {avatar}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="addPassword"
                checked={addPassword}
                onChange={() => setAddPassword(!addPassword)}
                className="form-checkbox h-5 w-5 text-[#3CB371] rounded mt-1"
              />
              <div className="flex-1">
                  <label htmlFor="addPassword" className="text-gray-700 text-sm font-medium">
                    Criar uma senha individual para {memberName || 'este membro'}
                  </label>
                  <p className="text-xs text-gray-500">
                      Opcional. Se não for criada, o membro não poderá fazer login individualmente.
                  </p>
              </div>
          </div>

          {addPassword && (
            <Input
              id="memberPassword"
              label={`Senha para ${memberName}`}
              type="password"
              placeholder="********"
              value={memberPassword}
              onChange={(e) => setMemberPassword(e.target.value)}
              required={addPassword}
            />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            {isJoiningExistingFamily ? 'Entrar na Família' : 'Adicionar Membro'}
          </Button>
        </form>
      </div>
      
      {/* Footer */}
      <div className="flex-shrink-0 p-6 pt-4 text-center">
        <div className="w-full max-w-sm mx-auto">
            {familyId && familyId !== 'join' && !isJoiningExistingFamily && (
                <Button variant="secondary" className="w-full" onClick={() => navigate('/login')}>
                  Finalizar e Ir para Login
                </Button>
            )}

            {!familyId && !isJoiningExistingFamily && (
              <p className="mt-4 text-gray-600 text-sm">
                Já tem um código de convite?{' '}
                <span className="text-[#87CEFA] font-semibold cursor-pointer hover:underline" onClick={() => setIsJoiningExistingFamily(true)}>
                  Entrar em uma família existente.
                </span>
              </p>
            )}

            {isJoiningExistingFamily && (
              <p className="mt-4 text-gray-600 text-sm">
                <span className="text-[#87CEFA] font-semibold cursor-pointer hover:underline" onClick={() => { setIsJoiningExistingFamily(false); navigate('/register-family'); }}>
                  Voltar para criar uma família.
                </span>
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default MemberRegistration;