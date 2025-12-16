# VLA Repair Analytics - AI Integration

## 🤖 Tích hợp OpenAI GPT-4o Mini

### 📋 Cấu hình cho Development (Local)

1. **Tạo file `.env.local`** (đã được tạo sẵn):

```bash
VITE_OPENAI_API_KEY=your-openai-api-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_MAX_TOKENS=16384
VITE_OPENAI_TEMPERATURE=0.1
```

2. **Restart dev server**:

```bash
npm run dev
```

### 🚀 Deploy lên Vercel

#### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Add OpenAI integration"
git push origin main
```

#### Bước 2: Deploy Vercel qua Dashboard

1. Truy cập [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import repository từ GitHub
4. Vào **"Environment Variables"**
5. Thêm các biến:

| Name                      | Value                  |
| ------------------------- | ---------------------- |
| `VITE_OPENAI_API_KEY`     | `sk-proj-89cbu4YAe...` |
| `VITE_OPENAI_MODEL`       | `gpt-4o-mini`          |
| `VITE_OPENAI_MAX_TOKENS`  | `16384`                |
| `VITE_OPENAI_TEMPERATURE` | `0.1`                  |

6. Click **"Deploy"**

#### Bước 3: Deploy qua Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add VITE_OPENAI_API_KEY
# Paste API key khi được yêu cầu

vercel env add VITE_OPENAI_MODEL
# Nhập: gpt-4o-mini

vercel env add VITE_OPENAI_MAX_TOKENS
# Nhập: 16384

vercel env add VITE_OPENAI_TEMPERATURE
# Nhập: 0.1

# Deploy
vercel --prod
```

### 💬 Cách sử dụng AI Chat

1. **Import dữ liệu** từ Google Sheets (sidebar trái)
2. **Mở AI Chat** (sidebar phải)
3. **Hỏi câu hỏi** về dữ liệu, ví dụ:
   - "Tổng chi phí sửa chữa tháng này là bao nhiêu?"
   - "Xe nào sửa nhiều nhất?"
   - "Phân tích chi phí theo phân xưởng"
   - "Tỷ lệ từ chối yêu cầu là bao nhiêu?"
   - "Đề xuất tối ưu chi phí"

### 🔧 API Configuration

```typescript
{
  model: "gpt-4o-mini",
  maxTokens: 16384,
  temperature: 0.1,
  apiUrl: "https://api.openai.com/v1/chat/completions"
}
```

### 📊 Context được gửi cho AI

- Tổng số yêu cầu
- Số phương tiện unique
- Tổng chi phí và chi phí trung bình
- Tỷ lệ từ chối yêu cầu
- Top 5 loại sửa chữa
- Top 5 phương tiện sửa nhiều nhất

### ⚠️ Lưu ý bảo mật

- ❌ **KHÔNG** commit file `.env.local` lên GitHub (đã được ignore)
- ✅ Chỉ set environment variables trên Vercel Dashboard
- ✅ API key chỉ sử dụng ở client-side (Vite)
- ✅ Giới hạn conversation history (max 10 cặp câu hỏi/trả lời)

### 🎯 Features

- ✅ Chat với GPT-4o Mini
- ✅ Context-aware (hiểu dữ liệu sửa chữa hiện tại)
- ✅ Conversation history (10 câu gần nhất)
- ✅ Auto-scroll to bottom
- ✅ Loading state
- ✅ Error handling
- ✅ Disable khi chưa import dữ liệu
- ✅ Hiển thị trạng thái API (configured/not configured)

### 💰 Chi phí ước tính

GPT-4o Mini pricing:

- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

Ước tính cho 1000 câu hỏi:

- ~$0.50 - $2.00 (tùy độ dài conversation)

### 🐛 Troubleshooting

**Lỗi: "API Key chưa được cấu hình"**

- Kiểm tra file `.env.local` có tồn tại không
- Restart dev server: `npm run dev`

**Lỗi: "Invalid API Key"**

- Kiểm tra API key có đúng không
- Kiểm tra key chưa expire trên OpenAI Dashboard

**Lỗi: "Rate limit exceeded"**

- Đợi 1 phút và thử lại
- Kiểm tra quota trên OpenAI Dashboard

**AI không trả lời đúng**

- Kiểm tra đã import dữ liệu chưa
- Đặt câu hỏi rõ ràng, cụ thể hơn
- Thử refresh conversation (reload page)

---

**Made with ❤️ by VLA Team**
