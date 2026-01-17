
import React, { useState } from 'react';
import { User } from '../types';

interface AuthContainerProps {
  onAuthSuccess: (user: User) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError('Please fill in all fields.');
      return;
    }

    // Mock authentication logic
    const user: User = {
      name: isLogin ? (formData.email.split('@')[0]) : formData.name,
      email: formData.email,
    };

    localStorage.setItem('kaggle_genius_user', JSON.stringify(user));
    onAuthSuccess(user);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            KaggleGenius <span className="text-blue-500 font-light">AI</span>
          </h1>
          <p className="text-gray-400">Master your datasets with the power of Gemini.</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="grandmaster@kaggle.com"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>}

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-4"
            >
              {isLogin ? 'Login to Dashboard' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#30363d] text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
