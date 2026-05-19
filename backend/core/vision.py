import anthropic
import base64
import json
import re

from core.config import settings
from models.financial_data import ExtractedFinancialData

EXTRACTION_PROMPT = """
Sen bir finansal veri analisti yapay zekasısın. Bu görsel bir hisse senedi grafiği,
bilanço tablosu veya finansal özet içeriyor.

Görseli dikkatlice analiz et ve aşağıdaki JSON formatında verileri çıkar.
Görselde hangi veriler varsa onları doldur, yoksa null bırak.
Sayısal değerleri birim olmadan (saf sayı olarak) döndür.

```json
{
  "image_type": "chart|balance_sheet|income_statement|summary|mixed",
  "company_info": {
    "name": null,
    "ticker": null,
    "sector": null,
    "analysis_date": null
  },
  "price_data": {
    "current_price": null,
    "price_change_pct": null,
    "high_52w": null,
    "low_52w": null,
    "volume": null,
    "market_cap": null
  },
  "fundamental_data": {
    "revenue": null,
    "revenue_growth_yoy": null,
    "net_income": null,
    "net_margin": null,
    "gross_margin": null,
    "ebitda": null,
    "total_assets": null,
    "total_debt": null,
    "equity": null,
    "cash": null,
    "free_cash_flow": null
  },
  "valuation_metrics": {
    "pe_ratio": null,
    "pb_ratio": null,
    "ev_ebitda": null,
    "ps_ratio": null,
    "dividend_yield": null,
    "eps": null
  },
  "chart_data": {
    "trend_direction": null,
    "timeframe": null,
    "price_points": [],
    "support_levels": [],
    "resistance_levels": [],
    "chart_patterns": [],
    "indicators_visible": []
  },
  "historical_financials": [],
  "raw_text_extracted": ""
}
```

Sadece JSON döndür, başka açıklama ekleme.
"""


class VisionExtractor:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def _encode_image(self, image_bytes: bytes) -> str:
        return base64.standard_b64encode(image_bytes).decode("utf-8")

    def _detect_media_type(self, image_bytes: bytes) -> str:
        if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
            return "image/png"
        elif image_bytes[:2] == b"\xff\xd8":
            return "image/jpeg"
        elif image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
            return "image/webp"
        return "image/jpeg"

    async def extract_financial_data(self, image_bytes: bytes) -> ExtractedFinancialData:
        image_data = self._encode_image(image_bytes)
        media_type = self._detect_media_type(image_bytes)

        message = self.client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {"type": "text", "text": EXTRACTION_PROMPT},
                    ],
                }
            ],
        )

        response_text = message.content[0].text
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            raw_data = json.loads(json_match.group())
        else:
            raw_data = json.loads(response_text)

        return ExtractedFinancialData(**raw_data)


vision_extractor = VisionExtractor()
