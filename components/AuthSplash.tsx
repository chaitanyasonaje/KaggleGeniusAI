
import React from 'react';

interface AuthSplashProps {
  onAuthenticate: () => void;
}

const AuthSplash: React.FC<AuthSplashProps> = ({ onAuthenticate }) => {
  const handleAuth = async () => {
    try {
      // Trigger the AI Studio key selection dialog
      await (window as any).aistudio.openSelectKey();
      // Assume success and proceed to the app
      onAuthenticate();
    } catch (error) {
      console.error("Authentication failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/20 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            KaggleGenius <span className="text-blue-500">AI</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Final Step: Connect your Intelligence.
          </p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Gemini API</h2>
              <p className="text-sm text-gray-400">
                To generate Grandmaster reports and baseline notebooks, you must select an API key from a paid Google Cloud project.
              </p>
            </div>

            <button
              onClick={handleAuth}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Select API Key
            </button>

            <div className="pt-4 border-t border-[#30363d] text-center">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Learn about Gemini API billing →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSplash;
