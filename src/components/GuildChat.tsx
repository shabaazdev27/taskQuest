import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Paperclip, 
  MoreVertical,
  Check,
  CheckCheck,
  Search,
  Smile,
  Shield,
  Clock,
  ArrowDown
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { ChatMessage, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface GuildChatProps {
  profile: UserProfile;
}

export default function GuildChat({ profile }: GuildChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPresence, setShowPresence] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'global_chat'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
      setMessages(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (shouldScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScroll(isAtBottom);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !isUploading) return;

    try {
      const messageData = {
        senderId: profile.uid,
        senderName: profile.displayName,
        senderPhoto: profile.photoURL,
        text: inputText,
        type: 'text',
        createdAt: new Date().toISOString(),
        readBy: [profile.uid]
      };
      
      setInputText('');
      await addDoc(collection(db, 'global_chat'), messageData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'global_chat');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `chat/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const messageData = {
        senderId: profile.uid,
        senderName: profile.displayName,
        senderPhoto: profile.photoURL,
        text: `Shared a ${file.type.startsWith('image/') ? 'photo' : 'file'}: ${file.name}`,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        attachmentUrl: url,
        createdAt: new Date().toISOString(),
        readBy: [profile.uid]
      };
      
      await addDoc(collection(db, 'global_chat'), messageData);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden min-h-0 relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-black/5 bg-white/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold">The Great Hall</h3>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                12 Heros Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40"><Search size={20} /></button>
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Message Thread */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          <div className="text-center py-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/20">Beginning of time</p>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId === profile.uid;
              const prevMsg = messages[idx - 1];
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-end gap-3",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar && (
                      <img 
                        src={msg.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} 
                        className="w-full h-full rounded-full border border-black/10 bg-orange-100" 
                        alt=""
                      />
                    )}
                  </div>
                  <div className={cn("max-w-[70%] space-y-1", isOwn ? "items-end" : "items-start")}>
                    {showAvatar && (
                      <p className={cn("text-[10px] font-bold text-black/40 mb-1", isOwn ? "text-right" : "text-left")}>
                        {msg.senderName}
                      </p>
                    )}
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm",
                      isOwn 
                        ? "bg-[#0a0502] text-white rounded-br-none" 
                        : "bg-[#F5F5F0] text-[#1a1a1a] rounded-bl-none border border-black/5"
                    )}>
                      {msg.type === 'image' && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                          <img src={msg.attachmentUrl} className="w-full max-h-60 object-cover" alt="attachment" />
                        </div>
                      )}
                      {msg.type === 'file' && (
                        <a 
                          href={msg.attachmentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-2 hover:bg-white/20 transition-all"
                        >
                          <FileText size={20} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">Secret Document</p>
                            <p className="text-[10px] opacity-60 uppercase">DOWNLOAD</p>
                          </div>
                        </a>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <div className={cn("flex items-center gap-1 text-[9px] text-black/30 font-bold uppercase", isOwn && "justify-end")}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isOwn && <CheckCheck size={12} className="text-orange-500" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-black/5 bg-white space-y-4">
          <form onSubmit={sendMessage} className="flex items-center gap-3 bg-[#F5F5F0] border border-black/5 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
            <div className="flex items-center">
              <label className="p-2 text-black/40 hover:text-black cursor-pointer transition-colors relative group">
                <Paperclip size={20} />
                <input type="file" className="hidden" onChange={handleFileUpload} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">SHARE LOOT</span>
              </label>
              <button type="button" className="p-2 text-black/40 hover:text-black transition-colors"><Smile size={20} /></button>
            </div>
            
            <input 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Send a message to the Guild..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-black/30 font-medium py-2"
            />

            <button 
              disabled={!inputText.trim() && !isUploading}
              className="w-10 h-10 bg-[#0a0502] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:bg-black/10 disabled:text-black/20 disabled:scale-100 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
          
          <div className="flex items-center justify-between text-[10px] font-bold text-black/30 uppercase tracking-widest px-2">
            <div className="flex items-center gap-2">
              <Shield size={12} />
              End-to-End Cryptography Active
            </div>
            {isUploading && (
              <div className="flex items-center gap-2 text-orange-500">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                Uploading Artifact...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Online Users List */}
      <div className={cn(
        "w-72 hidden lg:flex flex-col bg-white rounded-[32px] border border-black/5 shadow-sm p-6 overflow-hidden transition-all",
        !showPresence && "w-0 p-0 overflow-hidden opacity-0"
      )}>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 px-2">Guild Members</h3>
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {[profile, { uid: '1', displayName: 'Elder Mod', photoURL: '' }, { uid: '2', displayName: 'QuestMaster', photoURL: '' }].map((p, idx) => (
            <div key={p.uid} className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-black/5 hover:bg-[#F5F5F0]/50 transition-all cursor-pointer group">
              <div className="relative">
                <img 
                  src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`} 
                  className="w-10 h-10 rounded-xl border border-black/10 bg-orange-100"
                  alt=""
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate group-hover:text-orange-600 transition-colors">{p.displayName}</p>
                <p className="text-[10px] text-black/40 font-medium">In the Dungeon</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
