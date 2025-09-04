import React from 'react';
import { TopicCategory } from './types';

// Icons
const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5V3.935m-14 0A10.003 10.003 0 0112 2a10.003 10.003 0 017 1.935M5.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
  </svg>
);

const LawBookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 13a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 13a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9 9 9 0 01-9 9zM12 21V19M9.5 15.5V18M14.5 15.5V18M7 11.5L4.5 13M17 11.5L19.5 13" />
  </svg>
);

const WheelchairIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V8a2 2 0 00-2-2H9a2 2 0 00-2 2v8m4 0h5M9 16H4a2 2 0 01-2-2V8a2 2 0 012-2h1.5a2 2 0 012 2m0 0l-1 4m-4 4a5 5 0 100-10 5 5 0 000 10zm10 0a5 5 0 100-10 5 5 0 000 10z" />
  </svg>
);

// Hierarchical Practice Categories
export const PRACTICE_CATEGORIES: TopicCategory[] = [
  {
    id: 'human-social',
    titleKey: 'practice.categories.humanSocial.title',
    japaneseTitle: '人間と社会',
    topics: [
      { id: 'dignity', titleKey: 'practice.categories.humanSocial.dignity', title: '人間の尊厳と自立', icon: BrainIcon, progress: 0, questionsAttempted: 0 },
      { id: 'relationships', titleKey: 'practice.categories.humanSocial.relationships', title: '人間関係とコミュニケーション', icon: BrainIcon, progress: 0, questionsAttempted: 0 },
      { id: 'society', titleKey: 'practice.categories.humanSocial.society', title: '社会の理解', icon: LawBookIcon, progress: 0, questionsAttempted: 0 },
    ],
  },
  {
    id: 'mind-body',
    titleKey: 'practice.categories.mindBody.title',
    japaneseTitle: 'こころとからだのしくみ',
    topics: [
      { id: 'structure', titleKey: 'practice.categories.mindBody.structure', title: 'こころとからだのしくみ', icon: StethoscopeIcon, progress: 0, questionsAttempted: 0 },
      { id: 'aging', titleKey: 'practice.categories.mindBody.aging', title: '発達と老化の理解', icon: StethoscopeIcon, progress: 0, questionsAttempted: 0 },
      { id: 'dementia', titleKey: 'practice.categories.mindBody.dementia', title: '認知症の理解', icon: BrainIcon, progress: 0, questionsAttempted: 0 },
      { id: 'disability', titleKey: 'practice.categories.mindBody.disability', title: '障害の理解', icon: WheelchairIcon, progress: 0, questionsAttempted: 0 },
      { id: 'medical-care', titleKey: 'practice.categories.mindBody.medicalCare', title: '医療的ケア', icon: StethoscopeIcon, progress: 0, questionsAttempted: 0 },
    ],
  },
  {
    id: 'nursing-care',
    titleKey: 'practice.categories.nursingCare.title',
    japaneseTitle: '介護',
    topics: [
      { id: 'care-basics', titleKey: 'practice.categories.nursingCare.careBasics', title: '介護の基本', icon: StethoscopeIcon, progress: 0, questionsAttempted: 0 },
      { id: 'comm-skills', titleKey: 'practice.categories.nursingCare.commSkills', title: 'コミュニケーション技術', icon: BrainIcon, progress: 0, questionsAttempted: 0 },
      { id: 'life-support', titleKey: 'practice.categories.nursingCare.lifeSupport', title: '生活支援技術', icon: WheelchairIcon, progress: 0, questionsAttempted: 0 },
      { id: 'care-process', titleKey: 'practice.categories.nursingCare.careProcess', title: '介護過程', icon: LawBookIcon, progress: 0, questionsAttempted: 0 },
    ],
  },
  {
    id: 'comprehensive',
    titleKey: 'practice.categories.comprehensive.title',
    japaneseTitle: '総合問題',
    topics: [
      { id: 'comprehensive-ex', titleKey: 'practice.categories.comprehensive.exercise', title: '総合問題', icon: LawBookIcon, progress: 0, questionsAttempted: 0 },
    ],
  },
];


