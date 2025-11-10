
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { authService } from '../../services/authService';
import Card from '../ui/Card';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [recoveryType, setRecoveryType] = useState<'family' | 'member'>('family');
  const [familyName, setFamilyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!familyName || !adminEmail) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }
    
    const result = await authService.requestPasswordReset(familyName, adminEmail);
    if (result.success) {
      setSuccessMessage('Se as informações estiverem corretas, instruções para redefinir a senha foram enviadas para o e-mail do administrador.');
    } else {
      setError(result.error || 'Não foi possível processar sua solicitação.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Recuperar Senha</h2>

      <div className="w-full max-w-sm mb-4">
        <div className="flex space-x-2 mb-2">
            <Button
              type="button"
              variant={recoveryType === 'family' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setRecoveryType('family')}
              className="flex-1"
            >
              Senha da Família
            </Button>
            <Button
              type="button"
              variant={recoveryType === 'member' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setRecoveryType('member')}
              className="flex-1"
            >
              Senha de Membro
            </Button>
          </div>
      </div>
      
      {recoveryType === 'family' ? (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <p className="text-sm text-gray-600 text-center">Para redefinir a senha da família, confirme o nome da família e o e-mail do administrador.</p>
          <Input
            id="familyName"
            label="Nome da Família"
            placeholder="Família Melo"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
          <Input
            id="adminEmail"
            label="E-mail do Administrador"
            type="email"
            placeholder="admin@exemplo.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Recuperar Senha
          </Button>
        </form>
      ) : (
        <Card className="w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ajuda com a Senha de Membro</h3>
            <p className="text-gray-600">
                Apenas o administrador da família pode redefinir a senha de um membro. Por favor, peça ajuda ao administrador da sua família.
            </p>
        </Card>
      )}

      <p className="mt-6 text-gray-600 text-sm">
        <span className="text-[#87CEFA] font-semibold cursor-pointer hover:underline" onClick={() => navigate('/login')}>
          Voltar para o Login
        </span>
      </p>
    </div>
  );
};

export default ForgotPassword;