
import React from 'react';

interface LandingPageProps {
  onStartDemo: (type: 'TITANIC' | 'HOUSING' | 'FRAUD') => void;
  onGoToAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onGoToAuth }) => {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col overflow-x-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-700"></div>

      <nav className="z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">KaggleGenius <span className="text-blue-500 font-light">AI</span></span>
        </div>
        <button 
          onClick={onGoToAuth}
          className="text-sm font-medium hover:text-blue-400 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10"
        >
          Sign In
        </button>
      </nav>

      <main className="z-10">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-6 text-center py-24">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8">
            <span>✨</span>
            <span>Gemini 3 Flash Powered Intelligence</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none">
            Automate Your <br/>
            <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-purple-500 bg-clip-text text-transparent">Grandmaster</span> Path.
          </h1>
          <p className="max-w-2xl text-xl text-gray-400 mb-12">
            The elite AI companion for data scientists. Stop wrestling with boilerplate and start focusing on winning strategies.
          </p>
          <div className="flex flex-col md:row space-y-4 md:space-y-0 md:space-x-6">
            <button 
              onClick={onGoToAuth}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
            <div className="relative group">
               <button className="px-10 py-5 bg-white/5 text-white font-bold rounded-2xl border border-white/10 backdrop-blur-sm">
                 Explore Live Demos
               </button>
               <div className="absolute top-full left-0 mt-2 w-full bg-[#161b22] border border-white/10 rounded-xl overflow-hidden hidden group-hover:block shadow-2xl z-20">
                 <button onClick={() => onStartDemo('TITANIC')} className="w-full px-4 py-3 text-left text-xs hover:bg-blue-600 transition-colors border-b border-white/5">Classification (Titanic)</button>
                 <button onClick={() => onStartDemo('HOUSING')} className="w-full px-4 py-3 text-left text-xs hover:bg-blue-600 transition-colors border-b border-white/5">Regression (Ames Housing)</button>
                 <button onClick={() => onStartDemo('FRAUD')} className="w-full px-4 py-3 text-left text-xs hover:bg-blue-600 transition-colors">Imbalanced (Credit Fraud)</button>
               </div>
            </div>
          </div>
        </section>

        {/* THREE USES SECTION */}
        <section className="px-6 py-24 bg-[#0d1117] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-16 text-center">Three Pillars of Excellence</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-bold text-xl">01</div>
                <h3 className="text-xl font-bold">Kaggle Sprinting</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Join a competition and have a 0.8+ score baseline notebook generated in under 60 seconds. Our AI selects the optimal architecture (XGBoost, LightGBM, or TabNet) and suggests domain-specific feature splits instantly.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-600/20 text-purple-500 rounded-xl flex items-center justify-center font-bold text-xl">02</div>
                <h3 className="text-xl font-bold">Deep EDA Insight</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Go beyond simple histograms. KaggleGenius identifies non-linear correlations, skewness issues, and target leakage that standard libraries miss. It's like having a Grandmaster pair-programming with you 24/7.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-600/20 text-green-500 rounded-xl flex items-center justify-center font-bold text-xl">03</div>
                <h3 className="text-xl font-bold">Pipeline Architecture</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Export production-ready scikit-learn or PyTorch pipelines. The AI ensures proper cross-validation strategy (Stratified, Group, or TimeSeries) so your local validation always matches the public leaderboard.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-12 text-center text-gray-600 text-[10px] uppercase tracking-widest">
        &copy; 2024 KaggleGenius AI • Built for Winners
      </footer>
    </div>
  );
};

export default LandingPage;
