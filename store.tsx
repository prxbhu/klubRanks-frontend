import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Club, Member, Message } from './types';
import * as api from './api';

interface AppState {
  currentUser: User | null;
  clubs: Club[];
  members: Record<string, Member[]>;
  messages: Record<string, Message[]>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  createClub: (name: string, description: string, actionName: string) => Promise<void>;
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  incrementScore: (clubId: string) => Promise<boolean>;
  sendMessage: (clubId: string, text: string) => Promise<void>;
  loadClubData: (clubId: string) => Promise<void>;
  updateAvatar: (avatarId: string) => Promise<void>;
  refreshClubs: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const generateUserStyle = (username: string) => {
    const colors = [
      'bg-purple-100 text-purple-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-pink-100 text-pink-600',
      'bg-orange-100 text-orange-600'
    ];
    let hash = 0;
    if (username) {
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    const index = Math.abs(hash) % colors.length;
    
    return {
        color: colors[index],
        initials: username ? username.slice(0, 2).toUpperCase() : '??'
    };
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
      const root = window.document.documentElement;
      if (theme === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      try {
          const savedUser = localStorage.getItem('user');
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
          console.error("Failed to parse user from local storage", e);
          return null;
      }
  });
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [clubs, setClubs] = useState<Club[]>([]);
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setClubs([]);
  }, []);

  const refreshClubs = useCallback(async () => {
      if (!token) return;
      try {
          const myClubs = await api.getMyClubsApi(token);
          if (Array.isArray(myClubs)) {
             const mappedClubs: Club[] = myClubs.map(c => ({
                 id: c.id.toString(),
                 name: c.name,
                 description: c.description || '',
                 memberCount: c.number_of_members,
                 activeText: 'Active recently',
                 lastActive: new Date().toISOString(),
                 actionName: c.action || 'Points', 
                 cooldownMinutes: 10,
                 code: c.code,
                 currentRank: c.current_rank
             }));
             setClubs(mappedClubs);
          }
      } catch (e) {
          console.error("Failed to load clubs", e);
          if ((e as Error).message.includes("401")) logout();
      }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
        refreshClubs();
    }
  }, [token, refreshClubs]);

  const login = useCallback(async (username: string, password: string) => {
    try {
        const res = await api.loginApi(username, password);
        const style = generateUserStyle(res.user.username);
        const userObj = {
            id: res.user.id.toString(),
            username: res.user.username,
            avatarId: res.user.avatar_id ? res.user.avatar_id : style.initials,
            color: style.color
        };

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        setToken(res.token);
        setCurrentUser(userObj);
    } catch (e) {
        alert("Login failed: " + (e as Error).message);
        throw e;
    }
  }, []);

  const signup = useCallback(async (username: string, password: string) => {
    try {
        await api.signupApi(username, password);
        await login(username, password);
    } catch (e) {
        alert("Signup failed: " + (e as Error).message);
        throw e;
    }
  }, [login]);

  const createClub = useCallback(async (name: string, description: string, actionName: string) => {
    if (!token) return;
    try {
        await api.createClubApi(token, { name, description, action: actionName });
        await refreshClubs();
    } catch (e) {
        alert("Failed to create club");
    }
  }, [token, refreshClubs]);

  const joinClub = useCallback(async (clubId: string) => {
    if (!token) return;
    try {
        await api.addMemberApi(token, clubId);
        await refreshClubs();
    } catch (e) {
        alert("Failed to join club");
    }
  }, [token, refreshClubs]);

  const leaveClub = useCallback(async (clubId: string) => {
    if (!token) return;
    try {
        await api.leaveClubApi(token, clubId);
        await refreshClubs(); 
    } catch (e) {
        console.error("Failed to leave club", e);
        alert("Failed to leave club");
        throw e; 
    }
  }, [token, refreshClubs]);

  const updateAvatar = useCallback(async (avatarId: string) => {
      if (!token || !currentUser) return;
      try {
          await api.updateAvatarApi(token, avatarId);
          const updatedUser = { ...currentUser, avatarId };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
          console.error("Failed to update avatar", e);
          alert("Failed to update avatar");
      }
  }, [token, currentUser]);

  const loadClubData = useCallback(async (clubId: string) => {
      if (!token) return;

      try {
          const leaderboard = await api.getLeaderboardApi(token, clubId);
          const mappedMembers: Member[] = (leaderboard || []).map(entry => ({
              userId: entry.user.id.toString(),
              username: entry.user.username || 'Unknown',
              avatarInitials: (entry.user.username || '??').slice(0, 2).toUpperCase(),
              avatarId: entry.user.avatar_id,
              clubId: clubId,
              score: entry.score,
              lastUpdate: entry.last_checkedin || new Date().toISOString(),
              streak: entry.current_streak
          }));
          setMembers(prev => ({ ...prev, [clubId]: mappedMembers }));

          const backendMessages = await api.getClubMessagesApi(token, clubId);
          const mappedMessages: Message[] = (backendMessages || []).map((m, idx) => ({
              id: `msg-${idx}-${m.timestamp}`,
              userId: m.user.id.toString(),
              username: m.user.username,
              avatarId: m.user.avatar_id,
              text: m.message,
              timestamp: m.timestamp,
              type: (m.type as 'user' | 'system') || 'user' // Map the type here
          })).reverse(); 
          setMessages(prev => ({ ...prev, [clubId]: mappedMessages }));

      } catch (e) {
          console.error("Error loading club data", e);
      }
  }, [token]);

  const incrementScore = useCallback(async (clubId: string): Promise<boolean> => {
    if (!token) return false;
    try {
        await api.updateLeaderboardScoreApi(token, clubId);
        await loadClubData(clubId);
        return true;
    } catch (e) {
        console.error("Failed to increment", e);
        return false;
    }
  }, [token, loadClubData]);

  const sendMessage = useCallback(async (clubId: string, text: string) => {
    if (!token || !currentUser) return;
    try {
        await api.sendMessageApi(token, clubId, text);
        await loadClubData(clubId);
    } catch (e) {
        console.error("Failed to send message", e);
    }
  }, [token, currentUser, loadClubData]);

  return (
    <AppContext.Provider value={{ 
        currentUser, clubs, members, messages, theme, toggleTheme,
        login, signup, logout, createClub, joinClub, leaveClub,
        incrementScore, sendMessage, loadClubData , updateAvatar, refreshClubs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export default AppProvider;