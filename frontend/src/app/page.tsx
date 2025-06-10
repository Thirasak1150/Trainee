"use client";

import React, { FormEvent, useState } from 'react';

import { User, Lock, ArrowRight, Loader2 } from 'lucide-react'; // Added Loader2 for loading state

import { useRouter } from 'next/navigation';
// import IconTechnomic from '@/components/ui/IconTechnomic';
import { handleLogin } from '@/features/auth/services/authService';
import { useUser } from './Usercontext';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser_uuid } = useUser();
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      
    const response = await handleLogin(username, password, setError, router);
    console.log(response.user_uuid);
    setUser_uuid(response.user_uuid);

    } finally {
 
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-indigo-700 to-blue-800 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="bg-white/20 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/30 w-full max-w-4xl flex overflow-hidden min-h-[600px]">
        {/* Left Panel */} 
        <div className="w-1/2 bg-black/10 p-10 text-white hidden md:flex flex-col justify-center items-center relative">
          <div className="mb-8 text-center">
       {/* <IconTechnomic width={350} height={200} /> 
    */}<video src="/Animation/logovedio.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
        </div>
          <h2 className="text-3xl font-bold mb-3 text-center">Technomic Systems</h2>
          <p className="text-center text-indigo-200 text-lg">
            Technomic Systems  <span className="font-semibold text-indigo-100">PBX</span>.
          </p>
        </div>

        {/* Right Panel */} 
        <div className="w-full md:w-1/2 p-8 sm:p-10 bg-white/5 flex flex-col justify-center">
          <div className="flex justify-end mb-6">
            <button className="px-5 py-2 text-sm font-semibold text-white bg-slate-700 rounded-l-md focus:outline-none z-10 shadow-md transition-colors hover:bg-slate-600">Sign In</button>
            <button className="px-5 py-2 text-sm font-semibold text-indigo-200 bg-slate-800/80 hover:bg-slate-700/90 rounded-r-md focus:outline-none transition-colors">Sign Up</button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/30 text-red-100 border border-red-500/50 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={ handleSubmit}>
            <div className="mb-5">
              <label htmlFor="username" className="block text-sm font-medium text-indigo-100 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-indigo-300 pointer-events-none" size={18} />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 text-white rounded-lg border border-transparent focus:border-indigo-400/80 focus:ring-1 focus:ring-indigo-400/80 focus:outline-none placeholder-indigo-300/70 transition-colors duration-300"
                  placeholder="your.username"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-indigo-100 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-indigo-300 pointer-events-none" size={18} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 text-white rounded-lg border border-transparent focus:border-indigo-400/80 focus:ring-1 focus:ring-indigo-400/80 focus:outline-none placeholder-indigo-300/70 transition-colors duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mb-8">
              <a href="#" className="text-sm text-indigo-300 hover:text-indigo-100 hover:underline transition-colors">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? 'bg-slate-600' : 'bg-slate-700 hover:bg-slate-600'
              } text-white font-semibold py-3.5 rounded-lg transition duration-300 ease-in-out flex items-center justify-center shadow-md`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <hr className="flex-grow border-t border-indigo-400/30" />
            <span className="px-3 text-indigo-200 text-xs">OR CONTINUE WITH</span>
            <hr className="flex-grow border-t border-indigo-400/30" />
          </div>
          
          {/* <div className="mt-6 flex justify-center space-x-3">
            {[GoogleIcon, Facebook, Twitter, Github].map((Icon, index) => (
              <button key={index} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-indigo-200 hover:text-white transition-all duration-300 aspect-square flex items-center justify-center shadow">
                <Icon size={18} />
              </button>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;