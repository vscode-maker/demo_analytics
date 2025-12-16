import { Row, Col, Card, Statistic } from 'antd';
import { 
  CarOutlined, 
  DollarOutlined, 
  ToolOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { RepairData } from '../../types';

interface StatCardsProps {
  data: RepairData[];
}

export const StatCards: React.FC<StatCardsProps> = ({ data }) => {
  // Tính toán thống kê
  const totalRecords = data.length;
  
  // Xử lý chi phí (có thể là string với dấu phẩy)
  const parseCost = (cost: any): number => {
    if (typeof cost === 'string') {
      return parseFloat(cost.replace(/,/g, '')) || 0;
    }
    return Number(cost) || 0;
  };
  
  const totalCost = data.reduce((sum, item) => sum + parseCost(item.tong_chi_phi_sau_vat), 0);
  
  // Đếm số xe unique
  const uniqueVehicles = new Set(data.map(item => item.phuong_tien_can_sua_chua).filter(Boolean)).size;
  
  // Tính thời gian sửa chữa trung bình (từ vào xưởng đến hoàn thành)
  const repairTimesInHours = data
    .filter(item => item.ngay_gio_vao_xuong && item.ngay_gio_hoan_thanh)
    .map(item => {
      const start = new Date(item.ngay_gio_vao_xuong as string);
      const end = new Date(item.ngay_gio_hoan_thanh as string);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
    })
    .filter(hours => hours > 0 && hours < 1000); // Filter invalid values
  
  const avgRepairTime = repairTimesInHours.length > 0
    ? repairTimesInHours.reduce((sum, h) => sum + h, 0) / repairTimesInHours.length
    : 0;
  
  const stats = [
    {
      title: 'Tổng số yêu cầu',
      value: totalRecords,
      icon: <ToolOutlined />,
      color: '#1890ff',
      suffix: 'yêu cầu'
    },
    {
      title: 'Số phương tiện',
      value: uniqueVehicles,
      icon: <CarOutlined />,
      color: '#52c41a',
      suffix: 'xe'
    },
    {
      title: 'Tổng chi phí',
      value: totalCost,
      icon: <DollarOutlined />,
      color: '#faad14',
      suffix: 'đ',
      precision: 0
    },
    {
      title: 'Thời gian TB',
      value: avgRepairTime,
      icon: <ClockCircleOutlined />,
      color: '#ff4d4f',
      suffix: 'giờ',
      precision: 1
    }
  ];
  
  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card>
            <Statistic
              title={stat.title}
              value={stat.value}
              suffix={stat.suffix}
              precision={stat.precision}
              valueStyle={{ color: stat.color }}
              prefix={
                <div style={{ 
                  fontSize: 24, 
                  color: stat.color,
                  marginRight: 8,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  {stat.icon}
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
