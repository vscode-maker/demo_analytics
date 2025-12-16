import { Layout, Space } from 'antd';
import { ImportSheet } from '../import/ImportSheet';
import { ImportHistory } from '../import/ImportHistory';
import { useState, useEffect } from 'react';

const { Sider } = Layout;

interface LeftSidebarProps {
  onImportSuccess?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onImportSuccess }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Sider 
      width={isMobile ? '100%' : 320}
      style={{ 
        background: '#fff',
        borderRight: isMobile ? 'none' : '1px solid #f0f0f0',
        overflow: 'auto',
        height: isMobile ? '100%' : 'calc(100vh - 64px)',
        position: isMobile ? 'relative' : 'fixed',
        left: isMobile ? 'auto' : 0,
        top: isMobile ? 0 : 64
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
