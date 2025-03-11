import React, { useState, useEffect } from 'react';
import { LogOut, User, Settings } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/user`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError('Could not load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/logout`, {
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="card bg-base-200 shadow animate-pulse">
        <div className="card-body items-center text-center">
          <div className="w-16 h-16 rounded-full bg-base-300"></div>
          <div className="h-4 bg-base-300 rounded w-3/4 mt-4"></div>
          <div className="h-3 bg-base-300 rounded w-1/2 mt-2"></div>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="card bg-base-200 shadow">
        <div className="card-body items-center text-center">
          <User className="w-16 h-16 text-error" />
          <h3 className="card-title mt-2">Error</h3>
          <p className="text-sm text-error">{error || 'User not found'}</p>
          <a href="/login" className="btn btn-sm btn-primary mt-4">Login</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-base-200 shadow">
      <div className="card-body items-center text-center">
        {user.avatar ? (
          <img 
            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128`} 
            alt={user.username}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
              <span className="text-xl">{user.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        )}
        
        <h3 className="card-title mt-2">{user.username}</h3>
        <p className="text-sm opacity-70">Discord User</p>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleLogout}
            className="btn btn-sm btn-outline btn-error gap-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          
          <a href="/settings" className="btn btn-sm btn-outline gap-1">
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 