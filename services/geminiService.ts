import { GoogleGenAI } from "@google/genai";

export const generateOudPoetry = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    const prompt = "اكتب لي 3 أبيات شعرية قصيرة جداً وجميلة ومعبرة عن رائحة العود، والمبخرة، والكرم السعودي، باللغة العربية الفصحى. اجعلها مفعمة بالمشاعر.";

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.9,
      },
    });

    return response.text || "يا ضيفنا لو زرتنا لوجدتنا نحن الضيوف وأنت رب المنزلِ";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "العود يفوح والعنبر يفوح، مرحباً بالضيف في دار الكرم.\n(نعتذر، حدث خطأ في الاتصال بالخدمة)";
  }
};