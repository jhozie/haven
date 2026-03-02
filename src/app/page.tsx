"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Shield, Building2, Mail, Lock, ArrowRight, XCircle, CreditCard } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function LandingPage() {
  const router = useRouter();
  const { login, users } = useData();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [quickFillIndex, setQuickFillIndex] = useState(0);

  // Quick Fill Handlers
  const handleQuickFill = (role: 'resident' | 'admin') => {
    setErrorMsg('');
    if (role === 'admin') {
      setEmail('admin@havenprop.com');
      setPassword('admin123');
    } else {
      // Get all resident emails dynamically from the active users list
      const residentUsers = users.filter(u => u.role === 'resident');
      if (residentUsers.length > 0) {
        // Cycle through residents on each click
        const selectedResident = residentUsers[quickFillIndex % residentUsers.length];
        setEmail(`${selectedResident.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@havenprop.com`);
        setPassword('resident123');
        setQuickFillIndex(prev => prev + 1);
      }
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Simulate network delay for realism
    setTimeout(() => {
      setIsLoading(false);

      // Simple mock validation
      if (email === 'admin@havenprop.com' && password === 'admin123') {
        login('u1'); // Login as Yewande (Admin)
        router.push('/admin');
      } else if (password === 'resident123') {
        // Find matching resident by generating expected emails
        const residentUsers = users.filter(u => u.role === 'resident');
        const matchedResident = residentUsers.find(u =>
          `${u.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@havenprop.com` === email
        );

        if (matchedResident) {
          login(matchedResident.id);
          router.push('/resident');
        } else {
          setErrorMsg('Resident account not found. Please try again or use Quick Fill.');
        }
      } else {
        setErrorMsg('Invalid email or password. Please try again or use a Quick Fill button.');
      }
    }, 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elegant gradient elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <div className="space-y-4">
          <motion.div
            className="w-20 h-20 mx-auto rounded-2xl bg-primary-gradient flex items-center justify-center mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Building2 className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Welcome to <span className="text-gradient">HavenProp</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience effortless estate living and management.
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-medium text-slate-200">Sign in to your portal</h2>
            <p className="text-sm text-slate-400 mt-1">Enter your details to securely access your account.</p>
          </div>

          {/* Subtle Quick Fill Helpers - Designed to go unnoticed by clients */}
          <div className="flex justify-between items-center px-1 mb-2">
            <button
              onClick={() => handleQuickFill('admin')}
              type="button"
              className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest font-medium"
            >
              [ Fill Admin ]
            </button>
            <button
              onClick={() => handleQuickFill('resident')}
              type="button"
              className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest font-medium"
            >
              [ Fill Resident ]
            </button>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <p>{errorMsg}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors text-white placeholder-slate-500"
                  placeholder="name@havenprop.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <button type="button" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors text-white placeholder-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-primary-gradient rounded-xl font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center">Authenticating...</span>
              ) : (
                <span className="flex items-center">Sign In <ArrowRight className="w-4 h-4 ml-2" /></span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5">
            <Link
              href="/pay"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-medium text-slate-300 transition-all flex items-center justify-center gap-2 group"
            >
              <CreditCard className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              Quick Pay (No Login)
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          HavenProp Prototype Demonstration
        </div>
      </motion.div>
    </main>
  );
}
