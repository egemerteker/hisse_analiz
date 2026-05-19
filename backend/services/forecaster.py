from typing import List, Optional, Dict, Any

from models.financial_data import ExtractedFinancialData, HistoricalFinancial
from models.analysis_result import ForecastingAnalysis, ForecastPeriod, FairValueRange

SECTOR_AVERAGES: Dict[str, Dict[str, Any]] = {
    "default": {"pe": 15.0, "pb": 2.0, "ev_ebitda": 8.0, "net_margin": 10.0, "growth": 8.0},
    "technology": {"pe": 25.0, "pb": 4.0, "ev_ebitda": 15.0, "net_margin": 15.0, "growth": 15.0},
    "banking": {"pe": 8.0, "pb": 1.2, "ev_ebitda": None, "net_margin": 20.0, "growth": 10.0},
    "energy": {"pe": 12.0, "pb": 1.5, "ev_ebitda": 6.0, "net_margin": 8.0, "growth": 5.0},
    "retail": {"pe": 18.0, "pb": 2.5, "ev_ebitda": 10.0, "net_margin": 5.0, "growth": 7.0},
}

QUARTER_LABELS = ["2025Q2", "2025Q3", "2025Q4", "2026Q1"]


class Forecaster:
    def forecast(self, data: ExtractedFinancialData) -> ForecastingAnalysis:
        fd = data.fundamental_data
        vm = data.valuation_metrics
        price = data.price_data
        raw_sector = (data.company_info.sector or "default").lower() if data.company_info else "default"
        sector_avg = SECTOR_AVERAGES.get(raw_sector, SECTOR_AVERAGES["default"])

        quarterly_forecasts = self._project_quarters(data.historical_financials, fd, sector_avg)
        fair_value = self._calculate_fair_value(fd, vm, price, sector_avg)
        sector_comparison = self._compare_to_sector(vm, sector_avg)
        growth_outlook = self._assess_growth_outlook(fd, sector_avg)
        valuation_assessment = self._assess_valuation(vm, sector_avg, fair_value)

        return ForecastingAnalysis(
            quarterly_forecasts=quarterly_forecasts,
            fair_value_range=fair_value,
            sector_comparison=sector_comparison,
            growth_outlook=growth_outlook,
            valuation_assessment=valuation_assessment,
        )

    def _project_quarters(
        self,
        historical: List[HistoricalFinancial],
        fd: Any,
        sector_avg: Dict,
    ) -> List[ForecastPeriod]:
        growth_rate = sector_avg.get("growth", 8.0) / 100
        if fd and fd.revenue_growth_yoy is not None:
            growth_rate = fd.revenue_growth_yoy / 100 * 0.6 + growth_rate * 0.4

        quarterly_g = (1 + growth_rate) ** 0.25 - 1

        base_rev = base_ni = base_eps = None
        if historical:
            last = historical[-1]
            base_rev, base_ni, base_eps = last.revenue, last.net_income, last.eps
        elif fd:
            base_rev = fd.revenue / 4 if fd.revenue else None
            base_ni = fd.net_income / 4 if fd.net_income else None

        forecasts = []
        for i, label in enumerate(QUARTER_LABELS):
            m = (1 + quarterly_g) ** (i + 1)
            forecasts.append(ForecastPeriod(
                period=label,
                revenue_estimate=round(base_rev * m, 2) if base_rev else None,
                net_income_estimate=round(base_ni * m, 2) if base_ni else None,
                eps_estimate=round(base_eps * m, 4) if base_eps else None,
                growth_rate=round(quarterly_g * 100, 2),
            ))
        return forecasts

    def _calculate_fair_value(
        self, fd: Any, vm: Any, price: Any, sector_avg: Dict
    ) -> Optional[FairValueRange]:
        valuations: List[float] = []

        if vm and vm.eps and vm.eps > 0:
            pe_s = sector_avg.get("pe", 15.0)
            if pe_s:
                valuations.append(vm.eps * pe_s)

        if vm and vm.pb_ratio and vm.pb_ratio > 0 and price and price.current_price:
            pb_s = sector_avg.get("pb", 2.0)
            if pb_s:
                book_ps = price.current_price / vm.pb_ratio
                valuations.append(book_ps * pb_s)

        if fd and fd.ebitda and fd.ebitda > 0 and price and price.market_cap and price.market_cap > 0:
            ev_s = sector_avg.get("ev_ebitda", 8.0)
            if ev_s and fd.total_debt is not None and fd.cash is not None:
                fair_ev = fd.ebitda * ev_s
                fair_equity = fair_ev - (fd.total_debt - fd.cash)
                if fair_equity > 0 and price.current_price:
                    valuations.append(price.current_price * (fair_equity / price.market_cap))

        if not valuations:
            if price and price.current_price:
                return FairValueRange(base_case=price.current_price, current_price=price.current_price, upside_potential=0.0)
            return None

        base = sum(valuations) / len(valuations)
        cur = price.current_price if price else None
        return FairValueRange(
            bear_case=round(base * 0.8, 2),
            base_case=round(base, 2),
            bull_case=round(base * 1.2, 2),
            current_price=cur,
            upside_potential=round((base / cur - 1) * 100, 1) if cur else None,
        )

    def _compare_to_sector(self, vm: Any, sector_avg: Dict) -> Dict[str, Any]:
        if not vm:
            return {}
        result: Dict[str, Any] = {}
        checks = [("pe_ratio", "pe", "F/K"), ("pb_ratio", "pb", "PD/DD"), ("ev_ebitda", "ev_ebitda", "FD/FAVÖK")]
        for attr, key, label in checks:
            val = getattr(vm, attr, None)
            bench = sector_avg.get(key)
            if val is not None and bench:
                vs = (val / bench - 1) * 100
                result[attr] = {
                    "label": label,
                    "company_value": val,
                    "sector_average": bench,
                    "vs_sector_pct": round(vs, 1),
                    "assessment": "pahalı" if vs > 20 else "ucuz" if vs < -20 else "makul",
                }
        return result

    def _assess_growth_outlook(self, fd: Any, sector_avg: Dict) -> str:
        s_growth = sector_avg.get("growth", 8.0)
        if not fd or fd.revenue_growth_yoy is None:
            return f"Sektör ortalaması %{s_growth:.1f} büyüme öngörülüyor. Şirkete ait veri mevcut değil."
        g = fd.revenue_growth_yoy
        if g > s_growth * 1.5:
            return f"Şirket %{g:.1f} ile sektör ortalamasının ({s_growth:.1f}%) belirgin üzerinde büyüyor."
        elif g > s_growth:
            return f"Şirket %{g:.1f} büyümeyle sektör ortalamasını ({s_growth:.1f}%) geçiyor."
        elif g > 0:
            return f"Şirket %{g:.1f} büyürken sektör ortalaması %{s_growth:.1f}. Büyüme hızlanması için katalizörler takip edilmeli."
        return f"Gelir geriliyor (%{g:.1f}). Sektör ortalaması %{s_growth:.1f}. Yapısal sorunlar araştırılmalı."

    def _assess_valuation(self, vm: Any, sector_avg: Dict, fair_value: Optional[FairValueRange]) -> str:
        if not vm:
            return "Değerleme analizi için yeterli veri yok."
        parts: List[str] = []
        if vm.pe_ratio and sector_avg.get("pe"):
            diff = (vm.pe_ratio / sector_avg["pe"] - 1) * 100
            if diff > 30:
                parts.append(f"F/K ({vm.pe_ratio:.1f}x) sektörün %{diff:.0f} üzerinde — primli fiyatlama.")
            elif diff < -20:
                parts.append(f"F/K ({vm.pe_ratio:.1f}x) sektörün %{abs(diff):.0f} altında — iskontolu fiyatlama.")
            else:
                parts.append(f"F/K ({vm.pe_ratio:.1f}x) sektör ortalamasına yakın.")
        if fair_value and fair_value.upside_potential is not None:
            up = fair_value.upside_potential
            if up > 20:
                parts.append(f"Adil değer modeli %{up:.1f} yükseliş potansiyeli gösteriyor.")
            elif up < -15:
                parts.append(f"Adil değer modeli %{abs(up):.1f} düşüş riski işaret ediyor.")
        return " ".join(parts) if parts else "Mevcut verilerle kapsamlı değerleme yapılamadı."


forecaster = Forecaster()
