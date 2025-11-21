import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import MusicPlayer from './components/MusicPlayer';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');
  const [showLoadingTransition, setShowLoadingTransition] = useState(false);

  useEffect(() => {
    if (user) {
      setShowLoadingTransition(true);
      const timer = setTimeout(() => {
        setShowLoadingTransition(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (showLoadingTransition) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' ? <MusicPlayer /> : <ProfilePage />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
