# 📋 Google Sheets Template Guide

## Cấu trúc bảng dữ liệu mẫu

### Columns (Cột) bắt buộc:

| Column Name     | Mô tả                      | Ví dụ                         |
| --------------- | -------------------------- | ----------------------------- |
| `repairDate`    | Ngày sửa chữa (YYYY-MM-DD) | 2024-01-15                    |
| `vehicleNumber` | Biển số xe                 | 29A-12345                     |
| `vehicleType`   | Loại xe                    | Bus, Truck, Car, Van          |
| `repairType`    | Loại sửa chữa              | Engine, Brake, Tire, Electric |
| `garage`        | Garage thực hiện           | Garage A, Garage B            |
| `cost`          | Chi phí (số)               | 1500                          |
| `description`   | Mô tả chi tiết             | Thay dầu động cơ              |

## 📝 Mẫu dữ liệu (Copy vào Google Sheets)

```
repairDate	vehicleNumber	vehicleType	repairType	garage	cost	description
2024-01-15	29A-12345	Bus	Engine	Garage A	1500	Thay dầu động cơ
2024-01-16	30B-67890	Truck	Brake	Garage B	800	Thay má phanh
2024-01-17	51C-11111	Car	Tire	Garage A	400	Thay lốp xe
2024-01-18	29A-12345	Bus	Electric	Garage C	1200	Sửa hệ thống điện
2024-01-20	30B-67890	Truck	Engine	Garage A	2000	Đại tu động cơ
2024-01-22	51D-22222	Van	Brake	Garage B	600	Thay dầu phanh
2024-01-25	29A-12345	Bus	Tire	Garage A	1600	Thay 4 lốp
2024-02-01	30B-67890	Truck	Electric	Garage C	900	Thay ắc quy
2024-02-05	51C-11111	Car	Engine	Garage A	1100	Bảo dưỡng định kỳ
2024-02-10	29A-54321	Bus	Brake	Garage B	1400	Thay phanh tay
2024-02-15	30B-67890	Truck	Tire	Garage A	700	Vá lốp và cân bằng
2024-02-20	51D-22222	Van	Engine	Garage C	1800	Thay phớt động cơ
2024-03-01	29A-12345	Bus	Electric	Garage A	500	Thay đèn chiếu sáng
2024-03-05	30B-67890	Truck	Brake	Garage B	950	Thay đĩa phanh
2024-03-10	51C-11111	Car	Tire	Garage A	450	Thay lốp dự phòng
2024-03-15	29A-54321	Bus	Engine	Garage C	2200	Sửa chữa động cơ lớn
2024-03-20	30B-67890	Truck	Electric	Garage A	750	Kiểm tra hệ thống điện
2024-03-25	51D-22222	Van	Brake	Garage B	650	Bảo dưỡng phanh
2024-04-01	29A-12345	Bus	Tire	Garage A	1700	Thay lốp trước
2024-04-05	30B-67890	Truck	Engine	Garage C	1900	Thay dây curoa
```

## 🔗 Hướng dẫn tạo và chia sẻ Google Sheet

### Bước 1: Tạo Google Sheet mới

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Click **Blank** (Tạo bảng tính mới)
3. Đặt tên file: `VLA Repair Data`

### Bước 2: Nhập dữ liệu

1. Copy bảng dữ liệu mẫu ở trên
2. Paste vào Sheet (Ctrl+V)
3. Đảm bảo dòng đầu tiên là tên cột

### Bước 3: Chia sẻ Sheet

1. Click nút **Share** (góc trên phải)
2. Chọn **Anyone with the link** → **Viewer**
3. Click **Copy link**
4. Paste link vào VLA Repair Report

### ✅ URL hợp lệ có dạng:

```
https://docs.google.com/spreadsheets/d/1abc...xyz/edit?usp=sharing
```

## 🎯 Tips & Best Practices

### ✅ DO (Nên làm):

- Giữ tên cột chính xác (phân biệt hoa thường)
- Sử dụng định dạng ngày: `YYYY-MM-DD` (2024-01-15)
- Nhập số cho cột `cost` (không có ký tự đặc biệt)
- Kiểm tra dữ liệu trước khi import

### ❌ DON'T (Không nên):

- Thêm/xóa cột bắt buộc
- Để trống các ô quan trọng (repairDate, vehicleNumber, cost)
- Sử dụng định dạng ngày khác (DD/MM/YYYY sẽ bị lỗi)
- Nhập chữ vào cột `cost`

## 📊 Loại xe (vehicleType) phổ biến:

- `Bus` - Xe buýt
- `Truck` - Xe tải
- `Car` - Xe con
- `Van` - Xe van
- `Motorcycle` - Xe máy

## 🔧 Loại sửa chữa (repairType) phổ biến:

- `Engine` - Động cơ
- `Brake` - Phanh
- `Tire` - Lốp xe
- `Electric` - Điện
- `Transmission` - Hộp số
- `Suspension` - Hệ thống treo
- `Cooling` - Làm mát
- `Fuel` - Nhiên liệu

## 🏭 Garage phổ biến:

- `Garage A` - Garage trung tâm
- `Garage B` - Garage khu vực 1
- `Garage C` - Garage khu vực 2
- `External` - Garage bên ngoài

## 🆘 Troubleshooting

### Lỗi: "URL không hợp lệ"

- Kiểm tra URL có chứa `docs.google.com/spreadsheets`
- Đảm bảo Sheet đã được chia sẻ public (Anyone with the link)

### Lỗi: "Import thất bại"

- Kiểm tra tên cột có chính xác không
- Đảm bảo có dữ liệu (ít nhất 1 dòng)
- Thử refresh trình duyệt và import lại

### Lỗi: "CORS blocked"

- Đảm bảo Sheet đã được share với **Anyone with the link**
- Kiểm tra Sheet không bị restrict bởi organization

## 📌 Example Sheet Link

Sử dụng sheet mẫu này để test:

```
https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]/edit?usp=sharing
```

---

**Need help?** Contact: support@vla-repair.com
