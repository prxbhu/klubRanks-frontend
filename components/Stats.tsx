import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Club, UserStats } from '../types';
import { useApp } from '../store';
import { getUserStatsApi } from '../api';

interface StatsProps {
  club: Club;
}

const YOU_COLOR = '#22c55e'; // green
const OTHER_COLORS = ['#60a5fa', '#f59e0b', '#a78bfa', '#f87171'];

export const Stats: React.FC<StatsProps> = ({ club }) => {
  const { theme } = useApp();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: selected player from legend
  const [activePlayer, setActivePlayer] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const data = await getUserStatsApi(token, club.id);
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch stats', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [club.id]);

  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';




  const { chartData, players, colorMap } = useMemo(() => {

  if (!stats?.graph_data) {
    return {
      chartData: [],
      players: [],
      colorMap: {} as Record<string, string>,
    };
  }

  // 1. Collect all players
  const playerSet = new Set<string>();
  stats.graph_data.forEach(point => {
    Object.keys(point.scores || {}).forEach(p => playerSet.add(p));
  });

  const playersArr = Array.from(playerSet);

  // 2. Normalize data: missing = 0
  const data = stats.graph_data.map(point => {
    const normalized: Record<string, number | string> = {
      day: point.day,
    };

    playersArr.forEach(player => {
      normalized[player] =
        typeof point.scores?.[player] === 'number'
          ? point.scores[player]
          : 0;
    });

    return normalized;
  });

  // 3. Assign colors
  const colors: Record<string, string> = {};
  let colorIdx = 0;

  playersArr.forEach(p => {
    if (p === 'You') {
      colors[p] = YOU_COLOR;
    } else {
      colors[p] = OTHER_COLORS[colorIdx % OTHER_COLORS.length];
      colorIdx++;
    }
  });

  return {
    chartData: data,
    players: playersArr,
    colorMap: colors,
  };
}, [stats]);

    //select "You" by default if present
      useEffect(() => {
      if (!players.length) return;

      // Select "You" by default if present
      if (players.includes('You')) {
        setActivePlayer('You');
      }
    }, [players]);


  const hasSinglePoint =
    chartData.filter(d =>
      players.some(p => typeof d[p] === 'number'),
    ).length === 1;

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400">
        Loading stats…
      </div>
    );
  }

  if (!stats) return null;

  const isDimmed = (player: string) =>
    activePlayer !== null && activePlayer !== player;

  return (
    <div className="p-5 space-y-6 pb-28">
      {/* GRAPH */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
          Weekly Activity
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Tap a name below to focus on a player
        </p>

        <div className="h-64 w-full -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
            >

              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
                width={28}
                allowDecimals={false}
              />

              {players.map(player => {
                const dimmed = isDimmed(player);
                const highlighted = activePlayer === player;

                return (
                  <Line
                    key={player}
                    type="monotone"
                    dataKey={player}
                    stroke={colorMap[player]}
                    strokeWidth={highlighted ? 4 : 2}
                    opacity={dimmed ? 0.15 : 1}
                    dot={(props: any) => {
                      const { cx, cy, value } = props;

                      // Hide dot if value is 0 or coordinates are missing
                      if (value === 0 || cx == null || cy == null) {
                        return null;
                      }

                      const r = highlighted
                        ? 7
                        : hasSinglePoint
                        ? 6
                        : 4;

                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={colorMap[player]}
                          opacity={dimmed ? 0.2 : 1}
                        />
                      );
                    }}

                    activeDot={false}
                    connectNulls
                  >
                    {hasSinglePoint && !dimmed && (
                      <LabelList
                        dataKey={player}
                        position="top"
                        formatter={(v: number) =>
                          v !== undefined ? `${player}: ${v}` : ''
                        }
                        style={{
                          fontSize: 11,
                          fill: colorMap[player],
                          fontWeight: highlighted ? 700 : 500,
                        }}
                      />
                    )}
                  </Line>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* INTERACTIVE LEGEND */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {players.map(player => {
            const active = activePlayer === player;

            return (
              <button
                key={player}
                onClick={() =>
                  setActivePlayer(prev =>
                    prev === player ? null : player,
                  )
                }
                className={`flex items-center gap-2 text-xs font-medium transition-opacity ${
                  activePlayer && !active ? 'opacity-40' : ''
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colorMap[player] }}
                />
                <span
                  className={
                    player === 'You'
                      ? 'font-semibold text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }
                >
                  {player}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Score" value={stats.score} />
        <StatCard label="Rank" value={`#${stats.rank}`} />
        <StatCard
          label="Current Streak"
          value={`🔥 ${stats.current_streak}`}
          highlight
        />
        <StatCard
          label="Longest Streak"
          value={stats.longest_streak}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
    <div
      className={`text-2xl font-bold ${
        highlight
          ? 'text-green-500'
          : 'text-gray-900 dark:text-white'
      }`}
    >
      {value}
    </div>
    <div className="mt-1 text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
      {label}
    </div>
  </div>
);

export default Stats;
