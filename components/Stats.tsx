import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Club, Member, UserStats, GraphDataPoint } from '../types';
import { useApp } from '../store';
import { BarChart2 } from 'lucide-react';
import { getUserStatsApi } from '../api';

interface StatsProps {
    club: Club;
    members: Member[];
    currentUserId: string;
}

export const Stats: React.FC<StatsProps> = ({ club, members, currentUserId }) => {
    const { theme } = useApp();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await getUserStatsApi(token, club.id);
                    setStats(data);
                } catch (e) {
                    console.error("Failed to fetch stats", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStats();
    }, [club.id]);

    const axisColor = theme === 'dark' ? '#6b7280' : '#9ca3af'; 
    const gridColor = theme === 'dark' ? '#374151' : '#f3f4f6'; 
    const tooltipBg = theme === 'dark' ? '#1f2937' : '#ffffff'; 
    const tooltipText = theme === 'dark' ? '#f3f4f6' : '#111827'; 

    if (loading) {
        return <div className="p-10 text-center text-gray-400">Loading stats...</div>;
    }

    const data = stats?.graph_data || [];
    const percentile = stats?.percentile || "N/A";
    const myStreak = stats?.current_streak || 0;

    return (
        <div className="p-6 space-y-6 pb-24">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Weekly Activity</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Compare your daily activity with the club leader.</p>
                
                <div className="h-64 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorLeader" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: axisColor}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: axisColor}} />
                            <Tooltip 
                                contentStyle={{
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: tooltipBg,
                                    color: tooltipText
                                }}
                                itemStyle={{ color: tooltipText }}
                                labelStyle={{ color: axisColor }}
                            />
                            <CartesianGrid vertical={false} stroke={gridColor} />
                            <Area type="monotone" dataKey="Leader" stroke="#cbd5e1" fillOpacity={1} fill="url(#colorLeader)" strokeWidth={2} />
                            <Area type="monotone" dataKey="You" stroke="#4ade80" fillOpacity={1} fill="url(#colorYou)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center transition-colors duration-200">
                    <span className="block text-3xl font-bold text-gray-900 dark:text-white mb-1">{percentile}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Percentile</span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center transition-colors duration-200">
                    <span className="block text-3xl font-bold text-green-500 mb-1">🔥 {myStreak}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Day Streak</span>
                </div>
            </div>
        </div>
    );
};

export default Stats;