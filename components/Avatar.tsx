import React from 'react';

// Define our 7 Avatar Options
export const AVATAR_OPTIONS = [
    { id: '1', emoji: '🦊', color: 'bg-orange-100', label: 'Fox' },
    { id: '2', emoji: '🐼', color: 'bg-slate-100', label: 'Panda' },
    { id: '3', emoji: '🦁', color: 'bg-yellow-100', label: 'Lion' },
    { id: '4', emoji: '🐯', color: 'bg-red-100', label: 'Tiger' },
    { id: '5', emoji: '🐸', color: 'bg-green-100', label: 'Frog' },
    { id: '6', emoji: '🐙', color: 'bg-purple-100', label: 'Octopus' },
    { id: '7', emoji: '🦄', color: 'bg-pink-100', label: 'Unicorn' },
    { id: '8', emoji: '🐵', color: 'bg-brown-100', label: 'Monkey' },
    { id: '9', emoji: '🐧', color: 'bg-blue-100', label: 'Penguin' },
    { id: '10', emoji: '🐢', color: 'bg-teal-100', label: 'Turtle' },
    { id: '11', emoji: '🦇', color: 'bg-gray-100', label: 'Bat' },
];

interface AvatarProps {
    avatarId?: string;
    username?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const getUserColor = (username: string) => {
    const colors = ['bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-yellow-100 text-yellow-600'];
    let hash = 0;
    if(username) {
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ avatarId, username = '??', size = 'md', className = '' }) => {
    // 1. Check if avatarId corresponds to a preset
    const preset = AVATAR_OPTIONS.find(a => a.id === avatarId);

    // Size mappings
    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-16 h-16 text-2xl',
        xl: 'w-20 h-20 text-3xl'
    };

    if (preset) {
        return (
            <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center shadow-sm ${preset.color} ${className}`}>
                {preset.emoji}
            </div>
        );
    }

    // 2. Fallback to Initials
    const initials = username.slice(0, 2).toUpperCase();
    const colorClass = getUserColor(username);

    return (
        <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center font-bold shadow-inner ${colorClass} ${className}`}>
            {initials}
        </div>
    );
};