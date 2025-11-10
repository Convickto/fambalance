import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Report, Emotion, User } from '../../types';
import { famBalanceService } from '../../services/famBalanceService';
import { authService } from '../../services/authService'; // FIX: Import authService
import { useAuth } from '../auth/AuthContext';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { EMOTIONS_EMOJI } from '../../constants';
import Button from '../ui/Button'; // FIX: Import Button component

interface MoodDataPoint {
  name: string;
  value: number;
  color: string;
}

const emotionColors: Record<Emotion, string> = {
  [Emotion.HAPPY]: '#90EE90', // Soft Green
  [Emotion.NEUTRAL]: '#ADD8E6', // Light Blue
  [Emotion.SAD]: '#AECAD6', // Slightly darker blue for sadness
  [Emotion.STRESSED]: '#FFD700', // Gold for stress/warning
  [Emotion.ANXIOUS]: '#FFA07A', // Light Salmon for anxiety
};

const WeeklyReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { currentFamily, isAuthenticated, loading: authLoading, effectiveIsPremium } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    if (!reportId || !currentFamily?.id) {
      setLoading(false);
      return;
    }

    // FIX: Use famBalanceService.getReportById to fetch the specific report.
    const foundReport = await famBalanceService.getReportById(reportId);
    setReport(foundReport || null);

    if (currentFamily.id) {
      // FIX: Use authService.getFamilyMembers to fetch family members.
      const members = await authService.getFamilyMembers(currentFamily.id);
      setFamilyMembers(members);
    }

    setLoading(false);
  }, [reportId, currentFamily?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && currentFamily) {
      fetchReportData();
    }
  }, [isAuthenticated, authLoading, navigate, currentFamily, fetchReportData]);


  const getUserName = (userId: string) => familyMembers.find(m => m.id === userId)?.name || 'Membro Desconhecido';

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner className="h-8 w-8 text-[#3CB371]" />
        <p className="mt-4 text-gray-600">Carregando relatório...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-xl font-semibold text-gray-800 mb-4">Relatório não encontrado.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>Voltar para o Painel</Button>
      </div>
    );
  }

  const familyMoodChartData = report.familyMoodSummary.map(m => ({
    name: `${EMOTIONS_EMOJI[m.emotion]} ${m.emotion.split(' ')[1]}`,
    value: m.count,
    color: emotionColors[m.emotion],
  }));

  return (
    <div className="flex flex-col space-y-6 overflow-y-auto h-full p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Relatório Semanal de Bem-Estar</h1>
      <p className="text-lg text-gray-600 text-center mb-6">
        De <span className="font-semibold">{new Date(report.startDate).toLocaleDateString('pt-BR')}</span> a <span className="font-semibold">{new Date(report.endDate).toLocaleDateString('pt-BR')}</span>
      </p>

      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo Emocional da Família</h2>
        {familyMoodChartData.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={familyMoodChartData}
              layout="vertical"
              margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: '#374151' }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                formatter={(value: number, name, props) => [`${value} registros`, props.payload.name]}
              />
              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                {familyMoodChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="right" offset={10} style={{ fill: '#4B5563', fontSize: 14, fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 text-center py-10">Nenhum dado de humor registrado para a família nesta semana.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Humor Individual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.individualMoodSummary.map(individual => {
            const chartData = individual.moodData.map(m => ({
              name: `${EMOTIONS_EMOJI[m.emotion]}`,
              fullName: `${EMOTIONS_EMOJI[m.emotion]} ${m.emotion.split(' ')[1]}`,
              count: m.count,
              color: emotionColors[m.emotion],
            }));
            const hasData = chartData.some(d => d.count > 0);
            return (
              <div key={individual.userId} className="border p-4 rounded-xl shadow-sm bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3 text-center">{getUserName(individual.userId)}</h3>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={180}>
                     <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 20 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            formatter={(value: number, name, props) => [`${value} ${value === 1 ? 'dia' : 'dias'}`, props.payload.fullName]}
                        />
                        <Bar dataKey="count" barSize={20} radius={[0, 8, 8, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList dataKey="count" position="right" offset={8} style={{ fill: '#4B5563', fontSize: 14 }} />
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[180px]">
                    <p className="text-gray-500 text-sm text-center">Nenhum dado de humor registrado.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recomendações FamBalance</h2>
        {report.recommendations.length > 0 ? (
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {report.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Nenhuma recomendação disponível para esta semana.</p>
        )}
        {!effectiveIsPremium && (
          <p className="text-sm text-gray-500 mt-4">
            Assine o plano Premium para receber recomendações personalizadas e guiadas por IA.
          </p>
        )}
      </Card>

      <div className="flex justify-center mt-6">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Voltar para o Painel
        </Button>
      </div>
    </div>
  );
};

export default WeeklyReport;
