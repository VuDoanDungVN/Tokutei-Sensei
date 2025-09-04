import React, { useState, useEffect, useContext } from 'react';
import { AppScreen } from '../../types';
import { AppContext } from '../../App';
import { appService } from '../../services/geminiService';
import Card from '../shared/Card';
import Button from '../shared/Button';

const Login: React.FC = () => {
  const { setCurrentScreen, t } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorCountdown, setErrorCountdown] = useState<number | null>(null);

  // Auto-hide error messages after 10 seconds
  useEffect(() => {
    if (error) {
      // Thêm delay nhỏ để đảm bảo error message được hiển thị
      const displayTimer = setTimeout(() => {
        setErrorCountdown(10);
        const timer = setTimeout(() => {
          setError(null);
          setErrorCountdown(null);
        }, 10000); // 10 seconds
        
        const countdownTimer = setInterval(() => {
          setErrorCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownTimer);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => {
          clearTimeout(timer);
          clearInterval(countdownTimer);
        };
      }, 100); // 100ms delay
      
      return () => {
        clearTimeout(displayTimer);
      };
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorCountdown(null);
    
    try {
      await appService.signInWithEmail(email, password);
      // Nếu đăng nhập thành công, onAuthStateChanged sẽ xử lý navigation
    } catch (err: any) {
      console.error('Authentication error:', err);
      // Provide more specific error messages
      if (err.code === 'auth/user-not-found') {
        setError('Tài khoản không tồn tại. Vui lòng kiểm tra lại email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
      } else if (err.message === 'EMAIL_NOT_VERIFIED') {
        setError(t('auth.emailNotVerified'));
      } else {
        setError(t('auth.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-brand-bg">
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-3xl font-bold text-brand-blue-dark text-center mb-6">{t('auth.loginTitle')}</h1>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text-primary mb-1">{t('auth.emailLabel')} *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Nhập địa chỉ email"
                style={{ fontSize: '13px' }}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-text-primary mb-1">{t('auth.passwordLabel')} *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                style={{ fontSize: '13px' }}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm text-center">{error}</p>
                {errorCountdown && (
                  <p className="text-red-500 text-xs text-center mt-1">
                    Thông báo sẽ tự động ẩn sau {errorCountdown} giây
                  </p>
                )}
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Chưa có tài khoản? 
                <button 
                  onClick={() => setCurrentScreen(AppScreen.Signup)}
                  className="text-brand-blue hover:underline ml-1"
                >
                  Đăng ký ngay
                </button>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  📧 Hướng dẫn xác thực email:
                </p>
                <p className="text-xs text-blue-600">
                  1. Đăng ký tài khoản mới<br/>
                  2. Kiểm tra email và click link xác thực<br/>
                  3. Quay lại đăng nhập
                </p>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? '...' : t('auth.loginButton')}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-brand-text-secondary mt-4">
          {t('auth.signupPrompt')}{' '}
          <button onClick={() => setCurrentScreen(AppScreen.Signup)} className="font-medium text-brand-blue hover:underline">
            {t('auth.signupTitle')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
