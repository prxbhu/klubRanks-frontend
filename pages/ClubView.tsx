import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../store';
import { Tab } from '../types';
import { Leaderboard } from '../components/Leaderboard';
import { Chat } from '../components/Chat';
import { Settings } from '../components/Settings';
import { Stats } from '../components/Stats';
import { UserProfileModal } from '../components/UserProfileModal';
import { ChevronLeft, Trophy, MessageSquare, Settings as SettingsIcon, Plus, BarChart2 } from 'lucide-react';

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
            active 
            ? 'border-green-500 text-gray-900 dark:text-white' 
            : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
    >
        {icon}
        <span className={active ? 'inline-block' : 'hidden sm:inline-block'}>{label}</span>
    </button>
);

const UsersIcon = ({count}: {count: number}) => (
    <>
        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
        <span>{count}</span>
    </>
);

const ClockIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export const ClubView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { clubs, members, messages, incrementScore, currentUser, loadClubData } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>(Tab.LEADERBOARD);
    const [animateButton, setAnimateButton] = useState(false);
    const [showPlusOne, setShowPlusOne] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const club = clubs.find(c => c.id === id);
    const clubMembers = (id && members[id]) || [];
    const clubMessages = (id && messages[id]) || [];

    useEffect(() => {
        if (id) {
            loadClubData(id);
        }
    }, [id, loadClubData]);
    
    const myStats = clubMembers.find(m => m.userId === currentUser?.id);
    const myScore = myStats?.score || 0;

    const handleIncrement = async () => {
        if (!id) return;
        const success = await incrementScore(id);
        if (success) {
            setAnimateButton(true);
            setShowPlusOne(true);
            setTimeout(() => setAnimateButton(false), 200);
            setTimeout(() => setShowPlusOne(false), 1000);
        }
    };

    if (!club) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-gray-500 dark:text-gray-400 animate-pulse">Loading club details...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 p-4 flex items-center sticky top-0 z-20 border-b border-transparent dark:border-gray-800 transition-colors duration-200">
                <Link to="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div className="ml-2">
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{club.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{club.description}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <UsersIcon count={club.memberCount} />
                </div>
            </div>

            {/* Score Display */}
            <div className="bg-white dark:bg-gray-900 flex flex-col items-center py-6 pb-2 border-b border-gray-50 dark:border-gray-800 sticky top-[60px] z-10 transition-all duration-200">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Your {club.actionName}</span>
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight transition-all duration-300">
                    {myScore}
                </span>

                <div className="relative mt-6 mb-2">
                    <button 
                        onClick={handleIncrement}
                        className={`w-24 h-24 rounded-full bg-green-400 dark:bg-green-500 shadow-xl shadow-green-400/30 dark:shadow-green-500/20 flex items-center justify-center transition-all duration-100 ${animateButton ? 'scale-90 bg-green-500' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                    </button>

                    {showPlusOne && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-2xl font-bold text-green-500 dark:text-green-400 animate-out fade-out slide-out-to-top-8 duration-700 pointer-events-none">
                            +1
                        </div>
                    )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-2">Tap to increment</span>
                
                 <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                    <ClockIcon />
                    <span>9:59</span>
                 </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-around border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-[280px] z-10 transition-colors duration-200">
                <TabButton 
                    active={activeTab === Tab.LEADERBOARD} 
                    onClick={() => setActiveTab(Tab.LEADERBOARD)} 
                    icon={<Trophy className="w-4 h-4" />} 
                    label="Leaderboard" 
                />
                <TabButton 
                    active={activeTab === Tab.STATS} 
                    onClick={() => setActiveTab(Tab.STATS)} 
                    icon={<BarChart2 className="w-4 h-4" />} 
                    label="Stats" 
                />
                <TabButton 
                    active={activeTab === Tab.CHAT} 
                    onClick={() => setActiveTab(Tab.CHAT)} 
                    icon={<MessageSquare className="w-4 h-4" />} 
                    label="Chat" 
                />
                <TabButton 
                    active={activeTab === Tab.SETTINGS} 
                    onClick={() => setActiveTab(Tab.SETTINGS)} 
                    icon={<SettingsIcon className="w-4 h-4" />} 
                    label="Settings" 
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-950 min-h-[400px] transition-colors duration-200">
                {activeTab === Tab.LEADERBOARD && (
                    <Leaderboard 
                        members={clubMembers} 
                        currentUserId={currentUser?.id || ''} 
                        onUserClick={(uid) => setSelectedUserId(uid)}
                    />
                )}
                {activeTab === Tab.STATS && <Stats club={club} members={clubMembers} currentUserId={currentUser?.id || ''} />}
                {activeTab === Tab.CHAT && <Chat messages={clubMessages} clubId={club.id} />}
                {activeTab === Tab.SETTINGS && <Settings clubId={club.id} />}
            </div>

            {selectedUserId && (
                <UserProfileModal 
                    userId={selectedUserId} 
                    onClose={() => setSelectedUserId(null)} 
                />
            )}
        </div>
    );
};

export default ClubView;