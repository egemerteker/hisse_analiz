from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class FinancialHealthScore(BaseModel):
    score: float
    grade: str
    components: Dict[str, float] = Field(default_factory=dict)


class RiskFactor(BaseModel):
    category: str
    description: str
    severity: str
    impact: str


class TechnicalSignal(BaseModel):
    signal_type: str
    description: str
    direction: str
    strength: str


class ForecastPeriod(BaseModel):
    period: str
    revenue_estimate: Optional[float] = None
    net_income_estimate: Optional[float] = None
    eps_estimate: Optional[float] = None
    growth_rate: Optional[float] = None


class FairValueRange(BaseModel):
    bear_case: Optional[float] = None
    base_case: Optional[float] = None
    bull_case: Optional[float] = None
    current_price: Optional[float] = None
    upside_potential: Optional[float] = None


class InvestorNote(BaseModel):
    priority: str
    title: str
    description: str
    action_required: bool = False


class GeneralSummary(BaseModel):
    company_name: Optional[str] = None
    ticker: Optional[str] = None
    sector: Optional[str] = None
    overall_assessment: str
    key_highlights: List[str] = Field(default_factory=list)
    financial_health_score: Optional[FinancialHealthScore] = None
    current_price: Optional[float] = None
    fair_value_range: Optional[FairValueRange] = None


class FinancialHealthAnalysis(BaseModel):
    liquidity_analysis: Dict[str, Any] = Field(default_factory=dict)
    profitability_analysis: Dict[str, Any] = Field(default_factory=dict)
    debt_analysis: Dict[str, Any] = Field(default_factory=dict)
    efficiency_analysis: Dict[str, Any] = Field(default_factory=dict)
    risk_factors: List[RiskFactor] = Field(default_factory=list)
    financial_health_score: Optional[FinancialHealthScore] = None


class TechnicalAnalysis(BaseModel):
    trend_direction: Optional[str] = None
    trend_strength: Optional[str] = None
    support_levels: List[float] = Field(default_factory=list)
    resistance_levels: List[float] = Field(default_factory=list)
    chart_patterns: List[str] = Field(default_factory=list)
    technical_signals: List[TechnicalSignal] = Field(default_factory=list)
    overall_technical_view: str = ""


class ForecastingAnalysis(BaseModel):
    quarterly_forecasts: List[ForecastPeriod] = Field(default_factory=list)
    fair_value_range: Optional[FairValueRange] = None
    sector_comparison: Dict[str, Any] = Field(default_factory=dict)
    growth_outlook: str = ""
    valuation_assessment: str = ""


class AnalysisResult(BaseModel):
    general_summary: GeneralSummary
    financial_health: FinancialHealthAnalysis
    technical_analysis: TechnicalAnalysis
    forecasting: ForecastingAnalysis
    investor_notes: List[InvestorNote] = Field(default_factory=list)
    analysis_confidence: float = 0.0
    data_completeness: float = 0.0
