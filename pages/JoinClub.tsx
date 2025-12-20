import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';

export const JoinClub: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Save the code to session storage to be handled by Dashboard
      sessionStorage.setItem('pendingClubJoin', code);
      
      if (currentUser) {
        // If logged in, go straight to dashboard to trigger join
        navigate('/dashboard');
      } else {
        // If not logged in, go to landing (which handles auth)
        // We pass a query param just to let Landing know (optional UI hint)
        navigate('/?invite=true');
      }
    } else {
      navigate('/dashboard');
    }
  }, [code, currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-gray-500 dark:text-gray-400 animate-pulse">
        Redirecting to club...
      </div>
    </div>
  );
};