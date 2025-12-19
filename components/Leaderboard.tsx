import React from 'react';
import { Member } from '../types';
import { Trophy, Medal, Flame, Users } from 'lucide-react';
import { Avatar } from './Avatar';

interface LeaderboardProps {
    members: Member[];
    currentUserId: string;
    onUserClick: (userId: string) => void;
}

const getUserColor = (username: string) => {
    const colors = [
      'bg-purple-100 text-purple-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600'
    ];
    let hash = 0;
    if (username) {
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ members, currentUserId, onUserClick }) => {
  if (!members || members.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <Users className="w-12 h-12 mb-4 opacity-50" />
              <p>No members in this club yet.</p>
              <p className="text-xs">Invite friends to start competing!</p>
          </div>
      );
  }

  return (
    <div className="pb-20">
        {members.map((member, index) => {
            const isMe = member.userId === currentUserId;
            const rank = index + 1;
            const username = member.username || 'Unknown';
            const color = getUserColor(username);
            const initials = member.avatarInitials || '??';
            const displayAvatarId = isMe ? (window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')!).avatarId : member.avatarId) : member.avatarId;
            
            let RankIcon;
            let rankColor = "text-gray-400 dark:text-gray-500 font-bold w-6 text-center";
            
            if (rank === 1) {
                RankIcon = <Trophy className="w-5 h-5 text-yellow-500" />;
            } else if (rank === 2) {
                RankIcon = <Medal className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
            } else if (rank === 3) {
                RankIcon = <Medal className="w-5 h-5 text-amber-600" />;
            }

            return (
                <div 
                    key={member.userId} 
                    onClick={() => onUserClick(member.userId)}
                    className={`flex items-center px-6 py-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800 transition-colors cursor-pointer ${isMe ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-white dark:bg-gray-900'}`}
                >
                    <div className="w-8 flex items-center justify-center mr-2">
                        {RankIcon ? RankIcon : <span className={rankColor}>{rank}</span>}
                    </div>
                    
                    <div className="mr-3">
                        <Avatar avatarId={displayAvatarId} username={member.username} size="md" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isMe ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {username} {isMe && '(You)'}
                            </h4>
                            {(member.streak || 0) > 0 && (
                                <div className="flex items-center text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 rounded-full font-bold">
                                    <Flame className="w-3 h-3 mr-0.5 fill-orange-500" /> {member.streak}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Score: {member.score}</p>
                    </div>

                    <div className="text-right">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{member.score}</span>
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default Leaderboard;