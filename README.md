# 📊 XZone News Map Chart - Quantitative Impact Analysis Engine

<div align="center">

**Hệ thống định lượng tác động của tin tức lên giá cổ phiếu Việt Nam**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0-4285f4.svg)](https://ai.google.dev/)

</div>

---

## 🎯 Tổng quan dự án

XZone News Map Chart là ứng dụng **event study** chuyên nghiệp, sử dụng phương pháp định lượng để:

1. **Thu thập tin tức** từ Google Search/News (real-time)
2. **Map tin tức** vào timeline giá cổ phiếu (OHLCV Daily)
3. **Đo lường tác động** bằng các chỉ số thống kê (Abnormal Return, Z-score, Volume Shock)
4. **Phân loại mức độ** từ Negligible → Structural Shock

### Triết lý cốt lõi
> **Tin tức = Catalyst | Giá + Khối lượng = Phán quyết**

Hệ thống **KHÔNG dự báo - KHÔNG khuyến nghị** - chỉ phân tích dữ liệu quá khứ một cách khách quan.

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    XZone News Map Chart                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐        ┌──────────────────┐            │
│  │  Gemini 2.0    │───────▶│  News Discovery  │            │
│  │  (Google Search)│        │  + Normalization │            │
│  └────────────────┘        └──────────────────┘            │
│                                     │                        │
│                                     ▼                        │
│  ┌────────────────────────────────────────────┐             │
│  │      Impact Analysis Engine (Pure Math)     │             │
│  │  • Log Return Calculation                   │             │
│  │  • Z-Score (Price, Volume, Range)           │             │
│  │  • Event Clustering                         │             │
│  │  • XIS Score (0-100)                        │             │
│  └────────────────────────────────────────────┘             │
│                                     │                        │
│                                     ▼                        │
│  ┌────────────────────────────────────────────┐             │
│  │   TradingView Chart + Timeline UI           │             │
│  │   (Lightweight Charts + React)              │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tách biệt logic (Separation of Concerns)

| Component | Role | Tools |
|-----------|------|-------|
| **Deterministic Engine** | Tính toán metrics, classification | Pure TypeScript |
| **LLM Layer (Optional)** | News search, Market observation | Gemini 2.0 Flash |
| **UI/Chart** | Visualization | Lightweight Charts + React |

---

## 📐 Impact Analysis Methodology

### Cửa sổ sự kiện (Event Windows)

```
Pre-window:       [-10, -1]  → Baseline estimation
Immediate:        [0, +1]     → Instant reaction
Short-term:       [0, +3]     → Momentum confirmation
Medium-term:      [0, +5]     → Trend sustainability
```

### Metrics chính

#### 1. **Price Impact (Abnormal Return)**
```
r_t = ln(C_t / C_{t-1})                   // Log return
μ_pre = mean(r[-10..-1])                  // Baseline mean
σ_pre = std(r[-10..-1])                   // Baseline volatility

CAR_k = Σ (r_i - μ_pre)                   // Cumulative Abnormal Return
z_k = CAR_k / (σ_pre × sqrt(k))           // Z-statistic
```

#### 2. **Volume Shock**
```
z_vol = (V_event - μ_vol) / σ_vol
```

#### 3. **Range Expansion**
```
TR = max(H - L, |H - C_prev|, |L - C_prev|)
z_TR = (TR_event - μ_TR) / σ_TR
```

### XIS Score (0-100)
```
XIS = (Z_max × 65%) + (Vol_ratio × 20%) + (Range_ratio × 15%)
```

**Classification:**
- **0-20**: Negligible
- **20-45**: Absorbed Reaction
- **45-70**: Market Re-pricing
- **70-100**: Structural Shock

### Event Clustering
Khi nhiều tin xuất hiện trong vòng ±3 ngày:
- **Anchor event** giữ nguyên baseline
- **Clustered events** kế thừa baseline từ anchor
- Tránh bias do baseline contamination

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Gemini API Key ([Get here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd xzoneapp

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# Run development server
npm run dev
```

App sẽ chạy tại: `http://localhost:3000`

---

## 📂 Project Structure

```
xzoneapp/
├── components/
│   ├── StockChart.tsx          # TradingView chart with markers
│   ├── ImpactReport.tsx        # Event impact detail panel
│   └── NewsTimeline.tsx        # News event list
├── services/
│   ├── impactEngine.ts         # Deterministic calculations
│   ├── geminiService.ts        # Gemini API integration
│   └── dataLoader.ts           # CSV/JSON price data parser
├── contextApp/
│   ├── Impact_Analysis_Engine_AI_Quant.md    # Spec document
│   └── News_Map_Chart_Prompt_FULL_GoogleSearch.md
├── App.tsx                     # Main application
├── types.ts                    # TypeScript interfaces
├── data.csv                    # Default price data
└── package.json
```

---

## 📊 Data Format

### Price Data (CSV)
```csv
Date,Ticker,Open,High,Low,Close,Volume
2024-01-01,HPG,26000,26500,25800,26200,1800000
```

### Price Data (JSON)
```json
{
  "symbol": "HPG",
  "price": [
    {
      "date": "2024-01-01",
      "open": 26000,
      "high": 26500,
      "low": 25800,
      "close": 26200,
      "volume": 1800000
    }
  ]
}
```

---

## 🎨 Features

### ✅ Core Features
- [x] Real-time news search via Google Search (Gemini)
- [x] Deterministic impact analysis (Z-score based)
- [x] Event clustering (within ±3 days)
- [x] TradingView-style candlestick chart
- [x] Volume histogram overlay
- [x] Interactive news markers
- [x] Validation flags (liquidity, volatility drift)
- [x] Multi-stock inventory system
- [x] CSV/JSON data upload
- [x] LocalStorage caching

### 🔜 Roadmap
- [ ] Benchmark adjustment (VNINDEX beta)
- [ ] Export to PDF/Excel
- [ ] Backtesting mode
- [ ] API endpoints for external integration

---

## ⚙️ Configuration

### Environment Variables
```bash
VITE_GEMINI_API_KEY=<your_api_key>
```

### Model Selection
File: [services/geminiService.ts](services/geminiService.ts:20)
```typescript
model: "gemini-3-flash-preview"  // Latest Gemini 3 Flash
// Alternative: "gemini-3-pro-preview" (more powerful)
// Alternative: "gemini-2.5-flash" (stable)
```

---

## 🧪 Data Validation & Quality Control

Hệ thống tự động phát hiện:
- **Low Liquidity Spike**: Giá biến động mạnh trên volume thấp
- **High Baseline Volatility**: Baseline nhiễu cao (>60% annualized)
- **Cluster Inheritance**: Sự kiện kế thừa baseline từ event trước

Validation flags xuất hiện trong Impact Report panel.

---

## 🔒 Giới hạn & Disclaimer

### Giới hạn kỹ thuật
1. **Chỉ hỗ trợ Daily timeframe** (chưa có intraday)
2. **Không có benchmark adjustment** (sẽ bị ảnh hưởng market-wide moves)
3. **Google Search giới hạn**: Tùy thuộc Gemini API quota
4. **Historical data only**: Không real-time streaming

### Legal Disclaimer
```
Ứng dụng này chỉ phục vụ mục đích NGHIÊN CỨU và HỌC TẬP.
- KHÔNG phải công cụ tư vấn đầu tư
- KHÔNG đưa khuyến nghị mua/bán
- Người dùng tự chịu trách nhiệm về quyết định đầu tư
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19.2 + TypeScript 5.8 |
| **Charting** | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) 4.2 |
| **AI/ML** | Google Gemini 2.0 Flash Exp |
| **Build Tool** | Vite 6.2 |
| **Styling** | TailwindCSS (via CDN) |
| **Icons** | Lucide React |

---

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Performance optimization (event clustering algorithm)
- Benchmark adjustment implementation
- UI/UX enhancements
- Test coverage

---

## 📚 References

### Spec Documents
- [Impact Analysis Engine Spec](contextApp/Impact_Analysis_Engine_AI_Quant.md)
- [News Map Chart Prompt](contextApp/News_Map_Chart_Prompt_FULL_GoogleSearch.md)

### Academic Foundation
- Event Study Methodology (MacKinlay, 1997)
- Market Microstructure Theory
- Statistical Arbitrage

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🆘 Troubleshooting

### API Key Issues
```bash
# Check if .env file exists
ls -la .env

# Verify variable name
cat .env | grep VITE_GEMINI_API_KEY

# Restart dev server after changing .env
npm run dev
```

### Chart Not Rendering
- Kiểm tra console cho lỗi
- Đảm bảo data có ít nhất 20 phiên
- Clear localStorage: `localStorage.clear()` in browser console

### News Search Fails
- Kiểm tra API quota tại [Google AI Studio](https://aistudio.google.com/)
- Thử lại với khoảng thời gian ngắn hơn (1 tháng thay vì 2 tháng)

---

## 👨‍💻 Developer Contact

For questions or support:
- Open an issue on GitHub
- Email: [your-email]
- Documentation: See `/contextApp` folder

---

<div align="center">

**Built with ❤️ for the Vietnamese stock market research community**

Made by XZone Quant Team

</div>
