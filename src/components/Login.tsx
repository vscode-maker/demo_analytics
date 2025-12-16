import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const handleLogin = (values: { username: string; password: string }) => {
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const success = authService.login(values.username, values.password);
      
      if (success) {
        message.success('Đăng nhập thành công!');
        onLoginSuccess();
      } else {
        message.error('Sai tên đăng nhập hoặc mật khẩu!');
      }
      
      setLoading(false);
    }, 500);
  };
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F97316 0%, #0369A1 100%)'
    }}>
      <Card style={{ width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img 
            src="https://vla.com.vn/wp-content/uploads/2023/10/342.png" 
            alt="VLA Logo" 
            style={{ height: 60, marginBottom: 16 }}
          />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>VLA Repair Analytics</h2>
          <p style={{ color: '#999', margin: '8px 0 0 0' }}>Demo Version - Phiên bản demo</p>
        </div>
        
        <Form 
          form={form}
          onFinish={handleLogin} 
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nhập: admin" 
              size="large"
              autoFocus
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập: 1234" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>
        
      </Card>
    </div>
  );
};
