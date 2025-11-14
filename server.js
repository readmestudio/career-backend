import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

app.post("/api/generate-career", async (req, res) => {
  const { experiences } = req.body;

  if (!experiences) {
    return res.status(400).json({ error: "experiences is required" });
  }

  const prompt = `
너는 '경력기술서 자동 생성 엔진'이다.
입력된 경험 배열을 기반으로, 각 경험에 대해:
1) 구조화 JSON
2) 서술형 경력기술서
둘 모두 생성하라.

입력 데이터:
${JSON.stringify(experiences, null, 2)}
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsed = JSON.parse(textResponse);
    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "AI 오류", detail: err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});
