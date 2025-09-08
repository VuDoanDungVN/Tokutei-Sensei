import React, { useState, useEffect } from 'react';
import { AnalyzedQuestion } from '../../services/imageAnalysisService';

interface QuestionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (editedQuestions: AnalyzedQuestion[]) => void;
  questions: AnalyzedQuestion[];
  loading?: boolean;
  subject: string;
  examNumber?: number;
  topicTitle?: string;
}

const QuestionConfirmationModal: React.FC<QuestionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  questions,
  loading = false,
  subject,
  examNumber,
  topicTitle
}) => {
  const [editedQuestions, setEditedQuestions] = useState<AnalyzedQuestion[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'question' | 'option' | 'explanation' | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize edited questions when modal opens
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      setEditedQuestions([...questions]);
      setHasChanges(false);
    }
  }, [isOpen, questions]);

  // Check for changes
  useEffect(() => {
    const hasChanges = JSON.stringify(editedQuestions) !== JSON.stringify(questions);
    setHasChanges(hasChanges);
  }, [editedQuestions, questions]);

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getCorrectAnswerColor = (question: AnalyzedQuestion) => {
    if (question.needsManualReview || question.correctAnswer === null) {
      return 'text-orange-600 bg-orange-100';
    }
    return 'text-green-600 bg-green-100';
  };

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'hard': return 'Khó';
      default: return 'Trung bình';
    }
  };

  const handleEditQuestion = (questionIndex: number) => {
    setEditingQuestionIndex(questionIndex);
    setEditingField('question');
    setEditingOptionIndex(null);
  };

  const handleEditOption = (questionIndex: number, optionIndex: number) => {
    setEditingQuestionIndex(questionIndex);
    setEditingField('option');
    setEditingOptionIndex(optionIndex);
  };

  const handleSetCorrectAnswer = (questionIndex: number, correctAnswer: string) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswer: correctAnswer,
      needsManualReview: false
    };
    setEditedQuestions(updatedQuestions);
  };

  const handleEditExplanation = (questionIndex: number) => {
    setEditingQuestionIndex(questionIndex);
    setEditingField('explanation');
    setEditingOptionIndex(null);
  };

  const handleSaveEdit = () => {
    setEditingQuestionIndex(null);
    setEditingField(null);
    setEditingOptionIndex(null);
  };

  const handleCancelEdit = () => {
    // Reset to original questions
    setEditedQuestions([...questions]);
    setEditingQuestionIndex(null);
    setEditingField(null);
    setEditingOptionIndex(null);
  };

  const updateQuestion = (questionIndex: number, field: string, value: string) => {
    const updatedQuestions = [...editedQuestions];
    if (field === 'question') {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        question: value
      };
    } else if (field === 'explanation') {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        explanation: value
      };
    }
    setEditedQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedQuestions[questionIndex].options.map((option, index) => 
        index === optionIndex ? { ...option, text: value } : option
      )
    };
    setEditedQuestions(updatedQuestions);
  };

  const handleConfirm = () => {
    onConfirm(editedQuestions);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newQuestions = [...editedQuestions];
    const draggedQuestion = newQuestions[draggedIndex];
    
    // Remove the dragged item
    newQuestions.splice(draggedIndex, 1);
    
    // Insert at new position
    newQuestions.splice(dropIndex, 0, draggedQuestion);
    
    setEditedQuestions(newQuestions);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Xác nhận câu hỏi đã phân tích
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              💡 Kéo thả các câu hỏi để sắp xếp lại thứ tự
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Lĩnh vực: <span className="font-medium">{subject}</span>
              {examNumber && (
                <span className="ml-2">
                  • Kỳ thi: <span className="font-medium">{examNumber}</span>
                </span>
              )}
              {topicTitle && (
                <span className="ml-2">
                  • Chủ đề: <span className="font-medium">{topicTitle}</span>
                </span>
              )}
              {hasChanges && (
                <span className="ml-2 text-orange-600 font-medium">
                  • Có thay đổi chưa lưu
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
                </svg>
              </div>
              <p className="text-gray-600">Không tìm thấy câu hỏi nào trong ảnh</p>
            </div>
          ) : (
            <div className="space-y-6">
              {editedQuestions.map((question, index) => (
                <div 
                  key={index} 
                  className={`border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
                    draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="cursor-move text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                          <h3 className="font-medium text-gray-900">
                            Câu {index + 1}
                            <span className={`ml-2 text-sm px-2 py-1 rounded ${getCorrectAnswerColor(question)}`}>
                              {question.correctAnswer 
                                ? `Đáp án đúng: ${question.correctAnswer}` 
                                : 'Cần xác định đáp án đúng'
                              }
                            </span>
                            {question.needsManualReview && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                ⚠️ Cần xem xét
                              </span>
                            )}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          disabled={loading}
                        >
                          ✏️ Chỉnh sửa
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {editingQuestionIndex === index && editingField === 'question' ? (
                          <div className="space-y-2">
                            <textarea
                              value={question.question}
                              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md resize-none"
                              rows={4}
                              placeholder="Nhập nội dung câu hỏi..."
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {question.question}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {question.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyText(question.difficulty)}
                        </span>
                      )}
                      {question.topic && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          {question.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Các đáp án:</h4>
                    </div>
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-start space-x-3 p-2 bg-white border border-gray-200 rounded">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          option.id === question.correctAnswer 
                            ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                            : question.correctAnswer === null
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {option.id}
                        </span>
                        {editingQuestionIndex === index && editingField === 'option' && editingOptionIndex === optionIndex ? (
                          <div className="flex-1 space-y-2">
                            <textarea
                              value={option.text}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md resize-none"
                              rows={2}
                              placeholder="Nhập nội dung đáp án..."
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
                              {option.text}
                            </span>
                            <div className="flex items-center space-x-2">
                              {option.id === question.correctAnswer && (
                                <span className="flex-shrink-0 text-green-600 text-sm font-medium">
                                  ✓ Đúng
                                </span>
                              )}
                              {question.correctAnswer === null && (
                                <button
                                  onClick={() => handleSetCorrectAnswer(index, option.id)}
                                  className="flex-shrink-0 text-orange-600 hover:text-orange-800 text-sm font-medium px-2 py-1 border border-orange-300 rounded hover:bg-orange-50"
                                >
                                  Chọn làm đáp án đúng
                                </button>
                              )}
                              <button
                                onClick={() => handleEditOption(index, optionIndex)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                                disabled={loading}
                              >
                                ✏️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {(question.explanation && question.explanation !== 'Giải thích sẽ được cập nhật sau.') || editingQuestionIndex === index && editingField === 'explanation' ? (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-800 font-medium">Giải thích:</p>
                        <button
                          onClick={() => handleEditExplanation(index)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          disabled={loading}
                        >
                          ✏️ Chỉnh sửa
                        </button>
                      </div>
                      {editingQuestionIndex === index && editingField === 'explanation' ? (
                        <div className="space-y-2">
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md resize-none"
                            rows={3}
                            placeholder="Nhập giải thích..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button
                        onClick={() => handleEditExplanation(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        disabled={loading}
                      >
                        + Thêm giải thích
                      </button>
                    </div>
                  )}
                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || editedQuestions.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Xác nhận lưu ({editedQuestions.length} câu hỏi)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionConfirmationModal;
