import React, { useState, useCallback, useMemo, useContext, useEffect, useRef } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import PracticeTopics from './components/PracticeTopics';
import QuizView from './components/QuizView';
import Results from './components/Results';
import Analytics from './components/Analytics';
import Community from './components/Community';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/shared/BottomNav';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { AppScreen, UserSettings, ExamResult, Topic, Question, User } from './types';
import { translations } from './constants';
import { appService } from './services/geminiService';
import { HomeIcon, PracticeIcon, AnalyticsIcon, CommunityIcon, AdminIcon } from './components/shared/BottomNav';


// --- Authentication Screens ---


// --- Main App Components ---

const Sidebar: React.FC<{ activeScreen: AppScreen, user: User | null }> = ({ activeScreen, user }) => {
  const { setCurrentScreen, t } = useContext(AppContext);
  let navItems = [
    { screen: AppScreen.Dashboard, label: t('nav.home'), icon: <HomeIcon /> },
    { screen: AppScreen.Practice, label: t('nav.practice'), icon: <PracticeIcon /> },
    { screen: AppScreen.Analytics, label: t('nav.analytics'), icon: <AnalyticsIcon /> },
    { screen: AppScreen.Community, label: t('nav.community'), icon: <CommunityIcon /> },
  ];

  if (user?.role === 'admin-pro') {
    navItems.push({ screen: AppScreen.Admin, label: t('nav.admin'), icon: <AdminIcon /> });
  }


  const handleLogout = async () => {
    await appService.signOut();
    setCurrentScreen(AppScreen.Login); // Redirect to login after signout
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-4 shrink-0">
        <div className="font-bold text-xl text-brand-blue-dark">Mora Sensei</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-2 p-4 pt-0">
          {navItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => setCurrentScreen(item.screen)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeScreen === item.screen ? 'bg-brand-blue-light text-brand-blue-dark' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >
              <div className="h-6 w-6 mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200">
        {/* User Info */}
        <div className="mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-slate-700">
                {user?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-slate-500">
                {user?.email}
              </div>
              {user?.phoneNumber && (
                <div className="text-xs text-slate-500">
                  {user.phoneNumber}
                </div>
              )}
              <div className="text-xs text-brand-blue">
                {user?.role === 'admin-pro' ? 'Admin' : user?.role === 'user-pro' ? 'Pro User' : 'User'}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

// App Context
export const AppContext = React.createContext<{
  setCurrentScreen: (screen: AppScreen) => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  setLastResult: (result: ExamResult | null) => void;
  lastResult: ExamResult | null;
  setSelectedTopic: (topic: Topic | null) => void;
  selectedTopic: Topic | null;
  startMockExam: () => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  user: User | null;
  startPracticeQuiz: (topic: Topic, examNumber: number) => Promise<void>;
}>({
  setCurrentScreen: () => { },
  settings: { language: 'vi', level: 'Practice', examDate: '', weeklyStudyTime: 5 },
  setSettings: () => { },
  setLastResult: () => { },
  lastResult: null,
  setSelectedTopic: () => { },
  selectedTopic: null,
  startMockExam: () => { },
  t: (key: string) => key,
  user: null,
  startPracticeQuiz: async () => { },
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Onboarding);
  const [settings, setSettings] = useState<UserSettings>({
    language: 'vi',
    level: 'Practice',
    examDate: new Date().toISOString().split('T')[0],
    weeklyStudyTime: 5,
  });
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const unsubscribe = appService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Kiểm tra email đã được xác minh chưa
        if (firebaseUser.emailVerified) {
          // If user is logged in and email verified, but we are on an unauth screen, move to dashboard.
          if ([AppScreen.Onboarding, AppScreen.Login, AppScreen.Signup].includes(currentScreen)) {
            setCurrentScreen(AppScreen.Dashboard);
          }
        } else {
          // Nếu email chưa được xác minh, KHÔNG signOut ở đây
          // Để Signup.tsx tự handle signOut sau khi user click "Xác nhận"
          console.log('User email not verified, waiting for verification');
          // KHÔNG signOut ở đây
        }
      } else {
        if (![AppScreen.Onboarding, AppScreen.Login, AppScreen.Signup].includes(currentScreen)) {
          setCurrentScreen(AppScreen.Login);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const lang = settings.language;
    const keys = key.split('.');
    let result: any = translations[lang];
    try {
      for (const k of keys) {
        result = result[k];
      }
      if (typeof result === 'string' && replacements) {
        let replacedString = result;
        for (const rKey in replacements) {
          replacedString = replacedString.replace(`{${rKey}}`, String(replacements[rKey]));
        }
        return replacedString;
      }
      return result || key;
    } catch (e) {
      return key;
    }
  }, [settings.language]);

  const startMockExam = useCallback(() => {
    // This would fetch random questions from firestore in a real scenario
    console.log("Mock exam started - using local data for now.");
    // setQuizQuestions(MOCK_QUESTIONS);
    setCurrentScreen(AppScreen.Quiz);
  }, []);

  const startPracticeQuiz = useCallback(async (topic: Topic, examNumber: number) => {
    try {
      const questions = await appService.getPracticeQuestions(examNumber, topic.title);
      setQuizQuestions(questions);
      setSelectedTopic(topic);
      setCurrentScreen(AppScreen.Quiz);
    } catch (error) {
      console.error("Failed to fetch practice questions:", error);
      // Optionally, show an error to the user
      setQuizQuestions([]); // Clear questions on error
    }
  }, []);

  const handleSetSelectedTopic = useCallback((topic: Topic | null) => {
    // This function seems to be called from the topic list, which doesn't have examNumber
    // We'll need to adjust the UI to pass the examNumber to startPracticeQuiz
    // For now, this function is effectively disabled until the UI is updated.
    // startPracticeQuiz(topic);
    setSelectedTopic(topic);
  }, []);

  const contextValue = useMemo(() => ({
    setCurrentScreen,
    settings,
    setSettings,
    setLastResult,
    lastResult,
    setSelectedTopic: handleSetSelectedTopic,
    selectedTopic,
    startMockExam,
    t,
    user,
    startPracticeQuiz,
  }), [settings, lastResult, selectedTopic, startMockExam, handleSetSelectedTopic, t, user, startPracticeQuiz]);

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.Dashboard: return <Dashboard />;
      case AppScreen.Practice: return <PracticeTopics />;
      case AppScreen.Quiz: return <QuizView questions={quizQuestions} isMockExam={!selectedTopic} />;
      case AppScreen.Results: return <Results />;
      case AppScreen.Analytics: return <Analytics />;
      case AppScreen.Community: return <Community />;
      case AppScreen.Admin: return user?.role === 'admin-pro' ? <AdminPanel /> : <Dashboard />; // Protected Route
      default: return <Dashboard />;
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue"></div></div>;
  }

  return (
    <AppContext.Provider value={contextValue}>
      {!user ? (
        // Unauthenticated screens
        <>
          {currentScreen === AppScreen.Onboarding && <Onboarding />}
          {currentScreen === AppScreen.Login && <Login />}
          {currentScreen === AppScreen.Signup && <Signup />}
          {/* Default to Onboarding if state is somehow wrong */}
          {![AppScreen.Onboarding, AppScreen.Login, AppScreen.Signup].includes(currentScreen) && <Onboarding />}
        </>
      ) : (
        // Authenticated screens
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text-primary flex">
          <div className="hidden md:block">
            <Sidebar activeScreen={currentScreen} user={user} />
          </div>
          <main className="flex-grow max-w-4xl mx-auto md:pb-0 pb-20 w-full">
            {renderScreen()}
          </main>
          <div className="md:hidden">
            {![AppScreen.Quiz, AppScreen.Results].includes(currentScreen) && <BottomNav activeScreen={currentScreen} user={user} />}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export default App;