'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import { useAnalysis } from '@/hooks/useAnalysis';
import { BarChart2, Brain, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { result, isLoading, error, analyze, reset } = useAnalysis();

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">HisseAnaliz</span>
              <span className="ml-2 text-xs text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full">AI Beta</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Brain className="w-4 h-4" /> Claude Vision</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Risk Analizi</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Forecasting</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!result ? (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                Finansal Görseli{' '}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Yapay Zeka ile Analiz Et
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Hisse grafiği, bilanço veya finansal özet yükleyin. Claude Vision teknolojisiyle
                saniyeler içinde profesyonel finansal analiz alın.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Brain, label: 'OCR + Vision', desc: 'Otomatik veri çıkarma' },
                { icon: BarChart2, label: 'Temel Analiz', desc: 'F/K, PD/DD, marjlar' },
                { icon: TrendingUp, label: 'Teknik', desc: 'Trend & formasyon' },
                { icon: Shield, label: 'Risk Skoru', desc: 'Zayıflık tespiti' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                </div>
              ))}
            </div>

            {/* Uploader */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <ImageUploader onUpload={analyze} isLoading={isLoading} />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <strong>Hata:</strong> {error}
              </div>
            )}
          </div>
        ) : (
          <AnalysisDashboard result={result} onReset={reset} />
        )}
      </main>

      <footer className="mt-20 border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        HisseAnaliz © 2025 · Bu platform yatırım tavsiyesi sunmaz. Bilgi amaçlıdır.
      </footer>
    </div>
  );
}
