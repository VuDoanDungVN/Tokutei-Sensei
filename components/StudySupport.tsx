import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import Header from './shared/Header';
import Card from './shared/Card';
import Chatbot from './shared/Chatbot';

const StudySupport: React.FC = () => {
  const { t } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'guide' | 'resources' | 'tips' | 'chat'>('guide');

  const studyGuides = [
    {
      id: 1,
      title: 'Hướng dẫn học Kaigo Fukushi từ cơ bản',
      description: 'Lộ trình học tập từ A-Z cho người mới bắt đầu',
      icon: '📚',
      difficulty: 'Cơ bản',
      duration: '3-6 tháng',
      topics: ['Kiến thức cơ bản', 'Thuật ngữ y tế', 'Kỹ năng giao tiếp']
    },
    {
      id: 2,
      title: 'Chiến lược làm bài thi hiệu quả',
      description: 'Cách phân bổ thời gian và kỹ thuật làm bài thi',
      icon: '🎯',
      difficulty: 'Trung bình',
      duration: '1-2 tháng',
      topics: ['Quản lý thời gian', 'Phân tích câu hỏi', 'Chiến thuật chọn đáp án']
    },
    {
      id: 3,
      title: 'Luyện tập theo chủ đề chuyên sâu',
      description: 'Học sâu từng lĩnh vực của Kaigo Fukushi',
      icon: '🔬',
      difficulty: 'Nâng cao',
      duration: '2-4 tháng',
      topics: ['Chăm sóc người cao tuổi', 'Y tế cơ bản', 'Tâm lý học']
    }
  ];

  const studyResources = [
    {
      id: 1,
      title: 'Sách giáo khoa chính thức',
      description: 'Tài liệu chính thức từ Bộ Y tế Nhật Bản',
      type: 'Sách',
      language: 'Tiếng Nhật',
      download: true
    },
    {
      id: 2,
      title: 'Video bài giảng',
      description: 'Các video hướng dẫn chi tiết từ chuyên gia',
      type: 'Video',
      language: 'Tiếng Việt',
      download: false
    },
    {
      id: 3,
      title: 'Flashcards từ vựng',
      description: 'Bộ thẻ học từ vựng chuyên ngành',
      type: 'Flashcard',
      language: 'Đa ngôn ngữ',
      download: true
    },
    {
      id: 4,
      title: 'Đề thi mẫu',
      description: 'Bộ sưu tập đề thi các năm trước',
      type: 'Đề thi',
      language: 'Tiếng Nhật',
      download: true
    }
  ];

  const studyTips = [
    {
      category: 'Phương pháp học',
      tips: [
        'Học từ vựng mỗi ngày 30 phút',
        'Làm bài tập thực hành thường xuyên',
        'Ghi chú và tóm tắt kiến thức',
        'Học nhóm để trao đổi kinh nghiệm'
      ]
    },
    {
      category: 'Chuẩn bị thi',
      tips: [
        'Làm đề thi mẫu trong thời gian quy định',
        'Ôn tập lại kiến thức yếu',
        'Nghỉ ngơi đầy đủ trước ngày thi',
        'Chuẩn bị tâm lý thoải mái'
      ]
    },
    {
      category: 'Kỹ năng làm bài',
      tips: [
        'Đọc kỹ đề bài trước khi trả lời',
        'Loại bỏ các đáp án sai rõ ràng',
        'Quản lý thời gian hợp lý',
        'Kiểm tra lại đáp án trước khi nộp bài'
      ]
    }
  ];

  const renderStudyGuides = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Hướng dẫn học tập</h3>
      {studyGuides.map(guide => (
        <Card key={guide.id} className="hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">{guide.icon}</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{guide.title}</h4>
              <p className="text-gray-600 mb-3">{guide.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {guide.difficulty}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {guide.duration}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {guide.topics.map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Bắt đầu
            </button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderStudyResources = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tài liệu học tập</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h4>
                <p className="text-gray-600 mb-3">{resource.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {resource.type}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {resource.language}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {resource.download && (
                  <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
                    Tải về
                  </button>
                )}
                <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                  Xem
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStudyTips = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Mẹo học tập</h3>
      {studyTips.map((section, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              {index + 1}
            </span>
            {section.category}
          </h4>
          <ul className="space-y-2">
            {section.tips.map((tip, tipIndex) => (
              <li key={tipIndex} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );

  const renderChatSupport = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Hỗ trợ trực tuyến</h3>
      <Card className="h-96">
        <Chatbot />
      </Card>
    </div>
  );

  return (
    <div>
      <Header title="Hỗ trợ học tập Kaigo Fukushi" />
      <div className="p-4 md:p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { id: 'guide', label: 'Hướng dẫn', icon: '📚' },
              { id: 'resources', label: 'Tài liệu', icon: '📖' },
              { id: 'tips', label: 'Mẹo học', icon: '💡' },
              { id: 'chat', label: 'Hỗ trợ', icon: '💬' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'guide' && renderStudyGuides()}
          {activeTab === 'resources' && renderStudyResources()}
          {activeTab === 'tips' && renderStudyTips()}
          {activeTab === 'chat' && renderChatSupport()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Hành động nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-800 mb-2">Làm bài kiểm tra</h4>
              <p className="text-gray-600 text-sm">Kiểm tra kiến thức hiện tại</p>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-800 mb-2">Xem tiến độ</h4>
              <p className="text-gray-600 text-sm">Theo dõi quá trình học tập</p>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-gray-800 mb-2">Thi thử</h4>
              <p className="text-gray-600 text-sm">Luyện tập với đề thi thật</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySupport;
