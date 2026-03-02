import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OfficialDashboard from './components/official/OfficialDashboard';
import CitizenDashboard from './components/citizen/CitizenDashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // display a splash screen at startup and fade it to reveal login
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2000);
    const t2 = setTimeout(() => setShowSplash(false), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading SmartInfra...</p>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center bg-slate-950 z-50 transition-all duration-700 ease-in-out ${
          fadeOut ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
      >
        <Building2 className="w-20 h-20 text-emerald-500 mb-4 animate-pulse" />
        <h1 className="text-6xl font-extrabold text-emerald-500 tracking-wide">
          SmartInfra
        </h1>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onToggle={() => setShowRegister(false)} />
    ) : (
      <Login onToggle={() => setShowRegister(true)} />
    );
  }

  if (user.role === 'official' || user.role === 'superadmin') {
    return <OfficialDashboard />;
  }

  return <CitizenDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
