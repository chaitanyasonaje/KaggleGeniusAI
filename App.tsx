
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { DatasetColumn, DatasetAnalysis, ProcessingState, ChatMessage, User } from './types';
import DashboardHeader from './components/DashboardHeader';
import DataStats from './components/DataStats';
import AnalysisDisplay from './components/AnalysisDisplay';
import AuthSplash from './components/AuthSplash';
import AuthContainer from './components/AuthContainer';
import LandingPage from './components/LandingPage';
import { DEMO_DATASETS } from './constants/demoData';

type AppView = 'landing' | 'auth' | 'apikey' | 'main';

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [demoName, setDemoName] = useState('');
  
  const [columns, setColumns] = useState<DatasetColumn[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [sampleRows, setSampleRows] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [procState, setProcState] = useState<ProcessingState>({ status: 'idle', progress: 0 });
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const geminiRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('kaggle_genius_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('apikey');
    }

    const checkApiKey = async () => {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsApiKeySelected(hasKey);
        if (hasKey && savedUser) setView('main');
      } catch (e) {
        setIsApiKeySelected(false);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const startDemo = (type: keyof typeof DEMO_DATASETS) => {
    const data = DEMO_DATASETS[type];
    setIsDemo(true);
    setDemoName(data.name);
    setColumns(data.columns);
    setRowCount(data.rowCount);
    setAnalysis(data.analysis);
    setChatMessages([{ role: 'assistant', content: `Welcome to the ${data.name} Demo! This is a pre-analyzed ${data.type} task. Notice how the AI suggests specific transformations like ${data.analysis.featureEngineering[0].title}.` }]);
    setView('main');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcState({ status: 'parsing', progress: 10 });
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) throw new Error("Empty file");

        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
        
        const rowCount = data.length;
        const analyzedCols: DatasetColumn[] = headers.map((name, colIdx) => {
          const colData = data.map(row => row[colIdx]);
          const nonNull = colData.filter(v => v !== '' && v !== 'NaN' && v !== 'null');
          
          let type: DatasetColumn['type'] = 'unknown';
          const isNumeric = nonNull.length > 0 && nonNull.every(v => !isNaN(Number(v)));
          if (isNumeric) type = 'numeric';
          else if (nonNull.length > 0 && nonNull[0].length > 100) type = 'text';
          else type = 'categorical';

          return {
            name,
            type,
            sampleValues: nonNull.slice(0, 10),
            stats: {
              uniqueCount: new Set(nonNull).size,
              missingCount: rowCount - nonNull.length,
              mean: type === 'numeric' ? nonNull.reduce((a, b) => a + Number(b), 0) / nonNull.length : undefined
            }
          };
        });

        setColumns(analyzedCols);
        setRowCount(rowCount);
        setProcState({ status: 'completed', progress: 100 });
      } catch (err) {
        setProcState({ status: 'error', progress: 0, error: 'Failed to parse file. Ensure it is a valid CSV.' });
      }
    };
    reader.readAsText(file);
  };

  const triggerAnalysis = async () => {
    if (columns.length === 0 || isDemo) return;
    
    setProcState({ status: 'analyzing', progress: 50 });
    const phases = ["Identifying Problem Type...", "Designing Pipeline...", "Synthesizing Report..."];
    let currentPhase = 0;
    const phaseInterval = setInterval(() => {
      if (currentPhase < phases.length) {
        setAnalysisPhase(phases[currentPhase]);
        currentPhase++;
      }
    }, 2000);

    try {
      geminiRef.current = new GeminiService();
      const result = await geminiRef.current.analyzeDataset(columns, rowCount, sampleRows);
      setAnalysis(result);
      setProcState({ status: 'completed', progress: 100 });
      setChatMessages([{ role: 'assistant', content: `Analysis complete! I've designed a specialized pipeline for your ${rowCount} rows.` }]);
    } catch (err: any) {
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("API_KEY"))) {
        setIsApiKeySelected(false);
        setView('apikey');
      }
      setProcState({ status: 'error', progress: 0, error: 'AI analysis failed. Please verify API key.' });
    } finally {
      clearInterval(phaseInterval);
      setAnalysisPhase('');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping || !geminiRef.current || isDemo) {
      if (isDemo) {
        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }, { role: 'assistant', content: "Chat is disabled in Demo Mode. Sign in to talk to the Grandmaster AI about your own data!" }]);
        setChatInput('');
      }
      return;
    }
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    try {
      const response = await geminiRef.current.askAssistant(chatInput);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kaggle_genius_user');
    setUser(null);
    setIsApiKeySelected(null);
    setIsDemo(false);
    setColumns([]);
    setAnalysis(null);
    setView('landing');
  };

  if (view === 'landing') {
    return <LandingPage onStartDemo={(type) => startDemo(type)} onGoToAuth={() => setView('auth')} />;
  }

  if (view === 'auth' && !user) {
    return <AuthContainer onAuthSuccess={(u) => { setUser(u); setView('apikey'); }} />;
  }

  if (view === 'apikey' || (user && isApiKeySelected === false)) {
    return <AuthSplash onAuthenticate={() => { setIsApiKeySelected(true); setView('main'); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <DashboardHeader user={isDemo ? { name: 'Demo Visitor', email: 'demo@kaggle.ai' } : user} onLogout={handleLogout} />

      <main className={`flex-1 container mx-auto px-6 py-8 transition-all duration-300 ${isChatOpen ? 'pr-[400px]' : ''}`}>
        {isDemo && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center text-blue-400 text-sm font-medium">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
              Live Demo Mode: <span className="font-bold ml-1">{demoName}</span>
            </div>
            <button onClick={handleLogout} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-bold">
              Analyze My Own Data
            </button>
          </div>
        )}

        {(procState.status === 'idle' && !isDemo) || (procState.status === 'completed' && columns.length === 0) ? (
          <div className="max-w-4xl mx-auto mt-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-green-500 bg-clip-text text-transparent">
              Ready to Analyze.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Upload your dataset to unlock Grandmaster-level insights and automated pipelines.
            </p>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#30363d] rounded-2xl p-16 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
              <div className="flex flex-col items-center">
                <div className="bg-[#161b22] p-6 rounded-full group-hover:scale-110 transition-transform mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Upload Competition CSV</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center justify-between sticky top-[80px] z-40 backdrop-blur-md bg-opacity-80">
              <div className="flex items-center space-x-4">
                <button onClick={() => { setColumns([]); setIsDemo(false); setAnalysis(null); }} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="h-6 w-[1px] bg-[#30363d]" />
                <div>
                  <h2 className="font-bold text-sm">Target: <span className="text-blue-400">{isDemo ? demoName : 'Custom Analysis'}</span></h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{rowCount.toLocaleString()} Rows • {columns.length} Features</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {procState.status === 'analyzing' ? (
                  <div className="flex items-center px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping mr-3"></span>
                    {analysisPhase || 'Turbo Analysis...'}
                  </div>
                ) : !analysis ? (
                  <button onClick={triggerAnalysis} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-900/40">
                    Start Fast AI Analysis
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${isChatOpen ? 'bg-blue-500 text-white' : 'bg-[#30363d] text-gray-300 hover:bg-[#484f58]'}`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {isChatOpen ? 'Close Chat' : 'Ask Grandmaster'}
                  </button>
                )}
              </div>
            </div>

            <DataStats columns={columns} rowCount={rowCount} />
            {analysis && <AnalysisDisplay analysis={analysis} />}
          </div>
        )}
      </main>

      {/* Chat Sidebar */}
      <aside className={`fixed top-[73px] right-0 bottom-0 w-[400px] bg-[#0d1117] border-l border-[#30363d] transform transition-transform duration-300 z-50 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]">
          <h3 className="font-bold flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Grandmaster AI Assistant
          </h3>
          <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#161b22] border border-[#30363d] text-gray-300'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-blue-400 text-xs animate-pulse">Assistant is thinking...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
          <input 
            type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isDemo ? "Chat disabled in demo" : "Ask the Grandmaster..."}
            disabled={isDemo}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </aside>
    </div>
  );
}

export default App;
