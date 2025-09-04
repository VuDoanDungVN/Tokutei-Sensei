import React, { useContext } from 'react';
import { AppContext } from '../App';
import Button from './shared/Button';
import { Language, AppScreen } from '../types';

const Onboarding: React.FC = () => {
  const { settings, setSettings, setCurrentScreen, t } = useContext(AppContext);

  const languages: { code: Language, name: string }[] = [
      { code: 'vi', name: 'Tiếng Việt' },
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' }
  ];

  const handleContinue = () => {
    setCurrentScreen(AppScreen.Login);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-white">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-brand-blue-dark text-center mb-2">{t('onboarding.welcome')}</h1>
        <p className="text-center text-brand-text-secondary mb-8">{t('onboarding.subtitle')}</p>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
           <div>
              <h2 className="text-xl font-bold mb-4 text-center">{t('onboarding.selectLanguage')}</h2>
              <div className="space-y-3 mb-6">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSettings(s => ({ ...s, language: lang.code }))}
                    className={`w-full p-3 rounded-lg border-2 transition font-medium text-center ${settings.language === lang.code ? 'bg-brand-blue text-white border-brand-blue font-bold' : 'bg-white text-brand-text-primary border-gray-300 hover:border-brand-blue'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
              <Button onClick={handleContinue}>{t('onboarding.next')}</Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
