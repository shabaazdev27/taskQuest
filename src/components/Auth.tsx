import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Swords } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
  onGuestLogin: () => void;
}

export default function Auth({ onLogin, onGuestLogin }: AuthProps) {
  return (
    <div className="min-h-screen bg-[#0a0502] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 atmosphere opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 text-center relative z-10"
      >
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <Swords className="text-white w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">TaskQuest</h1>
        <p className="text-white/60 mb-12 text-lg">Turn your daily grind into an epic adventure. Level up your productivity.</p>
        
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 transition-colors"
            id="login-button"
          >
            <LogIn size={20} />
            Login with Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGuestLogin}
            className="w-full bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-colors border border-white/10"
            id="guest-login-button"
          >
            Play as Guest
          </motion.button>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-sm">
          <ShieldCheck size={16} />
          Secure Enterprise Authentication
        </div>
      </motion.div>
      
      <style>{`
        .atmosphere {
          background: 
            radial-gradient(circle at 50% 30%, #3a1510 0%, transparent 60%),
            radial-gradient(circle at 10% 80%, #ff4e00 0%, transparent 50%);
          filter: blur(60px);
        }
      `}</style>
    </div>
  );
}
