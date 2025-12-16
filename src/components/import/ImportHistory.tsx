import { useState, useEffect } from 'react';
import { List, Card, Button, Tag, Popconfirm, Empty, Space, Checkbox, Tooltip, Badge } from 'antd';
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, FileOutlined, MergeCellsOutlined, ClearOutlined } from '@ant-design/icons';
import { useStore } from '../../store/useStore';
import { sheetService } from '../../services/sheetService';

interface ImportHistoryProps {
  onHistoryChange?: () => void;
}

export const ImportHistory: React.FC<ImportHistoryProps> = ({ onHistoryChange }) => {
  const { activeImport, setActiveImport, selectedImports, toggleImportSelection, clearSelection } = useStore();
  const [history, setHistory] = useState(sheetService.getImportHistory());
  
  // Reload history khi activeImport thay đổi
  useEffect(() => {
    setHistory(sheetService.getImportHistory());
  }, [activeImport]);
  
  const handleDelete = (id: string) => {
    sheetService.deleteImport(id);
    const updatedHistory = sheetService.getImportHistory();
    setHistory(updatedHistory);
    
    // Clear từ selectedImports nếu có
    const updatedSelected = selectedImports.filter(imp => imp.id !== id);
    if (updatedSelected.length !== selectedImports.length) {
      // Trigger reselection logic
      if (activeImport?.id === id) {
        setActiveImport(updatedHistory[0] || null);
      }
    }
    
    // Trigger callback to refresh parent
    if (onHistoryChange) {
      onHistoryChange();
    }
  };
  
  const handleSelect = (importRecord: any) => {
    // Toggle selection cho multi-select
    toggleImportSelection(importRecord);
  };
  
  const isSelected = (id: string) => selectedImports.some(imp => imp.id === id);
  
  // Tính tổng số dòng từ các file đã chọn
  const totalSelectedRows = selectedImports.reduce((sum, imp) => sum + (imp.rowCount || 0), 0);
  
  if (history.length === 0) {
    return (
      <Card title="📋 Lịch sử Import" size="small">
        <Empty 
          description="Chưa có dữ liệu import"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }
  
  return (
    <Card 
      title={
        <Space>
          <span>📋 Lịch sử Import</span>
          {selectedImports.length > 0 && (
            <Badge 
              count={`${selectedImports.length} file`} 
              style={{ backgroundColor: '#52c41a' }} 
            />
          )}
        </Space>
      }
      size="small"
      extra={
        selectedImports.length > 0 && (
          <Tooltip title="Bỏ chọn tất cả">
            <Button 
              type="text" 
              size="small" 
              icon={<ClearOutlined />}
              onClick={clearSelection}
            />
          </Tooltip>
        )
      }
    >
      {/* Thông tin gộp data */}
      {selectedImports.length > 1 && (
        <div style={{ 
          background: '#e6f7ff', 
          padding: '8px 12px', 
          borderRadius: 6, 
          marginBottom: 12,
          fontSize: 12,
          border: '1px solid #91d5ff'
        }}>
          <Space>
            <MergeCellsOutlined style={{ color: '#1890ff' }} />
            <span>
              <strong>{selectedImports.length}</strong> file đã chọn • 
              <strong> {totalSelectedRows.toLocaleString()}</strong> dòng gộp
            </span>
          </Space>
        </div>
      )}
      
      <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
        💡 Tick chọn nhiều file để gộp dữ liệu phân tích
      </div>
      
      <List
        dataSource={history}
        size="small"
        renderItem={(item) => (
          <List.Item
            key={item.id}
            style={{
              background: isSelected(item.id) ? '#e6f7ff' : 'transparent',
              border: isSelected(item.id) ? '1px solid #91d5ff' : '1px solid transparent',
              padding: '8px 12px',
              borderRadius: 4,
              marginBottom: 4,
              cursor: 'pointer'
            }}
            onClick={() => handleSelect(item)}
            actions={[
              <Popconfirm
                title="Xóa import này?"
                description="Dữ liệu sẽ bị xóa vĩnh viễn"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(item.id);
                }}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Space>
                  <Checkbox 
                    checked={isSelected(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSelect(item)}
                  />
                  <FileOutlined style={{ fontSize: 18, color: isSelected(item.id) ? '#1890ff' : '#999' }} />
                </Space>
              }
              title={
                <Space size={4}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {item.sheetName || 'Sheet Import'}
                  </span>
                  {item.status === 'completed' ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      {item.rowCount} dòng
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>Lỗi</Tag>
                  )}
                </Space>
              }
              description={
                <div style={{ fontSize: 11, color: '#999' }}>
                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
