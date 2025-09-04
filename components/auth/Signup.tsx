import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppScreen } from '../../types';
import { AppContext } from '../../App';
import { appService } from '../../services/geminiService';
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

    // Dialog state chung cho cả success và error
    const [dialogMessage, setDialogMessage] = useState<string | null>(null);
    const [dialogType, setDialogType] = useState<'success' | 'error' | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [shouldShowDialog, setShouldShowDialog] = useState(false);

    // Ref để track trạng thái đăng ký và tránh bị can thiệp bởi onAuthStateChanged
    const isSigningUpRef = useRef(false);
    const dialogDataRef = useRef<{ message: string, type: 'success' | 'error' } | null>(null);

    // Bảo vệ dialog state khỏi bị clear bởi re-render
    useEffect(() => {
        console.log('Dialog state changed:', { dialogMessage, dialogType, isSigningUp: isSigningUpRef.current });
        // Chỉ clear dialog nếu không đang trong quá trình đăng ký
        if (!isSigningUpRef.current && dialogMessage) {
            console.log('Dialog state protected from clearing');
        }
    }, [dialogMessage, dialogType]);

    // Handle shouldShowDialog để hiển thị dialog sau khi render
    useEffect(() => {
        if (shouldShowDialog && dialogDataRef.current) {
            console.log('shouldShowDialog is true, setting showDialog to true with data:', dialogDataRef.current);
            setDialogType(dialogDataRef.current.type);
            setDialogMessage(dialogDataRef.current.message);
            setShowDialog(true);
            setShouldShowDialog(false);
        }
    }, [shouldShowDialog]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Reset dialog trước
        setDialogMessage(null);
        setDialogType(null);

        try {
            if (!fullName.trim()) {
                setDialogType('error');
                setDialogMessage('Vui lòng nhập họ tên.');
                setLoading(false);
                return;
            }
            if (!email.trim()) {
                setDialogType('error');
                setDialogMessage('Vui lòng nhập địa chỉ email.');
                setLoading(false);
                return;
            }
            if (!password.trim()) {
                setDialogType('error');
                setDialogMessage('Vui lòng nhập mật khẩu.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setDialogType('error');
                setDialogMessage('Mật khẩu xác nhận không khớp.');
                setLoading(false);
                return;
            }

            await appService.signUpWithEmail(email, password, fullName, phoneNumber);

            // Reset form
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setPassword('');
            setConfirmPassword('');

            // Hiển thị dialog success ngay lập tức
            setDialogType('success');
            setDialogMessage('Đăng ký thành công! Vui lòng kiểm tra email và click link xác thực.');
        } catch (err: any) {
            setDialogType('error');
            if (err.code === 'auth/email-already-in-use') {
                setDialogMessage('Email này đã được sử dụng. Vui lòng sử dụng email khác.');
            } else {
                setDialogMessage('Đã xảy ra lỗi, vui lòng thử lại.');
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

            {/* Dialog chung cho cả success và error */}
            {console.log('Dialog state:', { dialogMessage, dialogType, showDialog, shouldShowDialog, dialogData: dialogDataRef.current, isSigningUp: isSigningUpRef.current })}
            {dialogMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div
                        className={`bg-white rounded-xl shadow-lg p-6 w-80 ${dialogType === 'success' ? 'border-green-400' : 'border-red-400'
                            } border-2`}
                    >
                        <p
                            className={`text-center mb-4 ${dialogType === 'success' ? 'text-green-700' : 'text-red-700'
                                }`}
                        >
                            {dialogMessage}
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={async () => {
                                    setDialogMessage(null);
                                    setDialogType(null);
                                    if (dialogType === 'success') {
                                        // SignOut user khi click "Xác nhận" để chờ email verification
                                        await appService.signOut();
                                        setCurrentScreen(AppScreen.Login);
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg text-white ${dialogType === 'success'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
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
