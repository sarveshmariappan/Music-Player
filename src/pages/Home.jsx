import React, { useState } from 'react';
import { User, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MusicPlayer from '../components/MusicPlayer';
import Profile from '../components/Profile';
import SongUpload from '../components/SongUpload';
import './Home.css';

export default function Home() {
  const { user, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState('player');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  const handleSongAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentTab('player');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>Tamil Music Player</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <button
              className="btn btn-ghost"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut size={18} />
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      <div className="home-tabs">
        <button
          className={`tab-button ${currentTab === 'player' ? 'active' : ''}`}
          onClick={() => setCurrentTab('player')}
        >
          Music Player
        </button>
        <button
          className={`tab-button ${currentTab === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentTab('upload')}
        >
          <Upload size={18} />
          Upload
        </button>
        <button
          className={`tab-button ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
        >
          <User size={18} />
          Profile
        </button>
      </div>

      <div className="home-content">
        {currentTab === 'player' && <MusicPlayer key={refreshTrigger} />}
        {currentTab === 'upload' && <SongUpload onSongAdded={handleSongAdded} />}
        {currentTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}
