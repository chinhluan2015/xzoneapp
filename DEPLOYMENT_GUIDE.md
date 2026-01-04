# 🚀 Deployment Guide - XZone News Map Chart

## 📌 TL;DR - Quick Decision Matrix

| Môi trường | Khả năng | Cách deploy | Ghi chú |
|------------|----------|-------------|---------|
| **Local Development** | ✅ Full support | `npm run dev` | Recommended cho development |
| **Static Hosting** | ✅ Full support | Build → Upload | Vercel, Netlify, GitHub Pages |
| **Google AI Studio** | ⚠️ Limited | Cần refactor | Chỉ hỗ trợ single HTML file |

---

## 1️⃣ Local Development (RECOMMENDED)

### Yêu cầu
- Node.js 18+
- Gemini API Key

### Các bước setup

```bash
# 1. Install dependencies
npm install

# 2. Tạo file .env
cp .env.example .env

# 3. Thêm API key vào .env
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# 4. Chạy dev server
npm run dev
```

**Lợi ích:**
- ✅ Hot reload
- ✅ TypeScript support
- ✅ Full debugging
- ✅ Tất cả features hoạt động

---

## 2️⃣ Static Hosting (Production)

### Build production

```bash
npm run build
```

Output: `dist/` folder

### Deploy lên Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables trên Vercel:**
- Vào Settings → Environment Variables
- Thêm: `VITE_GEMINI_API_KEY`

### Deploy lên Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy lên GitHub Pages

```bash
# Build
npm run build

# Push dist/ folder to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

---

## 3️⃣ Google AI Studio Deployment

### ⚠️ VẤN ĐỀ COMPATIBILITY

**Google AI Studio chỉ hỗ trợ:**
- Single HTML file với inline JS/CSS
- Module imports qua CDN (ESM.sh, unpkg)
- Không có build step

**Code hiện tại sử dụng:**
- TypeScript modules
- Vite build system
- Component separation
- → **KHÔNG tương thích trực tiếp**

### Giải pháp: Tạo Single-File Version

#### Option A: Manual Bundle (Quick & Dirty)

1. Build project
```bash
npm run build
```

2. Inline CSS vào HTML
```bash
# Extract CSS from dist/
cat dist/assets/*.css
```

3. Copy nội dung vào `index.html`
4. Thay thế imports bằng CDN links

**Hạn chế:**
- Mất TypeScript type checking
- Không có hot reload
- Khó maintain

#### Option B: Refactor cho Google AI Studio (Recommended nếu BẮT BUỘC dùng AI Studio)

Tạo file mới: `google-ai-studio.html`

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>XZone News Map Chart</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@19.2.3",
        "react-dom/client": "https://esm.sh/react-dom@19.2.3/client",
        "@google/genai": "https://esm.sh/@google/genai@1.34.0",
        "lightweight-charts": "https://esm.sh/lightweight-charts@4.2.1"
      }
    }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        // Inline toàn bộ TypeScript code đã compile
        // (Paste compiled JS from dist/)
    </script>
</body>
</html>
```

**Workflow:**
1. Build local
2. Copy compiled JS
3. Inline vào single HTML
4. Upload lên Google AI Studio

---

## 4️⃣ So sánh các phương án

| Feature | Local Dev | Vercel/Netlify | Google AI Studio |
|---------|-----------|----------------|------------------|
| **TypeScript** | ✅ | ✅ (build-time) | ❌ |
| **Hot Reload** | ✅ | ❌ | ❌ |
| **Component Separation** | ✅ | ✅ | ⚠️ (must inline) |
| **Environment Variables** | ✅ | ✅ | ⚠️ (runtime only) |
| **Build Optimization** | ✅ | ✅ | ❌ |
| **Ease of Update** | ✅ | ✅ | ❌ |
| **Debugging** | ✅ | ⚠️ | ❌ |

---

## 5️⃣ KHUYẾN NGHỊ

### Cho Development & Production
👉 **Sử dụng Local Dev + Vercel/Netlify**

**Lý do:**
- Full features
- Easy maintenance
- Professional workflow
- Scalable

### Cho Google AI Studio
👉 **KHÔNG khuyến nghị** trừ khi bắt buộc

**Nếu BẮT BUỘC:**
1. Develop trên local
2. Build & test
3. Manual inline vào single HTML
4. Upload lên AI Studio

**Lưu ý:**
- Google AI Studio phù hợp cho **prototype/demo nhanh**
- Không phù hợp cho **production app** như XZone

---

## 6️⃣ API Key Security

### Development (Local)
```bash
# .env file (NEVER commit)
VITE_GEMINI_API_KEY=your_secret_key
```

### Production (Recommended)
- Sử dụng **Backend Proxy** để ẩn API key
- Tạo API endpoint riêng:
  - User → Your Backend → Gemini API
  - Frontend không chứa API key

### Google AI Studio
⚠️ **Không an toàn**: API key phải hardcode hoặc prompt user input

---

## 7️⃣ Performance Optimization

### Local/Production
- ✅ Code splitting (Vite auto)
- ✅ Tree shaking
- ✅ Lazy loading components
- ✅ CDN for static assets

### Google AI Studio
- ⚠️ Tất cả code trong 1 file → slow initial load
- ⚠️ Không có caching optimization

---

## 8️⃣ Checklist trước khi Deploy

- [ ] Test build: `npm run build`
- [ ] Check bundle size: `ls -lh dist/`
- [ ] Test production build: `npm run preview`
- [ ] Verify API key không bị commit: `git log -p | grep API_KEY`
- [ ] Test trên mobile viewport
- [ ] Check console errors
- [ ] Verify data.csv loads correctly

---

## 9️⃣ Troubleshooting Common Issues

### Build fails
```bash
# Clear cache và reinstall
rm -rf node_modules dist
npm install
npm run build
```

### API key not working
```bash
# Check .env format (no quotes)
VITE_GEMINI_API_KEY=AIza...  # ✅ Correct
VITE_GEMINI_API_KEY="AIza..." # ❌ Wrong

# Restart dev server after .env change
```

### Module not found
```bash
# Check import paths use .tsx extension
import App from './App.tsx'  # ✅
import App from './App'      # ❌ (vite may fail)
```

---

## 🎓 KẾT LUẬN

**Best Practice:**
1. **Develop local** với `npm run dev`
2. **Build** với `npm run build`
3. **Deploy** lên Vercel/Netlify
4. **Monitor** với Vercel Analytics

**Avoid:**
- ❌ Hardcode API keys in code
- ❌ Deploy unbundled code to production
- ❌ Use Google AI Studio for complex apps (như XZone)

---

**Need help?** Check [README.md](README.md) hoặc mở issue trên GitHub.
