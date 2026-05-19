'use client';
import { AnalysisResult } from '@/types/analysis';
import MetricCard from '../cards/MetricCard';
import { Target, Award } from 'lucide-react';

interface Props { data: AnalysisResult; }

function GradeCircle({ grade, score }: { grade: string; score: number }) {
  const colors: Record<string, string> = {
    A: 'text-green-400 border-green-400',
    B: 'text-blue-400 border-blue-400',
    C: 'text-yellow-400 border-yellow-400',
    D: 'text-orange-400 border-orange-400',
    F: 'text-red-400 border-red-400',
  };
  return (
    <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${colors[grade] || 'text-slate-400 border-slate-600'}`}>
      <span className="text-2xl font-bold">{grade}</span>
      <span className="text-xs">{score.toFixed(0)}/100</span>
    </div>
  );
}

export default function GeneralSummaryTab({ data }: Props) {
  const gs = data.general_summary;
  const fv = gs.fair_value_range;
  const upside = fv?.upside_potential;

  return (
    <div className="space-y-6">
      {/* Company overview */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-white">{gs.company_name || 'Bilinmeyen Şirket'}</h2>
              {gs.ticker && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-mono rounded-lg border border-blue-500/30">
                  {gs.ticker}
                </span>
              )}
              {gs.sector && <span className="text-slate-400 text-sm">{gs.sector}</span>}
            </div>
            <p className="text-slate-300 mt-3 leading-relaxed max-w-2xl">{gs.overall_assessment}</p>
          </div>
          {gs.financial_health_score && (
            <div className="flex flex-col items-center gap-1">
              <GradeCircle grade={gs.financial_health_score.grade} score={gs.financial_health_score.score} />
              <span className="text-xs text-slate-400">Finansal Sağlık</span>
            </div>
          )}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {gs.current_price != null && (
          <MetricCard label="Güncel Fiyat" value={`₺${gs.current_price.toFixed(2)}`} variant="primary" />
        )}
        {fv?.base_case != null && (
          <MetricCard label="Adil Değer (Baz)" value={`₺${fv.base_case.toFixed(2)}`} />
        )}
        {upside != null && (
          <MetricCard
            label="Yükseliş Potansiyeli"
            value={`${upside > 0 ? '+' : ''}${upside.toFixed(1)}%`}
            variant={upside > 0 ? 'positive' : 'negative'}
          />
        )}
        {gs.financial_health_score && (
          <MetricCard
            label="Sağlık Skoru"
            value={`${gs.financial_health_score.score.toFixed(0)}/100`}
            variant={gs.financial_health_score.score >= 65 ? 'positive' : gs.financial_health_score.score >= 40 ? 'default' : 'negative'}
          />
        )}
      </div>

      {/* Key highlights */}
      {gs.key_highlights.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" /> Öne Çıkan Metrikler
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gs.key_highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fair value range */}
      {fv && (fv.bear_case || fv.base_case || fv.bull_case) && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" /> Adil Değer Aralığı
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Kötümser', val: fv.bear_case, color: 'text-red-400' },
              { label: 'Baz Senaryo', val: fv.base_case, color: 'text-blue-400' },
              { label: 'İyimser', val: fv.bull_case, color: 'text-green-400' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className={`text-2xl font-bold ${color}`}>{val != null ? `₺${val.toFixed(2)}` : '—'}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
          {fv.current_price != null && (
            <div className="mt-4 pt-4 border-t border-slate-700 text-center text-sm text-slate-400">
              Mevcut fiyat: <span className="text-white font-medium">₺{fv.current_price.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
