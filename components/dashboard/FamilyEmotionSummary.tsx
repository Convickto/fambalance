
import React, { useState, useEffect, useCallback } from 'react';
import { DailyMood, Emotion, User } from '../../types';
import { famBalanceService } from '../../services/famBalanceService';
import { EMOTIONS_EMOJI } from '../../constants';
import LoadingSpinner from '../ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FamilyEmotionSummaryProps {
  familyId: string;
  members: User[];
}

const emotionColors: Record<Emotion, string> = {
  [Emotion.HAPPY]: '#90EE90', // Soft Green
  [Emotion.NEUTRAL]: '#ADD8E6', // Light Blue
  [Emotion.SAD]: '#AECAD6', // Slightly darker blue for sadness
  [Emotion.STRESSED]: '#FFD700', // Gold for stress/warning
  [Emotion.ANXIOUS]: '#FFA07A', // Light Salmon for anxiety
};

const FamilyEmotionSummary: React.FC<FamilyEmotionSummaryProps> = ({ familyId, members }) => {
  const [dailyMoods, setDailyMoods] = useState<DailyMood[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilyMoods = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const moods = await famBalanceService.getFamilyDailyMoods(familyId, today);
    setDailyMoods(moods);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    fetchFamilyMoods();
  }, [fetchFamilyMoods]);

  const totalMembers = members.length;
  const moodsCount: Record<Emotion, number> = {
    [Emotion.HAPPY]: 0,
    [Emotion.NEUTRAL]: 0,
    [Emotion.SAD]: 0,
    [Emotion.STRESSED]: 0,
    [Emotion.ANXIOUS]: 0,
  };

  dailyMoods.forEach(mood => {
    moodsCount[mood.emotion]++;
  });

  const moodData = Object.entries(moodsCount).map(([emotion, count]) => ({
    name: `${EMOTIONS_EMOJI[emotion as Emotion]} ${emotion.split(' ')[1]}`,
    count,
    color: emotionColors[emotion as Emotion]
  }));

  const mostCommonMood = Object.entries(moodsCount).reduce((a, b) => (a[1] > b[1] ? a : b), [Emotion.NEUTRAL, 0] as [Emotion, number]);
  const membersWithMood = dailyMoods.length;

  if (loading) {
    return <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>;
  }

  return (
    <div className="text-center">
      {membersWithMood > 0 ? (
        <>
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold">{membersWithMood} de {totalMembers}</span> membros registraram o humor hoje.
          </p>
          <p className="text-xl font-bold text-gray-800 mb-6">
            <span className="text-[#87CEFA]">{mostCommonMood[1]} de {totalMembers}</span> estão se sentindo <span className="text-[#3CB371]">{mostCommonMood[0].split(' ')[1]}</span> hoje.
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#8884d8" radius={[10, 10, 0, 0]}>
                  {moodData.map((entry, index) => (
                    <Bar key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-lg text-gray-700">Nenhum membro registrou o humor hoje. Incentive sua família a participar!</p>
      )}
    </div>
  );
};

export default FamilyEmotionSummary;
