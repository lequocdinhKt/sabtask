/**
 * File: services/groqService.ts
 * Mục đích: Lớp dịch vụ gọi Groq AI qua groq-sdk cho ba tính năng của SabTask:
 * tách task thành danh sách subtask, gợi ý mức ưu tiên cho task và trả lời trợ lý trong Team Hub.
 * API key lấy từ biến môi trường GROQ_API_KEY; client chạy trực tiếp trên browser nên chỉ phù hợp demo/học tập.
 */

import Groq from 'groq-sdk';

/** Tên model Groq được dùng cho mọi lời gọi AI trong file này. */
const GROQ_MODEL = 'openai/gpt-oss-20b';

/** Client Groq dùng chung, cho phép gọi trực tiếp từ browser vì ứng dụng là SPA không có backend riêng. */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Hàm dùng chung để gửi một prompt tới model Groq và lấy phần nội dung văn bản trả về.
 * @param prompt Nội dung yêu cầu gửi cho model.
 * @returns Văn bản kết quả đã cắt khoảng trắng, hoặc chuỗi rỗng nếu model không trả nội dung.
 */
const chatText = async (prompt: string): Promise<string> => {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
};

/**
 * Yêu cầu AI chia nhỏ một task thành 3–5 subtask ngắn, có thể thực hiện được.
 * Hàm tự loại bỏ khung markdown ```json trước khi parse JSON.
 * @param taskTitle Tiêu đề task cần chia nhỏ.
 * @param taskDescription Mô tả chi tiết của task.
 * @returns Mảng tên subtask; nếu gọi AI hoặc parse thất bại thì trả về mảng chứa một thông báo lỗi.
 */
export const generateSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  try {
    const prompt = `
      Break down the following software development task into 3-5 concise, actionable subtasks. 
      Return ONLY a raw JSON array of strings. Do not include markdown formatting like \`\`\`json.
      
      Task: ${taskTitle}
      Description: ${taskDescription}
    `;

    const text = (await chatText(prompt)) || '[]';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error generating subtasks:', error);
    return ['Failed to generate subtasks. Try again.'];
  }
};

/**
 * Nhờ AI suy luận mức độ khẩn cấp từ tiêu đề task để gợi ý mức ưu tiên khi tạo/sửa task.
 * @param taskTitle Tiêu đề task cần đánh giá.
 * @returns Chuỗi in hoa dạng LOW/MEDIUM/HIGH; mặc định là MEDIUM khi lỗi hoặc không có kết quả.
 */
export const suggestPriority = async (taskTitle: string): Promise<string> => {
  try {
    const text = await chatText(
      `Analyze this task title: "${taskTitle}". Suggest a priority level (LOW, MEDIUM, or HIGH) based on urgency implied. Return ONLY the word.`
    );
    return text.toUpperCase() || 'MEDIUM';
  } catch {
    return 'MEDIUM';
  }
};

/**
 * Sinh câu trả lời ngắn cho trợ lý AI trong khung chat Team Hub.
 * @param userMessage Tin nhắn người dùng gửi cho trợ lý.
 * @returns Câu trả lời của AI, hoặc câu thông báo thay thế khi không gọi được dịch vụ.
 */
export const askTeamAssistant = async (userMessage: string): Promise<string> => {
  try {
    const text = await chatText(
      `You are a helpful team assistant for SabTask. User said: "${userMessage}". Reply briefly and helpfully.`
    );
    return text || "I'm not sure how to help with that yet.";
  } catch (err) {
    console.error(err);
    return "Sorry, I couldn't reach the AI service right now.";
  }
};
