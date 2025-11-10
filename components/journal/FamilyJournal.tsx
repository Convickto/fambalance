
import React, { useState, useEffect, useCallback } from 'react';
import { JournalEntry, User, Family, Emotion } from '../../types';
import { famBalanceService } from '../../services/famBalanceService';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { EMOTIONS_EMOJI, REACTION_EMOJIS } from '../../constants';

interface FamilyJournalProps {
  currentUser: User;
  currentFamily: Family;
  members: User[];
}

const FamilyJournal: React.FC<FamilyJournalProps> = ({ currentUser, currentFamily, members }) => {
  const [journalText, setJournalText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJournalEntries = useCallback(async () => {
    setLoading(true);
    const fetchedEntries = await famBalanceService.getFamilyJournalEntries(currentFamily.id);
    setEntries(fetchedEntries);
    setLoading(false);
  }, [currentFamily.id]);

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!journalText.trim() || !selectedEmotion) {
      setError('Por favor, escreva algo e selecione uma emoção.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newEntry = await famBalanceService.addJournalEntry(currentUser.id, currentFamily.id, journalText, selectedEmotion);
      setEntries(prev => [newEntry, ...prev]);
      setJournalText('');
      setSelectedEmotion(null);
    } catch (err) {
      console.error('Erro ao adicionar entrada no diário:', err);
      setError('Não foi possível adicionar a entrada. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (entryId: string, emoji: string) => {
    try {
      const updatedEntry = await famBalanceService.addReactionToJournalEntry(entryId, currentUser.id, emoji);
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => (entry.id === entryId ? updatedEntry : entry)));
      }
    } catch (err) {
      console.error('Erro ao adicionar reação:', err);
    }
  };

  const getUserName = (userId: string) => members.find(m => m.id === userId)?.name || 'Membro Desconhecido';
  const getUserAvatar = (userId: string) => members.find(m => m.id === userId)?.avatar || '👤';

  const getMoodColorClass = (emotion: Emotion) => {
    switch (emotion) {
      case Emotion.HAPPY: return 'bg-green-100 border-green-300';
      case Emotion.NEUTRAL: return 'bg-blue-100 border-blue-300';
      case Emotion.SAD: return 'bg-indigo-100 border-indigo-300';
      case Emotion.STRESSED: return 'bg-yellow-100 border-yellow-300';
      case Emotion.ANXIOUS: return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmitEntry} className="mb-8 p-4 bg-gray-50 rounded-xl shadow-inner space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Compartilhe seu dia:</h3>
        <Input
          id="journalEntry"
          placeholder="Hoje eu me senti..."
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          rows={3}
          as="textarea" // Make it a textarea
        />
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {Object.values(Emotion).map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => setSelectedEmotion(emotion)}
              className={`p-2 rounded-full border transition duration-200 ${selectedEmotion === emotion ? 'border-[#87CEFA] bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-100'}`}
            >
              <span className="text-2xl">{EMOTIONS_EMOJI[emotion]}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
          Adicionar ao Diário
        </Button>
      </form>

      <div className="space-y-6">
        {entries.length === 0 ? (
          <p className="text-gray-600 text-center">Nenhuma entrada no diário ainda. Seja o primeiro a compartilhar!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className={`p-4 rounded-xl border-2 ${getMoodColorClass(entry.emotion)} shadow-sm`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{getUserAvatar(entry.userId)}</span>
                <div>
                  <p className="font-semibold text-gray-800">{getUserName(entry.userId)}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('pt-BR')} - {EMOTIONS_EMOJI[entry.emotion]} {entry.emotion.split(' ')[1]}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3 text-lg">{entry.text}</p>
              <div className="flex items-center flex-wrap gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReaction(entry.id, emoji)}
                    className={`relative p-1 rounded-full text-lg transition duration-150 ${entry.reactions.some(r => r.userId === currentUser.id && r.emoji === emoji) ? 'bg-blue-200 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {emoji}
                    {entry.reactions.filter(r => r.emoji === emoji).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {entry.reactions.filter(r => r.emoji === emoji).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyJournal;
