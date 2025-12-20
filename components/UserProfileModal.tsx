import React, { useState } from 'react';
import { Club, Member } from '../types';
import { useApp } from '../store';
import { X, LogOut, Moon, Sun, Edit2, Zap, Trophy, Clock } from 'lucide-react';
import { Avatar, AVATAR_OPTIONS } from './Avatar';
import { format } from 'date-fns';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  allowLogout?: boolean;
  activeClubId?: string; // New Prop to know context
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose, allowLogout = false, activeClubId }) => {
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

  // Find user details (fallback method if not "me")
  let username = 'Unknown';
  let avatarId: string | undefined = undefined;

  // Gather club memberships for this user
  const userClubsData = clubs.reduce((acc, club) => {
    const clubMembers = members[club.id];
    if (clubMembers) {
      const membership = clubMembers.find(m => m.userId === userId);
      if (membership) {
        acc.push({ club, membership });
        // Set user details from the first found membership if not already set
        if (username === 'Unknown') {
            username = membership.username;
            avatarId = membership.avatarId;
        }
      }
    }
    return acc;
  }, [] as { club: Club, membership: Member }[]);

  // Override if currentUser
  if (isMe && currentUser) {
      username = currentUser.username;
      avatarId = currentUser.avatarId;
  }

  // --- Specific Club View (If activeClubId is present) ---
  const activeMembership = activeClubId 
    ? userClubsData.find(d => d.club.id === activeClubId)?.membership 
    : null;

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
          
          {/* Avatar Selector */}
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

          {/* Theme Toggle (Only for Me) */}
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

          {/* --- VIEW LOGIC --- */}
          
          {/* CASE 1: Specific Club View (Clicking another user inside a club) */}
          {activeClubId && activeMembership && (
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Club Stats</h3>
               <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center">
                        <Zap className="w-5 h-5 text-yellow-500 mb-1" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{activeMembership.streak}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Current Streak</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center">
                        <Trophy className="w-5 h-5 text-orange-500 mb-1" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{activeMembership.longestStreak || activeMembership.streak}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Longest Streak</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center text-center col-span-2">
                        <Clock className="w-5 h-5 text-blue-500 mb-1" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                           {activeMembership.lastUpdate ? format(new Date(activeMembership.lastUpdate), 'MMM d, h:mm a') : 'Never'}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Last Checked In</span>
                    </div>
               </div>
            </div>
          )}

          {/* CASE 2: Dashboard View (Clicking own profile) - List of Clubs */}
          {!activeClubId && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Your Clubs</h3>
              {userClubsData.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Not a member of any clubs yet.</p>
              ) : (
                <div className="space-y-3">
                  {userClubsData.map(({ club, membership }) => (
                    <div key={club.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 dark:text-white">{club.name}</h4>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-bold">
                           {membership.score} {club.actionName}
                        </span>
                      </div>
                      <div className="flex gap-4 border-t border-gray-50 dark:border-gray-800 pt-3">
                          <div className="flex-1 text-center border-r border-gray-50 dark:border-gray-800">
                             <div className="text-lg font-bold text-gray-900 dark:text-white">{membership.streak}</div>
                             <div className="text-[10px] text-gray-400 uppercase">Current</div>
                          </div>
                          <div className="flex-1 text-center">
                             <div className="text-lg font-bold text-gray-900 dark:text-white">{membership.longestStreak || membership.streak}</div>
                             <div className="text-[10px] text-gray-400 uppercase">Longest</div>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800 flex flex-col gap-3">
          {isMe && allowLogout && (
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