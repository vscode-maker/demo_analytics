export interface RepairData {
  seq?: number;
  repair_no: string;
  ngay_gio_yeu_cau: string | Date;
  ngay_gio_vao_xuong?: string | Date;
  ngay_gio_hoan_thanh?: string | Date;
  ngay_cong_no?: string | Date;
  phuong_tien_can_sua_chua: string;
  tham_chieu?: string;
  lai_xe?: string;
  tuyen?: string;
  loai_phuong_tien: string;
  nhan_hieu?: string;
  phan_loai_sua_chua: string;
  hang_muc_sua_chua?: string;
  chi_tiet_sua_chua?: string;
  dau_hieu?: string;
  ngay_sua_chua_gan_nhat?: string | Date;
  km_di_duoc?: number;
  tu_choi_yeu_cau?: boolean;
  ghi_chu?: string;
  phan_xuong?: string;
  nguoi_nghiem_thu?: string;
  chi_phi_nhan_cong: number;
  chi_phi_vat_tu_ngoai?: number;
  ma_vat_tu?: string;
  so_luong_xuat?: number;
  don_gia?: number;
  thanh_toan_vat_tu_xnk: number;
  tong_chi_phi_truoc_vat: number;
  vat: number;
  tong_chi_phi_sau_vat: number;
  nam_san_xuat?: number;
  thang_cong_no?: string;
  ma_phuong_tien?: string;
  ma_tham_chieu?: string;
}

export interface ImportRecord {
  id: string;
  url: string;
  csvUrl?: string;
  sheetName: string;
  rowCount: number;
  columnCount?: number;
  data: RepairData[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
  loginAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  defaultDateRange: string;
  savedFilters: SavedFilter[];
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterParams;
  createdAt: string;
}

export interface FilterParams {
  dateRange?: [string, string];
  vehicleTypes?: string[];
  repairTypes?: string[];
  workshops?: string[];
  brands?: string[];
  costRange?: [number, number];
}

export interface DashboardStats {
  totalRepairs: number;
  totalCost: number;
  avgCost: number;
  avgRepairTime: number;
  pendingRepairs: number;
  overdueRate: number;
  trend?: {
    repairsTrend: number;
    costTrend: number;
  };
}
