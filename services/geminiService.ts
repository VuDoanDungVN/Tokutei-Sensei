import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Question, Language } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker';


// --- Gemini AI Configuration ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Please add VITE_GEMINI_API_KEY to your .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Cache for kanji analysis to avoid repeated API calls
const kanjiCache = new Map<string, { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[]>();



/**
 * Cleans AI-generated text by removing markdown characters and trimming whitespace.
 * @param text The raw text from the AI.
 * @returns Cleaned, plain text.
 */
const cleanAiText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/^[#*+-]\s+/gm, '')
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2')
    .trim();
};

const chatModel = ai.chats.create({ 
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: "You are Mora Sensei, a friendly and knowledgeable AI tutor for Japanese Kaigo Fukushi (介護福祉士) exam students. Your answers should be clear, concise, and encouraging. Explain complex topics in simple terms. Your responses MUST be in plain text. Use line breaks for readability. Do NOT use markdown characters like asterisks, hashtags, or bullet points.",
  },
});

export const appService = {

  // --- Chatbot AI Method ---
  async chatWithAI(userMessage: string): Promise<string> {
    try {
      const prompt = `Bạn là trợ lý AI thông minh và hữu ích tên Mora. Hãy trả lời câu hỏi sau một cách chính xác, chi tiết và thân thiện. Bạn có thể giúp đỡ về:

- Tiếng Nhật và luyện thi Kaigo Fukushi (chuyên môn chính)
- Các môn học khác như toán, lý, hóa, sinh, văn, sử, địa
- Công nghệ thông tin và lập trình
- Kinh tế, tài chính, kinh doanh
- Sức khỏe và y tế
- Du lịch và văn hóa
- Giải trí và thể thao
- Và bất kỳ chủ đề nào khác mà người dùng quan tâm

QUAN TRỌNG: Khi trả lời, hãy:
1. Sử dụng xuống dòng (\\n) để tách các đoạn văn
2. Sử dụng bullet points (•) cho danh sách
3. Sử dụng số thứ tự (1., 2., 3.) cho các bước
4. Tạo khoảng trắng giữa các đoạn (\\n\\n)
5. Làm cho câu trả lời dễ đọc và có cấu trúc rõ ràng
6. KHÔNG sử dụng ký tự markdown như #, ##, ###, **, *, backtick, etc.
7. Chỉ sử dụng văn bản thuần túy với bullet points (•) và số thứ tự

Hãy trả lời bằng tiếng Việt một cách dễ hiểu và hữu ích. Nếu không chắc chắn về thông tin, hãy nói rõ và đề xuất nguồn tham khảo. Trả lời ngắn gọn, súc tích và thân thiện.

Câu hỏi của người dùng: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return cleanAiText(response.text);
    } catch (error) {
      console.error('Error in chatWithAI:', error);
      return 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.';
    }
  },

  // --- Gemini AI Methods ---
  async getMotivationalQuote(): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a short, motivational quote for a student preparing for a difficult certification exam in Japan. Keep it under 20 words. Provide only the plain text of the quote.",
      });
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error fetching motivational quote:", error);
      return "Every step forward, no matter how small, is progress. Keep going!";
    }
  },

  async askKaigoSensei(message: string): Promise<string> {
    try {
      const response: GenerateContentResponse = await chatModel.sendMessage({ message });
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error with Mora Sensei chat:", error);
      return "I'm sorry, I'm having a little trouble right now. Please try again in a moment.";
    }
  },

  async translateText(text: string, targetLanguage: Language): Promise<string> {
    const languageMap = {
      en: 'English',
      vi: 'Vietnamese',
      ja: 'Japanese',
    };

    try {
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following Japanese text to ${languageMap[targetLanguage]}. The translation should be in plain text, well-formatted with appropriate line breaks for readability, and MUST NOT contain any markdown characters (like *, #, -). Text to translate: "${text}"`,
      });
      return cleanAiText(response.text);
    } catch (error) {
      console.error(`Error translating text to ${targetLanguage}:`, error);
      return "Sorry, I couldn't translate that right now.";
    }
  },

  async getQuestionHint(questionText: string, options: string[]): Promise<string> {
    try {
      const prompt = `For the following Japanese Kaigo Fukushi exam question, provide a short, one-sentence hint in Japanese to guide the student. The hint must NOT reveal the answer directly. It should be plain text, without any special formatting or markdown characters.

        Question: "${questionText}"
        Options:
        ${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

        Hint:`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error fetching question hint:", error);
      return "もう一度考えてみてください。キーワードは何ですか？ (Please think again. What is the key word?)";
    }
  },

  async analyzeQuestion(question: string, options: string[]): Promise<{correctAnswer: number, explanation: string}> {
    try {
      const prompt = `You are an expert in Japanese Kaigo Fukushi (介護福祉士) exam. Analyze the following question and determine the correct answer.

Question: "${question}"

Options:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

Please respond in the following JSON format:
{
  "correctAnswer": [0-${options.length - 1}], // Index of correct answer (0 for first option, 1 for second, etc.)
  "explanation": "Brief explanation of why this answer is correct in Vietnamese"
}

Consider:
- Kaigo Fukushi exam standards and requirements
- Japanese healthcare and elderly care practices
- Legal and ethical considerations in caregiving
- Best practices in nursing care

Respond only with valid JSON, no additional text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = cleanAiText(response.text);
      
      try {
        const result = JSON.parse(responseText);
        
        // Validate the response
        if (typeof result.correctAnswer !== 'number' || result.correctAnswer < 0 || result.correctAnswer >= options.length) {
          throw new Error('Invalid correctAnswer');
        }
        
        if (typeof result.explanation !== 'string') {
          throw new Error('Invalid explanation');
        }

        return {
          correctAnswer: result.correctAnswer,
          explanation: result.explanation
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response:', responseText);
        
        // Fallback: try to extract answer from text
        const answerMatch = responseText.match(/(?:correctAnswer|đáp án|answer)[\s:]*(\d)/i);
        if (answerMatch) {
          const answerIndex = parseInt(answerMatch[1]) - 1;
          if (answerIndex >= 0 && answerIndex < options.length) {
            return {
              correctAnswer: answerIndex,
              explanation: 'Được phân tích bởi AI (tự động xác định)'
            };
          }
        }
        
        throw new Error('Could not parse AI response');
      }
    } catch (error) {
      console.error("Error analyzing question:", error);
      throw new Error('Không thể phân tích câu hỏi. Vui lòng thử lại.');
    }
  },

  async analyzeKanjiInQuestion(questionText: string, options: string[]): Promise<{ word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[]> {
    try {
      const fullText = `${questionText} ${options.join(' ')}`;
      
      // Check cache first
      const cacheKey = fullText.trim();
      if (kanjiCache.has(cacheKey)) {
        console.log('Using cached kanji analysis');
        return kanjiCache.get(cacheKey)!;
      }
      
      // Optimized prompt for faster processing
      const prompt = `Extract kanji words from: "${fullText}"

Return JSON array:
[{"word":"介護福祉士","furigana":"かいごふくしし","meaning":{"en":"certified care worker","vi":"nhân viên chăm sóc có chứng chỉ"}}]

Rules:
- Only healthcare/nursing terms
- Max 8 words
- Skip single kanji unless standalone word
- Be concise`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                furigana: { type: Type.STRING },
                meaning: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    vi: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      
      const jsonText = response.text.trim();
      const parsed = JSON.parse(jsonText) as { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[];
      
      // Quick validation and deduplication
      const validWords = parsed.filter(item => item.word && item.furigana && item.meaning);
      const uniqueWords = validWords.filter((item, index, self) => 
        index === self.findIndex(t => t.word === item.word)
      );
      
      // Cache the result
      kanjiCache.set(cacheKey, uniqueWords);
      
      // Limit cache size to prevent memory issues
      if (kanjiCache.size > 50) {
        const firstKey = kanjiCache.keys().next().value;
        kanjiCache.delete(firstKey);
      }
      
      return uniqueWords;
    } catch (error) {
      console.error("Error analyzing kanji in question:", error);
      return [];
    }
  },
  
  async processPdfToImages(file: File): Promise<{ base64: string, mimeType: string }[]> {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(fileBuffer).promise;
    const images: { base64: string, mimeType: string }[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            images.push({
                base64: dataUrl.split(',')[1],
                mimeType: 'image/jpeg'
            });
        }
    }
    return images;
  },

  // FIX: Updated the return type to Omit<Question, 'id' | 'examNumber'>[] as the examNumber is not known at this stage.
  async processExamDocument(file: File): Promise<Omit<Question, 'id' | 'examNumber'>[] | { error: string }> {
    try {
      let imageParts: { inlineData: { data: string, mimeType: string } }[] = [];
      
      if (file.type === 'application/pdf') {
          const images = await this.processPdfToImages(file);
          imageParts = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
      } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });
          imageParts = [{ inlineData: { data: base64, mimeType: file.type } }];
      } else {
          return { error: "Unsupported file type." };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            ...imageParts,
            {
              text: `
                Analyze these images of an exam paper. Identify all multiple-choice questions.
                Extract the question text, all options, and identify the correct answer's index (0-based).
                Provide a brief explanation for the correct answer. The explanation must be in plain text without any markdown formatting.
                The topic MUST be one of the following Japanese strings: '人間の尊厳と自立', '人間関係とコミュニケーション', '社会の理解', 'こころとからだのしくみ', '発達と老化の理解', '認知症の理解', '障害の理解', '医療的ケア', '介護の基本', 'コミュニケーション技術', '生活支援技術', '介護過程', '総合問題'.
                Return the result as a JSON object that matches the provided schema.
              `,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });
      
      const jsonText = response.text.trim();
      // The AI returns a structure with a 'questions' key
      const parsed = JSON.parse(jsonText) as { questions: Omit<Question, 'id' | 'examNumber'>[] };
      // Clean text fields
      return parsed.questions.map(q => ({ 
        ...q, 
        question: cleanAiText(q.question),
        explanation: cleanAiText(q.explanation),
        options: q.options.map(opt => cleanAiText(opt)),
      }));

    } catch (error) {
      console.error("Error processing exam document:", error);
      return { error: "Failed to process the document. The file might be unclear or the format is not supported. Please try again." };
    }
  },
};