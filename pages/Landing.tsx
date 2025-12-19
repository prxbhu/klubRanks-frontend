import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useApp } from '../store';
import { Trophy, ArrowRight, Shield, MessageSquare, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export const Landing: React.FC = () => {
  const { login, signup } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await signup(username, password);
      } else {
        await login(username, password);
      }
      setIsAuthModalOpen(false); // Close modal on success
    } catch (err) {
      // Error is handled in store but we can catch here if needed
      console.error(err);
    }
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-50 to-white -z-10" />

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-12 mt-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-green-500" />
          <span className="font-bold text-xl tracking-tight text-gray-900">ClubRank</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => openAuth('login')} className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
            Log In
          </button>
          <button onClick={() => openAuth('signup')} className="text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="w-full max-w-md text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Compete with Friends. <br/>
          <span className="text-green-400">Climb the Ranks.</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          Create clubs, track progress, and compete on real-time leaderboards. Increment your counter, chat with friends, and see who rises to the top.
        </p>

        <div className="space-y-3">
          <Button fullWidth onClick={() => openAuth('signup')}>Create a Club</Button>
          <Button fullWidth variant="secondary" onClick={() => openAuth('login')}>Join with Link</Button>
        </div>
      </div>

      {/* Features */}
      <div className="w-full max-w-md space-y-12 pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-500">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Competitive Leaderboards</h3>
          <p className="text-gray-500">Real-time rankings that update instantly when anyone in your club makes progress.</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-500">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Private Clubs</h3>
          <p className="text-gray-500">Create invite-only clubs and share links with your friends to compete together.</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Built-in Chat</h3>
          <p className="text-gray-500">Chat with club members and get notified when someone increases their counter.</p>
        </div>
      </div>

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-500" />
                <span className="font-bold text-lg">ClubRank</span>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-1">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm">
                {authMode === 'login' ? 'Sign in to start competing' : 'Join a club and climb the ranks'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6 relative">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ${authMode === 'signup' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                />
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('login'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold z-10 transition-colors ${authMode === 'login' ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  Log In
                </button>
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('signup'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold z-10 transition-colors ${authMode === 'signup' ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl text-xs font-medium animate-in fade-in zoom-in duration-200">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Input 
                placeholder="Enter your username" 
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <Input 
                type="password" 
                placeholder="Enter your password" 
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {authMode === 'signup' && (
                <Input 
                  type="password" 
                  placeholder="Confirm your password" 
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="animate-in slide-in-from-top-2 duration-300"
                />
              )}

              <Button fullWidth type="submit" className="mt-4">
                {authMode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              {authMode === 'login' ? (
                <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-green-500 font-bold hover:underline">Sign Up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setAuthMode('login')} className="text-green-500 font-bold hover:underline">Log In</button></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};