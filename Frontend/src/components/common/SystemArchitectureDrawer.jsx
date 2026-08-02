import React from 'react';
import { X, Cpu, Database, Shield, Server, Layers, Code2, CheckCircle2 } from 'lucide-react';

export const SystemArchitectureDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stackItems = [
    {
      category: 'Frontend & UI Engineering',
      icon: Layers,
      color: 'text-sky-400',
      techs: ['React 18', 'Vite SPA Engine', 'Redux Toolkit', 'Tailwind CSS v4', 'Lucide Icons'],
      description: 'Single-page client architecture with normalized Redux state slices, dynamic route protection, and instant UI state synchronization.',
    },
    {
      category: 'Backend & RESTful Services',
      icon: Server,
      color: 'text-emerald-400',
      techs: ['Node.js ES Modules', 'Express.js', 'Dual JWT Authentication', 'Rate Limiting', 'HTTP Cookies'],
      description: 'REST API architecture handling seat locking, flight status updates, secure token refresh rotation, and transactional booking validation.',
    },
    {
      category: 'Database & Data Persistence',
      icon: Database,
      color: 'text-amber-400',
      techs: ['MongoDB Atlas', 'Mongoose ORM', 'Compound Indexing', 'Schema Validation'],
      description: 'Document database configured with index optimization on origin/destination/date queries and atomic seat availability decrements.',
    },
    {
      category: 'Security & Auth Pipeline',
      icon: Shield,
      color: 'text-purple-400',
      techs: ['Bcrypt.js Hashing', 'HttpOnly Cookies', 'Role-Based Access Control (RBAC)'],
      description: 'Fine-grained access control separating Passenger Dashboards from Admin Command Centers with token expiration cycles.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative h-full w-full max-w-lg bg-slate-900 border-l border-slate-800 p-6 shadow-2xl overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cpu className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">System Architecture</h3>
              <p className="text-xs text-slate-400">Engineered by <strong className="text-white">Abhijeet Singh Rana</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-950 p-4 border border-sky-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Code2 className="h-4 w-4" /> B.Tech Computer Science Capstone Project
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AeroPulse is built as a production-grade MERN stack aviation platform implementing clean multi-layer separation, stateful seat locks, and stateless JWT token authentication.
          </p>
        </div>

        {/* Stack Items */}
        <div className="space-y-4">
          {stackItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded-2xl bg-slate-950 p-4 border border-slate-800/90 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <h4 className="text-sm font-bold text-white">{item.category}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.techs.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md">
                      <CheckCircle2 className="h-3 w-3 text-sky-400" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-400">
            Portfolio: <a href="https://abhirana.me/" target="_blank" rel="noopener noreferrer" className="text-sky-400 font-semibold hover:underline">abhirana.me</a>
          </p>
        </div>
      </div>
    </div>
  );
};
