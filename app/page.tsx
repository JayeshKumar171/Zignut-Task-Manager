'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token || isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/signin');
    }
  }, [router, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <span className="text-4xl font-bold text-white">TM</span>
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Task Manager
        </h1>
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          Organize your work, boost productivity, and achieve your goals with our modern task management system
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-2 w-2 bg-blue-500"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
