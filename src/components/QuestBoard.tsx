import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Swords,
  X
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Quest, QuestCategory, QuestPriority, QuestStatus, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface QuestBoardProps {
  profile: UserProfile;
}

export default function QuestBoard({ profile }: QuestBoardProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<QuestStatus | 'All'>('All');

  useEffect(() => {
    const q = query(
      collection(db, 'quests'),
      where('creatorId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
        setQuests(data);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'quests')
    );

    return () => unsubscribe();
  }, [profile.uid]);

  const toggleStatus = async (quest: Quest) => {
    const newStatus = quest.status === QuestStatus.ACTIVE ? QuestStatus.COMPLETED : QuestStatus.ACTIVE;
    try {
      await updateDoc(doc(db, 'quests', quest.id), { status: newStatus });
      
      // If completed, add XP
      if (newStatus === QuestStatus.COMPLETED) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, { 
          xp: profile.xp + quest.xpReward,
          'stats.tasksCompleted': (profile.stats?.tasksCompleted || 0) + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `quests/${quest.id}`);
    }
  };

  const filteredQuests = quests.filter(q => filter === 'All' || q.status === filter);

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-8 text-orange-500/10 pointer-events-none group-hover:scale-110 transition-transform">
            <Swords size={80} />
          </div>
          <p className="text-sm font-medium text-black/40 mb-1">Active Quests</p>
          <h3 className="text-3xl font-bold">{quests.filter(q => q.status === QuestStatus.ACTIVE).length}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
            <TrendingUp size={12} />
            Keep going, Hero!
          </div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm"
        >
          <p className="text-sm font-medium text-black/40 mb-1">Current XP</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{profile.xp}</h3>
            <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">XP</span>
          </div>
          <div className="mt-4 w-full h-2 bg-black/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-1000"
              style={{ width: `${(profile.xp % 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-black/40 uppercase font-bold tracking-widest text-right">
            {100 - (profile.xp % 100)} XP to Next Level
          </p>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm"
        >
          <p className="text-sm font-medium text-black/40 mb-1">Completed</p>
          <h3 className="text-3xl font-bold">{quests.filter(q => q.status === QuestStatus.COMPLETED).length}</h3>
          <p className="mt-4 text-xs text-black/40">Total adventures survived since joining.</p>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-white border border-black/5 rounded-2xl">
            {['All', QuestStatus.ACTIVE, QuestStatus.COMPLETED].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-sm font-medium transition-all",
                  filter === f ? "bg-[#0a0502] text-white shadow-md" : "text-black/60 hover:text-black hover:bg-black/5"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0a0502] text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
        >
          <Plus size={20} />
          New Quest
        </button>
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredQuests.map((quest, idx) => (
            <motion.div
              layout
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "group relative bg-white p-6 rounded-[32px] border border-black/5 hover:border-black/10 hover:shadow-xl hover:shadow-black/[0.02] transition-all cursor-pointer overflow-hidden",
                quest.status === QuestStatus.COMPLETED && "opacity-75 grayscale-[0.5]"
              )}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  quest.category === QuestCategory.MAIN ? "bg-orange-100 text-orange-600" :
                  quest.category === QuestCategory.DAILY ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                )}>
                  {quest.category}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                  <TrendingUp size={12} />
                  +{quest.xpReward} XP
                </div>
              </div>

              <h4 className={cn(
                "text-xl font-bold mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors",
                quest.status === QuestStatus.COMPLETED && "line-through text-black/40"
              )}>
                {quest.title}
              </h4>
              <p className="text-sm text-black/50 mb-6 line-clamp-2 leading-relaxed">
                {quest.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5">
                <div className="flex items-center gap-4 text-black/30">
                  {quest.deadline && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar size={14} />
                      {new Date(quest.deadline).toLocaleDateString()}
                    </div>
                  )}
                  {quest.priority === QuestPriority.EPIC && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                      <AlertCircle size={14} />
                      EPIC
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(quest);
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    quest.status === QuestStatus.COMPLETED 
                      ? "bg-green-500 text-white shadow-lg shadow-green-200" 
                      : "bg-black/5 text-black/20 hover:bg-black/10 hover:text-black"
                  )}
                >
                  {quest.status === QuestStatus.COMPLETED ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredQuests.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black/5 mb-4 text-black/10">
              <Swords size={40} />
            </div>
            <h3 className="text-lg font-bold text-black/40">No quests found in this scroll.</h3>
            <p className="text-sm text-black/20">Time to forge a new destiny?</p>
          </div>
        )}
      </div>

      {/* Add Quest Modal */}
      <AnimatePresence>
        {showAddModal && <AddQuestModal profile={profile} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function AddQuestModal({ profile, onClose }: { profile: UserProfile, onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: QuestCategory.MAIN,
    priority: QuestPriority.MEDIUM,
    deadline: '',
    xpReward: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'quests'), {
        ...formData,
        status: QuestStatus.ACTIVE,
        creatorId: profile.uid,
        assignees: [profile.uid],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quests');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#F5F5F0] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <h3 className="text-2xl font-bold tracking-tight">Forge New Quest</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <input 
              required
              placeholder="Quest Title (e.g., Slay the Bug in Prod)"
              className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-lg font-bold focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-black/20"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              placeholder="Quest details and secrets..."
              className="w-full bg-white border border-black/5 rounded-3xl px-6 py-4 text-sm min-h-[120px] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-black/20 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-2">Category</label>
              <select 
                className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
              >
                {Object.values(QuestCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-2">Priority</label>
              <select 
                className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
              >
                {Object.values(QuestPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-2">XP Reward</label>
              <input 
                type="number"
                className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.xpReward}
                onChange={e => setFormData({...formData, xpReward: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-2">Deadline</label>
              <input 
                type="date"
                className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-500 text-white font-bold py-5 rounded-[24px] shadow-xl shadow-orange-500/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-98 transition-all"
          >
            Forge Quest
          </button>
        </form>
      </motion.div>
    </div>
  );
}
