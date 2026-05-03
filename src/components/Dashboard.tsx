import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { 
  Trophy, 
  Target, 
  Zap, 
  Flame, 
  ChevronRight,
  TrendingUp,
  Activity,
  History,
  Award,
  Clock
} from 'lucide-react';
import { UserProfile, Quest, QuestStatus } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  profile: UserProfile;
  quests: Quest[];
}

const data = [
  { day: 'Mon', completed: 4, xp: 200 },
  { day: 'Tue', completed: 6, xp: 350 },
  { day: 'Wed', completed: 3, xp: 150 },
  { day: 'Thu', completed: 8, xp: 500 },
  { day: 'Fri', completed: 5, xp: 250 },
  { day: 'Sat', completed: 2, xp: 100 },
  { day: 'Sun', completed: 1, xp: 50 },
];

export default function Dashboard({ profile, quests }: DashboardProps) {
  const completedQuests = quests.filter(q => q.status === QuestStatus.COMPLETED);
  const activeQuests = quests.filter(q => q.status === QuestStatus.ACTIVE);
  
  return (
    <div className="grid grid-cols-12 gap-8 pb-12">
      {/* Left Column - Main Stats */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-[#0a0502] rounded-[40px] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <Trophy size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest">Master Level</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Established Hero</span>
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter leading-none">
              Glorious day, <br/>{profile.displayName}!
            </h1>
            <p className="text-white/60 mb-8 max-w-md text-lg font-medium">Your legend grows with every solved ticket. Today's battlefield awaits.</p>
            
            <div className="flex items-center gap-6">
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105">
                Resume Active Quest
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center p-2">
                  <Flame className="text-orange-500 w-full h-full" />
                </div>
                <div>
                  <p className="text-sm font-bold">5 Day Streak</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">+50 Bonus XP active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1 */}
          <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-black text-lg">Quest Velocity</h3>
                <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Survived Encounters per Day</p>
              </div>
              <Activity className="text-black/10" size={24} />
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 700, fill: '#00000040'}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f5f5f5'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#f97316' : '#00000010'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-black text-lg">XP Farming</h3>
                <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Experience Gain Trend</p>
              </div>
              <Zap className="text-black/10" size={24} />
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorXp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent History List */}
        <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h3 className="font-bold text-xl">Survival Logs</h3>
              <p className="text-xs text-black/40 font-bold tracking-widest uppercase">Your Recent Activity</p>
            </div>
            <button className="text-orange-500 font-bold text-xs uppercase tracking-widest hover:underline">View History</button>
          </div>
          <div className="space-y-4">
            {completedQuests.slice(0, 4).map((quest, idx) => (
              <div key={quest.id} className="flex items-center justify-between p-4 bg-[#F5F5F0]/50 rounded-2xl border border-transparent hover:border-black/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{quest.title}</h4>
                    <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Completed • {new Date(quest.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-black text-sm">+{quest.xpReward} XP</p>
                  <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">LOOT DROPPED</p>
                </div>
              </div>
            ))}
            {completedQuests.length === 0 && (
              <div className="text-center py-12 text-black/20">
                <History size={40} className="mx-auto mb-2 opacity-50" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No logs recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Side Profile / Quests */}
      <div className="col-span-12 lg:col-span-4 space-y-8">
        
        {/* Level Progress Card */}
        <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full rotate-[-90deg]">
              <circle 
                cx="64" cy="64" r="60" 
                className="stroke-black/5 fill-none stroke-[8]" 
              />
              <circle 
                cx="64" cy="64" r="60" 
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * (profile.xp % 100)) / 100}
                className="stroke-orange-500 fill-none stroke-[8] stroke-round transition-all duration-1000" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-[0deg]">
              <span className="text-[10px] font-black uppercase text-black/30">Lvl</span>
              <span className="text-3xl font-black">{profile.level}</span>
            </div>
          </div>
          <h3 className="font-black text-xl mb-1">{profile.displayName}</h3>
          <p className="text-xs text-black/40 font-bold uppercase tracking-widest mb-6">{profile.xp} Total XP Gathered</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F5F0] p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Rank</p>
              <p className="font-bold">Adventurer</p>
            </div>
            <div className="bg-[#F5F5F0] p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Guild</p>
              <p className="font-bold">Alpha Team</p>
            </div>
          </div>
        </div>

        {/* Priority Quests */}
        <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h3 className="font-bold text-xl">Top Missions</h3>
              <p className="text-xs text-black/40 font-bold tracking-widest uppercase">Action Required</p>
            </div>
            <Target className="text-black/10" size={24} />
          </div>
          <div className="space-y-3">
            {activeQuests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="p-5 bg-white border border-black/5 rounded-3xl hover:border-black/10 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full",
                    quest.priority === 'Epic' ? "bg-red-100 text-red-600" : "bg-black/5 text-black/60"
                  )}>
                    {quest.priority}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-orange-500">
                    <Zap size={10} />
                    {quest.xpReward} XP
                  </div>
                </div>
                <h4 className="font-black text-sm mb-1 line-clamp-1">{quest.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-black/30 font-bold">
                  <Clock size={10} />
                  Due Tomorrow
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors group">
            Open Quest Log
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
