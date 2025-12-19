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
  memberCount: number;
  activeText: string;
  lastActive: string;
  actionName: string; // e.g. "Pages", "Pushups", "Count"
  cooldownMinutes: number;
}

export interface Member {
  userId: string;
  username: string;
  avatarInitials: string;
  avatarId?: string;
  clubId: string;
  score: number;
  lastUpdate: string; // ISO string
  streak: number; // New feature: daily streak
}

export interface Message {
  id: string;
  userId: string | 'system';
  username?: string;
  avatarId?: string;
  text: string;
  timestamp: string; // ISO string
}

export interface GraphDataPoint {
    name: string;
    You: number;
    Leader: number;
}

export interface UserStats {
    score: number;
    rank: number;
    current_streak: number;
    percentile: string;
    graph_data: GraphDataPoint[];
}

export enum Tab {
  LEADERBOARD = 'LEADERBOARD',
  STATS = 'STATS', // New feature
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}

