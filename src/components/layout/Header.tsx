import { Layout, Typography, Space, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined
} from '@ant-design/icons';
import { authService } from '../../services/authService';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const user = authService.getUser();
  
  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: onLogout
    }
  ];
  
  return (
    <AntHeader 
      style={{ 
        background: '#fff', 
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        height: 56,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
    >
      {/* Logo */}
      <img 
        src="https://vla.com.vn/wp-content/uploads/2023/10/342.png" 
        alt="VLA Logo"
        style={{ 
          height: 36,
          width: 'auto',
          objectFit: 'contain'
        }}
      />
      
      {/* User menu */}
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space size={8} style={{ cursor: 'pointer' }}>
          <Avatar size={28} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <Text style={{ fontSize: 13 }}>{user?.username || 'Admin'}</Text>
        </Space>
      </Dropdown>
    </AntHeader>
  );
};
