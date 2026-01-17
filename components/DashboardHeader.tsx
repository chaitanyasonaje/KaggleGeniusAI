
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">KaggleGenius <span className="text-blue-500 font-light">AI</span></h1>
          <p className="text-xs text-gray-400">Next-Gen ML Dataset Analyzer</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full flex items-center">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          Gemini 3 Pro Active
        </span>
      </div>
    </header>
  );
};

export default DashboardHeader;
