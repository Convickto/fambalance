import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from './AuthContext';
import { DEFAULT_AVATARS } from '../../constants';

const FamilyRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { registerFamily, loading } = useAuth();

  const [familyName, setFamilyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminBirthDate, setAdminBirthDate] = useState('');
  const [adminGender, setAdminGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [adminAvatar, setAdminAvatar] = useState(DEFAULT_AVATARS[0]);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!familyName || !adminEmail || !familyPassword || !confirmPassword || !adminName || !adminBirthDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (familyPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const result = await registerFamily(familyName, adminEmail, familyPassword, adminName, adminBirthDate, adminGender, adminAvatar);

    if (result.success && result.familyId) {
      navigate(`/add-members/${result.familyId}`);
    } else {
      setError(result.error || 'Erro ao registrar família.');
    }
  };

  return (
    <div className="flex flex-col items-center p-6 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex-shrink-0">Criar sua Família</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          id="familyName"
          label="Nome da Família"
          placeholder="Família Melo"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          required
        />
        <Input
          id="adminName"
          label="Seu Nome (Administrador)"
          placeholder="Seu Nome"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          required
        />
        <Input
          id="adminEmail"
          label="E-mail do Administrador (Você)"
          type="email"
          placeholder="seu.exemplo.com"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
        />
        <Input
          id="adminBirthDate"
          label="Sua Data de Nascimento"
          type="date"
          value={adminBirthDate}
          onChange={(e) => setAdminBirthDate(e.target.value)}
          required
        />
        <div>
          <label htmlFor="adminGender" className="block text-gray-700 text-sm font-medium mb-1">Gênero</label>
          <select
            id="adminGender"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADD8E6] transition duration-200"
            value={adminGender}
            onChange={(e) => setAdminGender(e.target.value as 'Feminino' | 'Masculino' | 'Outro')}
            required
          >
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label htmlFor="adminAvatar" className="block text-gray-700 text-sm font-medium mb-1">Seu Avatar</label>
          <div className="flex flex-wrap gap-2 justify-center">
            {DEFAULT_AVATARS.map((avatar) => (
              <span
                key={avatar}
                className={`text-3xl p-2 rounded-full cursor-pointer ${adminAvatar === avatar ? 'bg-[#ADD8E6] shadow-md' : 'hover:bg-gray-100'}`}
                onClick={() => setAdminAvatar(avatar)}
              >
                {avatar}
              </span>
            ))}
          </div>
        </div>
        <Input
          id="familyPassword"
          label="Crie uma Senha Familiar"
          type="password"
          placeholder="********"
          value={familyPassword}
          onChange={(e) => setFamilyPassword(e.target.value)}
          required
        />
        <Input
          id="confirmPassword"
          label="Confirme a Senha Familiar"
          type="password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
          Próximo: Adicionar Membros
        </Button>
      </form>
      <p className="mt-6 text-gray-600 text-sm flex-shrink-0">
        Já tem uma família?{' '}
        <span className="text-[#87CEFA] font-semibold cursor-pointer hover:underline" onClick={() => navigate('/login')}>
          Entrar com código de convite.
        </span>
      </p>
    </div>
  );
};

export default FamilyRegistration;