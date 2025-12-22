import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { useApp } from '../store';
import { Send, TrendingUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar } from './Avatar';

interface ChatProps {
    messages: Message[];
    clubId: string;
}


export const Chat: React.FC<ChatProps> = ({ messages, clubId }) => {
    const isFirstLoad = useRef(true);
    const { sendMessage, currentUser, loadMoreMessages } = useApp();
    const [text, setText] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const shouldStickToBottom = useRef(true);

    const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop < 40) {
        loadMoreMessages(clubId);
    }
    };



    useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // User is near bottom (within 40px)
    shouldStickToBottom.current =
        scrollHeight - (scrollTop + clientHeight) < 40;
    }, [messages]);

        useEffect(() => {
    // FIRST open → always jump to bottom
    if (isFirstLoad.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        isFirstLoad.current = false;
        return;
    }

    // Normal behavior (polling, updates)
    if (shouldStickToBottom.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    }, [messages]);

    useEffect(() => {
  isFirstLoad.current = true;
}, [clubId]);




    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage(clubId, text);
        setText('');
        shouldStickToBottom.current = true;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-340px)]"> 
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
                >

                {(!messages || messages.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-60">
                        <MessageSquare className="w-10 h-10 mb-2" />
                        <span className="text-sm">No messages yet. Say hi!</span>
                    </div>
                )}

                {messages && messages.map((msg) => {
                    // Check type instead of userId
                    if (msg.type === 'system') {
                        return (
                            <div key={msg.id} className="flex gap-2 items-center justify-center my-4 opacity-70">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 italic">{msg.text}</span>
                            </div>
                        );
                    }

                    const isMe = msg.userId === currentUser?.id;
                    const username = msg.username || 'Unknown';
                    const displayAvatarId = isMe ? currentUser?.avatarId : msg.avatarId;

                    let timeDisplay = "";
                    try {
                        timeDisplay = format(new Date(msg.timestamp), 'HH:mm');
                    } catch (e) {
                        timeDisplay = "";
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className="mr-2 mt-1">
                                    <Avatar avatarId={displayAvatarId} username={username} size="sm" />
                                </div>
                            )}
                            <div className="flex flex-col max-w-[75%]">
                                {!isMe && <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 ml-1">{username}</span>}
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                    isMe 
                                    ? 'bg-green-500 text-white rounded-br-none' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-300 dark:text-gray-600 mt-1 text-right">{timeDisplay}</span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                   <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full pl-5 pr-12 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                   />
                   <button 
                        type="submit" 
                        disabled={!text.trim()}
                        className="absolute right-2 p-2 bg-green-500 rounded-full text-white shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-green-600 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                   </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;