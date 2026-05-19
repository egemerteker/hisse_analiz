'use client';
import { AnalysisResult } from '@/types/analysis';
import MetricCard from '../cards/MetricCard';
import { AlertTriangle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

interface Props { data: AnalysisResult; }

function StatusIcon({ status }: { status: string }) {
  if (['excellent', 'good', 'low_debt', 'manageable'].includes(status))
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (['poor', 'high_debt', 'critical'].includes(status))
    return <XCircle className="w-4 h-4 text-red-400" />;
  if (['concerning', 'elevated'].includes(status))
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  return <MinusCircle className="w-4 h-4 text-slate-400" />;
}

const statusLabels: Record<string, string> = {
  excellent: 'Mükemmel', good: 'İyi', moderate: 'Orta', poor: 'Zayıf',
  low_debt: 'Düşük Borç', manageable: 'Yönetilebilir', elevated: 'Yüksek', high_debt: 'Çok Yüksek Borç',
  data_unavailable: 'Veri Yok', unknown: 'Bilinmiyor', concerning: 'Endişe Verici',
};

const severityStyle: Record<string, string> = {
  critical: 'border-red-500/50 bg-red-500/10',
  high: 'border-orange-500/40 bg-orange-500/10',
  medium: 'border-yellow-500/30 bg-yellow-500/10',
  low: 'border-slate-600 bg-slate-800',
};

const severityBadge: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-slate-700 text-slate-400',
};

function MetricRow({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || typeof value === 'object') return null;
  const display = typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : String(value);
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400 capitalize">{label.replace(/_/g, ' ')}</span>
      <span className="text-sm font-medium text-slate-200">{display}</span>
    </div>
  );
}

export default function FinancialHealthTab({ data }: Props) {
  const fh = data.financial_health;
  const hs = fh.financial_health_score;

  const sections = [
    { title: 'Likidite', key: 'liquidity_analysis', analysis: fh.liquidity_analysis },
    { title: 'Karlılık', key: 'profitability_analysis', analysis: fh.profitability_analysis },
    { title: 'Borçluluk', key: 'debt_analysis', analysis: fh.debt_analysis },
    { title: 'Verimlilik', key: 'efficiency_analysis', analysis: fh.efficiency_analysis },
  ];

  return (
    <div className="space-y-6">
      {/* Health score breakdown */}
      {hs && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Finansal Sağlık Skoru — {hs.grade} ({hs.score.toFixed(0)}/100)</h3>
          <div className="space-y-3">
            {Object.entries(hs.components).map(([key, val]) => {
              const labels: Record<string, string> = { liquidity: 'Likidite', profitability: 'Karlılık', debt: 'Borçluluk', efficiency: 'Verimlilik' };
              const color = val >= 70 ? 'bg-green-500' : val >= 50 ? 'bg-blue-500' : val >= 35 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{labels[key] || key}</span>
                    <span className="text-slate-200 font-medium">{val.toFixed(0)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ title, analysis }) => (
          <div key={title} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon status={analysis.status || 'unknown'} />
              <h4 className="font-semibold text-white">{title}</h4>
              <span className="ml-auto text-xs text-slate-400">
                {statusLabels[analysis.status as string] || analysis.status}
              </span>
            </div>
            {analysis.metrics && Object.entries(analysis.metrics).map(([k, v]) => (
              <MetricRow key={k} label={k} value={v} />
            ))}
          </div>
        ))}
      </div>

      {/* Risk factors */}
      {fh.risk_factors.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-4">Risk Faktörleri ({fh.risk_factors.length})</h3>
          <div className="space-y-3">
            {fh.risk_factors.map((r, i) => (
              <div key={i} className={`border rounded-xl p-4 ${severityStyle[r.severity] || 'border-slate-600 bg-slate-800'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white">{r.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadge[r.severity]}`}>
                        {r.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">{r.description}</p>
                    <p className="text-xs text-slate-400 mt-1 italic">{r.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