// Translations
export const translations: any = {
  ja: {
    nav: { home: "ホーム", practice: "練習", analytics: "進捗", community: "コミュニティ", admin: "管理", logout: "ログアウト" },
    onboarding: {
      welcome: "ようこそ Mora",
      subtitle: "成功への準備をしましょう。",
      selectLanguage: "言語を選択",
      chooseLevel: "試験レベルを選択",
      setGoals: "目標を設定",
      examDate: "試験日",
      studyTime: "週間学習時間 (時間)",
      hoursPerWeek: "時間/週",
      next: "次へ",
      back: "戻る",
      startLearning: "アカウントを作成",
    },
    auth: {
      loginTitle: "ログイン",
      signupTitle: "アカウント作成",
      emailLabel: "メールアドレス",
      passwordLabel: "パスワード",
      loginButton: "ログイン",
      signupButton: "登録",
      loginPrompt: "すでにアカウントをお持ちですか？",
      signupPrompt: "アカウントをお持ちでないですか？",
      error: "エラーが発生しました。もう一度お試しください。"
    },
    dashboard: {
      greeting: "こんにちは！",
      subtitle: "介護福祉士試験の準備はできましたか？",
      progress: "あなたの進捗",
      daysLeft: "残り日数",
      practiceByTopic: "トピック別練習",
      flashcards: "フラッシュカード",
      startMockExam: "模擬試験を開始",
      streak: "日連続！",
      notifications: "通知",
      mockExamScheduled: "明日、模擬試験が予定されています",
      reviewNotes: "ノートの復習を忘れずに！",
    },
    practice: {
      selectExamTitle: "試験回を選択",
      examN: "第{n}回",
      backToSelection: "試験選択に戻る",
      questionsAttempted: "問解答済み",
      start: "開始",
      progress: "進捗",
      categories: {
        humanSocial: {
          title: "人間と社会",
          dignity: "人間の尊厳と自立",
          relationships: "人間関係とコミュニケーション",
          society: "社会の理解",
        },
        mindBody: {
          title: "こころとからだのしくみ",
          structure: "こころとからだのしくみ",
          aging: "発達と老化の理解",
          dementia: "認知症の理解",
          disability: "障害の理解",
          medicalCare: "医療的ケア",
        },
        nursingCare: {
          title: "介護",
          careBasics: "介護の基本",
          commSkills: "コミュニケーション技術",
          lifeSupport: "生活支援技術",
          careProcess: "介護過程",
        },
        comprehensive: {
          title: "総合問題",
          exercise: "総合問題",
        },
      },
    },
    quiz: {
      mockExam: "模擬試験",
      practice: "練習",
      question: "問題",
      of: "/",
      explanation: "解説",
      checkAnswer: "答えを確認",
      next: "次へ",
      finish: "終了",
      noQuestions: "利用可能な質問はありません。",
      backToDashboard: "ダッシュボードに戻る",
    },
    results: {
      title: "試験結果",
      passed: "おめでとうございます、合格です！",
      failed: "練習を続けてください、きっとできます！",
      correct: "正解",
      incorrect: "不正解",
      time: "時間",
      recommendedTopics: "おすすめのトピック",
      review: "復習",
      practiceMore: "もっと練習する",
      backToDashboard: "ダッシュボードに戻る",
    },
    analytics: {
      title: "進捗の追跡",
    },
    community: {
      title: "AIチューター (Mora Sensei)",
      welcome: "こんにちは！私はMora Senseiです。介護福祉士試験について何でも聞いてください。",
      placeholder: "Mora Senseiに質問する...",
    },
    admin: {
      title: "管理: OCRインポート",
      uploadTitle: "スキャンした試験をアップロード",
      uploadSubtitle: "試験問題の画像（JPG、PNG）またはPDFをアップロードしてください。AIが自動的に問題を抽出します。",
      preview: "プレビュー",
      extract: "問題を抽出",
      processing: "処理中...",
      analyzing: "AIがドキュメントを分析しています...",
      extractedQuestions: "抽出された問題",
      save: "問題を保存",
      examNumberLabel: "試験回 (例: 37)",
      saveSuccess: "質問が正常に保存されました！",
      saveError: "質問の保存中にエラーが発生しました。",
      saving: "保存中...",
    },
    topics: { // Legacy keys, might be used in analytics
      fundamentals: "介護の基本",
      communication: "コミュニケーション技術",
      lifeSupport: "生活支援技術",
      mindBody: "こころとからだのしくみ",
      medical: "医療的ケア",
      comprehensive: "総合問題",
    },
  },
  en: {
    nav: { home: "Home", practice: "Practice", analytics: "Tracking", community: "Community", admin: "Admin", logout: "Logout" },
    onboarding: {
      welcome: "Welcome to Mora",
      subtitle: "Let's set you up for success.",
      selectLanguage: "Select Language",
      chooseLevel: "Choose Exam Level",
      setGoals: "Set Your Goals",
      examDate: "Exam Date",
      studyTime: "Weekly Study Time (hours)",
      hoursPerWeek: "hours/week",
      next: "Next",
      back: "Back",
      startLearning: "Create Account",
    },
    auth: {
      loginTitle: "Login",
      signupTitle: "Create Account",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      loginButton: "Login",
      signupButton: "Sign Up",
      loginPrompt: "Already have an account?",
      signupPrompt: "Don't have an account?",
      error: "An error occurred. Please try again."
    },
    dashboard: {
      greeting: "Hello!",
      subtitle: "Ready to ace your Kaigo Fukushi exam?",
      progress: "Your Progress",
      daysLeft: "days left",
      practiceByTopic: "Practice by Topic",
      flashcards: "Flashcards",
      startMockExam: "Start Mock Exam",
      streak: "Day Streak!",
      notifications: "Notifications",
      mockExamScheduled: "Mock exam scheduled for tomorrow",
      reviewNotes: "Don't forget to review your notes!",
    },
    practice: {
      selectExamTitle: "Select Exam Session",
      examN: "Exam No. {n} (第{n}回)",
      backToSelection: "Back to Selection",
      questionsAttempted: "questions attempted",
      start: "Start",
      progress: "Progress",
       categories: {
        humanSocial: {
          title: "Human & Social Foundations",
          dignity: "Human Dignity & Independence",
          relationships: "Human Relationships & Communication",
          society: "Understanding Society",
        },
        mindBody: {
          title: "Medical & Psychological Knowledge",
          structure: "Mind & Body Structure",
          aging: "Understanding Development & Aging",
          dementia: "Understanding Dementia",
          disability: "Understanding Disabilities",
          medicalCare: "Medical Care",
        },
        nursingCare: {
          title: "Specialized Nursing Care",
          careBasics: "Fundamentals of Nursing Care",
          commSkills: "Communication Techniques",
          lifeSupport: "Life Support Techniques",
          careProcess: "Nursing Care Process",
        },
        comprehensive: {
          title: "Comprehensive",
          exercise: "Comprehensive Exercises",
        },
      },
    },
    quiz: {
      mockExam: "Mock Exam",
      practice: "Practice",
      question: "Question",
      of: "of",
      explanation: "Explanation",
      checkAnswer: "Check Answer",
      next: "Next",
      finish: "Finish",
      noQuestions: "No questions available.",
      backToDashboard: "Back to Dashboard",
    },
    results: {
      title: "Exam Results",
      passed: "Congratulations, you passed!",
      failed: "Keep practicing, you can do it!",
      correct: "Correct",
      incorrect: "Incorrect",
      time: "Time",
      recommendedTopics: "Recommended Topics",
      review: "Review",
      practiceMore: "Practice More",
      backToDashboard: "Back to Dashboard",
    },
    analytics: {
      title: "Progress Tracking",
    },
    community: {
      title: "Mora Sensei",
      welcome: "Hello! I am Mora Sensei. Ask me anything about the Kaigo Fukushi exam.",
      placeholder: "Ask Mora Sensei...",
    },
    admin: {
      title: "Admin: OCR Import",
      uploadTitle: "Upload Scanned Exam",
      uploadSubtitle: "Upload an image (JPG, PNG) or a PDF of an exam paper. The AI will extract the questions automatically.",
      preview: "Preview",
      extract: "Extract Questions",
      processing: "Processing...",
      analyzing: "AI is analyzing the document...",
      extractedQuestions: "Extracted Questions",
      save: "Save Questions",
      examNumberLabel: "Exam Number (e.g., 37)",
      saveSuccess: "Questions saved successfully!",
      saveError: "An error occurred while saving questions.",
      saving: "Saving...",
    },
    topics: { // Legacy keys
      fundamentals: "Fundamentals of Care",
      communication: "Communication Skills",
      lifeSupport: "Life Support Technology",
      mindBody: "Mind and Body Mechanisms",
      medical: "Medical Care",
      comprehensive: "Comprehensive Problems",
    },
  },
  vi: {
    nav: { home: "Trang chủ", practice: "Luyện tập", analytics: "Theo dõi", community: "Cộng đồng", admin: "Quản trị", logout: "Đăng xuất" },
    onboarding: {
      welcome: "Chào mừng bạn đến với Mora",
      subtitle: "Hãy cùng thiết lập để bạn thành công.",
      selectLanguage: "Chọn ngôn ngữ",
      chooseLevel: "Chọn cấp độ thi",
      setGoals: "Đặt mục tiêu của bạn",
      examDate: "Ngày thi",
      studyTime: "Thời gian học hàng tuần (giờ)",
      hoursPerWeek: "giờ/tuần",
      next: "Tiếp theo",
      back: "Quay lại",
      startLearning: "Tạo tài khoản",
    },
     auth: {
      loginTitle: "Đăng nhập",
      signupTitle: "Tạo tài khoản",
      emailLabel: "Địa chỉ Email",
      passwordLabel: "Mật khẩu",
      loginButton: "Đăng nhập",
      signupButton: "Đăng ký",
      loginPrompt: "Đã có tài khoản?",
      signupPrompt: "Chưa có tài khoản?",
      error: "Đã xảy ra lỗi. Vui lòng thử lại.",
      emailNotVerified: "Email chưa được xác thực. Vui lòng kiểm tra email và click link xác thực trước khi đăng nhập."
    },
    dashboard: {
      greeting: "Xin chào!",
      subtitle: "Sẵn sàng cho kỳ thi Kaigo Fukushi chưa?",
      progress: "Tiến độ của bạn",
      daysLeft: "ngày còn lại",
      practiceByTopic: "Luyện tập theo chủ đề",
      flashcards: "Thẻ ghi nhớ",
      startMockExam: "Bắt đầu thi thử",
      streak: "Ngày liên tiếp!",
      notifications: "Thông báo",
      mockExamScheduled: "Thi thử được lên lịch vào ngày mai",
      reviewNotes: "Đừng quên xem lại ghi chú của bạn!",
    },
    practice: {
      selectExamTitle: "Chọn Kỳ thi",
      examN: "Lần thứ {n} (第{n}回)",
      backToSelection: "Quay lại Chọn kỳ thi",
      questionsAttempted: "câu đã làm",
      start: "Bắt đầu",
      progress: "Tiến độ",
      categories: {
        humanSocial: {
          title: "Nền tảng nhân văn & xã hội",
          dignity: "Phẩm giá & Tự lập của con người",
          relationships: "Quan hệ con người & Giao tiếp",
          society: "Hiểu biết xã hội",
        },
        mindBody: {
          title: "Kiến thức y học & tâm lý",
          structure: "Cấu trúc tâm hồn & cơ thể",
          aging: "Hiểu biết về phát triển & lão hóa",
          dementia: "Hiểu biết về chứng sa sút trí tuệ",
          disability: "Hiểu biết về khuyết tật",
          medicalCare: "Chăm sóc y tế",
        },
        nursingCare: {
          title: "Kiến thức chuyên ngành điều dưỡng",
          careBasics: "Cơ bản về chăm sóc điều dưỡng",
          commSkills: "Kỹ thuật giao tiếp",
          lifeSupport: "Kỹ thuật hỗ trợ sinh hoạt",
          careProcess: "Quy trình chăm sóc điều dưỡng",
        },
        comprehensive: {
          title: "Tổng hợp",
          exercise: "Bài tập tổng hợp",
        },
      },
    },
    quiz: {
      mockExam: "Thi thử",
      practice: "Luyện tập",
      question: "Câu hỏi",
      of: "trên",
      explanation: "Giải thích",
      checkAnswer: "Kiểm tra đáp án",
      next: "Tiếp theo",
      finish: "Hoàn thành",
      noQuestions: "Không có câu hỏi nào.",
      backToDashboard: "Về trang chủ",
    },
    results: {
      title: "Kết quả thi",
      passed: "Chúc mừng, bạn đã đỗ!",
      failed: "Hãy tiếp tục luyện tập, bạn có thể làm được!",
      correct: "Đúng",
      incorrect: "Sai",
      time: "Thời gian",
      recommendedTopics: "Chủ đề đề xuất",
      review: "Ôn tập",
      practiceMore: "Luyện tập thêm",
      backToDashboard: "Về trang chủ",
    },
    analytics: {
      title: "Theo dõi Tiến độ",
    },
    community: {
      title: "Gia sư AI (Mora Sensei)",
      welcome: "Xin chào! Tôi là Mora Sensei. Hãy hỏi tôi bất cứ điều gì về kỳ thi Kaigo Fukushi.",
      placeholder: "Hỏi Mora Sensei...",
    },
    admin: {
      title: "Quản trị: Nhập OCR",
      uploadTitle: "Tải lên bài thi đã quét",
      uploadSubtitle: "Tải lên hình ảnh (JPG, PNG) hoặc PDF của một đề thi. AI sẽ tự động trích xuất các câu hỏi.",
      preview: "Xem trước",
      extract: "Trích xuất câu hỏi",
      processing: "Đang xử lý...",
      analyzing: "AI đang phân tích tài liệu...",
      extractedQuestions: "Các câu hỏi đã trích xuất",
      save: "Lưu câu hỏi",
      examNumberLabel: "Số thứ tự kỳ thi (ví dụ: 37)",
      saveSuccess: "Lưu câu hỏi thành công!",
      saveError: "Đã xảy ra lỗi khi lưu câu hỏi.",
      saving: "Đang lưu...",
    },
    topics: { // Legacy keys
      fundamentals: "Kiến thức cơ bản về chăm sóc",
      communication: "Kỹ năng giao tiếp",
      lifeSupport: "Kỹ thuật hỗ trợ cuộc sống",
      mindBody: "Cơ chế tâm lý và cơ thể",
      medical: "Chăm sóc y tế",
      comprehensive: "Vấn đề tổng hợp",
    },
  },
};