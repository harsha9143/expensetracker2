const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

exports.getCategory = async (itemName) => {
  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Provide one category for the item: ${itemName}. Respond with only category name`,
  });

  return response.text;
};
