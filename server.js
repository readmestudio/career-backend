import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/generate", async (req, res) => {
  const { experiences } = req.body;

  if (!experiences) {
    return res.status(400).json({ error: "experiences is required" });
  }

  const prompt = `
너는 ‘경력기술서 자동 생성 엔진’이다.

[출력 형식]
JSON만 출력:

{
  "structured": [{...}],
  "narrative": ""
}

입력 데이터:
${JSON.stringify(experiences, null, 2)}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = JSON.parse(text);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error", detail: err.toString() });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});
