import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Swords, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User as UserIcon
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quests', label: 'Quests', icon: Swords },
  { id: 'chat', label: 'Guild Chat', icon: MessageSquare },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
];

export default function Layout({ children, activeTab, setActiveTab, profile, onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#F5F5F0] text-[#1a1a1a] font-sans selection:bg-orange-200">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 border-r border-black/5 flex flex-col items-center md:items-stretch bg-white">
        <div className="p-6 mb-8 flex items-center justify-center md:justify-start gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Swords className="text-white w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">TaskQuest</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-[#0a0502] text-white" 
                  : "hover:bg-black/5 text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
              )}
            >
              <item.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", activeTab === item.id && "scale-110")} />
              <span className="hidden md:block font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-3/5 bg-orange-500 rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-[#1a1a1a]/60 hover:bg-black/5 hover:text-[#1a1a1a] transition-all">
            <Settings className="w-6 h-6" />
            <span className="hidden md:block font-medium">Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-6 h-6" />
            <span className="hidden md:block font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F5F5F0]">
        {/* Header */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-xl font-bold md:block hidden">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="relative max-w-md w-full md:block hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input 
                type="text" 
                placeholder="Search quests, team members..." 
                className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-black/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 text-[#1a1a1a]/60 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/5 ml-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-tight">{profile.displayName}</p>
                <p className="text-xs text-[#1a1a1a]/40">Lvl {profile.level} • {profile.xp} XP</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 p-0.5 border border-orange-200">
                <img 
                  src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
