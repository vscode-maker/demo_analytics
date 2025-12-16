import { useState, useEffect } from 'react';
import { Layout, Space, Empty } from 'antd';
import { Header } from './layout/Header';
import { LeftSidebar } from './layout/LeftSidebar';
import { RightChatPanel } from './layout/RightChatPanel';
import { StatCards } from './dashboard/StatCards';
import { FilterBar, FilterValues } from './dashboard/FilterBar';
import { Charts } from './charts/Charts';
import { sheetService } from '../services/sheetService';
import { useStore } from '../store/useStore';
import { RepairData } from '../types';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Enable custom parse format for DD/MM/YYYY
dayjs.extend(customParseFormat);

const { Content } = Layout;

/**
 * Helper: Parse date from Vietnamese format (DD/MM/YYYY HH:mm:ss)
 */
const parseVietnameseDate = (dateStr: string | Date | undefined): dayjs.Dayjs | null => {
  if (!dateStr) return null;
  
  if (dateStr instanceof Date) {
    return dayjs(dateStr);
  }
  
  const str = String(dateStr).trim();
  
  // Try multiple formats
  const formats = [
    'DD/MM/YYYY HH:mm:ss',
    'DD/MM/YYYY HH:mm',
    'DD/MM/YYYY',
    'D/M/YYYY HH:mm:ss',
    'D/M/YYYY HH:mm',
    'D/M/YYYY',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD',
    'MM/DD/YYYY',
  ];
  
  for (const fmt of formats) {
    const parsed = dayjs(str, fmt, true); // strict mode
    if (parsed.isValid()) {
      return parsed;
    }
  }
  
  // Fallback: let dayjs try auto-parse
  const fallback = dayjs(str);
  return fallback.isValid() ? fallback : null;
};

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { activeImport, selectedImports } = useStore();
  const [filteredData, setFilteredData] = useState<RepairData[]>([]);
  const [allData, setAllData] = useState<RepairData[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);
  
  // Load dữ liệu từ selected imports (gộp nhiều file)
  useEffect(() => {
    if (selectedImports.length > 0) {
      // Gộp dữ liệu từ tất cả imports được chọn
      const importIds = selectedImports
        .filter(imp => imp.status === 'completed')
        .map(imp => imp.id);
      
      if (importIds.length > 0) {
        const data = sheetService.getMergedRepairData(importIds);
        setAllData(data);
        setFilteredData(data);
      } else {
        setAllData([]);
        setFilteredData([]);
      }
    } else if (activeImport && activeImport.status === 'completed') {
      // Fallback: nếu chưa chọn multi, dùng activeImport
      const data = sheetService.getRepairData(activeImport.id);
      setAllData(data);
      setFilteredData(data);
    } else {
      setAllData([]);
      setFilteredData([]);
    }
  }, [activeImport, selectedImports]);
  
  // Xử lý filter
  const handleFilterChange = (filters: FilterValues) => {
    setActiveFilters(filters);
    let filtered = [...allData];
    
    // Filter theo ngày - sử dụng parseVietnameseDate
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(item => {
        const date = parseVietnameseDate(item.ngay_gio_yeu_cau);
        if (!date) return true; // Giữ lại nếu không parse được ngày
        return date.isAfter(start.startOf('day').subtract(1, 'second')) && 
               date.isBefore(end.endOf('day').add(1, 'second'));
      });
    }
    
    // Filter theo loại xe
    if (filters.vehicleType && filters.vehicleType !== 'all') {
      filtered = filtered.filter(item => item.loai_phuong_tien === filters.vehicleType);
    }
    
    // Filter theo loại sửa chữa
    if (filters.repairType && filters.repairType !== 'all') {
      filtered = filtered.filter(item => item.phan_loai_sua_chua === filters.repairType);
    }
    
    // Filter theo garage/phân xưởng
    if (filters.garage && filters.garage !== 'all') {
      filtered = filtered.filter(item => item.phan_xuong === filters.garage);
    }
    
    console.log(`🔍 Filter applied: ${allData.length} → ${filtered.length} records`);
    setFilteredData(filtered);
  };
  
  // Lấy danh sách unique values cho filters
  const vehicleTypes = Array.from(new Set(allData.map(d => d.loai_phuong_tien).filter((v): v is string => Boolean(v))));
  const repairTypes = Array.from(new Set(allData.map(d => d.phan_loai_sua_chua).filter((v): v is string => Boolean(v))));
  const garages = Array.from(new Set(allData.map(d => d.phan_xuong).filter((v): v is string => Boolean(v))));
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header onLogout={onLogout} />
      
      <Layout style={{ marginTop: 56 }}>
        <LeftSidebar onImportSuccess={() => {
          // Reload data sau khi import
          const history = sheetService.getImportHistory();
          if (history.length > 0 && history[0].status === 'completed') {
            const data = sheetService.getRepairData(history[0].id);
            setAllData(data);
            setFilteredData(data);
          }
        }} />
        
        <Content 
          style={{ 
            marginLeft: 320,
            marginRight: 340,
            padding: 24,
            background: '#f0f2f5',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          {/* Trường hợp 1: Chưa import dữ liệu */}
          {allData.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 400,
              background: '#fff',
              borderRadius: 8
            }}>
              <Empty 
                description={
                  <div>
                    <div style={{ fontSize: 16, marginBottom: 8 }}>
                      Chưa có dữ liệu
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      Import Google Sheets từ thanh bên trái để bắt đầu
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <FilterBar 
                onFilterChange={handleFilterChange}
                vehicleTypes={vehicleTypes}
                repairTypes={repairTypes}
                garages={garages}
              />
              
              {/* Trường hợp 2: Có dữ liệu nhưng filter không có kết quả */}
              {filteredData.length === 0 ? (
                <div style={{ 
                  background: '#fff',
                  borderRadius: 8,
                  padding: 40
                }}>
                  <Empty 
                    description={
                      <div>
                        <div style={{ fontSize: 16, marginBottom: 8, color: '#faad14' }}>
                          ⚠️ Không có dữ liệu phù hợp với bộ lọc
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                          {activeFilters?.dateRange && (
                            <div>📅 Thời gian: {activeFilters.dateRange[0]?.format('DD/MM/YYYY')} - {activeFilters.dateRange[1]?.format('DD/MM/YYYY')}</div>
                          )}
                          {activeFilters?.vehicleType && activeFilters.vehicleType !== 'all' && (
                            <div>🚗 Loại xe: {activeFilters.vehicleType}</div>
                          )}
                          {activeFilters?.repairType && activeFilters.repairType !== 'all' && (
                            <div>🔧 Loại sửa chữa: {activeFilters.repairType}</div>
                          )}
                          {activeFilters?.garage && activeFilters.garage !== 'all' && (
                            <div>🏭 Garage: {activeFilters.garage}</div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          Tổng số: {allData.length.toLocaleString()} bản ghi | Thử điều chỉnh bộ lọc hoặc bấm Reset
                        </div>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <StatCards data={filteredData} />
                  <Charts data={filteredData} />
                </>
              )}
            </Space>
          )}
        </Content>
        
        <RightChatPanel />
      </Layout>
    </Layout>
  );
};
