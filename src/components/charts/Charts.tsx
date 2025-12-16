import { Row, Col, Card, Table } from 'antd';
import { ChartWrapper } from './ChartWrapper';
import { RepairData } from '../../types';
import * as echarts from 'echarts';

interface ChartsProps {
  data: RepairData[];
}

export const Charts: React.FC<ChartsProps> = ({ data }) => {
  // Helper function to parse cost
  const parseCost = (cost: any): number => {
    if (typeof cost === 'string') {
      return parseFloat(cost.replace(/,/g, '')) || 0;
    }
    return Number(cost) || 0;
  };
  
  // Helper function to parse date DD/MM/YYYY to YYYY-MM
  const parseDate = (dateStr: any): string => {
    if (!dateStr) return '';
    const str = String(dateStr);
    // Check if format is DD/MM/YYYY
    if (str.includes('/')) {
      const parts = str.split(' ')[0].split('/');
      if (parts.length === 3) {
        const [, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}`;
      }
    }
    return str.substring(0, 7);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M đ';
    }
    return value.toLocaleString('vi-VN') + ' đ';
  };
  
  // ===================== BIỂU ĐỒ 1: Chi phí theo tháng =====================
  const getMonthlyData = () => {
    const monthlyData = data.reduce((acc, item) => {
      const month = parseDate(item.ngay_gio_yeu_cau);
      if (month) {
        const cost = parseCost(item.tong_chi_phi_sau_vat);
        acc[month] = (acc[month] || 0) + cost;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const months = Object.keys(monthlyData).sort();
    return months.map(m => ({
      key: m,
      month: m,
      monthDisplay: (() => {
        const [year, month] = m.split('-');
        return `${month}/${year}`;
      })(),
      cost: monthlyData[m]
    }));
  };
  
  const getCostByMonthOption = (): echarts.EChartsOption => {
    const tableData = getMonthlyData();
    return {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: tableData.map(d => d.monthDisplay),
      },
      yAxis: { type: 'value', name: 'Chi phí (đ)' },
      series: [{
        data: tableData.map(d => d.cost),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24, 144, 255, 0.2)' }
      }]
    };
  };
  
  const monthlyTableColumns = [
    { title: 'Tháng', dataIndex: 'monthDisplay', key: 'month', width: 100 },
    { 
      title: 'Chi phí', 
      dataIndex: 'cost', 
      key: 'cost',
      render: (v: number) => formatCurrency(v),
      align: 'right' as const
    },
  ];
  
  // ===================== BIỂU ĐỒ 2: Phân loại sửa chữa =====================
  const getRepairTypeData = () => {
    const typeCount = data.reduce((acc, item) => {
      const type = item.phan_loai_sua_chua || 'Khác';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCount).map(([name, value]) => ({
      key: name,
      type: name,
      count: value,
      percent: ((value / data.length) * 100).toFixed(1) + '%'
    }));
  };
  
  const getRepairTypeOption = (): echarts.EChartsOption => {
    const tableData = getRepairTypeData();
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 10, top: 'center' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: tableData.map(d => ({ name: d.type, value: d.count })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };
  
  const repairTypeColumns = [
    { title: 'Loại sửa chữa', dataIndex: 'type', key: 'type' },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', align: 'right' as const, width: 80 },
    { title: 'Tỷ lệ', dataIndex: 'percent', key: 'percent', align: 'right' as const, width: 80 },
  ];
  
  // ===================== BIỂU ĐỒ 3: Top 10 xe sửa nhiều nhất =====================
  const getTopVehiclesData = () => {
    const vehicleCount = data.reduce((acc, item) => {
      const vehicle = item.phuong_tien_can_sua_chua || 'N/A';
      acc[vehicle] = (acc[vehicle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(vehicleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([vehicle, count], index) => ({
        key: vehicle,
        rank: index + 1,
        vehicle,
        count
      }));
  };
  
  const getTopVehiclesOption = (): echarts.EChartsOption => {
    const tableData = getTopVehiclesData();
    return {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: tableData.map(d => d.vehicle),
        axisLabel: { rotate: 45, fontSize: 10 }
      },
      yAxis: { type: 'value', name: 'Số lần sửa' },
      series: [{
        data: tableData.map(d => d.count),
        type: 'bar',
        itemStyle: { color: '#52c41a' }
      }]
    };
  };
  
  const topVehiclesColumns = [
    { title: '#', dataIndex: 'rank', key: 'rank', width: 40 },
    { title: 'Phương tiện', dataIndex: 'vehicle', key: 'vehicle', ellipsis: true },
    { title: 'Số lần', dataIndex: 'count', key: 'count', align: 'right' as const, width: 70 },
  ];
  
  // ===================== BIỂU ĐỒ 4: Chi phí theo phân xưởng =====================
  const getWorkshopData = () => {
    const workshopCost = data
      .filter(item => item.phan_xuong && !item.tu_choi_yeu_cau)
      .reduce((acc, item) => {
        const workshop = item.phan_xuong || 'Khác';
        const cost = parseCost(item.tong_chi_phi_sau_vat);
        if (!acc[workshop]) {
          acc[workshop] = { cost: 0, count: 0 };
        }
        acc[workshop].cost += cost;
        acc[workshop].count += 1;
        return acc;
      }, {} as Record<string, { cost: number; count: number }>);
    
    return Object.entries(workshopCost).map(([workshop, data]) => ({
      key: workshop,
      workshop,
      cost: data.cost,
      count: data.count,
      avgCost: data.cost / data.count
    }));
  };
  
  const getCostByWorkshopOption = (): echarts.EChartsOption => {
    const tableData = getWorkshopData();
    return {
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>Chi phí: ${item.value.toLocaleString('vi-VN')} đ`;
        }
      },
      xAxis: { type: 'category', data: tableData.map(d => d.workshop) },
      yAxis: { type: 'value', name: 'Tổng chi phí (đ)' },
      series: [{
        data: tableData.map(d => d.cost),
        type: 'bar',
        itemStyle: { color: '#faad14' },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return (params.value / 1000000).toFixed(1) + 'M';
          }
        }
      }]
    };
  };
  
  const workshopColumns = [
    { title: 'Phân xưởng', dataIndex: 'workshop', key: 'workshop' },
    { title: 'Số yêu cầu', dataIndex: 'count', key: 'count', align: 'right' as const, width: 90 },
    { 
      title: 'Tổng chi phí', 
      dataIndex: 'cost', 
      key: 'cost',
      render: (v: number) => formatCurrency(v),
      align: 'right' as const
    },
  ];
  
  // ===================== BIỂU ĐỒ 5: Chi phí nhân công vs Vật tư =====================
  const getLaborMaterialData = () => {
    const monthlyData = data
      .filter(item => !item.tu_choi_yeu_cau)
      .reduce((acc, item) => {
        const month = parseDate(item.ngay_gio_yeu_cau);
        if (month) {
          if (!acc[month]) {
            acc[month] = { labor: 0, material: 0 };
          }
          acc[month].labor += parseCost(item.chi_phi_nhan_cong);
          acc[month].material += parseCost(item.chi_phi_vat_tu_ngoai) + parseCost(item.thanh_toan_vat_tu_xnk);
        }
        return acc;
      }, {} as Record<string, { labor: number; material: number }>);
    
    const months = Object.keys(monthlyData).sort();
    return months.map(m => ({
      key: m,
      month: m,
      monthDisplay: (() => {
        const [year, month] = m.split('-');
        return `${month}/${year}`;
      })(),
      labor: monthlyData[m].labor,
      material: monthlyData[m].material,
      total: monthlyData[m].labor + monthlyData[m].material
    }));
  };
  
  const getLaborVsMaterialOption = (): echarts.EChartsOption => {
    const tableData = getLaborMaterialData();
    return {
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: { data: ['Nhân công', 'Vật tư'] },
      xAxis: {
        type: 'category',
        data: tableData.map(d => d.monthDisplay),
      },
      yAxis: { type: 'value', name: 'Chi phí (đ)' },
      series: [
        {
          name: 'Nhân công',
          type: 'bar',
          stack: 'total',
          data: tableData.map(d => d.labor),
          itemStyle: { color: '#1890ff' }
        },
        {
          name: 'Vật tư',
          type: 'bar',
          stack: 'total',
          data: tableData.map(d => d.material),
          itemStyle: { color: '#52c41a' }
        }
      ]
    };
  };
  
  const laborMaterialColumns = [
    { title: 'Tháng', dataIndex: 'monthDisplay', key: 'month', width: 80 },
    { 
      title: 'Nhân công', 
      dataIndex: 'labor', 
      key: 'labor',
      render: (v: number) => formatCurrency(v),
      align: 'right' as const
    },
    { 
      title: 'Vật tư', 
      dataIndex: 'material', 
      key: 'material',
      render: (v: number) => formatCurrency(v),
      align: 'right' as const
    },
    { 
      title: 'Tổng', 
      dataIndex: 'total', 
      key: 'total',
      render: (v: number) => formatCurrency(v),
      align: 'right' as const
    },
  ];
  
  // ===================== BIỂU ĐỒ 6: Tỷ lệ từ chối yêu cầu =====================
  const getRejectionData = () => {
    const approved = data.filter(item => !item.tu_choi_yeu_cau).length;
    const rejected = data.filter(item => item.tu_choi_yeu_cau === true).length;
    const total = approved + rejected;
    
    return [
      { 
        key: 'approved', 
        status: 'Chấp nhận', 
        count: approved,
        percent: total > 0 ? ((approved / total) * 100).toFixed(1) + '%' : '0%'
      },
      { 
        key: 'rejected', 
        status: 'Từ chối', 
        count: rejected,
        percent: total > 0 ? ((rejected / total) * 100).toFixed(1) + '%' : '0%'
      },
    ];
  };
  
  const getRejectionRateOption = (): echarts.EChartsOption => {
    const tableData = getRejectionData();
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: '60%',
        data: [
          { value: tableData[0].count, name: 'Chấp nhận', itemStyle: { color: '#52c41a' } },
          { value: tableData[1].count, name: 'Từ chối', itemStyle: { color: '#ff4d4f' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c} ({d}%)'
        }
      }]
    };
  };
  
  const rejectionColumns = [
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', align: 'right' as const },
    { title: 'Tỷ lệ', dataIndex: 'percent', key: 'percent', align: 'right' as const },
  ];
  
  if (data.length === 0) {
    return null;
  }
  
  // Table style
  const tableStyle = { 
    marginTop: 12,
    fontSize: 12
  };
  
  return (
    <Row gutter={[16, 16]}>
      {/* Biểu đồ 1: Chi phí theo tháng */}
      <Col xs={24} lg={12}>
        <Card size="small" style={{ height: '100%' }}>
          <ChartWrapper 
            title="📊 Chi phí sửa chữa theo tháng"
            option={getCostByMonthOption()}
            height={280}
          />
          <div style={tableStyle}>
            <Table 
              dataSource={getMonthlyData()}
              columns={monthlyTableColumns}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
              summary={(pageData) => {
                const total = pageData.reduce((sum, row) => sum + row.cost, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{formatCurrency(total)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </Card>
      </Col>
      
      {/* Biểu đồ 2: Phân loại sửa chữa */}
      <Col xs={24} lg={12}>
        <Card size="small" style={{ height: '100%' }}>
          <ChartWrapper 
            title="🔧 Phân loại sửa chữa"
            option={getRepairTypeOption()}
            height={280}
          />
          <div style={tableStyle}>
            <Table 
              dataSource={getRepairTypeData()}
              columns={repairTypeColumns}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
            />
          </div>
        </Card>
      </Col>
      
      {/* Biểu đồ 3: Top 10 xe */}
      <Col xs={24} lg={12}>
        <Card size="small" style={{ height: '100%' }}>
          <ChartWrapper 
            title="🚗 Top 10 phương tiện sửa nhiều nhất"
            option={getTopVehiclesOption()}
            height={280}
          />
          <div style={tableStyle}>
            <Table 
              dataSource={getTopVehiclesData()}
              columns={topVehiclesColumns}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
            />
          </div>
        </Card>
      </Col>
      
      {/* Biểu đồ 4: Chi phí theo phân xưởng */}
      <Col xs={24} lg={12}>
        <Card size="small" style={{ height: '100%' }}>
          <ChartWrapper 
            title="🏭 Chi phí theo phân xưởng"
            option={getCostByWorkshopOption()}
            height={280}
          />
          <div style={tableStyle}>
            <Table 
              dataSource={getWorkshopData()}
              columns={workshopColumns}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
              summary={(pageData) => {
                const totalCost = pageData.reduce((sum, row) => sum + row.cost, 0);
                const totalCount = pageData.reduce((sum, row) => sum + row.count, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><strong>{totalCount}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong>{formatCurrency(totalCost)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </Card>
      </Col>
      
      {/* Biểu đồ 5: Chi phí nhân công vs Vật tư */}
      <Col xs={24} lg={12}>
        <Card size="small" style={{ height: '100%' }}>
          <ChartWrapper 
            title="💰 Chi phí nhân công vs Vật tư"
            option={getLaborVsMaterialOption()}
            height={280}
          />
          <div style={tableStyle}>
            <Table 
              dataSource={getLaborMaterialData()}
              columns={laborMaterialColumns}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
              summary={(pageData) => {
                const totalLabor = pageData.reduce((sum, row) => sum + row.labor, 0);
                const totalMaterial = pageData.reduce((sum, row) => sum + row.material, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{formatCurrency(totalLabor)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong>{formatCurrency(totalMaterial)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <strong>{formatCurrency(totalLabor + totalMaterial)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </Card>
      </Col>
      
      {/* Biểu đồ 6: Tỷ lệ từ chối */}
      <Col xs={24} lg={12}>
        <Card size="small" style={{ height: '100%' }}>
          <ChartWrapper 
            title="📋 Tỷ lệ chấp nhận/từ chối yêu cầu"
            option={getRejectionRateOption()}
            height={280}
          />
          <div style={tableStyle}>
            <Table 
              dataSource={getRejectionData()}
              columns={rejectionColumns}
              size="small"
              pagination={false}
              summary={(pageData) => {
                const total = pageData.reduce((sum, row) => sum + row.count, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><strong>{total}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right"><strong>100%</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};
