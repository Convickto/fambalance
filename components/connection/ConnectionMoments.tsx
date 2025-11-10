
import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionMoment, User } from '../../types';
import { famBalanceService } from '../../services/famBalanceService';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../auth/AuthContext';

interface ConnectionMomentsProps {
  familyId: string;
  currentUser: User;
  members: User[];
}

const ConnectionMoments: React.FC<ConnectionMomentsProps> = ({ familyId, currentUser, members }) => {
  const { updateUser } = useAuth();
  const [currentMoment, setCurrentMoment] = useState<ConnectionMoment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchConnectionMoment = useCallback(async () => {
    setLoading(true);
    const moment = await famBalanceService.getSuggestedConnectionMoment(familyId);
    setCurrentMoment(moment);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    fetchConnectionMoment();
  }, [fetchConnectionMoment]);

  const handleParticipate = async (attended: boolean) => {
    if (!currentMoment || !currentUser) return;
    setIsUpdating(true);
    try {
      const updatedMoment = await famBalanceService.updateConnectionMomentParticipation(currentMoment.id, currentUser.id, attended);
      if (updatedMoment) {
        setCurrentMoment(updatedMoment);
        // Recalculate and update user's connection points
        const participation = updatedMoment.participations.find(p => p.userId === currentUser.id);
        const pointsChange = (participation?.attended ? 25 : -25); // Hardcoded points per participation
        updateUser({ ...currentUser, connectionPoints: currentUser.connectionPoints + pointsChange });
      }
    } catch (error) {
      console.error("Erro ao registrar participação:", error);
      alert("Erro ao registrar participação. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getUserName = (userId: string) => members.find(m => m.id === userId)?.name || 'Membro Desconhecido';
  const getParticipationStatus = (userId: string) => currentMoment?.participations.find(p => p.userId === userId)?.attended || false;
  const currentUserAttended = getParticipationStatus(currentUser.id);

  if (loading) {
    return <div className="flex justify-center items-center h-32"><LoadingSpinner /></div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Você tem <span className="font-semibold">{currentUser.connectionPoints}</span> Pontos de Conexão.
      </p>
      {currentMoment ? (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Momento de Conexão Sugerido:</h3>
          <p className="text-xl font-bold text-[#87CEFA] mb-4">{currentMoment.suggestion}</p>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quem participou hoje?</p>
            <ul className="space-y-1">
              {members.map(member => (
                <li key={member.id} className="flex items-center justify-between text-gray-700">
                  <span>{member.avatar} {member.name}</span>
                  {getParticipationStatus(member.id) ? (
                    <span className="text-[#3CB371]">✅ Participou</span>
                  ) : (
                    <span className="text-gray-500">❌ Não participou</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => handleParticipate(true)}
              isLoading={isUpdating && !currentUserAttended}
              disabled={isUpdating || currentUserAttended}
              className="flex-1"
            >
              {currentUserAttended ? 'Você Participou ✅' : 'Eu Participei!'}
            </Button>
            {currentUserAttended && (
              <Button
                variant="outline"
                onClick={() => handleParticipate(false)}
                isLoading={isUpdating && currentUserAttended}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Total de Pontos de Conexão no momento: {currentMoment.connectionPointsEarned}
          </p>
        </div>
      ) : (
        <p className="text-gray-700">Nenhum momento de conexão sugerido para hoje.</p>
      )}
    </div>
  );
};

export default ConnectionMoments;
