import { Emotion, Mission, MissionType } from './types';

// UI Colors (Tailwind classes for convenience, but using raw hex for custom)
export const UI_COLORS = {
  lavender: '#E6E6FA',
  lightBlue: '#ADD8E6',
  softGreen: '#90EE90',
  white: '#FFFFFF',
  darkText: '#333333',
  lightGray: '#F5F5F5',
  mediumGray: '#D1D5DB',
  darkGreenButton: '#3CB371',
  blueButton: '#87CEFA',
};

// Emojis
export const EMOTIONS_EMOJI: Record<Emotion, string> = {
  [Emotion.HAPPY]: '😊',
  [Emotion.NEUTRAL]: '😐',
  [Emotion.SAD]: '😞',
  [Emotion.STRESSED]: '😖',
  [Emotion.ANXIOUS]: '😔',
};

export const REACTION_EMOJIS = ['💖', '🤗', '🌈', '🌟', '🫂'];

export const DEFAULT_AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐣', '🦋', '🐢', '🐍', '🐙',
];

// Default Missions
export const MISSIONS: Mission[] = [
  // Self-Care
  { id: 'm1', description: 'Ouça uma música calma', points: 10, type: MissionType.SELF_CARE, moodTrigger: [Emotion.ANXIOUS, Emotion.STRESSED] },
  { id: 'm3', description: 'Respire fundo por 2 minutos', points: 10, type: MissionType.SELF_CARE, moodTrigger: [Emotion.ANXIOUS, Emotion.STRESSED] },
  { id: 'm5', description: 'Beba um copo de água', points: 5, type: MissionType.SELF_CARE },
  { id: 'm11', description: 'Alongue o corpo por 5 minutos', points: 10, type: MissionType.SELF_CARE },
  { id: 'm6', description: 'Faça uma pequena caminhada', points: 15, type: MissionType.SELF_CARE, isPremium: true },
  { id: 'm9', description: 'Leia um capítulo de um livro', points: 10, type: MissionType.SELF_CARE, isPremium: true },
  { id: 'm12', description: 'Tire uma soneca de 20 minutos', points: 20, type: MissionType.SELF_CARE, isPremium: true, moodTrigger: [Emotion.STRESSED] },

  // Reflection
  { id: 'm2', description: 'Anote 3 coisas boas do seu dia', points: 15, type: MissionType.REFLECTION, moodTrigger: [Emotion.SAD, Emotion.NEUTRAL] },
  { id: 'm7', description: 'Escreva um pensamento positivo', points: 10, type: MissionType.REFLECTION },
  { id: 'm13', description: 'Qual foi seu maior desafio hoje?', points: 15, type: MissionType.REFLECTION },
  { id: 'm10', description: 'Passe 15 minutos em silêncio', points: 15, type: MissionType.REFLECTION, moodTrigger: [Emotion.STRESSED, Emotion.ANXIOUS], isPremium: true },
  { id: 'm14', description: 'Planeje uma meta para amanhã', points: 10, type: MissionType.REFLECTION, isPremium: true },

  // Connection
  { id: 'm4', description: 'Abrace alguém que você ama', points: 20, type: MissionType.CONNECTION, moodTrigger: [Emotion.SAD, Emotion.NEUTRAL, Emotion.HAPPY] },
  { id: 'm15', description: 'Faça um elogio a um familiar', points: 15, type: MissionType.CONNECTION },
  { id: 'm8', description: 'Ajude alguém em casa', points: 20, type: MissionType.CONNECTION, isPremium: true },
  { id: 'm16', description: 'Envie uma mensagem de carinho', points: 10, type: MissionType.CONNECTION, isPremium: true },
  { id: 'm17', description: 'Pergunte como foi o dia de alguém', points: 15, type: MissionType.CONNECTION, isPremium: true },
];

// Connection Moments Suggestions
export const CONNECTION_MOMENT_SUGGESTIONS = [
  'Jantar sem telas',
  'Assistir algo juntos',
  'Caminhar por 10 minutos',
  'Escrever algo bom uns para os outros',
  'Jogar um jogo de tabuleiro',
  'Contar uma história divertida',
  'Fazer uma sobremesa juntos',
  'Fazer um piquenique improvisado',
  'Olhar fotos antigas da família',
  'Planejar as férias dos sonhos',
  'Montar um quebra-cabeça',
  'Cuidar do jardim ou de plantas',
  'Ouvir a playlist favorita de alguém',
  'Fazer um ato de gentileza para um vizinho',
  'Construir uma cabana de cobertores',
];

// Onboarding Text
export const ONBOARDING_TEXT = {
  title: "Bem-vindos ao FamBalance",
  subtitle: "FamBalance é o espaço seguro da sua família. Aqui, vocês aprendem a cuidar um do outro com pequenas ações diárias, construindo mais equilíbrio, afeto e harmonia.",
  button: "Começar Agora"
};

// Mock AI Recommendations (for premium feature)
export const AI_RECOMMENDATIONS_MOCK = [
  "Priorize descanso: Tente dormir 7-9 horas por noite.",
  "Procure conversas leves: Compartilhe algo divertido com a família.",
  "Invista em um hobby relaxante: Pintura, leitura ou jardinagem podem ajudar.",
  "Pratique a gratidão: Anote as coisas pelas quais você é grato.",
  "Exercite-se regularmente: Atividades físicas leves melhoram o humor.",
  "Conecte-se com a natureza: Passe um tempo ao ar livre.",
  "Defina limites saudáveis: Diga 'não' quando precisar.",
  "Medite ou pratique mindfulness por 10 minutos.",
];