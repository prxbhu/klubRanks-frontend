import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../store';
import { Tab } from '../types';
import { Leaderboard } from '../components/Leaderboard';
import { Chat } from '../components/Chat';
import { Settings } from '../components/Settings';
import { Stats } from '../components/Stats';
import { UserProfileModal } from '../components/UserProfileModal';
import {
  ChevronLeft,
  Trophy,
  MessageSquare,
  Settings as SettingsIcon,
  Plus,
  BarChart2,
} from 'lucide-react';

/* -------------------- helpers -------------------- */

const getRemainingMs = (nextCheckIn: string) =>
  Math.max(0, new Date(nextCheckIn).getTime() - Date.now());

const formatTime = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/* -------------------- UI atoms -------------------- */

const TabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
      active
        ? 'border-green-500 text-gray-900 dark:text-white'
        : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
    }`}
  >
    {icon}
    <span className={active ? 'inline-block' : 'hidden sm:inline-block'}>
      {label}
    </span>
  </button>
);

const UsersIcon = ({ count }: { count: number }) => (
  <>
    <svg
      className="w-3 h-3 text-gray-500 dark:text-gray-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
    <span>{count}</span>
  </>
);

const ClockIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/* -------------------- main -------------------- */

export const ClubView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    clubs,
    members,
    messages,
    incrementScore,
    currentUser,
    loadClubData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>(Tab.LEADERBOARD);
  const [animateButton, setAnimateButton] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [displayScore, setDisplayScore] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  const club = clubs.find((c) => c.id === id);
  const clubMembers = (id && members[id]) || [];
  const clubMessages = (id && messages[id]) || [];

  /* ---- polling ---- */
  useEffect(() => {
    if (!id) return;
    loadClubData(id);
    const interval = setInterval(() => loadClubData(id), 3000);
    return () => clearInterval(interval);
  }, [id, loadClubData]);

  const myStats = clubMembers.find(
    (m) => m.userId === currentUser?.id,
  );
  const myScore = myStats?.score || 0;

  /* ---- animated score ---- */
  useEffect(() => {
    let frame: number;
    const start = displayScore;
    const end = myScore;
    const duration = 300;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayScore(Math.round(start + (end - start) * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [myScore]);

  /* ---- countdown ---- */
  useEffect(() => {
    if (!club?.nextCheckIn) return;

    const tick = () =>
      setRemainingMs(getRemainingMs(club.nextCheckIn));

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [club?.nextCheckIn]);

  const canIncrement = remainingMs <= 0;

const handleIncrement = async () => {
  if (!id || !canIncrement) return;

  setAnimateButton(true);
  setShowParticles(true);

  const success = await incrementScore(id);

  setTimeout(() => setAnimateButton(false), 200);
  setTimeout(() => setShowParticles(false), 1000);
};


  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading club details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* ---------- Header ---------- */}
      <div className="p-4 flex items-center sticky top-0 z-20 border-b dark:border-gray-800">
        <Link
          to="/dashboard"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>

        <div className="ml-2">
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">
            {club.name}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {club.description}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-xs font-semibold">
          <UsersIcon count={club.memberCount} />
        </div>
      </div>

      {/* ---------- Score ---------- */}
      <div className="flex flex-col items-center py-6 border-b dark:border-gray-800 sticky top-[60px] z-0">
        <span className="text-sm font-semibold text-gray-500 mb-2">
          Your {club.actionName}
        </span>

        <span className="text-5xl font-black text-gray-900 dark:text-white">
          {displayScore}
        </span>

        <div className="relative mt-6 mb-2">
          <button
            onClick={handleIncrement}
            disabled={!canIncrement}
            className={`
              w-24 h-24 rounded-full flex items-center justify-center transition-all
              ${canIncrement
                ? 'bg-green-400 dark:bg-green-500 shadow-xl hover:scale-105 active:scale-95'
                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60'}
              ${animateButton ? 'scale-90 ring-8 ring-green-300/40' : ''}
            `}
          >
            <Plus className="w-10 h-10 text-white" strokeWidth={3} />
          </button>

          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className={`particle particle-${i}`} />
                ))}
            </div>
            )}

        </div>

        <span className="text-xs text-gray-400 mt-1">
          {canIncrement ? 'Tap to increment' : 'Check-in locked'}
        </span>

        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
          <ClockIcon />
          {canIncrement ? (
            <span>Ready to check in</span>
          ) : (
            <span>Next check-in in {formatTime(remainingMs)}</span>
          )}
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="flex justify-around border-b dark:border-gray-800 sticky top-[280px] bg-white dark:bg-gray-900 z-10">
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

      {/* ---------- Content ---------- */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 relative z-10">
        {activeTab === Tab.LEADERBOARD && (
          <Leaderboard
            members={clubMembers}
            currentUserId={currentUser?.id || ''}
            onUserClick={(uid) => setSelectedUserId(uid)}
          />
        )}
        {activeTab === Tab.STATS && (
          <Stats
            club={club}
            members={clubMembers}
            currentUserId={currentUser?.id || ''}
          />
        )}
        {activeTab === Tab.CHAT && (
          <Chat messages={clubMessages} clubId={club.id} />
        )}
        {activeTab === Tab.SETTINGS && (
          <Settings clubId={club.id} />
        )}
      </div>

      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          allowLogout={false}
          activeClubId={id}
        />
      )}
        {/* ---------- Particle Burst Styles ---------- */}
      <style>{`
  .particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: rgba(34, 197, 94, 0.85);
    transform: translate(-50%, -50%);
    animation: burst 900ms ease-out forwards;
    pointer-events: none;
  }

  @keyframes burst {
    from {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    to {
      transform: translate(var(--x), var(--y)) scale(0.3);
      opacity: 0;
    }
  }

  .particle-0 { --x: -40px; --y: -40px; }
  .particle-1 { --x:  40px; --y: -40px; }
  .particle-2 { --x: -50px; --y:   0px; }
  .particle-3 { --x:  50px; --y:   0px; }
  .particle-4 { --x: -40px; --y:  40px; }
  .particle-5 { --x:  40px; --y:  40px; }
  .particle-6 { --x:   0px; --y: -50px; }
  .particle-7 { --x:   0px; --y:  50px; }
`}</style>
    </div>
  );
};

export default ClubView;
