import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Globe, Compass, MapPin } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left Branding / Hero Panel */}
      <div className="relative md:w-1/2 lg:w-3/5 p-8 md:p-12 flex flex-col justify-between overflow-hidden min-h-[300px] md:min-h-screen">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/40" />

        {/* Logo Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-400/20" />
                <Compass className="w-6 h-6 text-emerald-400 group-hover:rotate-45 transition-transform duration-500 relative z-10" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Odyssey</span>
              <span className="block text-xs uppercase tracking-widest text-emerald-400 font-extrabold">Multi-City Travel Planner</span>
            </div>
          </Link>
        </div>

        {/* Hero Tagline */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5" />
            <span>Plan • Customize • Explore</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
            Design your ideal multi-city trip in minutes.
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-4 leading-relaxed max-w-md">
            Build day-by-day itineraries, discover curated city activities, calculate budgets, and share your adventures seamlessly.
          </p>

          <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-white/10 text-xs font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              <span>100+ Destinations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>Interactive Drag-and-Drop</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} GlobeTrotter Travel Technologies. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
      <div className="md:w-1/2 lg:w-2/5 bg-white p-6 sm:p-12 flex items-center justify-center min-h-[500px]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
