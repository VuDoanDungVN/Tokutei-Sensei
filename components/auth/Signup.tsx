import React, { useState, useContext } from 'react';
import { AppScreen } from '../../types';
import { AppContext } from '../../App';
import { authService } from '../../services/firebase';
import Card from '../shared/Card';
import Button from '../shared/Button';

const Signup: React.FC = () => {
    const { setCurrentScreen, t } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Validate form
            if (!fullName.trim()) {
                setError('Vui lòng nhập họ tên.');
                setLoading(false);
                return;
            }
            if (!email.trim()) {
                setError('Vui lòng nhập địa chỉ email.');
                setLoading(false);
                return;
            }
            if (!password.trim()) {
                setError('Vui lòng nhập mật khẩu.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Mật khẩu xác nhận không khớp.');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự.');
                setLoading(false);
                return;
            }

            // Create user account
            await authService.signUpWithEmail(email, password, fullName, phoneNumber);

            // Reset form
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setPassword('');
            setConfirmPassword('');

            // Show success dialog
            setShowSuccessDialog(true);
        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email này đã được sử dụng. Vui lòng sử dụng email khác.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email không hợp lệ. Vui lòng kiểm tra lại.');
            } else if (err.code === 'auth/weak-password') {
                setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.');
            } else {
                setError('Đã xảy ra lỗi, vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex flex-col justify-center p-6 bg-brand-bg relative">
            <div className="w-full max-w-sm mx-auto">
                <h1 className="text-3xl font-bold text-brand-blue-dark text-center mb-6">
                    {t('auth.signupTitle')}
                </h1>
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-brand-text-primary mb-1">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="Nhập họ và tên của bạn"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brand-text-primary mb-1">
                                {t('auth.emailLabel')} *
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="Nhập địa chỉ email"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-brand-text-primary mb-1">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="Nhập số điện thoại (không bắt buộc)"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-brand-text-primary mb-1">
                                {t('auth.passwordLabel')} *
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-text-primary mb-1">
                                Xác nhận mật khẩu *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="Nhập lại mật khẩu"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm text-center">{error}</p>
                            </div>
                        )}
                        <Button type="submit" disabled={loading}>
                            {loading ? '...' : t('auth.signupButton')}
                        </Button>
                    </form>
                </Card>
                <p className="text-center text-sm text-brand-text-secondary mt-4">
                    {t('auth.loginPrompt')}{' '}
                    <button
                        onClick={() => setCurrentScreen(AppScreen.Login)}
                        className="font-medium text-brand-blue hover:underline"
                    >
                        {t('auth.loginTitle')}
                    </button>
                </p>
            </div>

            {/* Success Dialog */}
            {showSuccessDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80 border-2 border-green-400">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Đăng ký thành công!</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Tài khoản của bạn đã được tạo thành công. Vui lòng kiểm tra email và click link xác thực để kích hoạt tài khoản.
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccessDialog(false);
                                    setCurrentScreen(AppScreen.Login);
                                }}
                                className="w-full btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;