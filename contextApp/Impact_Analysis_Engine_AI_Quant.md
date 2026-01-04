
# IMPACT ANALYSIS ENGINE – ĐẶC TẢ CHUẨN (AI QUANT)

## 1. Mục tiêu hệ thống
Impact Analysis Engine được thiết kế để **định lượng mức độ tác động của tin tức lên giá cổ phiếu** một cách:
- Khách quan
- Có thể lặp lại
- Không phụ thuộc cảm tính hay ngôn ngữ mô tả

Tin tức được xem là **catalyst**, còn tác động phải được **đo bằng dữ liệu giá và khối lượng**.

---

## 2. Định nghĩa sự kiện (Event Definition)

- Mỗi tin tức được ánh xạ tới **một ngày giao dịch t0**
- Nếu tin rơi vào ngày nghỉ → ánh xạ sang **phiên giao dịch kế tiếp**
- Phân tích chỉ dựa trên dữ liệu **daily OHLCV**

---

## 3. Cửa sổ sự kiện (Event Windows)

- Pre-window (baseline): `[-10, -1]`
- Immediate impact: `[0, +1]`
- Short-term impact: `[0, +3]`
- Medium-term impact: `[0, +5]`
- Post-confirmation: `[+1, +5]`

Các cửa sổ này cho phép phân biệt:
- Phản ứng tức thì
- Theo sau xu hướng
- Nhiễu ngắn hạn

---

## 4. Đo lường tác động giá (Price Impact)

### 4.1 Log Return
Sử dụng log return thay vì % thay đổi:

r_t = ln(C_t / C_{t-1})

### 4.2 Baseline
Tính trên pre-window:
- μ_pre = mean(r[-10..-1])
- σ_pre = std(r[-10..-1])

### 4.3 Abnormal Return
Với cửa sổ k ngày:

R_k = ln(C_{t0+k} / C_{t0})  
AR_k = R_k − k × μ_pre

### 4.4 Độ ý nghĩa thống kê (Significance)

t_k = AR_k / (sqrt(k) × σ_pre)

Phân loại:
- |t| < 1.0 → Không có tác động (Noise)
- 1.0 ≤ |t| < 2.0 → Tác động yếu
- 2.0 ≤ |t| < 3.0 → Tác động trung bình
- |t| ≥ 3.0 → Tác động mạnh

---

## 5. Volume Shock

Đo khối lượng giao dịch bất thường tại t0:

- μ_vol = mean(V[-10..-1])
- σ_vol = std(V[-10..-1])

z_vol = (V_t0 − μ_vol) / σ_vol

Phân loại:
- z_vol ≥ 2.0 → Volume spike
- |z_vol| < 2.0 → Bình thường

---

## 6. Range / Volatility Expansion

True Range (TR):

TR = max(H − L, |H − C_prev|, |L − C_prev|)

So sánh với baseline:
- μ_TR, σ_TR trên pre-window
- z_TR = (TR_t0 − μ_TR) / σ_TR

Giúp phân biệt:
- Tin gây dao động nội phiên
- Tin tạo xu hướng thực

---

## 7. Impact Score (0–100)

### 7.1 Thành phần
- Price impact (t-stat) – 50%
- Volume shock – 25%
- Range expansion – 25%

### 7.2 Công thức
- score_price = clamp(|t_3| / 3, 0, 1) × 50
- score_vol   = clamp(z_vol / 3, 0, 1) × 25
- score_range = clamp(z_TR / 3, 0, 1) × 25

Impact Score = score_price + score_vol + score_range

### 7.3 Diễn giải
- 0–25: Không tác động / nhiễu
- 25–50: Tác động yếu
- 50–75: Tác động trung bình
- 75–100: Tác động mạnh

---

## 8. Tin trùng & cụm sự kiện (Event Clustering)

Vấn đề:
- Nhiều tin xuất hiện gần nhau
- Giá phản ứng với **cụm thông tin**, không phải một bài

Giải pháp:
- Gom các tin trong ±2 phiên thành **Event Cluster**
- Tính impact cho cluster
- Gán impact chung cho từng tin trong cluster

---

## 9. Benchmark Adjustment (Khuyến nghị)

Để loại ảnh hưởng thị trường chung:
- Sử dụng VNINDEX / VN30 làm benchmark
- Abnormal return điều chỉnh:

r_abn = r_stock − β × r_market

β ước lượng từ pre-window

---

## 10. Kiến trúc hệ thống (Separation of Concerns)

### 10.1 Deterministic (BẮT BUỘC)
- Impact metrics
- Score
- Classification

### 10.2 LLM (TÙY CHỌN)
- Tìm kiếm tin tức
- Chuẩn hóa & tóm tắt nội dung
- Viết Market Observation dựa trên số liệu

LLM **không** được quyết định “có tác động hay không”.

---

## 11. Market Observation (Text Layer)

Nguyên tắc:
- Trung lập
- Không dự báo
- Không khuyến nghị đầu tư
- Dựa hoàn toàn trên số liệu

Mục đích:
- Giải thích *điều đã xảy ra*, không phải *điều sẽ xảy ra*

---

## 12. Kiểm soát chất lượng & lỗi thường gặp

- False positive do thị trường chung
- Nhiễu thanh khoản thấp
- Dữ liệu sát cuối chuỗi
- Tin công bố ngoài giờ

Biện pháp:
- Benchmark adjustment
- Minimum liquidity filter
- Kiểm tra đủ dữ liệu pre/post window
- Cảnh báo “low confidence”

---

## 13. Triết lý cốt lõi

- Tin tức = Catalyst
- Giá + Khối lượng = Phán quyết
- Impact phải đo được, không kể chuyện
- Hệ thống phục vụ **ra quyết định kỷ luật**, không hô hào

