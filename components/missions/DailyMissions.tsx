
import React, { useState, useEffect, useCallback } from 'react';
import { Mission, UserMission } from '../../types';
import { famBalanceService } from '../../services/famBalanceService';
import { useAuth } from '../auth/AuthContext';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { MISSIONS } from '../../constants';

interface DailyMissionsProps {
  userId: string;
  familyId: string;
  isPremium: boolean;
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ userId, familyId, isPremium }) => {
  const { currentUser, updateUser } = useAuth();
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [completedMissionsToday, setCompletedMissionsToday] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const FREE_USER_MISSION_LIMIT = 3;

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const missions = await famBalanceService.getAvailableMissions(userId, familyId);
    const completed = await famBalanceService.getDailyUserMissions(userId, today);
    setAvailableMissions(missions);
    setCompletedMissionsToday(completed);
    setLoading(false);
  }, [userId, familyId]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleCompleteMission = async (mission: Mission) => {
    if (!currentUser) return;
    setIsCompleting(mission.id);
    try {
      await famBalanceService.completeMission(userId, mission);
      updateUser({ ...currentUser, harmonyPoints: currentUser.harmonyPoints + mission.points });
      alert(`Missão "${mission.description}" concluída! Você ganhou ${mission.points} pontos de harmonia.`);
      fetchMissions();
    } catch (error) {
      console.error("Erro ao completar missão:", error);
      alert("Erro ao completar missão. Tente novamente.");
    } finally {
      setIsCompleting(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32"><LoadingSpinner /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Você tem <span className="font-semibold">{currentUser?.harmonyPoints || 0}</span> Pontos de Harmonia.
        </p>
        {!isPremium && (
          <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            Progresso Diário: <span className="font-semibold">{completedMissionsToday.length}/{FREE_USER_MISSION_LIMIT}</span>
          </p>
        )}
      </div>

      <h3 className="font-semibold text-gray-700 mb-2">Missões Disponíveis</h3>
      {availableMissions.length === 0 ? (
        <p className="text-gray-700 text-center p-4 bg-gray-50 rounded-lg">
          {completedMissionsToday.length > 0 ? 'Parabéns! Você concluiu suas missões de hoje.' : 'Nenhuma missão disponível no momento.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {availableMissions.map((mission) => (
            <li key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
              <span className="text-gray-800">
                {mission.description} ({mission.points} Pts)
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCompleteMission(mission)}
                isLoading={isCompleting === mission.id}
                disabled={!!isCompleting}
              >
                Concluir
              </Button>
            </li>
          ))}
        </ul>
      )}

      {completedMissionsToday.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Missões Concluídas Hoje</h3>
          <ul className="space-y-2">
            {completedMissionsToday.map(cm => {
              const missionDetails = MISSIONS.find(m => m.id === cm.missionId);
              return (
                <li key={cm.id} className="flex items-center p-3 bg-green-100 rounded-lg text-green-800 shadow-sm">
                  <span className="text-xl mr-3">✅</span>
                  <span className="line-through">{missionDetails?.description || `Missão ${cm.missionId}`}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {!isPremium && (
        <p className="text-sm text-gray-500 mt-6 text-center italic">
          Assine o plano Premium para missões diárias ilimitadas e personalizadas!
        </p>
      )}
    </div>
  );
};

export default DailyMissions;