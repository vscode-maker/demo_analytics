import { Layout, Space } from 'antd';
import { ImportSheet } from '../import/ImportSheet';
import { ImportHistory } from '../import/ImportHistory';

const { Sider } = Layout;

interface LeftSidebarProps {
  onImportSuccess?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onImportSuccess }) => {
  return (
    <Sider 
      width={320} 
      style={{ 
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64
      }}
    >
      <div style={{ padding: 16 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <ImportSheet onImportSuccess={onImportSuccess} />
          <ImportHistory onHistoryChange={onImportSuccess} />
        </Space>
      </div>
    </Sider>
  );
};
