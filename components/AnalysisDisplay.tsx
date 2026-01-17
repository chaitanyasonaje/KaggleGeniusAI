
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { DatasetAnalysis, TrainingLog } from '../types';

interface AnalysisDisplayProps {
  analysis: DatasetAnalysis;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'models' | 'visuals' | 'training' | 'notebook'>('strategy');
  const [trainingProgress, setTrainingProgress] = useState<TrainingLog[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  // Fallback values for safety
  const metricName = analysis?.metricRationale?.recommendedMetric || 'Accuracy';
  const summaryText = analysis?.summary || 'No summary available.';
  const problemType = analysis?.problemType || 'unknown';
  const targetVar = analysis?.targetSuggestion || 'unknown';
  const featureImportance = analysis?.simulatedTraining?.featureImportance || [];
  const correlations = analysis?.correlations || [];
  const logs = analysis?.simulatedTraining?.logs || [];

  const startSimulation = () => {
    if (!logs || logs.length === 0) return;
    setIsTraining(true);
    setTrainingProgress([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setTrainingProgress(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Grandmaster Insight
          </h2>
          <p className="text-gray-300 leading-relaxed text-sm">
            {summaryText}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              {problemType}
            </span>
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium">
              Metric: {metricName}
            </span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl relative">
           <h2 className="text-lg font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Feature Influence
          </h2>
          <div className="flex items-end justify-between h-20">
             {featureImportance.slice(0, 5).map((f, i) => (
               <div key={i} className="flex flex-col items-center flex-1">
                 <div 
                   className="w-4 bg-purple-500/40 rounded-t group relative hover:bg-purple-500 transition-all cursor-help"
                   style={{ height: `${(f.importance || 0.1) * 100}%` }}
                 >
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#0d1117] text-[8px] whitespace-nowrap p-1 rounded border border-[#30363d] z-10">
                     {f.feature} ({((f.importance || 0) * 100).toFixed(0)}%)
                   </div>
                 </div>
                 <span className="text-[8px] text-gray-500 mt-1 truncate w-full text-center px-1">{f.feature}</span>
               </div>
             ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-4 italic text-center">Relative Information Gain (Simulated)</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-[#30363d] bg-[#161b22] overflow-x-auto scrollbar-hide">
          {(['strategy', 'models', 'visuals', 'training', 'notebook'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-blue-400 bg-[#0d1117]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1f242c]'
              }`}
            >
              {tab.toUpperCase()}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[450px]">
          {activeTab === 'strategy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-gray-100">Engineering Pipeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analysis?.featureEngineering || []).map((feat, i) => (
                  <div key={i} className="p-4 bg-[#1c2128] border border-[#30363d] rounded-lg border-l-4 border-l-blue-500">
                    <h4 className="font-bold text-blue-400 mb-2">{feat.title}</h4>
                    <p className="text-sm text-gray-300 mb-3">{feat.description}</p>
                    <div className="text-xs p-2 bg-black/30 rounded text-gray-400 font-mono">
                      {feat.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-gray-100">Architecture & Tuning</h3>
              <div className="space-y-6">
                {(analysis?.modelRecommendations || []).map((model, i) => (
                  <div key={i} className="p-6 bg-[#1c2128] border border-[#30363d] rounded-xl">
                    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                      <div className="max-w-md">
                        <h4 className="text-lg font-bold text-green-400 mb-2">{model.modelName}</h4>
                        <p className="text-sm text-gray-300">{model.suitability}</p>
                      </div>
                      <div className="bg-black/30 p-4 rounded-lg flex-1">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Hyperparameter Search Space</h5>
                        <div className="grid grid-cols-1 gap-1">
                          {(model.hyperparameters || []).map((hp, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] border-b border-[#30363d] pb-1">
                              <span className="text-blue-300 font-mono">{hp.param}</span>
                              <span className="text-gray-400">{hp.range}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase">Kaggle Success Factors</h5>
                        {(model.pros || []).map((p, idx) => (
                          <div key={idx} className="text-xs text-green-400/80 flex items-center bg-green-400/5 p-2 rounded">
                            <span className="mr-2">✓</span> {p}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase">Potential Pitfalls</h5>
                        {(model.cons || []).map((c, idx) => (
                          <div key={idx} className="text-xs text-red-400/80 flex items-center bg-red-400/5 p-2 rounded">
                            <span className="mr-2">!</span> {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'visuals' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-4">Correlation Heatmap (Estimated)</h3>
                  <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-4 aspect-square flex items-center justify-center">
                    <div className="grid grid-cols-6 gap-1 w-full h-full">
                      {correlations.slice(0, 36).map((corr, i) => (
                        <div 
                          key={i} 
                          className="rounded flex items-center justify-center group relative cursor-help"
                          style={{ backgroundColor: `rgba(59, 130, 246, ${Math.abs(corr.value || 0)})` }}
                        >
                          <span className="text-[8px] opacity-0 group-hover:opacity-100 text-white font-bold">{corr.value?.toFixed(2)}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-[10px] p-2 rounded border border-[#30363d] z-10 whitespace-nowrap">
                            {corr.x} × {corr.y}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-4">Feature Importance</h3>
                  <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-6 h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={featureImportance}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="feature" type="category" width={100} tick={{ fontSize: 10, fill: '#8b949e' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                        <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                           {featureImportance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={0.6 + ((entry.importance || 0) * 0.4)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {problemType === 'classification' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-4">Simulated Confusion Matrix</h3>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-2 bg-[#1c2128] p-4 rounded-xl border border-[#30363d]">
                      <div className="w-20 h-20" />
                      <div className="flex items-center justify-center text-xs font-bold text-gray-500">Pred: 0</div>
                      <div className="flex items-center justify-center text-xs font-bold text-gray-500">Pred: 1</div>
                      <div className="flex items-center justify-center text-xs font-bold text-gray-500">Actual: 0</div>
                      <div className="w-20 h-20 bg-green-500/20 rounded flex items-center justify-center text-green-400 font-bold border border-green-500/30">
                        {analysis?.simulatedTraining?.confusionMatrix?.[0]?.[0] || 0.82}
                      </div>
                      <div className="w-20 h-20 bg-red-500/10 rounded flex items-center justify-center text-red-400/50 font-bold border border-red-500/20">
                        {analysis?.simulatedTraining?.confusionMatrix?.[0]?.[1] || 0.18}
                      </div>
                      <div className="flex items-center justify-center text-xs font-bold text-gray-500">Actual: 1</div>
                      <div className="w-20 h-20 bg-red-500/10 rounded flex items-center justify-center text-red-400/50 font-bold border border-red-500/20">
                        {analysis?.simulatedTraining?.confusionMatrix?.[1]?.[0] || 0.12}
                      </div>
                      <div className="w-20 h-20 bg-green-500/20 rounded flex items-center justify-center text-green-400 font-bold border border-green-500/30">
                        {analysis?.simulatedTraining?.confusionMatrix?.[1]?.[1] || 0.88}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-100">Live Training Simulator</h3>
                {!isTraining && trainingProgress.length === 0 ? (
                  <button 
                    onClick={startSimulation}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Run Simulation
                  </button>
                ) : isTraining ? (
                   <span className="text-blue-400 text-sm flex items-center animate-pulse">
                     <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                     Processing Epoch {trainingProgress.length}...
                   </span>
                ) : (
                  <button onClick={startSimulation} className="text-xs text-gray-500 hover:text-white underline">Re-run Simulation</button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1c2128] border border-[#30363d] rounded-xl p-6 h-[350px]">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Training Curves</h4>
                  {trainingProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trainingProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                        <XAxis dataKey="epoch" tick={{fontSize: 10, fill: '#8b949e'}} />
                        <YAxis tick={{fontSize: 10, fill: '#8b949e'}} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                        <Line type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={2} dot={false} name="Train Loss" />
                        <Line type="monotone" dataKey="val_loss" stroke="#ef4444" strokeWidth={2} dot={false} name="Val Loss" />
                        <Line type="monotone" dataKey="val_metric" stroke="#10b981" strokeWidth={2} dot={false} name="Validation Metric" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                      <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm">Click 'Run Simulation' to estimate model convergence</p>
                    </div>
                  )}
                </div>
                <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-6 overflow-hidden flex flex-col">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Training Log</h4>
                  <div className="flex-1 font-mono text-[10px] space-y-1 overflow-y-auto custom-scrollbar">
                    {trainingProgress.map((log, i) => (
                      <div key={i} className="flex space-x-2">
                        <span className="text-gray-500">[{log.epoch}/10]</span>
                        <span className="text-blue-400">loss: {log.loss?.toFixed(4)}</span>
                        <span className="text-green-400">val_score: {log.val_metric?.toFixed(4)}</span>
                      </div>
                    ))}
                    {isTraining && <div className="animate-pulse text-blue-500">_</div>}
                    {!isTraining && trainingProgress.length > 0 && (
                      <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded text-green-400">
                        Training finished.<br/>
                        Best Score: {(analysis?.simulatedTraining?.finalMetricScore || 0).toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notebook' && (
            <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-100">Grandmaster Baseline</h3>
                <button 
                  onClick={() => analysis?.baselineNotebook && navigator.clipboard.writeText(analysis.baselineNotebook)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                   Copy Boilerplate
                </button>
              </div>
              <div className="flex-1 overflow-auto rounded-xl border border-[#30363d] bg-black/50 p-4">
                <pre className="code-font text-[11px] text-blue-300 leading-relaxed whitespace-pre-wrap">
                  {analysis?.baselineNotebook || '# No notebook generated.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
