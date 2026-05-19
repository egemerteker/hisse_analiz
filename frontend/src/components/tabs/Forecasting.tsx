'use client';
import { AnalysisResult } from '@/types/analysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, GitCompare } from 'lucide-react';

interface Props { data: AnalysisResult; }

const assessmentStyle: Record<string, string> = {
  ucuz: 'text-green-400 bg-green-500/10 border-green-500/30',
  pahalı: 'text-red-400 bg-red-500/10 border-red-500/30',
  makul: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export default function ForecastingTab({ data }: Props) {
  const fc = data.forecasting;
  const fv = fc.fair_value_range;

  const chartData = fc.quarterly_forecasts.map(q => ({
    period: q.period,
    Gelir: q.revenue_estimate ? +(q.revenue_estimate / 1e6).toFixed(2) : null,
    'Net Kar': q.net_income_estimate ? +(q.net_income_estimate / 1e6).toFixed(2) : null,
  })).filter(d => d.Gelir !== null || d['Net Kar'] !== null);

  return (
    <div className="space-y-6">
      {/* Growth outlook */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Büyüme Görünümü</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">{fc.growth_outlook || 'Büyüme verisi mevcut değil.'}</p>
      </div>

      {/* Valuation */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Değerleme Değerlendirmesi</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">{fc.valuation_assessment || 'Değerleme verisi yetersiz.'}</p>
      </div>

      {/* Quarterly forecast chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Çeyreklik Projeksiyon (Milyon ₺)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar dataKey="Gelir" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Kar" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {fc.quarterly_forecasts[0]?.growth_rate != null && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              Tahmini çeyreklik büyüme: %{fc.quarterly_forecasts[0].growth_rate.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Quarterly table */}
      {fc.quarterly_forecasts.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700">
            <h3 className="text-base font-semibold text-white">Dönemsel Tahminler</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40">
                  {['Dönem', 'Tahmini Gelir', 'Tahmini Net Kar', 'EPS', 'Büyüme'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fc.quarterly_forecasts.map((q, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300">{q.period}</td>
                    <td className="px-4 py-3 text-slate-300">{q.revenue_estimate != null ? `₺${(q.revenue_estimate / 1e6).toFixed(1)}M` : '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{q.net_income_estimate != null ? `₺${(q.net_income_estimate / 1e6).toFixed(1)}M` : '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{q.eps_estimate != null ? q.eps_estimate.toFixed(3) : '—'}</td>
                    <td className="px-4 py-3">
                      {q.growth_rate != null ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          q.growth_rate > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>%{q.growth_rate.toFixed(1)}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sector comparison */}
      {Object.keys(fc.sector_comparison).length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Sektör Karşılaştırması</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(fc.sector_comparison).map(([key, cmp]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-300">{cmp.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    assessmentStyle[cmp.assessment] || 'text-slate-400 bg-slate-700 border-slate-600'
                  }`}>{cmp.assessment}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Şirket: <strong className="text-white">{cmp.company_value.toFixed(1)}x</strong></span>
                  <span>Sektör ort.: <strong className="text-white">{cmp.sector_average.toFixed(1)}x</strong></span>
                  <span className={cmp.vs_sector_pct > 0 ? 'text-red-400' : 'text-green-400'}>
                    {cmp.vs_sector_pct > 0 ? '+' : ''}{cmp.vs_sector_pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fair value */}
      {fv && (
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Model Bazlı Adil Değer</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Kötümser', val: fv.bear_case, color: 'text-red-400' },
              { label: 'Baz', val: fv.base_case, color: 'text-blue-400' },
              { label: 'İyimser', val: fv.bull_case, color: 'text-green-400' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className={`text-xl font-bold ${color}`}>{val != null ? `₺${val.toFixed(2)}` : '—'}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
          {fv.upside_potential != null && (
            <div className={`mt-4 text-center text-lg font-bold ${
              fv.upside_potential > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              Potansiyel: {fv.upside_potential > 0 ? '+' : ''}{fv.upside_potential.toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
