from typing import Optional, Dict, Any, List

from models.financial_data import ExtractedFinancialData, FundamentalData, ValuationMetrics
from models.analysis_result import FinancialHealthAnalysis, FinancialHealthScore, RiskFactor

SECTOR_AVERAGES: Dict[str, Dict[str, Any]] = {
    "default": {"pe": 15.0, "pb": 2.0, "ev_ebitda": 8.0, "net_margin": 10.0, "debt_equity": 1.0},
    "technology": {"pe": 25.0, "pb": 4.0, "ev_ebitda": 15.0, "net_margin": 15.0, "debt_equity": 0.5},
    "banking": {"pe": 8.0, "pb": 1.2, "ev_ebitda": None, "net_margin": 20.0, "debt_equity": 8.0},
    "energy": {"pe": 12.0, "pb": 1.5, "ev_ebitda": 6.0, "net_margin": 8.0, "debt_equity": 1.2},
    "retail": {"pe": 18.0, "pb": 2.5, "ev_ebitda": 10.0, "net_margin": 5.0, "debt_equity": 1.5},
    "industrials": {"pe": 14.0, "pb": 1.8, "ev_ebitda": 9.0, "net_margin": 7.0, "debt_equity": 1.0},
    "real_estate": {"pe": 20.0, "pb": 1.5, "ev_ebitda": 12.0, "net_margin": 15.0, "debt_equity": 2.0},
}


