import { User } from '../types';

const DEMO_USER = {
  username: 'admin',
  password: '1234'
};

export const authService = {
  login(username: string, password: string): boolean {
    if (username === DEMO_USER.username && password === DEMO_USER.password) {
      const user: User = {
        username: DEMO_USER.username,
        isLoggedIn: true,
        loginAt: new Date().toISOString()
      };
      
      localStorage.setItem('vla_user', JSON.stringify(user));
      return true;
    }
    return false;
  },
  
  logout(): void {
    localStorage.removeItem('vla_user');
    localStorage.removeItem('vla_active_import');
  },
  
  isAuthenticated(): boolean {
    const user = localStorage.getItem('vla_user');
    if (!user) return false;
    
    try {
      const parsed: User = JSON.parse(user);
      return parsed.isLoggedIn === true;
    } catch {
      return false;
    }
  },
  
  getUser(): User | null {
    const user = localStorage.getItem('vla_user');
    if (!user) return null;
    
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
};
