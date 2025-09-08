import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for question analysis
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface AnalyzedQuestion {
  question: string;
  options: QuestionOption[];
  correctAnswer?: string | null;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  needsManualReview?: boolean;
  notes?: string;
}

export interface ImageAnalysisResult {
  success: boolean;
  questions: AnalyzedQuestion[];
  error?: string;
}

class ImageAnalysisService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY environment variable not set. Please add it to your .env file.');
    }
    
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  /**
   * Test API key validity
   */
  async testApiKey(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Test");
      return !!result.response;
    } catch (error) {
      console.error('API Key test failed:', error);
      return false;
    }
  }

  /**
   * Get debug information about the service
   */
  getDebugInfo(): { apiKeyExists: boolean; apiKeyLength: number } {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    return {
      apiKeyExists: !!API_KEY,
      apiKeyLength: API_KEY ? API_KEY.length : 0
    };
  }

  /**
   * Convert file to base64 for Gemini API
   */
  private async fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve({
          data: base64,
          mimeType: file.type
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image if it's too large and enhance for better OCR
   */
  private async resizeImageIfNeeded(file: File, maxSize: number = 2 * 1024 * 1024): Promise<File> {
    if (file.size <= maxSize) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (reduce by 50% each time until under limit)
        let { width, height } = img;
        let scale = 1;

        // Calculate scale factor to get under size limit
        while (width * height * 4 > maxSize) { // 4 bytes per pixel (RGBA)
          scale *= 0.8;
          width = Math.floor(img.width * scale);
          height = Math.floor(img.height * scale);
        }

        canvas.width = width;
        canvas.height = height;

        // Enhance image for better OCR
        if (ctx) {
          // Set high quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Apply contrast enhancement for better text recognition
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          // Simple contrast enhancement
          for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            
            // Apply contrast enhancement
            const enhanced = gray < 128 ? gray * 0.8 : Math.min(255, gray * 1.2);
            
            data[i] = enhanced;     // Red
            data[i + 1] = enhanced; // Green
            data[i + 2] = enhanced; // Blue
            // Alpha channel remains unchanged
          }
          
          ctx.putImageData(imageData, 0, 0);
        }

        // Convert to blob with high quality
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            console.log(`Image resized and enhanced from ${file.size} to ${resizedFile.size} bytes`);
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, 0.9); // 90% quality for better text recognition
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Analyze image and extract questions
   */
  async analyzeImage(file: File, subject: string): Promise<ImageAnalysisResult> {
    try {
      
      // Validate file size (max 20MB)
      const maxFileSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxFileSize) {
        return {
          success: false,
          questions: [],
          error: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 20MB.'
        };
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          questions: [],
          error: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.'
        };
      }
      
      // Resize image if needed (max 2MB for processing)
      const processedFile = await this.resizeImageIfNeeded(file, 2 * 1024 * 1024);
      
      const imageData = await this.fileToBase64(processedFile);
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Bạn là một chuyên gia phân tích đề thi y tế Nhật Bản với khả năng đọc và hiểu tiếng Nhật xuất sắc. Hãy phân tích ảnh này một cách toàn diện và trích xuất TẤT CẢ các câu hỏi trắc nghiệm.

Ảnh này thuộc lĩnh vực: ${subject}

QUAN TRỌNG: Hãy phân tích ảnh theo các bước sau:

BƯỚC 1: QUAN SÁT TOÀN BỘ ẢNH
- Đọc từ trên xuống dưới, từ trái sang phải
- Tìm tất cả các số thứ tự (1., 2., 3., ①, ②, ③, 問1, 問2, v.v.)
- Tìm tất cả các ký hiệu câu hỏi (?, ？, 問題, 問い)
- Tìm tất cả các đáp án (A, B, C, D, ア, イ, ウ, エ, 1, 2, 3, 4)

BƯỚC 2: XÁC ĐỊNH CẤU TRÚC
- Câu hỏi có thể có nhiều dòng
- Đáp án có thể có nhiều dòng
- Có thể có bảng, sơ đồ, hình ảnh kèm theo
- Có thể có phần giải thích hoặc ghi chú

BƯỚC 3: TRÍCH XUẤT NỘI DUNG
- Đọc toàn bộ nội dung, không bỏ sót
- Bao gồm cả phần mô tả tình huống
- Bao gồm cả phần giải thích nếu có
- Tìm đáp án đúng (○, ●, ✓, đánh dấu, tô đậm)

BƯỚC 4: XỬ LÝ CÂU HỎI KHÔNG RÕ RÀNG
- Nếu chỉ có "Chọn đáp án đúng nhất" mà không có câu hỏi cụ thể:
  + Tìm câu hỏi ở câu trước đó (có thể là câu hỏi liên quan)
  + Hoặc tạo câu hỏi dựa trên ngữ cảnh của các đáp án
  + Hoặc đánh dấu là "Câu hỏi cần xác định thêm"
- Nếu không tìm thấy đáp án đúng được đánh dấu:
  + Đánh dấu correctAnswer là null
  + Thêm ghi chú "Cần xác định đáp án đúng thủ công"

Hãy trích xuất TẤT CẢ các câu hỏi trắc nghiệm từ ảnh và trả về kết quả theo định dạng JSON sau:

{
  "questions": [
    {
      "question": "Nội dung đầy đủ của câu hỏi (bao gồm cả phần mô tả, tình huống, bảng, sơ đồ nếu có)",
      "options": [
        {
          "id": "A",
          "text": "Nội dung đầy đủ của đáp án A (bao gồm tất cả dòng)"
        },
        {
          "id": "B", 
          "text": "Nội dung đầy đủ của đáp án B (bao gồm tất cả dòng)"
        },
        {
          "id": "C",
          "text": "Nội dung đầy đủ của đáp án C (bao gồm tất cả dòng)"
        },
        {
          "id": "D",
          "text": "Nội dung đầy đủ của đáp án D (bao gồm tất cả dòng)"
        }
      ],
      "correctAnswer": "A", // hoặc null nếu không xác định được
      "explanation": "Giải thích chi tiết tại sao đáp án này đúng (nếu có trong ảnh)",
      "difficulty": "medium",
      "topic": "Chủ đề cụ thể của câu hỏi",
      "needsManualReview": false, // true nếu cần xem xét thủ công
      "notes": "Ghi chú đặc biệt (nếu có)"
    }
  ]
}

HƯỚNG DẪN CHI TIẾT:
- Đọc kỹ từng dòng, từng ký tự trong ảnh
- Không bỏ sót bất kỳ thông tin nào
- Nếu có bảng, sơ đồ, hãy mô tả chi tiết
- Nếu có nhiều câu hỏi, trích xuất tất cả
- Nếu không chắc chắn về đáp án đúng, hãy đoán dựa trên ngữ cảnh
- Ưu tiên trích xuất đầy đủ hơn là chính xác tuyệt đối

XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT:
1. Câu hỏi chỉ có "Chọn đáp án đúng nhất":
   - Tìm câu hỏi ở câu trước đó (có thể liên quan)
   - Hoặc tạo câu hỏi dựa trên nội dung các đáp án
   - Đặt needsManualReview = true

2. Không tìm thấy đáp án đúng được đánh dấu:
   - Đặt correctAnswer = null
   - Đặt needsManualReview = true
   - Thêm ghi chú "Cần xác định đáp án đúng thủ công"

3. Câu hỏi liên quan đến câu trước:
   - Tham chiếu đến câu hỏi trước đó
   - Tạo câu hỏi dựa trên ngữ cảnh
   - Đặt notes = "Liên quan đến câu hỏi trước"

Lưu ý:
- Chỉ trả về JSON hợp lệ, không có text thêm
- Nếu không tìm thấy câu hỏi nào, trả về {"questions": []}
- Đảm bảo nội dung được trích xuất đầy đủ, không bị cắt ngắn
- Nếu có nghi ngờ, hãy trích xuất và để người dùng kiểm tra sau
`;

      const imagePart = {
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType
        }
      };

      // Multiple analysis strategies with different prompts
      let result;
      let analysisResults = [];
      
      const strategies = [
        {
          name: "Detailed Analysis",
          prompt: prompt
        },
        {
          name: "Simple Analysis", 
          prompt: `
Hãy phân tích ảnh này và trích xuất các câu hỏi trắc nghiệm. 

Ảnh thuộc lĩnh vực: ${subject}

Trả về JSON với format:
{
  "questions": [
    {
      "question": "Nội dung câu hỏi đầy đủ",
      "options": [
        {"id": "A", "text": "Đáp án A"},
        {"id": "B", "text": "Đáp án B"},
        {"id": "C", "text": "Đáp án C"},
        {"id": "D", "text": "Đáp án D"}
      ],
      "correctAnswer": "A",
      "explanation": "Giải thích nếu có",
      "difficulty": "medium",
      "topic": "Chủ đề"
    }
  ]
}

Chỉ trả về JSON hợp lệ.
`
        },
        {
          name: "OCR Focus",
          prompt: `
Hãy đọc toàn bộ văn bản trong ảnh này và tìm các câu hỏi trắc nghiệm.

Ảnh thuộc lĩnh vực: ${subject}

Tìm kiếm:
- Các số thứ tự (1., 2., ①, ②, 問1, 問2)
- Các ký hiệu câu hỏi (?, ？, 問題)
- Các đáp án (A, B, C, D, ア, イ, ウ, エ)
- Đáp án đúng (○, ●, ✓, đánh dấu)

Trả về JSON:
{
  "questions": [
    {
      "question": "Nội dung câu hỏi",
      "options": [
        {"id": "A", "text": "Đáp án A"},
        {"id": "B", "text": "Đáp án B"},
        {"id": "C", "text": "Đáp án C"},
        {"id": "D", "text": "Đáp án D"}
      ],
      "correctAnswer": "A",
      "explanation": "Giải thích",
      "difficulty": "medium",
      "topic": "Chủ đề"
    }
  ]
}
`
        },
        {
          name: "Fallback Analysis",
          prompt: `
Hãy mô tả toàn bộ nội dung trong ảnh này và tìm bất kỳ câu hỏi nào.

Ảnh thuộc lĩnh vực: ${subject}

Nếu tìm thấy câu hỏi, trả về:
{
  "questions": [
    {
      "question": "Nội dung câu hỏi",
      "options": [
        {"id": "A", "text": "Đáp án A"},
        {"id": "B", "text": "Đáp án B"},
        {"id": "C", "text": "Đáp án C"},
        {"id": "D", "text": "Đáp án D"}
      ],
      "correctAnswer": "A",
      "explanation": "Giải thích",
      "difficulty": "medium",
      "topic": "Chủ đề"
    }
  ]
}

Nếu không tìm thấy, trả về: {"questions": []}
`
        }
      ];
      
      // Try each strategy
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        try {
          result = await model.generateContent([strategy.prompt, imagePart]);
          
          const response = await result.response;
          const text = response.text();
          
          // Try to parse the result
          let jsonText = text.trim();
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
          }
          
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0]);
            if (parsedResult.questions && parsedResult.questions.length > 0) {
              analysisResults.push({
                strategy: strategy.name,
                questions: parsedResult.questions,
                rawText: text
              });
            }
          }
          
          // If we found questions, use the first successful result
          if (analysisResults.length > 0) {
            break;
          }
          
        } catch (error) {
          if (i === strategies.length - 1) {
            throw error; // Re-throw if all strategies failed
          }
        }
        
        // Wait between strategies
        if (i < strategies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Use the best result
      if (analysisResults.length === 0) {
        throw new Error('Tất cả các chiến lược phân tích đều thất bại');
      }
      
      const bestResult = analysisResults[0];
      result = { response: { text: () => bestResult.rawText } };
      
      const response = await result.response;
      const text = response.text();

      // Clean up the response text to extract JSON
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Try to parse JSON
      let parsedResult;
      try {
        parsedResult = JSON.parse(jsonText);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the text
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể phân tích kết quả từ AI');
        }
      }

      // Validate and format the result
      const questions: AnalyzedQuestion[] = parsedResult.questions || [];
      
      // Format questions to ensure proper structure and validate content
      const formattedQuestions = questions.map((q, index) => {
        
        // Validate and clean question text
        let questionText = q.question || `Câu hỏi ${index + 1}`;
        if (questionText.length < 5) {
          questionText = `Câu hỏi ${index + 1}: ${questionText}`;
        }
        
        // Validate and clean options
        const validOptions = (q.options || []).map((option, optIndex) => {
          let optionText = typeof option === 'string' ? option : (option.text || '');
          if (optionText.length < 1) {
            optionText = `Đáp án ${String.fromCharCode(65 + optIndex)}`;
          }
          return {
            id: typeof option === 'string' ? String.fromCharCode(65 + optIndex) : (option.id || String.fromCharCode(65 + optIndex)),
            text: optionText,
            isCorrect: typeof option === 'object' ? option.isCorrect : false
          };
        });
        
        // Ensure we have at least 2 options
        if (validOptions.length < 2) {
          validOptions.push(
            { id: 'A', text: 'Đáp án A', isCorrect: false },
            { id: 'B', text: 'Đáp án B', isCorrect: false }
          );
        }
        
        // Validate correct answer - be more flexible
        let correctAnswer = q.correctAnswer || 'A';
        if (typeof correctAnswer === 'string') {
          // Check if correctAnswer matches any option ID
          const matchingOption = validOptions.find(opt => opt.id === correctAnswer);
          if (!matchingOption) {
            // Try to find by index (1, 2, 3, 4 -> A, B, C, D)
            const numericAnswer = parseInt(correctAnswer);
            if (!isNaN(numericAnswer) && numericAnswer >= 1 && numericAnswer <= 4) {
              correctAnswer = String.fromCharCode(64 + numericAnswer); // 1->A, 2->B, etc.
            } else {
              // Default to first option
              correctAnswer = validOptions[0]?.id || 'A';
            }
          }
        }
        
        // Clean explanation
        let explanation = q.explanation || '';
        if (explanation.length < 3) {
          explanation = 'Giải thích sẽ được cập nhật sau.';
        }
        
        const formattedQuestion = {
          question: questionText,
          options: validOptions,
          correctAnswer: correctAnswer,
          explanation: explanation,
          difficulty: q.difficulty || 'medium',
          topic: q.topic || subject
        };
        
        return formattedQuestion;
      });

      // Filter out invalid questions
      const validQuestions = formattedQuestions.filter(q => this.validateQuestion(q));

      if (validQuestions.length === 0) {
        // Fallback: try to create a basic question from the first raw question
        if (questions.length > 0) {
          const fallbackQuestion = questions[0];
          
          // Create a basic question structure
          const basicQuestion = {
            question: fallbackQuestion.question || 'Câu hỏi từ ảnh',
            options: [
              { id: 'A', text: 'Đáp án A', isCorrect: false },
              { id: 'B', text: 'Đáp án B', isCorrect: false },
              { id: 'C', text: 'Đáp án C', isCorrect: false },
              { id: 'D', text: 'Đáp án D', isCorrect: false }
            ],
            correctAnswer: 'A',
            explanation: 'Giải thích sẽ được cập nhật sau.',
            difficulty: 'medium' as const,
            topic: subject
          };
          
          // Try to extract options from the raw question
          if (fallbackQuestion.options && Array.isArray(fallbackQuestion.options)) {
            fallbackQuestion.options.forEach((option, index) => {
              if (index < 4) {
                const optionText = typeof option === 'string' ? option : option.text || '';
                if (optionText) {
                  basicQuestion.options[index].text = optionText;
                }
              }
            });
          }
          
          return {
            success: true,
            questions: [basicQuestion]
          };
        }
        
        return {
          success: false,
          questions: [],
          error: 'Không tìm thấy câu hỏi hợp lệ trong ảnh. Vui lòng kiểm tra chất lượng ảnh và thử lại.'
        };
      }

      return {
        success: true,
        questions: validQuestions
      };

    } catch (error) {
      console.error('Image analysis error:', error);
      
      // Handle specific Gemini API errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('api_key') || errorMessage.includes('invalid api key')) {
          return {
            success: false,
            questions: [],
            error: 'API Key không hợp lệ. Vui lòng kiểm tra VITE_GEMINI_API_KEY trong file .env'
          };
        } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          return {
            success: false,
            questions: [],
            error: 'Lỗi định dạng ảnh hoặc nội dung không hợp lệ. Vui lòng thử với ảnh khác (JPG, PNG)'
          };
        } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
          return {
            success: false,
            questions: [],
            error: 'Đã hết quota API. Vui lòng thử lại sau'
          };
        } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
          return {
            success: false,
            questions: [],
            error: 'Không có quyền truy cập API. Vui lòng kiểm tra cấu hình API'
          };
        } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          return {
            success: false,
            questions: [],
            error: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại'
          };
        }
      }
      
      return {
        success: false,
        questions: [],
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân tích ảnh'
      };
    }
  }

  /**
   * Validate analyzed question data
   */
  validateQuestion(question: AnalyzedQuestion): boolean {
    
    // Check if question has meaningful content (relaxed requirement)
    const hasValidQuestion = question.question && 
      question.question.length >= 5 && // Reduced from 10 to 5
      question.question.trim().length > 0;
    
    // Check if options are valid (relaxed requirement)
    const hasValidOptions = question.options && 
      question.options.length >= 2 &&
      question.options.every(option => 
        option.id && 
        option.text && 
        option.text.length >= 1 && // Reduced from 2 to 1
        option.text.trim().length > 0
      );
    
    // Check if correct answer is specified (relaxed requirement)
    const hasValidCorrectAnswer = question.correctAnswer && 
      (question.options.some(option => option.id === question.correctAnswer) ||
       ['A', 'B', 'C', 'D', '1', '2', '3', '4'].includes(question.correctAnswer));
    
    const isValid = hasValidQuestion && hasValidOptions && hasValidCorrectAnswer;
    
    return isValid;
  }
}

export const imageAnalysisService = new ImageAnalysisService();
