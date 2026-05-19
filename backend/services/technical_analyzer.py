from typing import List, Optional

from models.financial_data import ExtractedFinancialData
from models.analysis_result import TechnicalAnalysis, TechnicalSignal

BULLISH_PATTERNS = {"cup_and_handle", "inverse_head_shoulders", "double_bottom", "ascending_triangle", "bull_flag"}
BEARISH_PATTERNS = {"head_and_shoulders", "double_top", "descending_triangle", "bear_flag"}


class TechnicalAnalyzer:
    def analyze(self, data: ExtractedFinancialData) -> TechnicalAnalysis:
        chart = data.chart_data
        price = data.price_data

        if not chart:
            return TechnicalAnalysis(overall_technical_view="Grafik verisi mevcut değil.")

        signals = self._generate_signals(chart, price)
        trend_strength = self._assess_trend_strength(signals)
        overall = self._assess_overall_view(chart, signals)

        return TechnicalAnalysis(
            trend_direction=chart.trend_direction,
            trend_strength=trend_strength,
            support_levels=chart.support_levels,
            resistance_levels=chart.resistance_levels,
            chart_patterns=chart.chart_patterns,
            technical_signals=signals,
            overall_technical_view=overall,
        )

    def _generate_signals(self, chart, price) -> List[TechnicalSignal]:
        signals: List[TechnicalSignal] = []

        trend_map = {
            "uptrend": ("bullish", "Yükselen trend kanalında işlem görüyor. Alım baskısı hakim."),
            "downtrend": ("bearish", "Düşen trend kanalında. Satış baskısı baskın."),
            "sideways": ("neutral", "Yatay bantta konsolide oluyor."),
        }
        if chart.trend_direction in trend_map:
            direction, desc = trend_map[chart.trend_direction]
            signals.append(TechnicalSignal(signal_type="Trend", description=desc, direction=direction, strength="moderate"))

        if price and price.current_price and price.high_52w and price.low_52w:
            r = price.high_52w - price.low_52w
            if r > 0:
                pos = (price.current_price - price.low_52w) / r
                if pos > 0.8:
                    signals.append(TechnicalSignal(
                        signal_type="52H Pozisyon",
                        description=f"52 haftalık zirveye yakın (%{pos*100:.0f}). Direnç yakın.",
                        direction="bearish", strength="weak",
                    ))
                elif pos < 0.2:
                    signals.append(TechnicalSignal(
                        signal_type="52H Pozisyon",
                        description=f"52 haftalık dibe yakın (%{pos*100:.0f}). Destek aranıyor.",
                        direction="bullish", strength="weak",
                    ))

        if price and price.price_change_pct is not None:
            if price.price_change_pct > 5:
                signals.append(TechnicalSignal(
                    signal_type="Momentum",
                    description=f"Güçlü pozitif momentum: %{price.price_change_pct:.1f} artış.",
                    direction="bullish", strength="strong",
                ))
            elif price.price_change_pct < -5:
                signals.append(TechnicalSignal(
                    signal_type="Momentum",
                    description=f"Güçlü negatif momentum: %{price.price_change_pct:.1f} düşüş.",
                    direction="bearish", strength="strong",
                ))

        for pattern in chart.chart_patterns:
            key = pattern.lower().replace(" ", "_")
            if any(bp in key for bp in BULLISH_PATTERNS):
                signals.append(TechnicalSignal(
                    signal_type="Formasyon", description=f"Yükseliş formasyonu: {pattern}",
                    direction="bullish", strength="moderate",
                ))
            elif any(bp in key for bp in BEARISH_PATTERNS):
                signals.append(TechnicalSignal(
                    signal_type="Formasyon", description=f"Düşüş formasyonu: {pattern}",
                    direction="bearish", strength="moderate",
                ))

        return signals

    def _assess_trend_strength(self, signals: List[TechnicalSignal]) -> str:
        bull = sum(1 for s in signals if s.direction == "bullish")
        bear = sum(1 for s in signals if s.direction == "bearish")
        diff = abs(bull - bear)
        return "strong" if diff >= 3 else "moderate" if diff >= 1 else "weak"

    def _assess_overall_view(self, chart, signals: List[TechnicalSignal]) -> str:
        if not signals:
            return "Yeterli teknik veri bulunmuyor."

        bull = [s for s in signals if s.direction == "bullish"]
        bear = [s for s in signals if s.direction == "bearish"]

        if len(bull) > len(bear) * 1.5:
            view = "Teknik görünüm OLUMLU. Yükseliş sinyalleri baskın."
        elif len(bear) > len(bull) * 1.5:
            view = "Teknik görünüm OLUMSUZ. Düşüş sinyalleri baskın."
        else:
            view = "Teknik görünüm KARMA. Net bir yön oluşana kadar izleme önerilir."

        extras = []
        if chart.support_levels:
            extras.append(f"Destek: {min(chart.support_levels):.2f}")
        if chart.resistance_levels:
            extras.append(f"Direnç: {max(chart.resistance_levels):.2f}")
        if extras:
            view += " | " + ", ".join(extras)

        return view


technical_analyzer = TechnicalAnalyzer()
