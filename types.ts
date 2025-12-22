export interface User {
  id: string;
  username: string;
  color: string;
  avatarId: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  code: string;
  memberCount: number;
  lastActive: string; 
  nextCheckIn: string;
  actionName: string; // e.g. "Pages", "Pushups", "Count"
  currentRank: number;
  createdBy: string;
  isPrivate: boolean;
}

export interface Member {
  userId: string;
  username: string;
  avatarInitials: string;
  avatarId?: string;
  clubId: string;
  score: number;
  lastUpdate: string; 
  streak: number;
  longestStreak: number;
}

export interface Message {
  id: string;
  userId: string | 'system';
  username?: string;
  avatarId?: string;
  text: string;
  timestamp: string; // ISO string
  type: 'user' | 'system';
  replyTo?: {
      username: string;
      text: string;
  };
}

export interface GraphDataPoint {
    day: string;
    scores: { [username: string]: number };
}

export interface UserStats {
    score: number;
    rank: number;
    current_streak: number;
    longest_streak: number;
    graph_data: GraphDataPoint[];
}

export enum Tab {
  LEADERBOARD = 'LEADERBOARD',
  STATS = 'STATS',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}

