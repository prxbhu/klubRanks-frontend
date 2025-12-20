import React, { useState } from 'react';
import { Button } from './Button';
import { Link, LogOut, Copy, Check } from 'lucide-react';
import { useApp } from '../store';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
    clubId: string;
}

export const Settings: React.FC<SettingsProps> = ({ clubId }) => {
    const { clubs, leaveClub } = useApp();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    // Find the club to get the code
    const club = clubs.find(c => c.id === clubId);
    const clubCode = club?.code || clubId; // Fallback to ID if code not found (should not happen with new backend)
    
    const displayLink = `Invite Code: ${clubCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(clubCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeaveClub = async () => {
        if (confirm("Are you sure you want to leave this club?")) {
            await leaveClub(clubId);
            navigate('/dashboard'); 
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
                <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold">
                    <Link className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <h3>Invite Friends</h3>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Share this Club Code with your friends. They can enter it on their dashboard to join instantly.
                </p>

                <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono flex items-center">
                        {displayLink}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 flex items-center justify-center transition-colors min-w-[50px]"
                    >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </button>
                </div>
                <Button variant="secondary" fullWidth className="mt-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy Code'}
                </Button>
            </div>

            <Button 
                variant="danger" 
                fullWidth 
                className="justify-center dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30"
                onClick={handleLeaveClub}
            >
                <LogOut className="w-4 h-4" /> Leave Club
            </Button>
        </div>
    );
};

export default Settings;