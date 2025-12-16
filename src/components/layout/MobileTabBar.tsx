import { FileTextOutlined, BarChartOutlined, CommentOutlined } from '@ant-design/icons';

interface MobileTabBarProps {
  activeTab: 'import' | 'report' | 'chat';
  onTabChange: (tab: 'import' | 'report' | 'chat') => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'import' as const, label: 'Import', icon: <FileTextOutlined /> },
    { key: 'report' as const, label: 'Báo cáo', icon: <BarChartOutlined /> },
    { key: 'chat' as const, label: 'Chat AI', icon: <CommentOutlined /> },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      background: '#fff',
      borderTop: '1px solid #e8eaed',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.08)'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
            color: activeTab === tab.key ? '#1890ff' : '#666',
            transition: 'all 0.3s',
            padding: '8px 0'
          }}
        >
          <div style={{ fontSize: 22 }}>
            {tab.icon}
          </div>
          <div style={{ 
            fontSize: 12, 
            fontWeight: activeTab === tab.key ? 600 : 400 
          }}>
            {tab.label}
          </div>
        </button>
      ))}
    </div>
  );
};
