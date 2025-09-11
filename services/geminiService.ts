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

// Enhanced cache for kanji analysis with individual word caching
const kanjiCache = new Map<string, { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[]>();
const individualWordCache = new Map<string, { word: string; furigana: string; meaning: { en: string; vi: string } }>();



/**
 * Cleans AI-generated text by removing markdown characters, special characters, and formatting for better readability.
 * @param text The raw text from the AI.
 * @returns Cleaned, plain text with proper line breaks.
 */
const cleanAiText = (text: string): string => {
  if (!text) return "";
  return text
    // Remove markdown headers
    .replace(/^[#*+-]\s+/gm, '')
    // Remove bold/italic markdown
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2')
    // Remove backticks and code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove special characters and emojis (keep basic punctuation and Vietnamese characters)
    .replace(/[^\w\s\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff\u00C0-\u1EF9.,!?;:()\-•]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up excessive line breaks (more than 2 consecutive)
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    // Ensure proper line breaks for bullet points
    .replace(/•\s*/g, '\n• ')
    // Ensure proper line breaks for numbered lists
    .replace(/(\d+\.\s*)/g, '\n$1')
    // Clean up leading/trailing whitespace
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
      const kaigoPrompt = `Bạn là Kaigo Fukushi Sensei - chuyên gia hàng đầu về chăm sóc y tế và ngôn ngữ tiếng Nhật y tế tại Nhật Bản.

VAI TRÒ CỦA BẠN:
• Chuyên gia về 介護福祉士 (Kaigo Fukushi-shi) - nhân viên chăm sóc có chứng chỉ
• Chuyên gia về ngôn ngữ tiếng Nhật trong lĩnh vực y tế và chăm sóc
• Giáo viên có kinh nghiệm giảng dạy tiếng Nhật y tế
• Có thể dịch thuật và giải thích các thuật ngữ y tế Nhật Bản

NHIỆM VỤ:
1. Trả lời câu hỏi về Kaigo Fukushi và chăm sóc y tế
2. Dịch thuật tiếng Nhật sang tiếng Việt và ngược lại
3. Giải thích các thuật ngữ y tế Nhật Bản
4. Hướng dẫn học tiếng Nhật chuyên ngành y tế
5. Cung cấp thông tin về kỳ thi 介護福祉士

PHONG CÁCH GIAO TIẾP:
• Thân thiện, chuyên nghiệp như một giáo viên
• Sử dụng tiếng Việt dễ hiểu
• Cung cấp ví dụ cụ thể khi cần
• Khuyến khích học tập và đặt câu hỏi

QUAN TRỌNG - FORMAT CÂU TRẢ LỜI:
• Sử dụng xuống dòng (\\n) để tách các đoạn văn
• Sử dụng bullet points (•) cho danh sách
• Sử dụng số thứ tự (1., 2., 3.) cho các bước
• Tạo khoảng trắng giữa các đoạn (\\n\\n)
• Làm cho câu trả lời dễ đọc và có cấu trúc rõ ràng
• KHÔNG sử dụng ký tự markdown như #, ##, ###, **, *, backtick, etc.
• Chỉ sử dụng văn bản thuần túy với bullet points (•) và số thứ tự
• KHÔNG sử dụng ký tự đặc biệt như emoji, symbols, etc.

Câu hỏi của học viên: ${message}

Hãy trả lời một cách chi tiết, có cấu trúc rõ ràng và dễ đọc:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: kaigoPrompt,
      });
      
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error with Kaigo Sensei chat:", error);
      return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau một chút.";
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

  async translateJapaneseWithReading(text: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following Japanese text to Vietnamese and provide the reading (furigana/romaji) for each Japanese word. Format the response with proper line breaks and clear structure.

Japanese text: "${text}"

Please provide a well-formatted response with clear sections and line breaks:

【原文】
[Japanese text]

【読み方】
[Reading in hiragana/romaji]

【意味】
[Vietnamese translation]

【単語分解】
[Word-by-word breakdown with readings and meanings - each word on a new line]

Format requirements:
- Use proper Vietnamese diacritics
- Provide accurate readings
- Give clear, easy-to-understand Vietnamese translations
- Each word in 単語分解 should be on a separate line
- Use line breaks (\\n) to separate sections
- Use line breaks (\\n) to separate individual words in the breakdown
- Make the text easy to read with proper spacing
- Use plain text only, no markdown formatting`,
      });
      
      // Process the response to ensure proper formatting
      const rawText = response.text;
      return this.formatTranslationResponse(rawText);
    } catch (error) {
      console.error('Error translating Japanese with reading:', error);
      return "Xin lỗi, không thể dịch văn bản tiếng Nhật. Vui lòng thử lại.";
    }
  },

  formatTranslationResponse(text: string): string {
    if (!text) return "";
    
    // Clean the text first
    let cleaned = text
      // Remove markdown headers
      .replace(/^[#*+-]\s+/gm, '')
      // Remove bold/italic markdown
      .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2')
      // Remove backticks and code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove special characters and emojis (keep basic punctuation and Vietnamese characters)
      .replace(/[^\w\s\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff\u00C0-\u1EF9.,!?;:()\-•【】]/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Clean up excessive line breaks (more than 2 consecutive)
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      // Ensure proper line breaks for bullet points
      .replace(/•\s*/g, '\n• ')
      // Ensure proper line breaks for numbered lists
      .replace(/(\d+\.\s*)/g, '\n$1')
      // Clean up leading/trailing whitespace
      .trim();

    // Ensure proper spacing between sections
    cleaned = cleaned
      .replace(/【原文】/g, '\n【原文】\n')
      .replace(/【読み方】/g, '\n【読み方】\n')
      .replace(/【意味】/g, '\n【意味】\n')
      .replace(/【単語分解】/g, '\n【単語分解】\n')
      // Clean up multiple line breaks again
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    // Format word breakdown items for better display
    cleaned = cleaned
      .split('\n')
      .map(line => {
        // Format word breakdown items to have consistent structure
        if (line.includes('(') && line.includes(')') && !line.match(/^【.*】$/)) {
          // Ensure there's a space before the dash if missing
          line = line.replace(/\)\s*-\s*/, ') - ');
        }
        return line;
      })
      .join('\n');

    return cleaned;
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
        console.log('✅ Using cached kanji analysis for:', cacheKey.substring(0, 50) + '...');
        return kanjiCache.get(cacheKey)!;
      }
      
      console.log('🔍 Analyzing new kanji text:', fullText.substring(0, 100) + '...');
      
      // Fast fallback dictionary for common healthcare terms
      const commonTerms: { [key: string]: { word: string; furigana: string; meaning: { en: string; vi: string } } } = {
        '介護': { word: '介護', furigana: 'かいご', meaning: { en: 'nursing care', vi: 'chăm sóc y tế' } },
        '福祉': { word: '福祉', furigana: 'ふくし', meaning: { en: 'welfare', vi: 'phúc lợi' } },
        '士': { word: '士', furigana: 'し', meaning: { en: 'professional', vi: 'chuyên gia' } },
        '介護福祉士': { word: '介護福祉士', furigana: 'かいごふくしし', meaning: { en: 'certified care worker', vi: 'nhân viên chăm sóc có chứng chỉ' } },
        '看護': { word: '看護', furigana: 'かんご', meaning: { en: 'nursing', vi: 'điều dưỡng' } },
        '看護師': { word: '看護師', furigana: 'かんごし', meaning: { en: 'nurse', vi: 'y tá' } },
        '医療': { word: '医療', furigana: 'いりょう', meaning: { en: 'medical care', vi: 'chăm sóc y tế' } },
        '病院': { word: '病院', furigana: 'びょういん', meaning: { en: 'hospital', vi: 'bệnh viện' } },
        '患者': { word: '患者', furigana: 'かんじゃ', meaning: { en: 'patient', vi: 'bệnh nhân' } },
        '治療': { word: '治療', furigana: 'ちりょう', meaning: { en: 'treatment', vi: 'điều trị' } },
        '薬': { word: '薬', furigana: 'くすり', meaning: { en: 'medicine', vi: 'thuốc' } },
        '食事': { word: '食事', furigana: 'しょくじ', meaning: { en: 'meal', vi: 'bữa ăn' } },
        '入浴': { word: '入浴', furigana: 'にゅうよく', meaning: { en: 'bathing', vi: 'tắm rửa' } },
        '排泄': { word: '排泄', furigana: 'はいせつ', meaning: { en: 'excretion', vi: 'bài tiết' } },
        '身体': { word: '身体', furigana: 'しんたい', meaning: { en: 'body', vi: 'cơ thể' } },
        '機能': { word: '機能', furigana: 'きのう', meaning: { en: 'function', vi: 'chức năng' } },
        '障害': { word: '障害', furigana: 'しょうがい', meaning: { en: 'disability', vi: 'khuyết tật' } },
        '高齢者': { word: '高齢者', furigana: 'こうれいしゃ', meaning: { en: 'elderly person', vi: 'người cao tuổi' } },
        '認知症': { word: '認知症', furigana: 'にんちしょう', meaning: { en: 'dementia', vi: 'sa sút trí tuệ' } },
        'リハビリ': { word: 'リハビリ', furigana: 'りはびり', meaning: { en: 'rehabilitation', vi: 'phục hồi chức năng' } },
        '老人': { word: '老人', furigana: 'ろうじん', meaning: { en: 'elderly person', vi: 'người già' } },
        '施設': { word: '施設', furigana: 'しせつ', meaning: { en: 'facility', vi: 'cơ sở' } },
        '介護老人福祉施設': { word: '介護老人福祉施設', furigana: 'かいごろうじんふくししせつ', meaning: { en: 'elderly care welfare facility', vi: 'cơ sở phúc lợi chăm sóc người già' } },
        '生活': { word: '生活', furigana: 'せいかつ', meaning: { en: 'daily life', vi: 'cuộc sống hàng ngày' } },
        '支援': { word: '支援', furigana: 'しえん', meaning: { en: 'support', vi: 'hỗ trợ' } },
        '自立': { word: '自立', furigana: 'じりつ', meaning: { en: 'independence', vi: 'tự lập' } },
        '安全': { word: '安全', furigana: 'あんぜん', meaning: { en: 'safety', vi: 'an toàn' } },
        '健康': { word: '健康', furigana: 'けんこう', meaning: { en: 'health', vi: 'sức khỏe' } },
        '管理': { word: '管理', furigana: 'かんり', meaning: { en: 'management', vi: 'quản lý' } },
        '計画': { word: '計画', furigana: 'けいかく', meaning: { en: 'plan', vi: 'kế hoạch' } },
        '方法': { word: '方法', furigana: 'ほうほう', meaning: { en: 'method', vi: 'phương pháp' } },
        '技術': { word: '技術', furigana: 'ぎじゅつ', meaning: { en: 'technique', vi: 'kỹ thuật' } },
        '知識': { word: '知識', furigana: 'ちしき', meaning: { en: 'knowledge', vi: 'kiến thức' } },
        '経験': { word: '経験', furigana: 'けいけん', meaning: { en: 'experience', vi: 'kinh nghiệm' } },
        '問題': { word: '問題', furigana: 'もんだい', meaning: { en: 'problem', vi: 'vấn đề' } },
        '解決': { word: '解決', furigana: 'かいけつ', meaning: { en: 'solution', vi: 'giải pháp' } },
        '重要': { word: '重要', furigana: 'じゅうよう', meaning: { en: 'important', vi: 'quan trọng' } },
        '必要': { word: '必要', furigana: 'ひつよう', meaning: { en: 'necessary', vi: 'cần thiết' } },
        '可能': { word: '可能', furigana: 'かのう', meaning: { en: 'possible', vi: 'có thể' } },
        '効果': { word: '効果', furigana: 'こうか', meaning: { en: 'effect', vi: 'hiệu quả' } },
        '結果': { word: '結果', furigana: 'けっか', meaning: { en: 'result', vi: 'kết quả' } },
        '原因': { word: '原因', furigana: 'げんいん', meaning: { en: 'cause', vi: 'nguyên nhân' } }
      };
      
      // Extract kanji words from text
      const kanjiRegex = /[\u4e00-\u9faf]+/g;
      const kanjiWords = fullText.match(kanjiRegex) || [];
      
      // Check common terms and individual cache first for instant results
      const foundCommonTerms: { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[] = [];
      const foundCachedTerms: { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[] = [];
      const unknownTerms: string[] = [];
      
      console.log('🔍 Found kanji words:', kanjiWords);
      
      kanjiWords.forEach(word => {
        if (commonTerms[word]) {
          console.log('✅ Found in common terms:', word);
          foundCommonTerms.push(commonTerms[word]);
        } else if (individualWordCache.has(word)) {
          console.log('✅ Found in individual cache:', word);
          foundCachedTerms.push(individualWordCache.get(word)!);
        } else if (word.length > 1) { // Only analyze multi-character words
          console.log('❓ Unknown term to analyze:', word);
          unknownTerms.push(word);
        }
      });
      
      // Combine all found terms
      const allFoundTerms = [...foundCommonTerms, ...foundCachedTerms];
      
      // If we found any terms, return them immediately and analyze unknown terms in background
      if (allFoundTerms.length > 0) {
        console.log('✅ Returning immediate results:', allFoundTerms.length, 'terms');
        // Cache all found terms immediately
        kanjiCache.set(cacheKey, allFoundTerms);
        
        // Analyze unknown terms in background if any
        if (unknownTerms.length > 0) {
          console.log('🔄 Starting background analysis for:', unknownTerms);
          this.analyzeUnknownKanjiTerms(unknownTerms, cacheKey, allFoundTerms);
        }
        
        return allFoundTerms;
      }
      
      // If no common terms found, use AI for all terms
      const prompt = `Extract ALL kanji words from: "${fullText}"

Return JSON array:
[{"word":"介護福祉士","furigana":"かいごふくしし","meaning":{"en":"certified care worker","vi":"nhân viên chăm sóc có chứng chỉ"}}]

Rules:
- Extract ALL kanji words found in the text
- Include both healthcare and general terms
- Max 12 words
- Include single kanji if they are standalone words
- Vietnamese translation must be accurate and concise
- Focus on complete words, not individual characters`;
      
      // AI analysis without timeout
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
      
      // Cache individual words for future use
      uniqueWords.forEach(word => {
        if (word.word && word.furigana && word.meaning && word.meaning.en && word.meaning.vi) {
          individualWordCache.set(word.word, {
            word: word.word,
            furigana: word.furigana,
            meaning: {
              en: word.meaning.en,
              vi: word.meaning.vi
            }
          });
        }
      });
      
      // Cache the result
      kanjiCache.set(cacheKey, uniqueWords);
      
      // Limit cache size to prevent memory issues
      if (kanjiCache.size > 100) {
        const firstKey = kanjiCache.keys().next().value;
        kanjiCache.delete(firstKey);
      }
      
      if (individualWordCache.size > 200) {
        const firstKey = individualWordCache.keys().next().value;
        individualWordCache.delete(firstKey);
      }
      
      return uniqueWords;
    } catch (error) {
      console.error("Error analyzing kanji in question:", error);
      return [];
    }
  },

  // Fresh kanji analysis without cache - for manual button click
  async analyzeKanjiInQuestionFresh(questionText: string, options: string[]): Promise<{ word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[]> {
    const fullText = `${questionText} ${options.join(' ')}`;
    
    console.log('🆕 Starting fresh kanji analysis for:', fullText.substring(0, 100) + '...');
    
    // Extract kanji words from text
    const kanjiRegex = /[\u4e00-\u9faf]+/g;
    const kanjiWords = fullText.match(kanjiRegex) || [];
    
    console.log('🔍 Found kanji words:', kanjiWords);
    
    if (kanjiWords.length === 0) {
      console.log('❌ No kanji words found');
      return [];
    }
    
    // Remove duplicates and limit to reasonable number
    const uniqueKanjiWords = [...new Set(kanjiWords)].slice(0, 15);
    console.log('📝 Analyzing unique kanji words:', uniqueKanjiWords.length);
    
    try {
      
      // Use AI to analyze kanji words in batches
      const prompt = `Analyze these Japanese kanji words and provide furigana and Vietnamese meaning:

${uniqueKanjiWords.join(', ')}

Return ONLY a valid JSON array in this exact format:
[{"word":"介護","furigana":"かいご","meaning":{"en":"nursing care","vi":"chăm sóc y tế"}}]

Requirements:
- One entry per kanji word
- Provide accurate furigana
- Vietnamese meaning must be concise and accurate
- Return valid JSON only, no other text`;
      
      // AI analysis without timeout
      console.log('🤖 Sending request to AI...');
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
      
      console.log('📥 AI response received');
      const jsonText = response.text.trim();
      console.log('📄 Raw AI response:', jsonText.substring(0, 200) + '...');
      
      const parsed = JSON.parse(jsonText) as { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[];
      
      // Quick validation and deduplication
      const validWords = parsed.filter(item => item.word && item.furigana && item.meaning);
      const uniqueWords = validWords.filter((item, index, self) => 
        index === self.findIndex(t => t.word === item.word)
      );
      
      console.log('✅ Fresh analysis completed:', uniqueWords.length, 'words');
      
      // Cache individual words for future use (but not the full result)
      uniqueWords.forEach(word => {
        if (word.word && word.furigana && word.meaning && word.meaning.en && word.meaning.vi) {
          individualWordCache.set(word.word, {
            word: word.word,
            furigana: word.furigana,
            meaning: {
              en: word.meaning.en,
              vi: word.meaning.vi
            }
          });
        }
      });
      
      return uniqueWords;
    } catch (error) {
      console.error("❌ Error in fresh kanji analysis:", error);
      
      // Fallback: return basic kanji words without AI analysis
      console.log('🔄 AI analysis failed, returning basic kanji words');
      const basicWords = uniqueKanjiWords.slice(0, 10).map(word => ({
        word: word,
        furigana: '読み方不明',
        meaning: {
          en: 'Reading unknown',
          vi: 'Cách đọc chưa xác định'
        }
      }));
      return basicWords;
    }
  },

  // Background analysis for unknown terms
  async analyzeUnknownKanjiTerms(unknownTerms: string[], cacheKey: string, existingTerms: { word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[]): Promise<void> {
    try {
      console.log('🔄 Starting background analysis for terms:', unknownTerms);
      
      const prompt = `Analyze these Japanese terms: ${unknownTerms.join(', ')}

Return JSON array with word, furigana, and Vietnamese meaning:
[{"word":"介護","furigana":"かいご","meaning":{"en":"nursing care","vi":"chăm sóc y tế"}}]

Rules:
- Include both healthcare and general terms
- Vietnamese translation must be accurate and concise`;
      
      // Background analysis without timeout
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
      
      const validWords = parsed.filter(item => item.word && item.furigana && item.meaning);
      
      console.log('📝 Background analysis result:', validWords);
      
      // Cache individual words for future use
      validWords.forEach(word => {
        if (word.word && word.furigana && word.meaning && word.meaning.en && word.meaning.vi) {
          individualWordCache.set(word.word, {
            word: word.word,
            furigana: word.furigana,
            meaning: {
              en: word.meaning.en,
              vi: word.meaning.vi
            }
          });
          console.log('💾 Cached individual word:', word.word);
        }
      });
      
      // Update cache with combined results
      const combinedTerms = [...existingTerms, ...validWords];
      kanjiCache.set(cacheKey, combinedTerms);
      
      console.log('✅ Background kanji analysis completed, updated cache for:', cacheKey);
    } catch (error) {
      console.error("❌ Error in background kanji analysis:", error);
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