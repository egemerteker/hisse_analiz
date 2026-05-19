'use client';
import { useState } from 'react';
import { AnalysisResult } from '@/types/analysis';
import GeneralSummaryTab from './tabs/GeneralSummary';
import FinancialHealthTab from './tabs/FinancialHealth';
import TechnicalViewTab from './tabs/TechnicalView';
import ForecastingTab from './tabs/Forecasting';
import InvestorNoteCard from './cards/InvestorNoteCard';
import { RefreshCw, ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'summary', label: 'Genel Özet' },
  { id: 'health', label: 'Finansal Sağlık & Riskler' },
  { id: 'technical', label: 'Teknik Görünüm' },
  { id: 'forecast', label: 'Gelecek Tahminleri' },
] as const;

type TabId = typeof TABS[number]['id'];

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisDashboard({ result, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const { investor_notes, analysis_confidence, data_completeness } = result;

  const criticalNotes = investor_notes.filter(n => n.priority === 'critical');
  const warningNotes = investor_notes.filter(n => n.priority === 'warning');

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {result.general_summary.company_name || 'Finansal Analiz Sonuçları'}
            {result.general_summary.ticker && (
              <span className="ml-3 text-base font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-lg border border-blue-400/20">
                {result.general_summary.ticker}
              </span>
            )}
          </h2>
          <div className="flex gap-4 mt-1 text-xs text-slate-400">
            <span>Güven skoru: <strong className="text-slate-200">{(analysis_confidence * 100).toFixed(0)}%</strong></span>
            <span>Veri tamlığı: <strong className="text-slate-200">{(data_completeness * 100).toFixed(0)}%</strong></span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yeni Analiz
        </button>
      </div>

      {/* Critical alerts banner */}
      {criticalNotes.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 space-y-2">
          <p className="text-red-400 font-semibold text-sm flex items-center gap-2">
            <span>⚠</span> {criticalNotes.length} KRİTİK UYARI
          </p>
          {criticalNotes.map((n, i) => (
            <div key={i} className="text-red-300/80 text-sm pl-6">{n.title}: {n.description}</div>
          ))}
        </div>
      )}

      {/* Investor Notes Section */}
      {(criticalNotes.length > 0 || warningNotes.length > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Yatırımcının Bilmesi Gereken Önemli Notlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...criticalNotes, ...warningNotes].map((note, i) => (
              <InvestorNoteCard key={i} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-0 overflow-x-auto scrollbar-thin">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'summary' && <GeneralSummaryTab data={result} />}
        {activeTab === 'health' && <FinancialHealthTab data={result} />}
        {activeTab === 'technical' && <TechnicalViewTab data={result} />}
        {activeTab === 'forecast' && <ForecastingTab data={result} />}
      </div>

      {/* Info notes at bottom */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Genel Notlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {investor_notes.filter(n => n.priority === 'info').map((note, i) => (
            <InvestorNoteCard key={i} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}
