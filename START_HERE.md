# 🚀 START HERE - XZone News Map Chart

**Welcome!** Đây là điểm bắt đầu cho dự án XZone News Map Chart.

---

## ⚡ TL;DR - Chạy ngay trong 30 giây

```bash
# Run script tự động
./quick-start.sh
```

Hoặc manual:

```bash
npm install
cp .env.example .env
# Thêm API key vào .env
npm run dev
```

---

## 📚 TÀI LIỆU QUAN TRỌNG

### 🎯 Bắt đầu
1. **[README.md](README.md)** ← ĐỌC ĐẦU TIÊN
   - Overview dự án
   - Quick start guide
   - Methodology chi tiết

### 🚀 Deployment
2. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**
   - Local vs Production
   - Google AI Studio compatibility
   - Security best practices

### 🐛 Technical Details
3. **[FIXES_AND_IMPROVEMENTS.md](FIXES_AND_IMPROVEMENTS.md)**
   - Bugs đã fix
   - Changelog chi tiết
   - Migration guide

4. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
   - Tổng quan toàn bộ dự án
   - Architecture
   - Roadmap

---

## 🎯 YÊU CẦU TỐI THIỂU

✅ Node.js 18+
✅ Gemini API Key ([Get here](https://aistudio.google.com/app/apikey))

---

## ⚠️ QUAN TRỌNG - GOOGLE AI STUDIO

**App này KHÔNG tương thích trực tiếp với Google AI Studio.**

**Lý do:**
- Google AI Studio chỉ chạy single HTML file
- Project này dùng TypeScript + Build system

**Giải pháp:**
✅ **Deploy lên Vercel** (free, recommended)
⚠️ Hoặc refactor thành single HTML (không khuyến nghị)

Chi tiết: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🔍 CẤU TRÚC PROJECT

```
📁 xzoneapp/
│
├── 📄 START_HERE.md          ← BẠN ĐANG Ở ĐÂY
├── 📄 README.md              ← Đọc tiếp
├── 📄 DEPLOYMENT_GUIDE.md    
├── 📄 FIXES_AND_IMPROVEMENTS.md
├── 📄 PROJECT_SUMMARY.md
│
├── 🔧 quick-start.sh         ← Script setup tự động
├── 🔧 .env.example           ← Template API key
├── 🔧 package.json
│
├── 📂 components/            ← React components
├── 📂 services/              ← Business logic
├── 📂 contextApp/            ← Spec documents
│
└── 📂 node_modules/          (sau khi npm install)
```

---

## 🎬 QUICK START VIDEO GUIDE

### Step 1: Clone & Install
```bash
cd xzoneapp
npm install
```

### Step 2: Get API Key
1. Vào https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key

### Step 3: Configure
```bash
cp .env.example .env
nano .env  # Paste API key vào
```

### Step 4: Run
```bash
npm run dev
```

Open: http://localhost:3000

---

## ❓ FAQ

### Q: App không chạy?
A: Check console errors, verify API key, xem [README.md](README.md) Troubleshooting

### Q: Làm sao deploy production?
A: Xem [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Recommended: Vercel

### Q: Có thể chạy trên Google AI Studio không?
A: ❌ Không trực tiếp. Cần refactor. Chi tiết: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Q: Lỗi "API key not found"?
A: Kiểm tra file `.env` có biến `VITE_GEMINI_API_KEY=your_key`

### Q: Data ở đâu?
A: Upload CSV/JSON hoặc dùng `data.csv` mặc định

---

## 🐛 GẶP VẤN ĐỀ?

1. ✅ Đọc [README.md](README.md) Troubleshooting section
2. ✅ Check console browser (F12)
3. ✅ Clear localStorage: `localStorage.clear()`
4. ✅ Restart server: Ctrl+C → `npm run dev`
5. ❌ Vẫn lỗi? Open GitHub issue

---

## 📊 PROJECT STATUS

| Component | Status |
|-----------|--------|
| **Code** | ✅ Production ready |
| **Bugs** | ✅ 0 critical bugs |
| **Docs** | ✅ Complete |
| **Tests** | ⚠️ Manual only |
| **Deployment** | ✅ Ready |

---

## 🎯 NEXT ACTIONS

### For First-Time Users:
1. Read [README.md](README.md)
2. Run `./quick-start.sh`
3. Upload your stock data
4. Search for news

### For Developers:
1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Check codebase structure
3. Review [FIXES_AND_IMPROVEMENTS.md](FIXES_AND_IMPROVEMENTS.md)
4. Start coding!

### For Deployment:
1. Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Choose platform (Vercel recommended)
3. Setup environment variables
4. Deploy!

---

## 💡 PRO TIPS

✅ Dùng `./quick-start.sh` cho lần đầu setup
✅ Commit `.env` vào gitignore (đã làm rồi)
✅ Deploy lên Vercel cho production
✅ Dùng Chrome DevTools để debug
✅ Read spec documents trong `contextApp/`

---

## 📞 SUPPORT

- 📄 Documentation: Các file .md trong project
- 🐛 Issues: GitHub Issues
- 💬 Questions: Xem FAQ trên

---

**Chúc bạn thành công! 🚀**

XZone Quant Team
