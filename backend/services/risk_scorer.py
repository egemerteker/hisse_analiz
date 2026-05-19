from typing import List

from models.financial_data import ExtractedFinancialData
from models.analysis_result import InvestorNote, RiskFactor


class RiskScorer:
    def generate_investor_notes(
        self,
        data: ExtractedFinancialData,
        risk_factors: List[RiskFactor],
    ) -> List[InvestorNote]:
        notes: List[InvestorNote] = []

        for risk in risk_factors:
            if risk.severity == "critical":
                notes.append(InvestorNote(
                    priority="critical",
                    title=f"UYARI: {risk.category} Riski",
                    description=f"{risk.description} {risk.impact}",
                    action_required=True,
                ))
            elif risk.severity == "high":
                notes.append(InvestorNote(
                    priority="warning",
                    title=f"Dikkat: {risk.category}",
                    description=f"{risk.description} {risk.impact}",
                    action_required=False,
                ))

        fd = data.fundamental_data
        vm = data.valuation_metrics

        if fd:
            if fd.revenue_growth_yoy and fd.revenue_growth_yoy > 20:
                notes.append(InvestorNote(
                    priority="info",
                    title="Güçlü Büyüme Trendi",
                    description=f"Şirket %{fd.revenue_growth_yoy:.1f} gelir büyümesiyle sektördeki konumunu güçlendiriyor.",
                ))
            if fd.free_cash_flow and fd.free_cash_flow > 0:
                notes.append(InvestorNote(
                    priority="info",
                    title="Pozitif Nakit Akışı",
                    description="Şirket pozitif serbest nakit akışı üretiyor — finansal sürdürülebilirlik açısından olumlu.",
                ))

        if vm and vm.dividend_yield and vm.dividend_yield > 4:
            notes.append(InvestorNote(
                priority="info",
                title="Cazip Temettü Getirisi",
                description=f"%{vm.dividend_yield:.1f} temettü getirisi uzun vadeli yatırımcılara ek gelir sunuyor.",
            ))

        notes.append(InvestorNote(
            priority="info",
            title="Yasal Uyarı",
            description="Bu analiz yatırım tavsiyesi değildir. Kararlarınızı vermeden önce lisanslı bir finansal danışmana başvurun.",
        ))

        return notes


risk_scorer = RiskScorer()
