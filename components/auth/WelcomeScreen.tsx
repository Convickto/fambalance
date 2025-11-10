import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { ONBOARDING_TEXT } from '../../constants';
import { useAuth } from './AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import LogoIcon from '../ui/LogoIcon';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  const features = [
    { icon: '😊', title: 'Diário de Humor', description: 'Registre seu humor e entenda o clima emocional da família.' },
    { icon: '🎯', title: 'Missões Diárias', description: 'Complete pequenas tarefas para ganhar pontos de harmonia.' },
    { icon: '📝', title: 'Diário Coletivo', description: 'Compartilhe pensamentos e reaja com carinho aos posts.' },
    { icon: '🫂', title: 'Momentos de Conexão', description: 'Receba sugestões de atividades para fortalecer os laços.' },
    { icon: '📊', title: 'Relatórios Semanais', description: 'Acompanhe o progresso emocional da família com insights.' },
  ];

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner className="h-8 w-8 text-[#3CB371]" />
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex-grow overflow-y-auto p-6 text-center">
        <div className="flex flex-col items-center">
          <LogoIcon className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{ONBOARDING_TEXT.title}</h1>
          <p className="text-gray-600 mb-8 max-w-sm">{ONBOARDING_TEXT.subtitle}</p>
        </div>

        <div className="space-y-6 text-left mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <span className="text-3xl mr-4">{feature.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/register-family')}>
          {ONBOARDING_TEXT.button}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
