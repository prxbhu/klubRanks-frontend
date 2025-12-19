import React, { useState } from 'react';
import { Club, Member } from '../types';
import { useApp } from '../store';
import { X, Flame, Trophy, Target, LogOut, Moon, Sun, Edit2, Check } from 'lucide-react';
import { Avatar, AVATAR_OPTIONS } from './Avatar';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const { clubs, members, currentUser, logout, theme, toggleTheme, updateAvatar } = useApp();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  
  const isMe = userId === currentUser?.id;

  const handleLogout = () => {
      logout();
      onClose();
  };

  const handleAvatarSelect = async (avatarId: string) => {
      await updateAvatar(avatarId);
      setIsEditingAvatar(false);
  };

  const userClubsData = clubs.reduce((acc, club) => {
    const clubMembers = members[club.id];
    if (clubMembers) {
      const membership = clubMembers.find(m => m.userId === userId);
      if (membership) {
        acc.push({ club, membership });
      }
    }
    return acc;
  }, [] as { club: Club, membership: Member }[]);

  let username = 'Unknown';
  let avatarId: string | undefined = undefined;

  if (isMe && currentUser) {
      username = currentUser.username;
      avatarId = currentUser.avatarId;
  } else if (userClubsData.length > 0) {
      const sample = userClubsData[0].membership;
      username = sample.username;
      avatarId = sample.avatarId;
  }

  const currentStreak = userClubsData.length > 0 ? Math.max(...userClubsData.map(d => d.membership.streak), 0) : 0;
  const totalPoints = userClubsData.reduce((sum, d) => sum + d.membership.score, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-start border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative">
                <Avatar avatarId={avatarId} username={username} size="lg" />
                {isMe && (
                    <button 
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        className="absolute -bottom-2 -right-2 p-1.5 bg-gray-900 dark:bg-gray-700 text-white rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{username}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md inline-block mt-1">
                {isMe ? 'You' : 'Competitor'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Avatar Selector (Netflix Style) */}
          {isMe && isEditingAvatar && (
              <div className="animate-in fade-in zoom-in duration-300">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Choose your Avatar</h3>
                  <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map((opt) => (
                          <button 
                            key={opt.id}
                            onClick={() => handleAvatarSelect(opt.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${avatarId === opt.id ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                          >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${opt.color}`}>
                                  {opt.emoji}
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Theme Toggle */}
          {isMe && !isEditingAvatar && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-600'}`}>
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Appearance</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-purple-500' : 'bg-gray-300'}`}
                >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
              </div>
              <div className="text-3xl font-black text-orange-700 dark:text-orange-400">{currentStreak}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                <Trophy className="w-4 h-4 fill-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Points</span>
              </div>
              <div className="text-3xl font-black text-purple-700 dark:text-purple-400">{totalPoints}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800 flex flex-col gap-3">
          {isMe && (
            <button 
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
                <LogOut className="w-4 h-4" /> Log Out
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl active:scale-[0.98] transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};