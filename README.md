# 🚗 VLA Repair Report - Demo Version

Hệ thống báo cáo và thống kê sửa chữa xe - Phiên bản Demo

![VLA Logo](https://img.shields.io/badge/VLA-Repair%20Report-orange?style=for-the-badge&logo=car)
![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.12-red?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 📖 Giới thiệu

VLA Repair Report là ứng dụng web giúp quản lý và phân tích dữ liệu sửa chữa xe. Phiên bản demo này không yêu cầu backend server, chạy hoàn toàn trên trình duyệt với:

- ✅ **Import Google Sheets** - Nhập dữ liệu từ Google Sheets (dạng CSV)
- 📊 **Dashboard trực quan** - Biểu đồ và thống kê chi tiết
- 🤖 **AI Chat Assistant** - Trợ lý ảo hỗ trợ phân tích (mock)
- 🎨 **Giao diện 3 cột** - Bố cục tối ưu với màu cam/xanh dương
- 🌙 **Dark Mode** - Chuyển đổi chế độ sáng/tối
- 💾 **LocalStorage** - Lưu trữ dữ liệu ngay trên trình duyệt

## 🚀 Quick Start

### Yêu cầu hệ thống

- Node.js >= 16.x
- npm hoặc yarn

### Cài đặt

```bash
# 1. Clone hoặc download project
cd vla-repair-demo

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev

# 4. Mở trình duyệt tại: http://localhost:3000
```

### 🔐 Đăng nhập Demo

```
Username: admin
Password: 1234
```

## 📦 Tính năng chính

### 1. Import Google Sheets

- Paste link Google Sheets (dạng view link)
- Tự động chuyển đổi sang CSV và import
- Lưu lịch sử import, chọn dataset để phân tích

### 2. Dashboard & Thống kê

- **Stat Cards**: Tổng số lượt sửa, số xe, chi phí TB, thời gian TB
- **Filter Bar**: Lọc theo ngày, loại xe, loại sửa chữa, garage
- **Biểu đồ**:
  - 📈 Chi phí sửa chữa theo tháng (Line Chart)
  - 🥧 Phân loại sửa chữa (Pie Chart)
  - 📊 Top 10 xe sửa nhiều nhất (Bar Chart)
  - 💰 Chi phí theo loại xe (Bar Chart)

### 3. AI Chat Assistant (Mock)

- Giao diện chat ở sidebar phải
- Trả lời câu hỏi về dữ liệu (mock response)
- Gợi ý phân tích và báo cáo

## 🛠️ Tech Stack

| Công nghệ          | Mục đích                |
| ------------------ | ----------------------- |
| React 18           | Frontend framework      |
| TypeScript         | Type safety             |
| Vite               | Build tool & Dev server |
| Ant Design 5.12    | UI component library    |
| Apache ECharts 5.4 | Charting library        |
| Zustand 4.4        | State management        |
| Papa Parse 5.4     | CSV parser              |
| dayjs              | Date manipulation       |

## 📂 Cấu trúc Project

```
vla-repair-demo/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── ChartWrapper.tsx    # ECharts wrapper
│   │   │   └── Charts.tsx          # Tất cả biểu đồ
│   │   ├── dashboard/
│   │   │   ├── FilterBar.tsx       # Bộ lọc dữ liệu
│   │   │   └── StatCards.tsx       # Thẻ thống kê
│   │   ├── import/
│   │   │   ├── ImportSheet.tsx     # Form import Sheet
│   │   │   └── ImportHistory.tsx   # Lịch sử import
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Thanh header
│   │   │   ├── LeftSidebar.tsx     # Sidebar import
│   │   │   └── RightChatPanel.tsx  # AI chat panel
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   └── Login.tsx               # Màn hình login
│   ├── services/
│   │   ├── authService.ts          # Authentication logic
│   │   └── sheetService.ts         # Google Sheets import
│   ├── store/
│   │   └── useStore.ts             # Zustand store
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Hướng dẫn sử dụng

### Bước 1: Chuẩn bị Google Sheet

1. Tạo Google Sheet với cấu trúc:
   ```
   | repairDate | vehicleNumber | vehicleType | repairType | garage | cost | description |
   ```
2. Chia sẻ Sheet: **Mọi người có link → Người xem**
3. Copy URL (dạng: `https://docs.google.com/spreadsheets/d/...`)

### Bước 2: Import vào VLA

1. Login với `admin` / `1234`
2. Paste URL vào ô "Google Sheets URL" (sidebar trái)
3. Click **Import Sheet**
4. Chờ dữ liệu load (vài giây)

### Bước 3: Phân tích dữ liệu

1. **Xem thống kê tổng quan** ở Stat Cards
2. **Lọc dữ liệu** theo ngày, loại xe, loại sửa chữa
3. **Phân tích biểu đồ** - Zoom, hover để xem chi tiết
4. **Chat với AI** (mock) để được gợi ý phân tích

## 🔧 Scripts

```bash
# Development
npm run dev          # Chạy dev server (port 3000)

# Build Production
npm run build        # Build production files
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check ESLint errors
```

## 🌐 Deploy lên Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login Vercel
vercel login

# 3. Deploy
vercel --prod
```

Hoặc deploy qua Vercel Dashboard:

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → Import project
3. Chọn repo → Deploy

## 📊 Data Schema (LocalStorage)

### RepairData

```typescript
{
  id: string;
  repairDate: string; // YYYY-MM-DD
  vehicleNumber: string; // Biển số xe
  vehicleType: string; // Loại xe (Bus, Truck, Car...)
  repairType: string; // Loại sửa chữa
  garage: string; // Garage thực hiện
  cost: number; // Chi phí
  description: string; // Mô tả chi tiết
}
```

### ImportRecord

```typescript
{
  id: string;
  sheetName: string;
  timestamp: string;
  rowCount: number;
  status: "success" | "error";
  sheetUrl: string;
}
```

## ⚠️ Limitations (Demo Version)

- ❌ **Không có backend** - Dữ liệu chỉ lưu trên trình duyệt
- ❌ **Không có database** - Clear cache = mất dữ liệu
- ❌ **Không có authentication** - Login hardcoded admin/1234
- ❌ **AI Assistant là mock** - Chưa tích hợp AI thật
- ❌ **Giới hạn dữ liệu** - LocalStorage có limit ~5-10MB

## 🚧 Roadmap (Full Version)

- [ ] Backend API với Node.js/Express
- [ ] MongoDB database
- [ ] OAuth2 authentication (Google/Microsoft)
- [ ] Real AI integration (OpenAI/Gemini)
- [ ] Export PDF/Excel reports
- [ ] Email notifications
- [ ] Multi-user collaboration
- [ ] Mobile responsive optimization
- [ ] PWA support

## 📝 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại

## 👥 Contributors

- **Business Analyst** - Requirements & Planning
- **Frontend Developer** - React/TypeScript Implementation
- **UI/UX Designer** - Interface Design

## 📞 Support

- 📧 Email: support@vla-repair.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Docs: [Documentation](https://docs.vla-repair.com)

---

**Made with ❤️ by VLA Team**

🚀 **Happy Coding!** 🎉
