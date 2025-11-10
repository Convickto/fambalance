export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  name: string;
  birthDate: string; // Changed from age
  gender: 'Feminino' | 'Masculino' | 'Outro';
  avatar: string; // Emoji or image URL
  familyId?: string; // If part of a family
  email?: string; // Only for admin/parent
  password?: string; // Hashed password
  role: UserRole;
  harmonyPoints: number;
  connectionPoints: number;
}

export interface Family {
  id: string;
  name: string;
  familyPassword?: string; // Hashed password for family-wide login
  adminId: string; // ID of the family admin user
  memberIds: string[];
  inviteCode: string;
  isPremium: boolean;
  createdAt: string; // ISO date string
  trialEndsAt?: string; // ISO date string for trial period end
}

export enum Emotion {
  HAPPY = '😊 Feliz',
  NEUTRAL = '😐 Neutro',
  SAD = '😞 Triste',
  STRESSED = '😖 Estressado',
  ANXIOUS = '😔 Ansioso',
}

export interface DailyMood {
  userId: string;
  date: string; // YYYY-MM-DD
  emotion: Emotion;
  familyId: string;
}

export enum MissionType {
  SELF_CARE = 'Autocuidado',
  CONNECTION = 'Conexão',
  REFLECTION = 'Reflexão',
}

export interface Mission {
  id: string;
  description: string;
  points: number;
  isPremium?: boolean;
  type: MissionType;
  moodTrigger?: Emotion[]; // Missions can be triggered by specific moods
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  date: string;
  completed: boolean;
  harmonyPointsEarned: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  familyId: string;
  date: string; // YYYY-MM-DD
  text: string;
  emotion: Emotion;
  reactions: {
    emoji: string;
    userId: string;
  }[];
}

export interface ConnectionMoment {
  id: string;
  familyId: string;
  suggestion: string;
  date: string; // YYYY-MM-DD
  participations: {
    userId: string;
    attended: boolean;
  }[];
  connectionPointsEarned: number;
}

export interface Report {
  id: string;
  familyId: string;
  startDate: string;
  endDate: string;
  individualMoodSummary: { userId: string; moodData: { emotion: Emotion; count: number }[] }[];
  familyMoodSummary: { emotion: Emotion; count: number }[];
  recommendations: string[];
}

export interface AuthContextType {
  currentUser: User | null;
  currentFamily: Family | null;
  isAuthenticated: boolean;
  loading: boolean;
  effectiveIsPremium: boolean;
  login: (name: string, password: string, isFamilyLogin: boolean) => Promise<boolean>;
  logout: () => void;
  registerFamily: (familyName: string, adminEmail: string, familyPassword: string, adminName: string, adminBirthDate: string, adminGender: 'Feminino' | 'Masculino' | 'Outro', adminAvatar: string) => Promise<{ success: boolean; familyId?: string; adminId?: string; error?: string }>;
  addMemberToFamily: (familyId: string, memberName: string, memberBirthDate: string, memberGender: 'Feminino' | 'Masculino' | 'Outro', memberAvatar: string, memberPassword?: string) => Promise<{ success: boolean; memberId?: string; error?: string }>;
  joinFamilyWithCode: (inviteCode: string, memberName: string, memberBirthDate: string, memberGender: 'Feminino' | 'Masculino' | 'Outro', memberAvatar: string, memberPassword?: string) => Promise<{ success: boolean; familyId?: string; memberId?: string; error?: string }>;
  updateUser: (user: User) => void;
  updateFamily: (family: Family) => void;
}