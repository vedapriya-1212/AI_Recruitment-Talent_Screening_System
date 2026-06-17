import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/apiClient';
import { mockAnalytics } from '../../api/mockData';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<typeof mockAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const result = await apiClient.getAnalytics();
      setData(result);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="text-center py-12">
        <span className="text-xs font-bold text-primaryGlow font-space uppercase animate-pulse">Loading Diagnostics...</span>
      </div>
    );
  }

  // Source colors matching the theme
  const PIE_COLORS = ['#7C6BFF', '#4FFAF0', '#FF5EB5', '#FFD166'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">System Analytics</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Hiring pipelines efficiency scores and platform conversion rates.
        </p>
      </div>

      {/* CORE DIAGNOSTICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Avg Hiring Duration</span>
            <h3 className="text-2xl font-black text-white font-space mt-2">{data.metrics.avgTime}</h3>
            <span className="text-[9px] text-success font-bold mt-1 block font-space uppercase">Autonomous check</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Conversion Boost</span>
            <h3 className="text-2xl font-black text-white font-space mt-2">{data.metrics.timeSaved} Saved</h3>
            <span className="text-[9px] text-success font-bold mt-1 block font-space uppercase">Fast track</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondaryGlow/10 border border-secondaryGlow/25 text-secondaryGlow flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Screening Accuracy</span>
            <h3 className="text-2xl font-black text-white font-space mt-2">{data.metrics.screeningAccuracy}</h3>
            <span className="text-[9px] text-mutedGray mt-1 block font-space uppercase">Target check</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accentGlow/10 border border-accentGlow/25 text-accentGlow flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Hiring Conversion</span>
            <h3 className="text-2xl font-black text-white font-space mt-2">{data.metrics.hiringConversion}</h3>
            <span className="text-[9px] text-mutedGray mt-1 block font-space uppercase">Final offer</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/25 text-[#FFD166] flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Funnel Chart (Col-span 7) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Hiring Funnel Conversion</h4>
          
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.funnel}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="stage" stroke="#94A3B8" fontSize={10} fontFamily="sans-serif" />
                <YAxis stroke="#94A3B8" fontSize={10} fontFamily="sans-serif" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {data.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Sources Pie Chart (Col-span 5) */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Application Channels</h4>
          
          <div className="h-64 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] text-mutedGray font-outfit">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
