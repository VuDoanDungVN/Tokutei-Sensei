import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import Header from './shared/Header';
import Card from './shared/Card';

interface ExamSelectionProps {
  onSelectExam: (examNumber: number) => void;
}

const ExamSelection: React.FC<ExamSelectionProps> = ({ onSelectExam }) => {
  const { t, settings } = useContext(AppContext);
  const [isExamSectionOpen, setIsExamSectionOpen] = useState(false);
  const currentExamYear = 37;
  const exams = Array.from({ length: currentExamYear }, (_, i) => currentExamYear - i);

  // Group all exams in one decade (2020s)
  const groupedExams = {
    20: exams // All exams from 1-37 in the 2020s decade
  };

  return (
    <div>
      <Header title={t('practice.selectExamTitle')} />
      <div className="p-4 md:p-6">
        {/* Introduction Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Chọn kỳ thi để luyện tập</h2>
            <p className="text-gray-600">Chọn kỳ thi Kaigo Fukushi để bắt đầu luyện tập theo từng chủ đề</p>
          </div>
        </Card>

        
        {/* Quick Stats */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{currentExamYear}</div>
              <div className="text-sm text-gray-600">Kỳ thi có sẵn</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600">Chủ đề chính</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">1000+</div>
              <div className="text-sm text-gray-600">Câu hỏi luyện tập</div>
            </div>
          </div>
        </Card>

        {/* Exam Selection Accordion - Moved to top priority */}
        <Card className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <button
            onClick={() => setIsExamSectionOpen(!isExamSectionOpen)}
            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Tất cả kỳ thi Kaigo Fukushi
                </h3>
                <p className="text-sm text-gray-600">Chọn kỳ thi để bắt đầu luyện tập</p>
              </div>
            </div>
            <svg 
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${isExamSectionOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExamSectionOpen && (
            <div className="px-4 pb-4">
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {exams.map(examNumber => (
                    <Card
                      key={examNumber}
                      onClick={() => onSelectExam(examNumber)}
                      className="!p-0 text-center flex flex-col items-center justify-center aspect-square transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-green-300 bg-white hover:bg-green-50 group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-2 group-hover:from-green-500 group-hover:to-green-700 transition-all duration-300">
                        <span className="text-white font-bold text-lg">{examNumber}</span>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {settings.language === 'ja'
                          ? t('practice.examN', { n: examNumber })
                          : (
                            <>
                              <span className="block text-sm font-bold">{t('practice.examN', { n: examNumber }).split('(')[0]}</span>
                              <span className="block text-xs text-gray-500 mt-1">
                                {t('practice.examN', { n: examNumber }).split('(')[1]?.replace(')', '')}
                              </span>
                            </>
                          )
                        }
                      </div>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Kaigo Fukushi Information */}
        <div className="mt-8 space-y-6">
          {/* What is Kaigo Fukushi */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Kaigo Fukushi (介護福祉士) là gì?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Kaigo Fukushi là chứng chỉ quốc gia của Nhật Bản dành cho những người làm việc trong lĩnh vực chăm sóc người cao tuổi. 
                  Đây là chứng chỉ bắt buộc để có thể làm việc tại các cơ sở chăm sóc người cao tuổi tại Nhật Bản.
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-1">🎯 Mục đích</h4>
                    <p className="text-sm text-gray-600">Đảm bảo chất lượng dịch vụ chăm sóc người cao tuổi</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-1">📋 Yêu cầu</h4>
                    <p className="text-sm text-gray-600">Kiến thức chuyên môn và kỹ năng thực hành</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Exam Structure */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Cấu trúc đề thi Kaigo Fukushi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">1</span>
                        Nền tảng nhân văn và xã hội
                      </h4>
                      <p className="text-sm text-gray-600">Kiến thức về xã hội, pháp luật, tâm lý học cơ bản</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">2</span>
                        Kiến thức y học và tâm lý
                      </h4>
                      <p className="text-sm text-gray-600">Giải phẫu, sinh lý, bệnh lý, tâm lý người cao tuổi</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">3</span>
                        Kiến thức chuyên ngành điều dưỡng
                      </h4>
                      <p className="text-sm text-gray-600">Kỹ thuật chăm sóc, hỗ trợ sinh hoạt hàng ngày</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">4</span>
                        Tổng hợp
                      </h4>
                      <p className="text-sm text-gray-600">Câu hỏi tích hợp kiến thức từ các lĩnh vực trên</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">📊 Thông tin kỳ thi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-yellow-800">Tổng số câu:</span>
                      <span className="ml-2 text-gray-700">125 câu</span>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-800">Thời gian:</span>
                      <span className="ml-2 text-gray-700">220 phút</span>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-800">Điểm đậu:</span>
                      <span className="ml-2 text-gray-700">60% (75/125 câu)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Exam Schedule */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Lịch thi và đăng ký</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">📅 Kỳ thi chính</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tháng 1:</span>
                          <span className="font-medium">Chủ nhật tuần thứ 4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tháng 4:</span>
                          <span className="font-medium">Chủ nhật tuần thứ 3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tháng 7:</span>
                          <span className="font-medium">Chủ nhật tuần thứ 4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tháng 10:</span>
                          <span className="font-medium">Chủ nhật tuần thứ 3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">📝 Đăng ký thi</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian đăng ký:</span>
                          <span className="font-medium">2 tháng trước kỳ thi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lệ phí thi:</span>
                          <span className="font-medium">¥15,300</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Địa điểm:</span>
                          <span className="font-medium">Toàn quốc</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kết quả:</span>
                          <span className="font-medium">3 tháng sau</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Lưu ý quan trọng</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Kỳ thi được tổ chức 4 lần/năm (tháng 1, 4, 7, 10)</li>
                    <li>• Cần đăng ký trước 2 tháng để đảm bảo chỗ thi</li>
                    <li>• Kết quả thi có hiệu lực vĩnh viễn</li>
                    <li>• Có thể thi lại nhiều lần nếu chưa đạt</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Career Opportunities */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Cơ hội nghề nghiệp với Kaigo Fukushi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">🏥 Nơi làm việc</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Viện dưỡng lão (特別養護老人ホーム)</li>
                        <li>• Nhà chăm sóc người cao tuổi</li>
                        <li>• Trung tâm chăm sóc ban ngày</li>
                        <li>• Dịch vụ chăm sóc tại nhà</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">💰 Mức lương</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Mới tốt nghiệp: ¥200,000-250,000/tháng</li>
                        <li>• Có kinh nghiệm: ¥250,000-350,000/tháng</li>
                        <li>• Quản lý: ¥350,000-500,000/tháng</li>
                        <li>• Thưởng và phúc lợi hấp dẫn</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">🌟 Lợi ích của chứng chỉ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🇯🇵</div>
                      <div className="font-medium text-green-800">Làm việc tại Nhật</div>
                      <div className="text-gray-600">Cơ hội việc làm ổn định</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">📈</div>
                      <div className="font-medium text-green-800">Thăng tiến nghề nghiệp</div>
                      <div className="text-gray-600">Cơ hội phát triển cao</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💝</div>
                      <div className="font-medium text-green-800">Ý nghĩa xã hội</div>
                      <div className="text-gray-600">Đóng góp cho cộng đồng</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ExamSelection;