class FinancialAnalyzer:
    def analyze(self, data: ExtractedFinancialData) -> FinancialHealthAnalysis:
        fd = data.fundamental_data
        vm = data.valuation_metrics
        raw_sector = (data.company_info.sector or "default").lower() if data.company_info else "default"
        sector_avg = SECTOR_AVERAGES.get(raw_sector, SECTOR_AVERAGES["default"])

        liquidity = self._analyze_liquidity(fd)
        profitability = self._analyze_profitability(fd, vm, sector_avg)
        debt = self._analyze_debt(fd, sector_avg)
        efficiency = self._analyze_efficiency(fd, vm, sector_avg)
        risk_factors = self._identify_risk_factors(fd, vm, sector_avg, liquidity, profitability, debt)
        health_score = self._calculate_health_score(liquidity, profitability, debt, efficiency)

        return FinancialHealthAnalysis(
            liquidity_analysis=liquidity,
            profitability_analysis=profitability,
            debt_analysis=debt,
            efficiency_analysis=efficiency,
            risk_factors=risk_factors,
            financial_health_score=health_score,
        )

    def _analyze_liquidity(self, fd: Optional[FundamentalData]) -> Dict[str, Any]:
        if not fd:
            return {"status": "data_unavailable", "score": 50, "metrics": {}}

        result: Dict[str, Any] = {"status": "unknown", "score": 50, "metrics": {}}

        if fd.cash is not None and fd.total_debt is not None:
            net_debt = fd.total_debt - fd.cash
            result["metrics"]["net_debt"] = net_debt
            result["metrics"]["cash_position"] = fd.cash

            if fd.ebitda and fd.ebitda > 0:
                nd_ebitda = net_debt / fd.ebitda
                result["metrics"]["net_debt_ebitda"] = round(nd_ebitda, 2)
                if nd_ebitda < 1:
                    result["status"], result["score"] = "excellent", 90
                elif nd_ebitda < 2:
                    result["status"], result["score"] = "good", 75
                elif nd_ebitda < 3:
                    result["status"], result["score"] = "moderate", 55
                elif nd_ebitda < 4:
                    result["status"], result["score"] = "concerning", 35
                else:
                    result["status"], result["score"] = "poor", 15

        if fd.free_cash_flow is not None:
            result["metrics"]["free_cash_flow"] = fd.free_cash_flow
            result["metrics"]["fcf_positive"] = fd.free_cash_flow > 0
            if fd.free_cash_flow < 0:
                result["score"] = max(0, result["score"] - 20)

        return result

    def _analyze_profitability(
        self,
        fd: Optional[FundamentalData],
        vm: Optional[ValuationMetrics],
        sector_avg: Dict,
    ) -> Dict[str, Any]:
        result: Dict[str, Any] = {"status": "unknown", "score": 50, "metrics": {}}
        score = 50

        if fd:
            if fd.net_margin is not None:
                result["metrics"]["net_margin"] = fd.net_margin
                benchmark = sector_avg.get("net_margin", 10.0)
                if benchmark:
                    result["metrics"]["net_margin_vs_sector"] = round((fd.net_margin / benchmark - 1) * 100, 1)
                if fd.net_margin >= (benchmark or 10) * 1.5:
                    score += 25
                elif fd.net_margin >= (benchmark or 10):
                    score += 15
                elif fd.net_margin < (benchmark or 10) * 0.5:
                    score -= 20

            if fd.gross_margin is not None:
                result["metrics"]["gross_margin"] = fd.gross_margin

            if fd.revenue_growth_yoy is not None:
                result["metrics"]["revenue_growth"] = fd.revenue_growth_yoy
                if fd.revenue_growth_yoy > 20:
                    score += 20
                elif fd.revenue_growth_yoy > 5:
                    score += 10
                elif fd.revenue_growth_yoy < 0:
                    score -= 15

        if vm:
            if vm.pe_ratio is not None:
                result["metrics"]["pe_ratio"] = vm.pe_ratio
            if vm.eps is not None:
                result["metrics"]["eps"] = vm.eps

        result["score"] = max(0, min(100, score))
        s = result["score"]
        result["status"] = "excellent" if s >= 75 else "good" if s >= 55 else "moderate" if s >= 35 else "poor"
        return result

    def _analyze_debt(self, fd: Optional[FundamentalData], sector_avg: Dict) -> Dict[str, Any]:
        result: Dict[str, Any] = {"status": "unknown", "score": 50, "metrics": {}}
        if not fd:
            return result

        if fd.total_debt is not None and fd.equity is not None and fd.equity > 0:
            de = fd.total_debt / fd.equity
            result["metrics"]["debt_to_equity"] = round(de, 2)
            benchmark = sector_avg.get("debt_equity", 1.0) or 1.0
            if de < benchmark * 0.5:
                result["score"], result["status"] = 90, "low_debt"
            elif de < benchmark:
                result["score"], result["status"] = 70, "manageable"
            elif de < benchmark * 1.5:
                result["score"], result["status"] = 45, "elevated"
            else:
                result["score"], result["status"] = 20, "high_debt"

        if fd.total_debt is not None and fd.total_assets and fd.total_assets > 0:
            result["metrics"]["debt_ratio"] = round(fd.total_debt / fd.total_assets, 3)

        return result

    def _analyze_efficiency(
        self,
        fd: Optional[FundamentalData],
        vm: Optional[ValuationMetrics],
        sector_avg: Dict,
    ) -> Dict[str, Any]:
        result: Dict[str, Any] = {"metrics": {}, "score": 50}

        if fd and fd.revenue and fd.total_assets and fd.total_assets > 0:
            result["metrics"]["asset_turnover"] = round(fd.revenue / fd.total_assets, 2)

        if vm:
            if vm.pb_ratio is not None:
                result["metrics"]["pb_ratio"] = vm.pb_ratio
                pb_b = sector_avg.get("pb", 2.0)
                if pb_b:
                    result["metrics"]["pb_vs_sector"] = round((vm.pb_ratio / pb_b - 1) * 100, 1)
            if vm.ev_ebitda is not None:
                result["metrics"]["ev_ebitda"] = vm.ev_ebitda
                ev_b = sector_avg.get("ev_ebitda", 8.0)
                if ev_b:
                    result["metrics"]["ev_ebitda_vs_sector"] = round((vm.ev_ebitda / ev_b - 1) * 100, 1)

        return result

    def _identify_risk_factors(
        self,
        fd: Optional[FundamentalData],
        vm: Optional[ValuationMetrics],
        sector_avg: Dict,
        liquidity: Dict,
        profitability: Dict,
        debt: Dict,
    ) -> List[RiskFactor]:
        risks: List[RiskFactor] = []

        if debt.get("status") == "high_debt":
            risks.append(RiskFactor(
                category="Borçluluk",
                description="Borç/öz sermaye oranı sektör ortalamasının çok üzerinde.",
                severity="high",
                impact="Faiz yükü karlılığı tehdit edebilir, finansal esneklik kısıtlanabilir.",
            ))

        if fd and fd.net_margin is not None:
            benchmark = sector_avg.get("net_margin", 10.0) or 10.0
            if fd.net_margin < benchmark * 0.3:
                risks.append(RiskFactor(
                    category="Karlılık",
                    description=f"Net marj (%{fd.net_margin:.1f}) sektör ortalamasının (%{benchmark:.1f}) çok altında.",
                    severity="high",
                    impact="Faaliyetlerden değer yaratma kapasitesi zayıf.",
                ))

        if fd and fd.revenue_growth_yoy is not None and fd.revenue_growth_yoy < -5:
            risks.append(RiskFactor(
                category="Büyüme",
                description=f"Gelir büyümesi negatif (%{fd.revenue_growth_yoy:.1f}).",
                severity="high",
                impact="Pazar payı kaybediliyor, iş modeli sürdürülebilirliği sorgulanabilir.",
            ))

        if fd and fd.free_cash_flow is not None and fd.free_cash_flow < 0:
            risks.append(RiskFactor(
                category="Nakit Akışı",
                description="Serbest nakit akışı negatif.",
                severity="medium",
                impact="Büyüme dış finansmana bağımlı, borç artabilir.",
            ))

        if vm and vm.pe_ratio is not None:
            pe_b = sector_avg.get("pe", 15.0) or 15.0
            if vm.pe_ratio > pe_b * 2:
                risks.append(RiskFactor(
                    category="Değerleme",
                    description=f"F/K ({vm.pe_ratio:.1f}x) sektör ortalamasının ({pe_b:.1f}x) 2 katından fazla.",
                    severity="medium",
                    impact="Beklentiler karşılanmadığında sert düzeltme riski.",
                ))

        if liquidity.get("score", 50) < 30:
            risks.append(RiskFactor(
                category="Likidite",
                description="Net borç/FAVÖK oranı kritik seviyelerde.",
                severity="critical",
                impact="Kısa vadeli ödeme güçlüğü yaşanabilir.",
            ))

        return risks

    def _calculate_health_score(
        self, liquidity: Dict, profitability: Dict, debt: Dict, efficiency: Dict
    ) -> FinancialHealthScore:
        weights = {"liquidity": 0.25, "profitability": 0.35, "debt": 0.30, "efficiency": 0.10}
        scores = {
            "liquidity": liquidity.get("score", 50),
            "profitability": profitability.get("score", 50),
            "debt": debt.get("score", 50),
            "efficiency": efficiency.get("score", 50),
        }
        total = round(sum(scores[k] * weights[k] for k in weights), 1)
        grade = "A" if total >= 80 else "B" if total >= 65 else "C" if total >= 50 else "D" if total >= 35 else "F"
        return FinancialHealthScore(score=total, grade=grade, components=scores)


financial_analyzer = FinancialAnalyzer()
