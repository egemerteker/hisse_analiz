'use client';
import { AnalysisResult } from '@/types/analysis';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface Props { data: AnalysisResult; }

const directionConfig = {
  bullish: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: TrendingUp },
  bearish: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: TrendingDown },
  neutral: { color: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600', icon: Minus },
};

const trendLabels: Record<string, string> = {
  uptrend: 'Yükselen Trend ↑',
  downtrend: 'Düşen Trend ↓',
  sideways: 'Yatay Trend →',
};

const strengthLabels: Record<string, string> = {
  strong: 'Güçlü', moderate: 'Orta', weak: 'Zayıf',
};

export default function TechnicalViewTab({ data }: Props) {
  const ta = data.technical_analysis;

  const bullSignals = ta.technical_signals.filter(s => s.direction === 'bullish');
  const bearSignals = ta.technical_signals.filter(s => s.direction === 'bearish');
  const neutSignals = ta.technical_signals.filter(s => s.direction === 'neutral');

  return (
    <div className="space-y-6">
      {/* Overall view */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Genel Teknik Görünüm</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">{ta.overall_technical_view || 'Veri yetersiz.'}</p>
        <div className="flex gap-4 mt-4 flex-wrap">
          {ta.trend_direction && (
            <div className="text-sm">
              <span className="text-slate-400">Trend: </span>
              <span className="text-white font-medium">{trendLabels[ta.trend_direction] || ta.trend_direction}</span>
            </div>
          )}
          {ta.trend_strength && (
            <div className="text-sm">
              <span className="text-slate-400">Güç: </span>
              <span className="text-white font-medium">{strengthLabels[ta.trend_strength] || ta.trend_strength}</span>
            </div>
          )}
        </div>
      </div>

      {/* Signal summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Yükseliş', count: bullSignals.length, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
          { label: 'Nötr', count: neutSignals.length, color: 'text-slate-400', bg: 'bg-slate-700 border-slate-600' },
          { label: 'Düşüş', count: bearSignals.length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`border rounded-xl p-4 text-center ${bg}`}>
            <div className={`text-3xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-400 mt-1">{label} Sinyal</div>
          </div>
        ))}
      </div>

      {/* Signals detail */}
      {ta.technical_signals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white">Teknik Sinyaller</h3>
          {ta.technical_signals.map((signal, i) => {
            const cfg = directionConfig[signal.direction] || directionConfig.neutral;
            const Icon = cfg.icon;
            return (
              <div key={i} className={`border rounded-xl p-4 ${cfg.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${cfg.color}`}>{signal.signal_type}</span>
                      <span className="text-xs text-slate-500">{signal.strength}</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-0.5">{signal.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Support / Resistance */}
      {(ta.support_levels.length > 0 || ta.resistance_levels.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ta.support_levels.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-green-400 mb-3">Destek Seviyeleri</h4>
              <div className="space-y-2">
                {ta.support_levels.map((lvl, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">S{i + 1}</span>
                    <span className="font-mono text-sm text-green-300">₺{lvl.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ta.resistance_levels.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-red-400 mb-3">Direnç Seviyeleri</h4>
              <div className="space-y-2">
                {ta.resistance_levels.map((lvl, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">R{i + 1}</span>
                    <span className="font-mono text-sm text-red-300">₺{lvl.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart patterns */}
      {ta.chart_patterns.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Tespit Edilen Formasyonlar</h4>
          <div className="flex flex-wrap gap-2">
            {ta.chart_patterns.map((p, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
