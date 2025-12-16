import { Layout, Input, Button, Avatar, Space, Typography, Empty, Alert } from 'antd';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { sheetService } from '../../services/sheetService';
import { aiService } from '../../services/aiService';

const { Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const RightChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { activeImport, selectedImports } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check if có dữ liệu (từ multi-select hoặc single)
  const hasData = selectedImports.length > 0 || (activeImport && activeImport.status === 'completed');
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Lấy dữ liệu từ selectedImports (gộp) hoặc activeImport
      let repairData: any[] = [];
      
      if (selectedImports.length > 0) {
        // Gộp dữ liệu từ tất cả imports được chọn
        const importIds = selectedImports
          .filter(imp => imp.status === 'completed')
          .map(imp => imp.id);
        repairData = sheetService.getMergedRepairData(importIds);
      } else if (activeImport) {
        repairData = sheetService.getRepairData(activeImport.id);
      }
      
      // Gọi OpenAI API
      const response = await aiService.sendMessage(input, repairData);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Sider 
      width={isMobile ? '100%' : 340}
      style={{ 
        background: '#f8f9fa',
        borderLeft: isMobile ? 'none' : '1px solid #e8eaed',
        height: isMobile ? '100%' : 'calc(100vh - 56px)',
        position: isMobile ? 'relative' : 'fixed',
        right: isMobile ? 'auto' : 0,
        top: isMobile ? 0 : 56,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Wrapper để flex hoạt động đúng vì ant-layout-sider-children không có display flex */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%' 
      }}>
        {/* Chat Header */}
        <div style={{ 
          padding: 16, 
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          flexShrink: 0
        }}>
        <Space>
          <Avatar icon={<RobotOutlined />} style={{ backgroundColor: aiService.isConfigured() ? '#52c41a' : '#999' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              AI Assistant XNK {aiService.isConfigured() ? '🟢' : '⚪'}
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {aiService.isConfigured() ? 'GPT-4o Mini' : 'Chưa cấu hình API'}
            </Text>
          </div>
        </Space>
      </div>
      
        {/* Messages Container */}
        <div style={{ 
          flex: 1, 
          padding: 16, 
          overflowY: 'auto',
          background: '#f5f5f5',
          minHeight: 0
        }}>
        {!aiService.isConfigured() && (
          <Alert
            message="API Key chưa được cấu hình"
            description="Thêm VITE_OPENAI_API_KEY vào file .env.local để sử dụng AI"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {messages.length === 0 ? (
          <Empty 
            description={
              <div style={{ fontSize: 12 }}>
                <div>Chào mừng đến AI Assistant XNK!</div>
                <div style={{ marginTop: 8, color: '#999' }}>
                  {hasData 
                    ? `Đang phân tích ${selectedImports.length > 1 ? selectedImports.length + ' file gộp' : '1 file'}. Hỏi bất kỳ điều gì...`
                    : 'Import dữ liệu để bắt đầu hỏi AI'}
                </div>
              </div>
            }
            image={<RobotOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          />
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {messages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: msg.role === 'user' ? '#1890ff' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  fontSize: 13,
                  whiteSpace: 'pre-line',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#fff',
                  fontSize: 13
                }}>
                  <Text type="secondary">AI đang trả lời...</Text>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Space>
          )}
        </div>
        
        {/* Input Area */}
        <div style={{ 
          padding: 16, 
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
          flexShrink: 0
        }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={hasData ? "Hỏi AI về dữ liệu sửa chữa..." : "Import dữ liệu trước khi chat..."}
            autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={loading || !hasData}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim() || !hasData}
          >
            Gửi
          </Button>
        </Space.Compact>
        {hasData && (
          <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
            💡 Shift + Enter để xuống dòng
          </Text>
          )}
        </div>
      </div>
    </Sider>
  );
};
