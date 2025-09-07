import React, { useState, useContext } from 'react';
import { AppScreen } from '../../types';
import { AppContext } from '../../App';
import { authService } from '../../services/firebase';
import Card from '../shared/Card';
import Button from '../shared/Button';

const Login: React.FC = () => {
  const { setCurrentScreen, t } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailVerificationWarning, setShowEmailVerificationWarning] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await authService.signInWithEmail(email, password);
      // If login successful, onAuthStateChanged will handle navigation to Dashboard
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setError('⚠️ Email chưa được xác thực! Vui lòng kiểm tra hộp thư email (bao gồm cả thư mục Spam) và click vào link xác thực trước khi đăng nhập. Nếu không tìm thấy email, hãy thử đăng ký lại.');
        setShowEmailVerificationWarning(true);
      } else if (err.code === 'auth/user-not-found') {
        setError('Tài khoản không tồn tại. Vui lòng kiểm tra lại email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
      } else {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Vui lòng nhập email trước khi gửi lại email xác thực.');
      return;
    }

    setResendLoading(true);
    setError(null);
    
    try {
      // Try to sign in first to get the user, then send verification
      await authService.signInWithEmail(email, password);
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        try {
          // User is signed in but not verified, send verification email
          await authService.sendEmailVerification();
          setError('✅ Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư email.');
          setShowEmailVerificationWarning(false);
        } catch (verificationError) {
          setError('❌ Không thể gửi email xác thực. Vui lòng thử lại sau.');
        }
      } else {
        setError('Vui lòng nhập đúng email và mật khẩu trước khi gửi lại email xác thực.');
      }
    } finally {
      setResendLoading(false);
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Only clear error if user is actively typing (not during form submission)
                  if (e.target.value !== email) {
                    setShowEmailVerificationWarning(false);
                    setError(null);
                  }
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Only clear error if user is actively typing (not during form submission)
                  if (e.target.value !== password) {
                    setShowEmailVerificationWarning(false);
                    setError(null);
                  }
                }}
                required
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                style={{ fontSize: '13px' }}
              />
            </div>
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
            {error && (
              <div className={`border rounded-lg p-3 ${error.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm text-center ${error.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>{error}</p>
              </div>
            )}
            
            {showEmailVerificationWarning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Email chưa được xác thực
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Để đăng nhập, bạn cần xác thực email trước. Hãy:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Kiểm tra hộp thư email (bao gồm thư mục Spam)</li>
                        <li>Click vào link xác thực trong email</li>
                        <li>Quay lại đăng nhập sau khi xác thực</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Button type="submit" disabled={loading}>
                {loading ? '...' : t('auth.loginButton')}
              </Button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await authService.refreshUser();
                  } catch (error) {
                    // Silent fail for refresh
                  }
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Đã xác thực email? Click để refresh
              </button>
            </div>
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
