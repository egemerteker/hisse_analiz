export interface FinancialHealthScore {
  score: number;
  grade: string;
  components: Record<string, number>;
}

export interface FairValueRange {
  bear_case: number | null;
  base_case: number | null;
  bull_case: number | null;
  current_price: number | null;
  upside_potential: number | null;
}

export interface RiskFactor {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
}

export interface TechnicalSignal {
  signal_type: string;
  description: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
}

export interface ForecastPeriod {
  period: string;
  revenue_estimate: number | null;
  net_income_estimate: number | null;
  eps_estimate: number | null;
  growth_rate: number | null;
}

export interface InvestorNote {
  priority: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action_required: boolean;
}

export interface SectorComparison {
  label: string;
  company_value: number;
  sector_average: number;
  vs_sector_pct: number;
  assessment: string;
}

export interface GeneralSummary {
  company_name: string | null;
  ticker: string | null;
  sector: string | null;
  overall_assessment: string;
  key_highlights: string[];
  financial_health_score: FinancialHealthScore | null;
  current_price: number | null;
  fair_value_range: FairValueRange | null;
}

export interface FinancialHealthAnalysis {
  liquidity_analysis: Record<string, any>;
  profitability_analysis: Record<string, any>;
  debt_analysis: Record<string, any>;
  efficiency_analysis: Record<string, any>;
  risk_factors: RiskFactor[];
  financial_health_score: FinancialHealthScore | null;
}

export interface TechnicalAnalysis {
  trend_direction: string | null;
  trend_strength: string | null;
  support_levels: number[];
  resistance_levels: number[];
  chart_patterns: string[];
  technical_signals: TechnicalSignal[];
  overall_technical_view: string;
}

export interface ForecastingAnalysis {
  quarterly_forecasts: ForecastPeriod[];
  fair_value_range: FairValueRange | null;
  sector_comparison: Record<string, SectorComparison>;
  growth_outlook: string;
  valuation_assessment: string;
}

export interface AnalysisResult {
  general_summary: GeneralSummary;
  financial_health: FinancialHealthAnalysis;
  technical_analysis: TechnicalAnalysis;
  forecasting: ForecastingAnalysis;
  investor_notes: InvestorNote[];
  analysis_confidence: number;
  data_completeness: number;
}
