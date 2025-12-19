import React, { useState } from 'react';
import { useApp } from '../store';
import { Button } from '../components/Button';
import { Plus, Link as LinkIcon, Users, Trophy } from 'lucide-react';
import { Club } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { UserProfileModal } from '../components/UserProfileModal';
import { Avatar } from '../components/Avatar';

export const Dashboard: React.FC = () => {
  const { clubs, currentUser, createClub, joinClub } = useApp();
  const navigate = useNavigate();
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubAction, setNewClubAction] = useState('Count');
  const [joinLink, setJoinLink] = useState('');

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClubName && newClubDesc) {
      createClub(newClubName, newClubDesc, newClubAction);
      setCreateModalOpen(false);
      setNewClubName('');
      setNewClubDesc('');
      setNewClubAction('Count');
    }
  };

  const handleJoinClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinLink) return;

    const parts = joinLink.trim().replace(/\/$/, "").split('/');
    const clubId = parts[parts.length - 1];

    if (clubId) {
        joinClub(clubId);
        setJoinModalOpen(false);
        setJoinLink('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-6 py-5 shadow-sm sticky top-0 z-10 flex justify-between items-center transition-colors duration-200 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Your Clubs</h1>
        </div>
        
        {/* Clickable User Avatar */}
        <button 
            onClick={() => setShowProfile(true)}
            className="transition-transform active:scale-95"
        >
          <Avatar avatarId={currentUser?.avatarId} username={currentUser?.username} size="sm" />
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 py-6">
        <div className="flex gap-3 mb-8">
          <Button variant="secondary" className="flex-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700" onClick={() => setJoinModalOpen(true)}>
            <LinkIcon className="w-4 h-4" /> Join with Link
          </Button>
          <Button className="flex-1 text-sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Create Club
          </Button>
        </div>

        {/* Club List */}
        <div className="space-y-4">
          {clubs.map((club) => (
            <Link to={`/club/${club.id}`} key={club.id} className="block">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.99] transition-all hover:border-green-200 dark:hover:border-green-900/30">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{club.name}</h3>
                  <div className="flex items-center gap-1 bg-gray-900 dark:bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md font-medium">
                     <span className="opacity-70">RANK</span> #3
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-1">{club.description}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{club.memberCount} members</span>
                  </div>
                  <span>{club.activeText}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showProfile && currentUser && (
        <UserProfileModal 
            userId={currentUser.id} 
            onClose={() => setShowProfile(false)} 
        />
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-200 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Club</h2>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" label="Club Name" placeholder="e.g. Fitness Warriors" value={newClubName} onChange={e => setNewClubName(e.target.value)} required />
              <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" label="Description" placeholder="What are you competing in?" value={newClubDesc} onChange={e => setNewClubDesc(e.target.value)} required />
              <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" label="Action Unit" placeholder="e.g. Reps, Pages, Miles" value={newClubAction} onChange={e => setNewClubAction(e.target.value)} />
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" fullWidth className="dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" fullWidth>Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-200 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-1 dark:text-white">Join a Club</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter an invite link or Club ID.</p>
            <form onSubmit={handleJoinClub} className="space-y-4">
              <Input 
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                label="Invite Link / ID" 
                placeholder="e.g. c2, or clubrank.app/join/c2" 
                value={joinLink} 
                onChange={e => setJoinLink(e.target.value)} 
                autoFocus
                required 
              />
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" fullWidth className="dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => setJoinModalOpen(false)}>Cancel</Button>
                <Button type="submit" fullWidth>Join Club</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;