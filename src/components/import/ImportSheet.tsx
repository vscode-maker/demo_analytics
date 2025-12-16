import { useState } from 'react';
import { Form, Input, Button, message, Alert, Card } from 'antd';
import { LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { sheetService } from '../../services/sheetService';
import { useStore } from '../../store/useStore';

interface ImportSheetProps {
  onImportSuccess?: () => void;
}

export const ImportSheet: React.FC<ImportSheetProps> = ({ onImportSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { setActiveImport, toggleImportSelection, selectedImports } = useStore();
  
  const handleImport = async (values: { url: string }) => {
    setLoading(true);
    
    try {
      const result = await sheetService.importSheet(values.url);
      
      message.success(`Đã import ${result.rowCount} dòng dữ liệu thành công!`);
      form.resetFields();
      
      // Set as active import
      setActiveImport(result);
      
      // Tự động thêm vào selectedImports để gộp data
      // Nếu chưa có trong selectedImports thì toggle để thêm
      const isAlreadySelected = selectedImports.some(imp => imp.id === result.id);
      if (!isAlreadySelected) {
        toggleImportSelection(result);
      }
      
      if (onImportSuccess) {
        onImportSuccess();
      }
      
    } catch (error: any) {
      message.error(error.message || 'Import thất bại. Vui lòng kiểm tra URL và thử lại.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card title="📥 Import Google Sheets" size="small">
      <Alert 
        message="Hướng dẫn Import"
        description={
          <div>
            <ol style={{ marginBottom: 12, paddingLeft: 20, fontSize: 12 }}>
              <li>Mở Google Sheet của bạn</li>
              <li>Click "Chia sẻ" → "Mọi người có link" → Người xem</li>
              <li>Copy link và paste vào ô dưới đây</li>
              <li>Click "Import Sheet"</li>
            </ol>
            <div style={{ fontSize: 12, borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
              <strong>📋 Link mẫu để test:</strong>
              <div style={{ marginTop: 4 }}>
                <a 
                  href="https://docs.google.com/spreadsheets/d/108jShaWpMpli1l7izi0vWA7EHxONElC6sxmiJh7TDKI/edit?gid=0#gid=0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'block', marginBottom: 4, wordBreak: 'break-all' }}
                  onClick={(e) => {
                    e.preventDefault();
                    form.setFieldsValue({ url: 'https://docs.google.com/spreadsheets/d/108jShaWpMpli1l7izi0vWA7EHxONElC6sxmiJh7TDKI/edit?gid=0#gid=0' });
                  }}
                >
                  📄 Sheet mẫu 1 (click để dùng)
                </a>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1DNRGraoOMPf-4C-r7wOY_XSouJU1WR6BKE-Y6pipc-Y/edit?gid=842451919#gid=842451919" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'block', wordBreak: 'break-all' }}
                  onClick={(e) => {
                    e.preventDefault();
                    form.setFieldsValue({ url: 'https://docs.google.com/spreadsheets/d/1DNRGraoOMPf-4C-r7wOY_XSouJU1WR6BKE-Y6pipc-Y/edit?gid=842451919#gid=842451919' });
                  }}
                >
                  📄 Sheet mẫu 2 (click để dùng)
                </a>
              </div>
            </div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form form={form} onFinish={handleImport} layout="vertical">
        <Form.Item
          name="url"
          label="Google Sheets URL"
          rules={[
            { required: true, message: 'Vui lòng nhập URL Google Sheets' },
            { 
              pattern: /docs\.google\.com\/spreadsheets/,
              message: 'URL không hợp lệ'
            }
          ]}
        >
          <Input 
            prefix={<LinkOutlined />}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            size="large"
          />
        </Form.Item>
        
        <Form.Item style={{ marginBottom: 0 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<UploadOutlined />}
            block
            size="large"
            loading={loading}
          >
            {loading ? 'Đang import...' : 'Import Sheet'}
          </Button>
        </Form.Item>
      </Form>
      
      {loading && (
        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          <div>Đang tải dữ liệu từ Google Sheets...</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Vui lòng đợi...</div>
        </div>
      )}
    </Card>
  );
};
