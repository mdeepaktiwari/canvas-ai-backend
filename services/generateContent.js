const ai = require("../config/gemini");

async function generateContentWithGemini(prompt, res) {
  let fullText = "";
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    fullText += text;
    res.write(text);
  }

  return fullText;
}

module.exports = {
  generateContentWithGemini,
};
