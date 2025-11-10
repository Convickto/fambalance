import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from './AuthContext';
import LogoIcon from '../ui/LogoIcon';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFamilyLogin, setIsFamilyLogin] = useState(true); // Default to family login
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const success = await login(username, password, isFamilyLogin);
    if (!success) {
      setError(isFamilyLogin ? 'Nome da família ou senha incorretos.' : 'Nome de usuário ou senha incorretos.');
    }
    // AuthContext's login handles navigation on success
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <LogoIcon className="w-20 h-20 mb-4" />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Bem-vindo(a) de volta!</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="loginType" className="block text-gray-700 text-sm font-medium mb-1">Tipo de Login</label>
          <div className="flex space-x-2 mb-2">
            <Button
              type="button"
              variant={isFamilyLogin ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setIsFamilyLogin(true)}
              className="flex-1"
            >
              Família
            </Button>
            <Button
              type="button"
              variant={!isFamilyLogin ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setIsFamilyLogin(false)}
              className="flex-1"
            >
              Membro
            </Button>
          </div>
        </div>
        <Input
          id="username"
          label={isFamilyLogin ? "Nome da Família" : "Nome do Membro"}
          placeholder={isFamilyLogin ? "Família Melo" : "Isabelly"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Senha"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="form-checkbox h-5 w-5 text-[#3CB371] rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-gray-700 text-sm">Lembrar-me</label>
          </div>
          <span
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer hover:underline"
            onClick={() => navigate('/forgot-password')}
          >
            Esqueceu a senha?
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-gray-600 text-sm">
        Ainda não tem família?{' '}
        <span className="text-[#87CEFA] font-semibold cursor-pointer hover:underline" onClick={() => navigate('/register-family')}>
          Criar nova família.
        </span>
      </p>
      <p className="mt-2 text-gray-600 text-sm">
        <span className="text-[#87CEFA] font-semibold cursor-pointer hover:underline" onClick={() => navigate('/add-members/join')}>
          Entrar com código de convite.
        </span>
      </p>
    </div>
  );
};

export default LoginScreen;
