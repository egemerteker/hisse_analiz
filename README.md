# Hisse Analiz — AI Destekli Finansal Analiz Platformu

Hisse senedi grafikleri, bilanço tabloları veya finansal özetleri görsel olarak yükleyin; Claude Vision teknolojisiyle saniyeler içinde profesyonel finansal analiz alın.

## Mimari

```
hisse_analiz/
├── backend/          # Python FastAPI + Claude Vision
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── vision.py          # Claude API entegrasyonu
│   ├── models/
│   │   ├── financial_data.py  # Veri modelleri (Pydantic)
│   │   └── analysis_result.py # Analiz sonuç modelleri
│   ├── services/
│   │   ├── financial_analyzer.py  # Temel analiz motoru
│   │   ├── technical_analyzer.py  # Teknik analiz
│   │   ├── risk_scorer.py         # Risk puanlama
│   │   └── forecaster.py          # Forecasting & değerleme
│   └── api/routes/
│       └── analysis.py        # POST /api/v1/analyze
└── frontend/         # Next.js 14 + TypeScript + Tailwind
    └── src/
        ├── app/
        ├── components/
        │   ├── tabs/          # 4 analiz sekmesi
        │   └── cards/         # Yatırımcı notları, metrik kartlar
        ├── hooks/useAnalysis.ts
        └── types/analysis.ts
```

## Hızlı Başlangıç

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# .env dosyasına ANTHROPIC_API_KEY ekleyin
uvicorn main:app --reload
```

API dokümantasyonu: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Uygulama: http://localhost:3000

## API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/v1/analyze` | Görsel yükle, analiz al |
| `GET` | `/api/v1/supported-formats` | Desteklenen formatlar |
| `GET` | `/health` | Sistem sağlığı |

## Analiz Sekmeleri

1. **Genel Özet** — Şirket profili, adil değer aralığı, finansal sağlık notu
2. **Finansal Sağlık & Riskler** — Likidite, karlılık, borçluluk skorları + risk faktörleri
3. **Teknik Görünüm** — Trend analizi, destek/direnç, formasyon tespiti
4. **Gelecek Tahminleri** — Çeyreklik projeksiyon, sektör karşılaştırması, adil değer modeli

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `ANTHROPIC_API_KEY` | Claude API anahtarı (zorunlu) |
| `ALLOWED_ORIGINS` | CORS izin verilen origin listesi |
| `NEXT_PUBLIC_API_URL` | Backend URL (frontend için) |
