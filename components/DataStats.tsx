
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DatasetColumn } from '../types';

interface DataStatsProps {
  columns: DatasetColumn[];
  rowCount: number;
}

const DataStats: React.FC<DataStatsProps> = ({ columns, rowCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {columns.map((col, idx) => (
        <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-blue-500/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-sm truncate max-w-[150px]">{col.name}</h3>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                col.type === 'numeric' ? 'bg-blue-500/10 text-blue-400' : 
                col.type === 'categorical' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'
              }`}>
                {col.type}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Missing</p>
              <p className={`text-xs font-mono ${col.stats?.missingCount ? 'text-red-400' : 'text-green-400'}`}>
                {((col.stats?.missingCount || 0) / rowCount * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={col.sampleValues.slice(0, 5).map(v => ({ value: String(v).length }))}>
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {col.sampleValues.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} fillOpacity={0.8} />
                  ))}
                </Bar>
                <XAxis hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '4px' }}
                  itemStyle={{ color: '#e6edf3' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
            {col.type === 'numeric' && (
              <>
                <div className="flex justify-between border-b border-[#30363d] pb-1">
                  <span>Mean</span>
                  <span className="text-gray-200">{col.stats?.mean?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-[#30363d] pb-1">
                  <span>Std</span>
                  <span className="text-gray-200">{col.stats?.std?.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-b border-[#30363d] pb-1">
              <span>Unique</span>
              <span className="text-gray-200">{col.stats?.uniqueCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataStats;
