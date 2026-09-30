export type Pillar = "Mind" | "Body" | "Craft" | "Wealth" | "Spirit";

export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  passwordHash: string;
  avatarColor: string;
  bio: string;
  primaryPillar: Pillar;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  focusMinutesTotal: number;
  dailyFocusTarget: number;
  joinedAt: string;
  badges: string[];
}

export type SafeUser = Omit<User, "passwordHash">;

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  pillar: Pillar;
  xpReward: number;
  targetDaysPerWeek: number;
  completedDates: string[]; // YYYY-MM-DD
  streak: number;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  pillar: Pillar;
  targetDate: string;
  priority: "Core" | "High" | "Medium";
  status: "active" | "completed";
  progress: number; // 0-100
  xpReward: number;
  milestones: GoalMilestone[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  winOfTheDay: string;
  lessonLearned: string;
  gratitude: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  pillar: Pillar;
  tags: string[];
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskTitle: string;
  pillar: Pillar;
  durationMinutes: number;
  xpEarned: number;
  completedAt: string;
}

export interface ChallengeParticipantProgress {
  userId: string;
  completedDays: number[]; // 1..durationDays
  startedAt: string;
}

export interface ChallengeProtocol {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  durationDays: number;
  pillar: Pillar;
  difficulty: "Initiate" | "Vanguard" | "Apex";
  xpReward: number;
  rules: string[];
  participantsCount: number;
  userProgress: ChallengeParticipantProgress[];
}

export interface CommunityComment {
  id: string;
  userId: string;
  authorName: string;
  authorHandle: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorHandle: string;
  authorLevel: number;
  authorAvatarColor: string;
  authorPillar: Pillar;
  content: string;
  tag: "Win" | "Streak" | "Protocol" | "Insight" | "Milestone";
  likes: string[]; // array of userIds
  comments: CommunityComment[];
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  habits: Habit[];
  goals: Goal[];
  journals: JournalEntry[];
  focusSessions: FocusSession[];
  challenges: ChallengeProtocol[];
  posts: CommunityPost[];
}
