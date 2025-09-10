import React from 'react';

interface KanjiWord {
  word?: string;
  furigana?: string;
  meaning?: {
    en?: string;
    vi?: string;
  };
}

interface KanjiHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  kanjiWords: KanjiWord[];
  language: 'ja' | 'en' | 'vi';
  isLoading?: boolean;
}

const KanjiHintModal: React.FC<KanjiHintModalProps> = ({
  isOpen,
  onClose,
  kanjiWords,
  language,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getLanguageLabel = () => {
    switch (language) {
      case 'en': return 'English';
      case 'vi': return 'Tiếng Việt';
      default: return '日本語';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              漢字のヒント (Kanji Hints)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Câu hỏi này có {kanjiWords.length} từ/cụm từ kanji
              {isLoading && kanjiWords.length > 0 && (
                <span className="ml-2 text-blue-600 text-xs flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Đang cập nhật thêm từ...
                </span>
              )}
              {!isLoading && kanjiWords.length > 0 && (
                <span className="ml-2 text-green-600 text-xs">✅ Đã dịch xong</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading && kanjiWords.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang phân tích từ kanji...</p>
            </div>
          ) : kanjiWords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
                </svg>
              </div>
              <p className="text-gray-600">Không tìm thấy từ kanji nào trong câu hỏi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {kanjiWords.map((word, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Kanji Word */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-800 text-center leading-tight">
                          {word.word || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Kanji Information */}
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        {/* Furigana */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">Furigana:</span>
                          <span className="text-lg font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                            {word.furigana || 'N/A'}
                          </span>
                        </div>
                        
                        {/* Meaning */}
                        <div className="flex items-start space-x-2">
                          <span className="text-sm font-medium text-gray-500 flex-shrink-0">
                            {getLanguageLabel()}: 
                          </span>
                          <span className={`text-base px-2 py-1 rounded ${
                            word.meaning?.[language] && word.meaning[language] !== 'Đang phân tích...' && word.meaning[language] !== 'Reading...'
                              ? 'text-gray-800 bg-gray-50' 
                              : 'text-gray-500 bg-yellow-50 animate-pulse'
                          }`}>
                            {word.meaning?.[language] || 'Nghĩa không có sẵn'}
                          </span>
                          {word.meaning?.[language] && word.meaning[language] !== 'Đang phân tích...' && word.meaning[language] !== 'Reading...' && (
                            <span className="text-green-500 text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            閉じる (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanjiHintModal;
