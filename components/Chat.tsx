import React, { useState, useRef, useLayoutEffect } from 'react';
import { Message } from '../types';
import { useApp } from '../store';
import { Send, TrendingUp, MessageSquare, ChevronDown, Reply, X } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar } from './Avatar';

interface ChatProps {
    messages: Message[];
    clubId: string;
}

export const Chat: React.FC<ChatProps> = ({ messages, clubId }) => {
    const { sendMessage, currentUser } = useApp();
    const [text, setText] = useState('');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    
    // Scroll & Notification Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    
    // State to track scroll status
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newMsgToast, setNewMsgToast] = useState<Message | null>(null);
    
    const prevMessagesLength = useRef(messages.length);

    // 1. Handle Scroll Detection
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        
        // If within 50px of bottom, consider it "at bottom"
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        
        if (isAtBottom) {
            setShowScrollButton(false);
            setUnreadCount(0);
            setNewMsgToast(null);
        } else {
            setShowScrollButton(true);
        }
    };

    // 2. Handle New Messages Logic
    useLayoutEffect(() => {
        const isNewMessage = messages.length > prevMessagesLength.current;
        prevMessagesLength.current = messages.length;

        if (isNewMessage) {
            const lastMsg = messages[messages.length - 1];
            const isMe = lastMsg.userId === currentUser?.id;

            // Logic: 
            // - If I sent the message -> Force scroll to bottom.
            // - If I am already at bottom -> Auto scroll to bottom.
            // - If I am scrolled up -> Show notification.
            if (isMe || !showScrollButton) {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else {
                setUnreadCount(prev => prev + 1);
                setNewMsgToast(lastMsg);
            }
        } else {
            // Initial load or tab switch
            if (!showScrollButton && unreadCount === 0 && messages.length > 0) {
                 bottomRef.current?.scrollIntoView();
            }
        }
    }, [messages, currentUser?.id]); // Removed showScrollButton from dep to avoid loop, handled by logic

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadCount(0);
        setNewMsgToast(null);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        const replyId = replyingTo ? replyingTo.id : undefined;
        await sendMessage(clubId, text, replyId);
        
        setText('');
        setReplyingTo(null);
        // We rely on the useLayoutEffect to scroll down after message is added to list
    };

    return (
        <div className="flex flex-col h-[calc(100vh-340px)] relative"> 
            
            {/* New Message Notification Toast */}
            {newMsgToast && showScrollButton && (
                <div 
                    onClick={scrollToBottom}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 cursor-pointer animate-in slide-in-from-top-2 fade-in"
                >
                    <div className="flex items-center gap-2 max-w-[200px]">
                        <span className="font-bold">{newMsgToast.username}:</span> 
                        <span className="truncate">{newMsgToast.text}</span>
                    </div>
                    <ChevronDown className="w-3 h-3" />
                </div>
            )}

            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar"
            >
                {(!messages || messages.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-60">
                        <MessageSquare className="w-10 h-10 mb-2" />
                        <span className="text-sm">No messages yet. Say hi!</span>
                    </div>
                )}

                {messages && messages.map((msg) => {
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
                    try { timeDisplay = format(new Date(msg.timestamp), 'HH:mm'); } catch (e) {}

                    return (
                        <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className="mr-2 mt-auto">
                                    <Avatar avatarId={displayAvatarId} username={username} size="sm" />
                                </div>
                            )}
                            
                            <div className={`flex flex-col max-w-[75%] relative items-${isMe ? 'end' : 'start'}`}>
                                
                                {/* Reply Bubble Visualization */}
                                {msg.replyTo && (
                                    <div className={`
                                        mb-1 px-3 py-1.5 rounded-xl text-xs bg-opacity-50 border-l-4 cursor-pointer
                                        ${isMe ? 'bg-green-100 border-green-600 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                               : 'bg-gray-100 border-gray-400 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}
                                    `}>
                                        <span className="font-bold block text-[10px] opacity-80">{msg.replyTo.username}</span>
                                        <span className="truncate block max-w-[150px] italic">{msg.replyTo.text}</span>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className="relative group/bubble">
                                    {!isMe && <span className="text-[10px] text-gray-400 ml-1 mb-0.5 block">{username}</span>}
                                    
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                        isMe 
                                        ? 'bg-green-500 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>

                                    {/* Reply Button (Visible on Hover) */}
                                    <button 
                                        onClick={() => setReplyingTo(msg)}
                                        className={`
                                            absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity
                                            ${isMe ? '-left-8' : '-right-8'}
                                        `}
                                        title="Reply"
                                        type="button"
                                    >
                                        <Reply className="w-3 h-3" />
                                    </button>
                                </div>

                                <span className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">{timeDisplay}</span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Scroll to Bottom Button with Badge */}
            {showScrollButton && (
                <button 
                    onClick={scrollToBottom}
                    className="absolute bottom-20 right-4 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                    <div className="relative">
                        <ChevronDown className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </button>
            )}

            {/* Input Area with Reply Context */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200">
                
                {/* Replying To Banner */}
                {replyingTo && (
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-2">
                        <div className="flex flex-col text-xs border-l-2 border-green-500 pl-2">
                            <span className="text-green-600 dark:text-green-400 font-bold">Replying to {replyingTo.username}</span>
                            <span className="text-gray-500 dark:text-gray-400 truncate max-w-[250px]">{replyingTo.text}</span>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="p-4">
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-12 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button 
                            type="submit" 
                            disabled={!text.trim()}
                            className="absolute right-2 p-2 bg-green-500 rounded-xl text-white shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-green-600 transition-colors active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                    </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;