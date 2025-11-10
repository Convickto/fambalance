import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import EmotionPicker from './EmotionPicker';
import FamilyEmotionSummary from './FamilyEmotionSummary';
import DailyMissions from '../missions/DailyMissions';
import FamilyJournal from '../journal/FamilyJournal';
import ConnectionMoments from '../connection/ConnectionMoments';
import LoadingSpinner from '../ui/LoadingSpinner';
import { famBalanceService } from '../../services/famBalanceService';
import { authService } from '../../services/authService';
import { Report, User } from '../../types';
import UpcomingBirthdays from './UpcomingBirthdays';

type Tab = 'today' | 'missions' | 'journal' | 'connection' | 'reports';

const getTrialDaysRemaining = (trialEndsAt?: string): number | null => {
  if (!trialEndsAt) return null;
  const endDate = new Date(trialEndsAt);
  const now = new Date();
  if (endDate < now) return 0;
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const Dashboard: React.FC = () => {
  const { currentUser, currentFamily, isAuthenticated, loading: authLoading, logout, updateFamily, effectiveIsPremium } = useAuth();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [lastReport, setLastReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('today');

  const fetchFamilyMembers = useCallback(async () => {
    if (currentFamily?.id) {
      const members = await authService.getFamilyMembers(currentFamily.id);
      setFamilyMembers(members);
    }
  }, [currentFamily?.id]);

  const fetchLastReport = useCallback(async () => {
    if (currentFamily?.id) {
      const report = await famBalanceService.getLastWeeklyReport(currentFamily.id);
      setLastReport(report);
    }
  }, [currentFamily?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
    if (isAuthenticated) {
      fetchFamilyMembers();
      fetchLastReport();
    }
  }, [isAuthenticated, authLoading, navigate, fetchFamilyMembers, fetchLastReport]);

  const handleGenerateReport = async () => {
    if (!currentFamily || !currentUser) return;
    setReportLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const newReport = await famBalanceService.generateWeeklyReport(
        currentFamily.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        effectiveIsPremium,
        familyMembers
      );
      setLastReport(newReport);
      navigate(`/report/${newReport.id}`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Erro ao gerar relatório semanal.");
    } finally {
      setReportLoading(false);
    }
  };

  const handlePremiumToggle = async () => {
    if (!currentFamily || !currentUser || currentUser.role !== 'ADMIN') {
      alert("Apenas administradores podem alterar o plano.");
      return;
    }
    const newStatus = !currentFamily.isPremium;
    const confirmation = window.confirm(`Deseja ${newStatus ? 'ativar' : 'desativar'} o plano Premium para a família ${currentFamily.name}?`);
    if (confirmation) {
      try {
        const updatedFamily = await famBalanceService.updateFamilyPremiumStatus(currentFamily.id, newStatus);
        if (updatedFamily) {
          updateFamily(updatedFamily);
          alert(`Plano Premium ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
        }
      } catch (error) {
        console.error("Error updating premium status:", error);
        alert("Erro ao atualizar o status do plano.");
      }
    }
  };
  
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('pt-BR', dateOptions);
  const finalDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const trialDaysRemaining = getTrialDaysRemaining(currentFamily?.trialEndsAt);

  if (authLoading || !currentUser || !currentFamily) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner className="h-8 w-8 text-[#3CB371]" />
        <p className="mt-4 text-gray-600">Carregando painel...</p>
      </div>
    );
  }

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none ${
        activeTab === tab
          ? 'bg-[#3CB371] text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Como você se sente hoje?</h2>
              <EmotionPicker userId={currentUser.id} familyId={currentFamily.id} />
            </Card>
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Clima Emocional da Família</h2>
              <FamilyEmotionSummary familyId={currentFamily.id} members={familyMembers} />
            </Card>
            <UpcomingBirthdays members={familyMembers} />
          </div>
        );
      case 'missions':
        return (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Missões Diárias</h2>
            <DailyMissions userId={currentUser.id} familyId={currentFamily.id} isPremium={effectiveIsPremium} />
          </Card>
        );
      case 'journal':
        return (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Diário Emocional Coletivo</h2>
            <FamilyJournal currentUser={currentUser} currentFamily={currentFamily} members={familyMembers} />
          </Card>
        );
      case 'connection':
        return (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Momentos de Conexão</h2>
            <ConnectionMoments familyId={currentFamily.id} currentUser={currentUser} members={familyMembers} />
          </Card>
        );
      case 'reports':
        return (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Relatório Semanal</h2>
            {lastReport ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-gray-600">Último relatório: {new Date(lastReport.endDate).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-gray-500">De {new Date(lastReport.startDate).toLocaleDateString('pt-BR')} a {new Date(lastReport.endDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <Button variant="secondary" onClick={() => navigate(`/report/${lastReport.id}`)} className="mt-2 sm:mt-0">
                  Ver Último Relatório
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">Nenhum relatório gerado ainda.</p>
            )}
            <Button
              variant="primary"
              onClick={handleGenerateReport}
              isLoading={reportLoading}
              disabled={reportLoading}
              className="mt-4 w-full sm:w-auto"
            >
              {reportLoading ? 'Gerando...' : 'Gerar Relatório Semanal'}
            </Button>
            {!effectiveIsPremium && (
              <p className="text-sm text-gray-500 mt-2">
                Assine o plano Premium para relatórios com recomendações de IA.
              </p>
            )}
          </Card>
        );
      default:
        return null;
    }
  };

  const renderPlanStatus = () => {
    if (currentFamily.isPremium) {
      return <span className="text-blue-600 font-semibold">Premium</span>;
    }
    if (trialDaysRemaining !== null && trialDaysRemaining > 0) {
      return <span className="text-green-600 font-semibold">Teste Gratuito ({trialDaysRemaining} dias restantes)</span>;
    }
    if (trialDaysRemaining === 0) {
      return <span className="text-red-600 font-semibold">Período de teste expirado</span>;
    }
    return <span className="text-gray-600 font-semibold">Grátis</span>;
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex-shrink-0 bg-white p-4 md:p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">{finalDate}</p>
            <h1 className="text-2xl font-bold text-gray-800">Olá, {currentUser.name}!</h1>
            <p className="text-md text-gray-600">Família: {currentFamily.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {renderPlanStatus()}
              {currentUser.role === 'ADMIN' && (
                <Button variant="ghost" size="sm" onClick={handlePremiumToggle} className="ml-2 text-xs">
                  {currentFamily.isPremium ? 'Desativar Premium' : 'Ativar Premium'}
                </Button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/family-management')} className="p-2 rounded-full hover:bg-gray-100 transition" title="Gerenciar Família e Perfis">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </button>
            <Button variant="outline" onClick={logout}>Sair</Button>
          </div>
        </div>
      </header>
      
      <nav className="flex-shrink-0 p-2 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <TabButton tab="today" label="Hoje" />
          <TabButton tab="missions" label="Missões" />
          <TabButton tab="journal" label="Diário" />
          <TabButton tab="connection" label="Conexão" />
          <TabButton tab="reports" label="Relatórios" />
        </div>
      </nav>

      <main className="overflow-y-auto flex-grow p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;