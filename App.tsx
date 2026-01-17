
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { DatasetColumn, DatasetAnalysis, ProcessingState, ChatMessage } from './types';
import DashboardHeader from './components/DashboardHeader';
import DataStats from './components/DataStats';
import AnalysisDisplay from './components/AnalysisDisplay';

const gemini = new GeminiService();

function App() {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcState({ status: 'parsing', progress: 10 });
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
        
        const rowCount = data.length;
        const samples = data.slice(0, 5).map(row => {
          const obj: any = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        });

        const analyzedCols: DatasetColumn[] = headers.map((name, colIdx) => {
          const colData = data.map(row => row[colIdx]);
          const nonNull = colData.filter(v => v !== '' && v !== 'NaN' && v !== 'null');
          
          let type: DatasetColumn['type'] = 'unknown';
          const isNumeric = nonNull.every(v => !isNaN(Number(v)));
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
        setSampleRows(samples);
        setProcState({ status: 'completed', progress: 100 });
      } catch (err) {
        setProcState({ status: 'error', progress: 0, error: 'Failed to parse file. Ensure it is a valid CSV.' });
      }
    };
    reader.readAsText(file);
  };

  const triggerAnalysis = async () => {
    if (columns.length === 0) return;
    
    setProcState({ status: 'analyzing', progress: 50 });
    
    // UI steps for perceived performance
    const phases = [
      "Identifying Problem Type...",
      "Designing Feature Pipeline...",
      "Selecting Optimal Architectures...",
      "Synthesizing Baseline Code...",
      "Finalizing Grandmaster Report..."
    ];
    let currentPhase = 0;
    const phaseInterval = setInterval(() => {
      if (currentPhase < phases.length) {
        setAnalysisPhase(phases[currentPhase]);
        currentPhase++;
      }
    }, 2000);

    try {
      const result = await gemini.analyzeDataset(columns, rowCount, sampleRows);
      setAnalysis(result);
      setProcState({ status: 'completed', progress: 100 });
      setChatMessages([{ role: 'assistant', content: "Hello! I've finished analyzing your dataset using the Flash core. You can ask me anything about the feature engineering steps, model choices, or the baseline code I generated." }]);
    } catch (err) {
      setProcState({ status: 'error', progress: 0, error: 'AI analysis failed. Please try again.' });
    } finally {
      clearInterval(phaseInterval);
      setAnalysisPhase('');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await gemini.askAssistant(chatInput);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const reset = () => {
    setColumns([]);
    setAnalysis(null);
    setChatMessages([]);
    setIsChatOpen(false);
    setProcState({ status: 'idle', progress: 0 });
    setAnalysisPhase('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <DashboardHeader />

      <main className={`flex-1 container mx-auto px-6 py-8 transition-all duration-300 ${isChatOpen ? 'pr-[400px]' : ''}`}>
        {procState.status === 'idle' || (procState.status === 'completed' && columns.length === 0) ? (
          <div className="max-w-4xl mx-auto mt-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-green-500 bg-clip-text text-transparent">
              Kaggle Mastery, Automated.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Analyze distributions, discover hidden patterns, and generate high-performance pipelines with a Grandmaster-level AI companion.
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#30363d] rounded-2xl p-16 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer group shadow-2xl shadow-blue-500/10"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
              <div className="flex flex-col items-center">
                <div className="bg-[#161b22] p-6 rounded-full group-hover:scale-110 transition-transform mb-6 ring-4 ring-blue-500/20">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Competition Dataset</h3>
                <p className="text-gray-500 text-sm">Drag and drop CSV files to begin the grandmaster analysis.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center justify-between sticky top-[80px] z-40 backdrop-blur-md bg-opacity-80">
              <div className="flex items-center space-x-4">
                <button onClick={reset} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="h-6 w-[1px] bg-[#30363d]" />
                <div>
                  <h2 className="font-bold text-sm">Dataset: <span className="text-blue-400">analysis_target.csv</span></h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{rowCount.toLocaleString()} Rows • {columns.length} Features</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {procState.status === 'analyzing' ? (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping mr-3"></span>
                      Turbo Analysis Active
                    </div>
                    {analysisPhase && (
                      <span className="text-[10px] text-blue-400/70 mt-1 animate-pulse italic">{analysisPhase}</span>
                    )}
                  </div>
                ) : !analysis ? (
                  <button onClick={triggerAnalysis} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-900/40 transition-all transform hover:scale-105">
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

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Feature Health & Distributions</h3>
              <DataStats columns={columns} rowCount={rowCount} />
            </section>

            {analysis && (
              <section className="pt-4 border-t border-[#30363d]">
                <AnalysisDisplay analysis={analysis} />
              </section>
            )}
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
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#161b22] border border-[#30363d] text-gray-300'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about specific columns, metrics..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isTyping}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <footer className={`border-t border-[#30363d] p-6 text-center text-gray-500 text-xs transition-all duration-300 ${isChatOpen ? 'pr-[400px]' : ''}`}>
        &copy; 2024 KaggleGenius AI. Precision-engineered for competition winners.
      </footer>
    </div>
  );
}

export default App;
