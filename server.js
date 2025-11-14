import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // <-- 수정됨

app.post("/generate", async (req, res) => {
  const { experiences } = req.body;

  if (!experiences) {
    return res.status(400).json({ error: "experiences is required" });
  }

  const prompt = `
너는 ‘경력기술서 자동 생성 엔진’이다.

사용자가 제공한 경험은 불완전할 수 있다. 일부 필드는 공란일 수 있다.
공란이 있을 경우 반드시 아래 규칙대로 자연스럽게 보완하라.

[필수 경험 구조]
1. 경험 제목 (experienceTitle)
2. 문제 (problem)
3. 나의 역할 (role)
4. 전략 (strategy)
5. 액션(한 일) (action)
6. 결과 (result)

[보완 규칙]
- problem 이 비어 있으면 experienceTitle 기반으로 자연스럽게 생성한다.
- role 이 비어 있으면 문제와 맥락을 고려해 적절히 추론한다.
- strategy 가 비어 있으면 문제 해결을 위한 전략을 자동 생성한다.
- action 이 비어 있으면 전략을 실행하기 위한 구체적 행동을 자동으로 만든다.
- result 가 비어 있으면 현실적인 정량·정성 결과로 자연스럽게 작성한다.

[출력 형식]
코드 블록 없이 JSON만 출력하라:

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

    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI Error", detail: err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});
