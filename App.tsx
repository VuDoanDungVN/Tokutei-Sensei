import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react';
import './styles/themes.css';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Tokutei from './components/Tokutei';
import PracticeTopics from './components/PracticeTopics';
import QuizView from './components/QuizView';
import Results from './components/Results';
import Analytics from './components/Analytics';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/shared/BottomNav';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { AppScreen, UserSettings, ExamResult, Topic, Question } from './types';
import { translations } from './constants';
import { authService } from './services/firebase';
import { questionService } from './services/questionService';
import { User } from 'firebase/auth';
import { HomeIcon, TokuteiIcon, PracticeIcon, AnalyticsIcon, AdminIcon } from './components/shared/BottomNav';
import Chatbot from './components/shared/Chatbot';
import Settings from './components/shared/Settings';
import { useTheme } from './hooks/useTheme';
import { notificationService } from './services/notificationService';
import { soundService } from './services/soundService';


// --- Authentication Screens ---


// --- Main App Components ---

const Sidebar: React.FC<{ activeScreen: AppScreen, user: User | null }> = ({ activeScreen, user }) => {
  const { setCurrentScreen, t, sidebarOpen, setSidebarOpen } = useContext(AppContext);
  let navItems = [
    { screen: AppScreen.Dashboard, label: t('nav.home'), icon: <HomeIcon /> },
    { screen: AppScreen.Tokutei, label: 'Tokutei', icon: <TokuteiIcon /> },
    { screen: AppScreen.Practice, label: t('nav.practice'), icon: <PracticeIcon /> },
    { screen: AppScreen.Analytics, label: t('nav.analytics'), icon: <AnalyticsIcon /> },
  ];

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentScreen(AppScreen.Login); // Redirect to login after signout
  };

  return (
    <aside className={`${sidebarOpen ? 'w-16 md:w-64' : 'w-0'} bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 overflow-hidden`}>
      <div className="p-2 md:p-4 shrink-0 flex items-center justify-between">
        <div className="font-bold text-lg md:text-xl text-brand-blue-dark text-center md:text-left">
          {sidebarOpen && (
            <>
              <span className="hidden md:inline">Mora Sensei</span>
              <span className="md:hidden">MS</span>
            </>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title={sidebarOpen ? 'Đóng sidebar' : 'Mở sidebar'}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>
      {sidebarOpen && (
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1 md:space-y-2 p-2 md:p-4 pt-0">
            {navItems.map((item) => (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center w-full px-2 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeScreen === item.screen ? 'bg-brand-blue-light text-brand-blue-dark' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                title={item.label}
              >
                <div className="h-5 w-5 md:h-6 md:w-6 mx-auto md:mr-3 md:mx-0">{item.icon}</div>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
      {sidebarOpen && (
        <div className="p-2 md:p-4 border-t border-slate-200">
          {/* User Info */}
          <div className="mb-2 md:mb-3 p-2 md:p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center mb-1 md:mb-2">
              <div className="h-6 w-6 md:h-8 md:w-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium mx-auto md:mx-0">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-0 md:ml-3 hidden md:block">
                <div className="text-sm font-medium text-slate-700">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.email}
                </div>
                <div className="text-xs text-brand-blue">
                  {user?.emailVerified ? 'Verified' : 'Unverified'}
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-2 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title={t('nav.logout')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mx-auto md:mr-3 md:mx-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">{t('nav.logout')}</span>
          </button>
        </div>
      )}
    </aside>
  );
};

// App Context
export const AppContext = React.createContext<{
  setCurrentScreen: (screen: AppScreen) => void;
  currentScreen: AppScreen;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  setLastResult: (result: ExamResult | null) => void;
  lastResult: ExamResult | null;
  setSelectedTopic: (topic: Topic | null) => void;
  selectedTopic: Topic | null;
  selectedExamNumber: number | null;
  setSelectedExamNumber: (examNumber: number | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  startMockExam: () => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  startPracticeQuiz: (topic: Topic, examNumber: number) => Promise<void>;
  user: User | null;
  setSettingsOpen: (open: boolean) => void;
}>({
  setCurrentScreen: () => { },
  currentScreen: AppScreen.Onboarding,
  settings: { language: 'vi', level: 'Practice', examDate: '', weeklyStudyTime: 5 },
  setSettings: () => { },
  setLastResult: () => { },
  lastResult: null,
  setSelectedTopic: () => { },
  selectedTopic: null,
  selectedExamNumber: null,
  setSelectedExamNumber: () => { },
  sidebarOpen: true,
  setSidebarOpen: () => { },
  startMockExam: () => { },
  t: (key: string) => key,
  startPracticeQuiz: async () => { },
  user: null,
  setSettingsOpen: () => { },
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Onboarding);
  
  
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('mora-sensei-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          language: parsed.language || 'vi',
          level: parsed.level || 'Practice',
          examDate: parsed.examDate || new Date().toISOString().split('T')[0],
          weeklyStudyTime: parsed.weeklyStudyTime || 5,
          // New settings with defaults
          theme: parsed.theme || 'light',
          fontSize: parsed.fontSize || 'medium',
          autoSave: parsed.autoSave !== undefined ? parsed.autoSave : true,
          notifications: parsed.notifications !== undefined ? parsed.notifications : true,
          soundEnabled: parsed.soundEnabled !== undefined ? parsed.soundEnabled : true,
          studyReminders: parsed.studyReminders !== undefined ? parsed.studyReminders : true,
          compactMode: parsed.compactMode !== undefined ? parsed.compactMode : false,
        };
      } catch (error) {
        console.warn('Failed to parse saved settings:', error);
      }
    }
    return {
      language: 'vi',
      level: 'Practice',
      examDate: new Date().toISOString().split('T')[0],
      weeklyStudyTime: 5,
      // New settings with defaults
      theme: 'light',
      fontSize: 'medium',
      autoSave: true,
      notifications: true,
      soundEnabled: true,
      studyReminders: true,
      compactMode: false,
    };
  });
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedExamNumber, setSelectedExamNumber] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Apply theme and other settings
  useTheme(settings);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mora-sensei-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize notification and sound services
  useEffect(() => {
    // Set sound service state
    soundService.setEnabled(settings.soundEnabled);
    
    // Request notification permission if enabled
    if (settings.notifications) {
      notificationService.requestPermission();
    }
  }, [settings.soundEnabled, settings.notifications]);


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
      // Load questions from Firestore
      const user = authService.getCurrentUser();
      if (!user) {
        alert('Vui lòng đăng nhập để làm bài kiểm tra');
        return;
      }

      // Map topic to subject category
      const getSubjectCategory = (topicTitle: string) => {
        if (topicTitle.includes('Nền tảng nhân văn') || topicTitle.includes('xã hội')) {
          return 'Nền tảng nhân văn và xã hội';
        } else if (topicTitle.includes('y học') || topicTitle.includes('tâm lý')) {
          return 'Kiến thức y học và tâm lý';
        } else if (topicTitle.includes('chuyên ngành') || topicTitle.includes('điều dưỡng')) {
          return 'Kiến thức chuyên ngành điều dưỡng';
        } else {
          return 'Tổng hợp';
        }
      };

      const subject = getSubjectCategory(topic.title);
      
      // Get questions for the specific exam number and topic
      let questions = [];
      try {
        console.log(`🎯 Loading questions for:`, {
          examNumber,
          subject,
          topicId: topic.id,
          topicTitle: topic.title,
          userId: user.uid
        });
        
        // First check if exam period exists
        const examPeriod = await questionService.getExamPeriodOnly(user.uid, examNumber);
        if (!examPeriod) {
          console.log('❌ No exam period found for exam', examNumber);
          questions = [];
        } else {
          console.log('✅ Exam period found:', examPeriod);
          
          // Get debug info
          const debugInfo = await questionService.getQuestionDebugInfo(user.uid, examNumber, topic.id);
          console.log('🔍 Debug info:', debugInfo);
          
          questions = await questionService.getQuestionsByTopic(
            examNumber,
            subject,
            topic.id, // Use the specific topic ID
            50,
            user.uid,
            true // use cache
          );
          console.log(`📝 Loaded ${questions.length} questions for topic ${topic.id}`);
        }
      } catch (error) {
        console.error('❌ Failed to load questions for exam', examNumber, 'topic', topic.id, ':', error);
      }

      // Don't fallback to simple collection - only use questions from current exam period

      if (questions.length === 0) {
        // Get debug info to show more details
        const debugInfo = await questionService.getQuestionDebugInfo(user.uid, examNumber, topic.id);
        
        let message = `Chưa có câu hỏi nào cho "${topic.title}" trong Kỳ thi ${examNumber}.`;
        
        if (debugInfo.examPeriodExists) {
          message += `\n\nThông tin debug:\n- Tổng câu hỏi trong kỳ thi: ${debugInfo.totalQuestions}\n- Câu hỏi theo topic: ${JSON.stringify(debugInfo.questionsByTopic, null, 2)}`;
        } else {
          message += `\n\nKỳ thi ${examNumber} chưa được tạo. Hãy upload ảnh đề thi trước!`;
        }
        
        alert(message);
        return;
      }

      // Convert Firestore questions to QuizView format
      const convertedQuestions = questions.map(q => ({
        id: q.id || `q_${Date.now()}_${Math.random()}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || '',
        topic: q.topic,
        examNumber: examNumber
      }));

      // Set topic with loaded questions
      const topicWithQuestions = {
        ...topic,
        questions: convertedQuestions
      };

      setSelectedTopic(topicWithQuestions);
      setQuizQuestions(convertedQuestions); // Set quiz questions state
      setCurrentScreen(AppScreen.Quiz);
    } catch (error) {
      console.error('Error starting practice quiz:', error);
      alert('Có lỗi xảy ra khi tải câu hỏi. Vui lòng thử lại.');
    }
  }, []);

  const handleSetSelectedTopic = useCallback((topic: Topic | null) => {
    // This function seems to be called from the topic list, which doesn't have examNumber
    // We'll need to adjust the UI to pass the examNumber to startPracticeQuiz
    // For now, this function is effectively disabled until the UI is updated.
    // startPracticeQuiz(topic);
    setSelectedTopic(topic);
  }, []);

  // Check if language is already set and skip onboarding if needed
  useEffect(() => {
    const savedSettings = localStorage.getItem('mora-sensei-settings');
    if (savedSettings && currentScreen === AppScreen.Onboarding) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.language) {
          // Language is already set, go to login
          setCurrentScreen(AppScreen.Login);
        }
      } catch (error) {
        console.warn('Failed to parse saved settings:', error);
      }
    }
  }, []); // Remove currentScreen dependency to prevent conflicts

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Update last login in Firestore (non-blocking)
        authService.updateLastLogin(firebaseUser.uid).catch(error => {
          console.warn('Failed to update last login:', error);
        });
        
        // Check if email is verified
        if (firebaseUser.emailVerified) {
          // If user is logged in and email verified, move to dashboard
          if ([AppScreen.Onboarding, AppScreen.Login, AppScreen.Signup].includes(currentScreen)) {
            setCurrentScreen(AppScreen.Dashboard);
          }
        } else {
          // If email not verified, redirect to login
          setCurrentScreen(AppScreen.Login);
        }
      } else {
        // If no user, only redirect if we're on a protected screen
        if (![AppScreen.Onboarding, AppScreen.Login, AppScreen.Signup].includes(currentScreen)) {
          setCurrentScreen(AppScreen.Login);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []); // Remove currentScreen dependency to prevent conflicts

  const contextValue = useMemo(() => ({
    setCurrentScreen,
    currentScreen,
    settings,
    setSettings,
    setLastResult,
    lastResult,
    setSelectedTopic: handleSetSelectedTopic,
    selectedTopic,
    selectedExamNumber,
    setSelectedExamNumber,
    sidebarOpen,
    setSidebarOpen,
    startMockExam,
    t,
    startPracticeQuiz,
    user,
    setSettingsOpen,
  }), [setCurrentScreen, currentScreen, settings, setSettings, setLastResult, lastResult, handleSetSelectedTopic, selectedTopic, selectedExamNumber, sidebarOpen, setSidebarOpen, startMockExam, t, startPracticeQuiz, user, setSettingsOpen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.Dashboard: return <Dashboard />;
      case AppScreen.Tokutei: return <Tokutei />;
      case AppScreen.Practice: return <PracticeTopics />;
      case AppScreen.Quiz: return <QuizView questions={selectedTopic?.questions || quizQuestions} isMockExam={!selectedTopic} />;
      case AppScreen.Results: return <Results />;
      case AppScreen.Analytics: return <Analytics />;
      case AppScreen.Admin: return <AdminPanel />;
      default: return <Dashboard />;
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {!user || !user.emailVerified ? (
        // Unauthenticated or unverified screens
        <>
          {currentScreen === AppScreen.Onboarding && <Onboarding />}
          {currentScreen === AppScreen.Login && <Login />}
          {currentScreen === AppScreen.Signup && <Signup />}
          {/* Default to Onboarding if state is somehow wrong */}
          {![AppScreen.Onboarding, AppScreen.Login, AppScreen.Signup].includes(currentScreen) && <Onboarding />}
        </>
      ) : (
        // Authenticated and verified screens
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text-primary">
          <Sidebar activeScreen={currentScreen} user={user} />
          <main className={`${sidebarOpen ? 'ml-16 md:ml-64' : 'ml-0'} min-h-screen transition-all duration-300`}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Mở sidebar"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
              {renderScreen()}
            </div>
          </main>
          <Chatbot />
          
          {/* Settings Modal */}
          <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </AppContext.Provider>
  );
};

export default App;