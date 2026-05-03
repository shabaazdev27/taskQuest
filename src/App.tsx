import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuestBoard from './components/QuestBoard';
import GuildChat from './components/GuildChat';
import { Quest } from './types';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

export default function App() {
  const { user, profile, loading, loginWithGoogle, loginAnonymously, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'quests'),
      where('creatorId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
        setQuests(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'quests')
    );

    return () => unsubscribe();
  }, [profile]);

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0502] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth onLogin={loginWithGoogle} onGuestLogin={loginAnonymously} />;
  }

  return (
    <Layout 
      profile={profile} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={logout}
    >
      {activeTab === 'dashboard' && <Dashboard profile={profile} quests={quests} />}
      {activeTab === 'quests' && <QuestBoard profile={profile} />}
      {activeTab === 'chat' && <GuildChat profile={profile} />}
      {activeTab === 'analytics' && <Dashboard profile={profile} quests={quests} />}
    </Layout>
  );
}

