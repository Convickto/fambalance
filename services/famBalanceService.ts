
import { DailyMood, Emotion, Family, JournalEntry, Mission, User, UserMission, ConnectionMoment, Report } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MISSIONS, CONNECTION_MOMENT_SUGGESTIONS } from '../constants';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOODS_STORAGE_KEY = 'famBalanceDailyMoods';
const USER_MISSIONS_STORAGE_KEY = 'famBalanceUserMissions';
const JOURNAL_ENTRIES_STORAGE_KEY = 'famBalanceJournalEntries';
const CONNECTION_MOMENTS_STORAGE_KEY = 'famBalanceConnectionMoments';
const REPORTS_STORAGE_KEY = 'famBalanceReports';
const USERS_STORAGE_KEY = 'famBalanceUsers';
const FAMILIES_STORAGE_KEY = 'famBalanceFamilies';

const saveToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const famBalanceService = {
  async saveDailyMood(userId: string, familyId: string, emotion: Emotion): Promise<DailyMood> {
    await delay(300);
    const moods: DailyMood[] = loadFromLocalStorage(MOODS_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];

    const existingMoodIndex = moods.findIndex(m => m.userId === userId && m.date === today);

    const newMood: DailyMood = {
      userId,
      familyId,
      date: today,
      emotion,
    };

    if (existingMoodIndex !== -1) {
      moods[existingMoodIndex] = newMood;
    } else {
      moods.push(newMood);
    }
    saveToLocalStorage(MOODS_STORAGE_KEY, moods);
    return newMood;
  },

  async getDailyMood(userId: string): Promise<DailyMood | null> {
    await delay(100);
    const moods: DailyMood[] = loadFromLocalStorage(MOODS_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    return moods.find(m => m.userId === userId && m.date === today) || null;
  },

  async getFamilyDailyMoods(familyId: string, date: string = new Date().toISOString().split('T')[0]): Promise<DailyMood[]> {
    await delay(200);
    const moods: DailyMood[] = loadFromLocalStorage(MOODS_STORAGE_KEY);
    return moods.filter(m => m.familyId === familyId && m.date === date);
  },

  async getAvailableMissions(userId: string, familyId: string): Promise<Mission[]> {
    await delay(300);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);
    const user = users.find(u => u.id === userId);
    if (!user) return [];

    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    const family = families.find(f => f.id === familyId);
    const isPremium = family?.isPremium || false;

    const userMood = await this.getDailyMood(userId);
    const today = new Date().toISOString().split('T')[0];
    const completedMissionsToday: UserMission[] = loadFromLocalStorage(USER_MISSIONS_STORAGE_KEY)
      .filter((um: UserMission) => um.userId === userId && um.date === today && um.completed);

    const FREE_USER_MISSION_LIMIT = 3;

    if (!isPremium && completedMissionsToday.length >= FREE_USER_MISSION_LIMIT) {
        return [];
    }

    const potentialMissions = MISSIONS.filter(mission => {
      // Filter out already completed missions
      if (completedMissionsToday.some(um => um.missionId === mission.id)) {
        return false;
      }
      // Filter out premium missions for free users
      if (!isPremium && mission.isPremium) {
        return false;
      }
      // Filter by mood if specified
      if (mission.moodTrigger && userMood && !mission.moodTrigger.includes(userMood.emotion)) {
        return false;
      }
      return true;
    });

    if (!isPremium) {
      const remainingSlots = FREE_USER_MISSION_LIMIT - completedMissionsToday.length;
      return potentialMissions.slice(0, remainingSlots);
    }
    
    return potentialMissions;
  },

  async completeMission(userId: string, mission: Mission): Promise<UserMission> {
    await delay(500);
    const userMissions: UserMission[] = loadFromLocalStorage(USER_MISSIONS_STORAGE_KEY);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);

    const today = new Date().toISOString().split('T')[0];

    const newUserMission: UserMission = {
      id: uuidv4(),
      userId,
      missionId: mission.id,
      date: today,
      completed: true,
      harmonyPointsEarned: mission.points,
    };
    userMissions.push(newUserMission);
    saveToLocalStorage(USER_MISSIONS_STORAGE_KEY, userMissions);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].harmonyPoints += mission.points;
      saveToLocalStorage(USERS_STORAGE_KEY, users);
    }

    return newUserMission;
  },

  async getDailyUserMissions(userId: string, date: string = new Date().toISOString().split('T')[0]): Promise<UserMission[]> {
    await delay(200);
    const userMissions: UserMission[] = loadFromLocalStorage(USER_MISSIONS_STORAGE_KEY);
    return userMissions.filter(um => um.userId === userId && um.date === date);
  },

  async addJournalEntry(userId: string, familyId: string, text: string, emotion: Emotion): Promise<JournalEntry> {
    await delay(500);
    const entries: JournalEntry[] = loadFromLocalStorage(JOURNAL_ENTRIES_STORAGE_KEY);
    const newEntry: JournalEntry = {
      id: uuidv4(),
      userId,
      familyId,
      date: new Date().toISOString().split('T')[0],
      text,
      emotion,
      reactions: [],
    };
    entries.push(newEntry);
    saveToLocalStorage(JOURNAL_ENTRIES_STORAGE_KEY, entries);
    return newEntry;
  },

  async getFamilyJournalEntries(familyId: string): Promise<JournalEntry[]> {
    await delay(200);
    const entries: JournalEntry[] = loadFromLocalStorage(JOURNAL_ENTRIES_STORAGE_KEY);
    return entries.filter(e => e.familyId === familyId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addReactionToJournalEntry(entryId: string, reactorId: string, emoji: string): Promise<JournalEntry | null> {
    await delay(300);
    const entries: JournalEntry[] = loadFromLocalStorage(JOURNAL_ENTRIES_STORAGE_KEY);
    const entryIndex = entries.findIndex(e => e.id === entryId);

    if (entryIndex !== -1) {
      const existingReactionIndex = entries[entryIndex].reactions.findIndex(r => r.userId === reactorId && r.emoji === emoji);
      if (existingReactionIndex !== -1) {
        entries[entryIndex].reactions.splice(existingReactionIndex, 1); // Toggle off
      } else {
        entries[entryIndex].reactions.push({ userId: reactorId, emoji }); // Add reaction
      }
      saveToLocalStorage(JOURNAL_ENTRIES_STORAGE_KEY, entries);
      return entries[entryIndex];
    }
    return null;
  },

  async getSuggestedConnectionMoment(familyId: string): Promise<ConnectionMoment> {
    await delay(300);
    const existingMoments: ConnectionMoment[] = loadFromLocalStorage(CONNECTION_MOMENTS_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    const existingToday = existingMoments.find(m => m.familyId === familyId && m.date === today);

    if (existingToday) {
      return existingToday;
    }

    const suggestion = CONNECTION_MOMENT_SUGGESTIONS[Math.floor(Math.random() * CONNECTION_MOMENT_SUGGESTIONS.length)];
    const newMoment: ConnectionMoment = {
      id: uuidv4(),
      familyId,
      suggestion,
      date: today,
      participations: [],
      connectionPointsEarned: 0,
    };

    existingMoments.push(newMoment);
    saveToLocalStorage(CONNECTION_MOMENTS_STORAGE_KEY, existingMoments);
    return newMoment;
  },

  async updateConnectionMomentParticipation(momentId: string, userId: string, attended: boolean): Promise<ConnectionMoment | null> {
    await delay(500);
    const moments: ConnectionMoment[] = loadFromLocalStorage(CONNECTION_MOMENTS_STORAGE_KEY);
    const users: User[] = loadFromLocalStorage(USERS_STORAGE_KEY);

    const momentIndex = moments.findIndex(m => m.id === momentId);
    if (momentIndex !== -1) {
      const participationIndex = moments[momentIndex].participations.findIndex(p => p.userId === userId);
      const pointsPerParticipation = 25; // Example points

      if (participationIndex !== -1) {
        moments[momentIndex].participations[participationIndex].attended = attended;
      } else {
        moments[momentIndex].participations.push({ userId, attended });
      }

      // Recalculate points for the moment
      const totalParticipants = moments[momentIndex].participations.filter(p => p.attended).length;
      moments[momentIndex].connectionPointsEarned = totalParticipants * pointsPerParticipation;

      // Update user points
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        const currentUserParticipation = moments[momentIndex].participations.find(p => p.userId === userId);
        if (currentUserParticipation?.attended) {
          // Add points if not already added for this event, or if switching from not attended to attended
          const previousPoints = users[userIndex].connectionPoints;
          users[userIndex].connectionPoints = previousPoints + (attended ? pointsPerParticipation : -pointsPerParticipation); // Simple toggle
          saveToLocalStorage(USERS_STORAGE_KEY, users);
        }
      }

      saveToLocalStorage(CONNECTION_MOMENTS_STORAGE_KEY, moments);
      return moments[momentIndex];
    }
    return null;
  },

  async generateWeeklyReport(familyId: string, startDate: string, endDate: string, isPremium: boolean, members: User[]): Promise<Report> {
    await delay(1000); // Simulate processing time

    const moods: DailyMood[] = loadFromLocalStorage(MOODS_STORAGE_KEY);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredMoods = moods.filter(m => {
      const moodDate = new Date(m.date);
      return m.familyId === familyId && moodDate >= start && moodDate <= end;
    });

    // Individual mood summary
    const individualMoodSummary = members.map(member => {
      const memberMoods = filteredMoods.filter(m => m.userId === member.id);
      const moodCounts: Record<Emotion, number> = {
        [Emotion.HAPPY]: 0,
        [Emotion.NEUTRAL]: 0,
        [Emotion.SAD]: 0,
        [Emotion.STRESSED]: 0,
        [Emotion.ANXIOUS]: 0,
      };
      memberMoods.forEach(m => moodCounts[m.emotion]++);
      return { userId: member.id, moodData: Object.entries(moodCounts).map(([emotion, count]) => ({ emotion: emotion as Emotion, count })) };
    });

    // Family mood summary
    const familyMoodCounts: Record<Emotion, number> = {
      [Emotion.HAPPY]: 0,
      [Emotion.NEUTRAL]: 0,
      [Emotion.SAD]: 0,
      [Emotion.STRESSED]: 0,
      [Emotion.ANXIOUS]: 0,
    };
    filteredMoods.forEach(m => familyMoodCounts[m.emotion]++);
    const familyMoodSummary = Object.entries(familyMoodCounts).map(([emotion, count]) => ({ emotion: emotion as Emotion, count }));

    // Recommendations (AI-guided for premium)
    let recommendations: string[] = [];
    if (isPremium) {
      // In a real app, this would use geminiService.getAiRecommendations
      const prominentMoods = familyMoodSummary.filter(m => m.count > 0).sort((a, b) => b.count - a.count);
      if (prominentMoods.length > 0) {
        const topMood = prominentMoods[0].emotion;
        recommendations = [`Sua família sentiu-se predominantemente ${topMood} nesta semana.`, 'Aqui estão algumas sugestões personalizadas de bem-estar:'];
        // Mock specific AI recommendations based on top mood
        if (topMood === Emotion.ANXIOUS || topMood === Emotion.STRESSED) {
          recommendations.push("Priorize atividades de relaxamento e respiração profunda. Considere momentos de silêncio e meditação em família.");
          recommendations.push("Identifiquem fontes de estresse e discutam estratégias para gerenciá-las juntos.");
        } else if (topMood === Emotion.SAD) {
          recommendations.push("Incentivem mais momentos de conexão e apoio mútuo. Pequenos gestos de carinho podem fazer a diferença.");
          recommendations.push("Conversem abertamente sobre sentimentos, criando um espaço seguro para expressar a tristeza.");
        } else if (topMood === Emotion.HAPPY) {
          recommendations.push("Continuem celebrando as pequenas vitórias e os momentos de alegria. Compartilhem o que os fez felizes!");
          recommendations.push("Pensem em novas atividades divertidas para fortalecer ainda mais os laços familiares.");
        } else { // Neutral
          recommendations.push("Explorem novas atividades em família para despertar a alegria e a conexão.");
          recommendations.push("Reflitam sobre o que poderia trazer mais emoções positivas para o dia a dia.");
        }
      } else {
        recommendations = ["Não há dados de humor suficientes para gerar recomendações específicas esta semana. Continue registrando!"];
      }
      recommendations.push("Lembre-se: O bem-estar é uma jornada, e FamBalance está aqui para apoiar sua família a cada passo.");

    } else {
      recommendations = ["Assine o plano Premium para receber relatórios semanais com recomendações personalizadas por IA!"];
    }


    const newReport: Report = {
      id: uuidv4(),
      familyId,
      startDate,
      endDate,
      individualMoodSummary,
      familyMoodSummary,
      recommendations,
    };

    const reports: Report[] = loadFromLocalStorage(REPORTS_STORAGE_KEY);
    reports.push(newReport);
    saveToLocalStorage(REPORTS_STORAGE_KEY, reports);

    return newReport;
  },
  
  async getLastWeeklyReport(familyId: string): Promise<Report | null> {
    await delay(200);
    const reports: Report[] = loadFromLocalStorage(REPORTS_STORAGE_KEY);
    const familyReports = reports.filter(r => r.familyId === familyId);
    if (familyReports.length === 0) return null;
    return familyReports.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
  },

  // FIX: Added getReportById method to fetch a single report by its ID.
  async getReportById(reportId: string): Promise<Report | null> {
    await delay(200);
    const reports: Report[] = loadFromLocalStorage(REPORTS_STORAGE_KEY);
    return reports.find(r => r.id === reportId) || null;
  },

  async updateFamilyPremiumStatus(familyId: string, isPremium: boolean): Promise<Family | null> {
    await delay(500);
    const families: Family[] = loadFromLocalStorage(FAMILIES_STORAGE_KEY);
    const familyIndex = families.findIndex(f => f.id === familyId);

    if (familyIndex !== -1) {
      families[familyIndex].isPremium = isPremium;
      saveToLocalStorage(FAMILIES_STORAGE_KEY, families);
      return families[familyIndex];
    }
    return null;
  }
};