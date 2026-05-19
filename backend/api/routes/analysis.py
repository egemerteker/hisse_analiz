from fastapi import APIRouter, UploadFile, File, HTTPException

from core.vision import vision_extractor
from services.financial_analyzer import financial_analyzer
from services.technical_analyzer import technical_analyzer
from services.risk_scorer import risk_scorer
from services.forecaster import forecaster
from models.analysis_result import AnalysisResult, GeneralSummary

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024


@router.post("/analyze", response_model=AnalysisResult, summary="Görsel Finansal Analiz")
async def analyze_image(file: UploadFile = File(...)):
    """
    PNG/JPEG/WEBP formatında hisse grafiği veya finansal tablo yükleyin.
    Claude Vision ile verileri çıkarır ve kapsamlı finansal analiz döndürür.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Desteklenmeyen format: {file.content_type}")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Dosya 10MB sınırını aşıyor.")
    if len(image_bytes) < 100:
        raise HTTPException(status_code=400, detail="Geçersiz görsel dosyası.")

    try:
        extracted = await vision_extractor.extract_financial_data(image_bytes)
        fin_health = financial_analyzer.analyze(extracted)
        technical = technical_analyzer.analyze(extracted)
        forecast = forecaster.forecast(extracted)
        investor_notes = risk_scorer.generate_investor_notes(extracted, fin_health.risk_factors)

        company = extracted.company_info
        highlights = []
        fd, vm = extracted.fundamental_data, extracted.valuation_metrics
        if fd:
            if fd.revenue_growth_yoy is not None:
                highlights.append(f"Gelir büyümesi: %{fd.revenue_growth_yoy:.1f}")
            if fd.net_margin is not None:
                highlights.append(f"Net marj: %{fd.net_margin:.1f}")
        if vm and vm.pe_ratio is not None:
            highlights.append(f"F/K oranı: {vm.pe_ratio:.1f}x")
        if technical.trend_direction:
            td = {"uptrend": "Yükselen trend", "downtrend": "Düşen trend", "sideways": "Yatay trend"}
            highlights.append(td.get(technical.trend_direction, technical.trend_direction))

        critical_count = sum(1 for r in fin_health.risk_factors if r.severity in ("critical", "high"))
        if critical_count == 0:
            assessment = "Genel finansal görünüm olumlu. Önemli bir risk faktörü tespit edilmedi."
        elif critical_count <= 2:
            assessment = f"{critical_count} önemli risk faktörü tespit edildi. Detaylı inceleme önerilir."
        else:
            assessment = f"{critical_count} kritik risk faktörü mevcut. Yatırım öncesi kapsamlı due diligence yapılmalıdır."

        summary = GeneralSummary(
            company_name=company.name if company else None,
            ticker=company.ticker if company else None,
            sector=company.sector if company else None,
            overall_assessment=assessment,
            key_highlights=highlights,
            financial_health_score=fin_health.financial_health_score,
            current_price=extracted.price_data.current_price if extracted.price_data else None,
            fair_value_range=forecast.fair_value_range,
        )

        data_fields = [fd, vm, extracted.price_data, extracted.chart_data]
        completeness = sum(1 for f in data_fields if f is not None) / len(data_fields)

        return AnalysisResult(
            general_summary=summary,
            financial_health=fin_health,
            technical_analysis=technical,
            forecasting=forecast,
            investor_notes=investor_notes,
            analysis_confidence=0.75,
            data_completeness=completeness,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")


@router.get("/supported-formats", summary="Desteklenen formatlar")
async def supported_formats():
    return {
        "supported_image_types": list(ALLOWED_TYPES),
        "max_size_mb": 10,
        "supported_content": [
            "Hisse senedi fiyat grafiği",
            "Bilanço tablosu",
            "Gelir tablosu",
            "Finansal özet raporu",
            "Teknik analiz ekranı",
        ],
    }
