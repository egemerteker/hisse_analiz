from pydantic import BaseModel, Field
from typing import Optional, List


class CompanyInfo(BaseModel):
    name: Optional[str] = None
    ticker: Optional[str] = None
    sector: Optional[str] = None
    analysis_date: Optional[str] = None


class PriceData(BaseModel):
    current_price: Optional[float] = None
    price_change_pct: Optional[float] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None
    volume: Optional[float] = None
    market_cap: Optional[float] = None


class FundamentalData(BaseModel):
    revenue: Optional[float] = None
    revenue_growth_yoy: Optional[float] = None
    net_income: Optional[float] = None
    net_margin: Optional[float] = None
    gross_margin: Optional[float] = None
    ebitda: Optional[float] = None
    total_assets: Optional[float] = None
    total_debt: Optional[float] = None
    equity: Optional[float] = None
    cash: Optional[float] = None
    free_cash_flow: Optional[float] = None


class ValuationMetrics(BaseModel):
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    ps_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    eps: Optional[float] = None


class PricePoint(BaseModel):
    date: str
    price: float


class ChartData(BaseModel):
    trend_direction: Optional[str] = None
    timeframe: Optional[str] = None
    price_points: List[PricePoint] = Field(default_factory=list)
    support_levels: List[float] = Field(default_factory=list)
    resistance_levels: List[float] = Field(default_factory=list)
    chart_patterns: List[str] = Field(default_factory=list)
    indicators_visible: List[str] = Field(default_factory=list)


class HistoricalFinancial(BaseModel):
    period: str
    revenue: Optional[float] = None
    net_income: Optional[float] = None
    ebitda: Optional[float] = None
    eps: Optional[float] = None


class ExtractedFinancialData(BaseModel):
    image_type: Optional[str] = None
    company_info: Optional[CompanyInfo] = None
    price_data: Optional[PriceData] = None
    fundamental_data: Optional[FundamentalData] = None
    valuation_metrics: Optional[ValuationMetrics] = None
    chart_data: Optional[ChartData] = None
    historical_financials: List[HistoricalFinancial] = Field(default_factory=list)
    raw_text_extracted: Optional[str] = None
