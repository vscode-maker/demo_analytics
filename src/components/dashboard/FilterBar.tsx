import { Card, DatePicker, Select, Space, Button, Row, Col } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { useState } from 'react';

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface FilterValues {
  dateRange: [Dayjs, Dayjs] | null;
  vehicleType: string;
  repairType: string;
  garage: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
  vehicleTypes?: string[];
  repairTypes?: string[];
  garages?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  onFilterChange,
  vehicleTypes = [],
  repairTypes = [],
  garages = []
}) => {
  // Mặc định: không filter gì cả (hiển thị tất cả)
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: null, // NULL = không filter theo ngày
    vehicleType: 'all',
    repairType: 'all',
    garage: 'all'
  });
  
  const handleChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleReset = () => {
    const defaultFilters: FilterValues = {
      dateRange: null,
      vehicleType: 'all',
      repairType: 'all',
      garage: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <Card size="small">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span style={{ fontSize: 12, color: '#666' }}>Khoảng thời gian</span>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleChange('dateRange', dates)}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span style={{ fontSize: 12, color: '#666' }}>Loại xe</span>
            <Select
              value={filters.vehicleType}
              onChange={(value) => handleChange('vehicleType', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              {vehicleTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span style={{ fontSize: 12, color: '#666' }}>Loại sửa chữa</span>
            <Select
              value={filters.repairType}
              onChange={(value) => handleChange('repairType', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              {repairTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span style={{ fontSize: 12, color: '#666' }}>Garage</span>
            <Select
              value={filters.garage}
              onChange={(value) => handleChange('garage', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              {garages.map(garage => (
                <Option key={garage} value={garage}>{garage}</Option>
              ))}
            </Select>
          </Space>
        </Col>
        
        <Col xs={24} sm={24} md={8} lg={2}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            block
            style={{ marginTop: 20 }}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
