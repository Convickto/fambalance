
import React, { useState, useEffect, useCallback } from 'react';
import { Emotion } from '../../types';
import { EMOTIONS_EMOJI } from '../../constants';
import Button from '../ui/Button';
import { famBalanceService } from '../../services/famBalanceService';
import LoadingSpinner from '../ui/LoadingSpinner';

interface EmotionPickerProps {
  userId: string;
  familyId: string;
}

const EmotionPicker: React.FC<EmotionPickerProps> = ({ userId, familyId }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const fetchUserMood = useCallback(async () => {
    setLoading(true);
    const mood = await famBalanceService.getDailyMood(userId);
    if (mood) {
      setSelectedEmotion(mood.emotion);
      setSavedMessage(`Seu humor de hoje (${EMOTIONS_EMOJI[mood.emotion]} ${mood.emotion}) já foi registrado.`);
    } else {
      setSelectedEmotion(null);
      setSavedMessage(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchUserMood();
  }, [fetchUserMood]);

  const handleSaveMood = async () => {
    if (!selectedEmotion) {
      alert('Por favor, selecione uma emoção.');
      return;
    }
    setIsSaving(true);
    try {
      await famBalanceService.saveDailyMood(userId, familyId, selectedEmotion);
      setSavedMessage(`Seu humor de hoje (${EMOTIONS_EMOJI[selectedEmotion]} ${selectedEmotion}) foi salvo!`);
    } catch (error) {
      console.error("Erro ao salvar o humor:", error);
      setSavedMessage("Erro ao salvar seu humor. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>;
  }

  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {Object.values(Emotion).map((emotion) => (
          <button
            key={emotion}
            type="button"
            onClick={() => setSelectedEmotion(emotion)}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition duration-200
                        ${selectedEmotion === emotion ? 'border-[#87CEFA] bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <span className="text-4xl">{EMOTIONS_EMOJI[emotion]}</span>
            <span className="text-sm mt-1 text-gray-700">{emotion.split(' ')[1]}</span>
          </button>
        ))}
      </div>
      {savedMessage && <p className="text-sm text-gray-500 mb-4">{savedMessage}</p>}
      <Button
        variant="primary"
        onClick={handleSaveMood}
        isLoading={isSaving}
        disabled={!selectedEmotion || isSaving}
        className="w-full"
      >
        Salvar Humor
      </Button>
    </div>
  );
};

export default EmotionPicker;
