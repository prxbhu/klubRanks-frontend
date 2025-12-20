import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Link, LogOut, Copy, Check, Edit3, Save, X } from 'lucide-react';
import { useApp } from '../store';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
    clubId: string;
}

export const Settings: React.FC<SettingsProps> = ({ clubId }) => {
    const { clubs, currentUser, leaveClub, updateClub } = useApp();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    
    const club = clubs.find(c => c.id === clubId);
    const clubCode = club?.code || clubId; 
    
    // Local state for editing form
    const [editName, setEditName] = useState(club?.name || '');
    const [editDesc, setEditDesc] = useState(club?.description || '');
    const [editAction, setEditAction] = useState(club?.actionName || '');

    const isCreator = currentUser && club && currentUser.id === club.createdBy;

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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateClub(clubId, editName, editDesc, editAction);
        setIsEditing(false);
    };

    const toggleEdit = () => {
        if (!isEditing) {
            // Reset form to current values when opening edit
            setEditName(club?.name || '');
            setEditDesc(club?.description || '');
            setEditAction(club?.actionName || '');
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="p-6 space-y-8 pb-24">
            {/* Invite Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
                <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold">
                    <Link className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <h3>Invite Friends</h3>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Share this Club Code with your friends.
                </p>

                <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono flex items-center">
                        Invite Code: {clubCode}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 flex items-center justify-center transition-colors min-w-[50px]"
                    >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </button>
                </div>
            </div>

            {/* Club Details / Edit Section (Only for Creator) */}
            {isCreator && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4 text-gray-900 dark:text-white font-bold">
                        <div className="flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <h3>Club Settings</h3>
                        </div>
                        <button onClick={toggleEdit} className="text-xs text-green-500 hover:underline">
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-bold">Name</span>
                                <p className="text-gray-900 dark:text-white">{club?.name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-bold">Description</span>
                                <p className="text-gray-900 dark:text-white">{club?.description || 'No description'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-bold">Action Unit</span>
                                <p className="text-gray-900 dark:text-white">{club?.actionName}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <Input 
                                label="Club Name" 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)} 
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <Input 
                                label="Description" 
                                value={editDesc} 
                                onChange={e => setEditDesc(e.target.value)} 
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <Input 
                                label="Action Unit (e.g. Points)" 
                                value={editAction} 
                                onChange={e => setEditAction(e.target.value)} 
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <div className="flex gap-2">
                                <Button type="button" variant="secondary" fullWidth onClick={toggleEdit}>Cancel</Button>
                                <Button type="submit" fullWidth>Save Changes</Button>
                            </div>
                        </form>
                    )}
                </div>
            )}

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