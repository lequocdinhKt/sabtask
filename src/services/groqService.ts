/**
 * File: groqService.ts
 * Trách nhiệm: Gọi Groq AI để gợi ý subtask, mức ưu tiên và trả lời bot Team Hub.
 * Liên quan: hooks/useTaskForm.ts, components/TeamHub.tsx, vite.config.ts (GROQ_API_KEY).
 */

import Groq from 'groq-sdk';

/**
 * Model Groq hiện còn hỗ trợ (Llama 3.3 đã bị gỡ / không còn access trên nhiều tài khoản).
 * Xem danh sách mới: https://console.groq.com/docs/models
 */
const GROQ_MODEL = 'openai/gpt-oss-20b';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  // SPA chạy trên browser; key nằm trong .env (chỉ dùng cho demo/học tập)
  dangerouslyAllowBrowser: true,
});

/** Gọi chat completion và lấy nội dung text trả về */
const chatText = async (prompt: string): Promise<string> => {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
};

/** Gọi Groq để tách task thành 3–5 subtask dạng JSON array */
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

/** Phân tích tiêu đề task và trả về mức ưu tiên LOW/MEDIUM/HIGH */
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

/** Trả lời ngắn cho bot Team Hub khi user mention @ai / @groq */
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
