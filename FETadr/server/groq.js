import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export function loadEnv() {
  const file = path.join(appRoot, ".env")
  if (!fs.existsSync(file)) return
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const splitAt = trimmed.indexOf("=")
    if (splitAt < 1) continue
    const key = trimmed.slice(0, splitAt).trim()
    const value = trimmed.slice(splitAt + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function clampScore(value, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  const stepped = Math.round(number * 2) / 2
  return Math.min(max, Math.max(0, stepped))
}

async function groqChat(messages) {
  const key = process.env.GROQ_API_KEY
  if (!key) {
    const error = new Error("Chưa có GROQ_API_KEY")
    error.status = 503
    throw error
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages,
    }),
  })
  const payload = await response.json()
  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Groq từ chối yêu cầu chấm")
    error.status = 502
    throw error
  }
  const text = payload?.choices?.[0]?.message?.content
  if (!text) {
    const error = new Error("Groq không trả nội dung chấm")
    error.status = 502
    throw error
  }
  return JSON.parse(text)
}

const letterCriteria = [
  { id: "task", name: "Nhiệm vụ và độ dài", max: 5 },
  { id: "layout", name: "Bố cục", max: 4 },
  { id: "language", name: "Ngữ pháp và chính tả", max: 6 },
  { id: "vocab", name: "Từ vựng theo chủ đề", max: 5 },
]

export async function scoreLetter({ prompt, text, wordCount }) {
  const words = Number(wordCount) || 0
  const raw = await groqChat([
    {
      role: "system",
      content: [
        "Bạn là giám khảo chuẩn đầu ra tiếng Anh B1 của Đại học Thủy Lợi.",
        "Chỉ chấm thư hoặc email theo rubric sau. Điểm từng mục là bội số của 0.5, không vượt trần.",
        "Nhiệm vụ và độ dài tối đa 5: đủ ý đề yêu cầu, khoảng 80–100 từ, đúng dạng thư hoặc email. Dưới 70 từ hoặc lạc đề thì mục này tối đa 2.",
        "Bố cục tối đa 4: lời chào, mở bài, thân bài, kết thư.",
        "Ngữ pháp và chính tả tối đa 6: thì, câu, liên từ mức B1. Lỗi nhỏ không trừ sạch điểm nếu ý vẫn rõ.",
        "Từ vựng theo chủ đề tối đa 5.",
        "Nhận xét viết bằng tiếng Việt, ngắn.",
        "Trả JSON đúng dạng: {\"criteria\":[{\"id\":\"task\",\"score\":0,\"comment\":\"\"},{\"id\":\"layout\",\"score\":0,\"comment\":\"\"},{\"id\":\"language\",\"score\":0,\"comment\":\"\"},{\"id\":\"vocab\",\"score\":0,\"comment\":\"\"}],\"advice\":[\"\",\"\",\"\"]}",
      ].join("\n"),
    },
    {
      role: "user",
      content: `Đề:\n${prompt}\n\nSố từ đếm sẵn: ${words}\n\nBài làm:\n${text}`,
    },
  ])
  const byId = new Map((raw.criteria ?? []).map((item) => [item.id, item]))
  const criteria = letterCriteria.map((item) => {
    let score = clampScore(byId.get(item.id)?.score, item.max)
    if (item.id === "task" && (words < 70 || words === 0)) score = Math.min(score, 2)
    return {
      id: item.id,
      name: item.name,
      max: item.max,
      score,
      comment: String(byId.get(item.id)?.comment ?? ""),
    }
  })
  const advice = Array.isArray(raw.advice) ? raw.advice.map(String).filter(Boolean).slice(0, 3) : []
  const total = criteria.reduce((sum, item) => sum + item.score, 0)
  return { criteria, total, max: 20, advice }
}

const speakingMax = { 1: 6, 2: 8, 3: 6 }

export async function scoreSpeaking({ part, title, questions, transcript }) {
  const max = speakingMax[part] ?? 6
  const raw = await groqChat([
    {
      role: "system",
      content: [
        "Bạn là giám khảo nói chuẩn đầu ra tiếng Anh B1 của Đại học Thủy Lợi.",
        `Phần này tối đa ${max} điểm. Điểm là bội số của 0.5 và không vượt trần.`,
        "Chấm trên bản chuyển giọng nói thành chữ. Bỏ qua lỗi rõ ràng do nhận dạng giọng, như từ bị cắt hoặc câu cụt vô nghĩa.",
        "Bốn trục: hoàn thành nhiệm vụ, ngữ pháp, từ vựng, mạch lạc. Quy bốn trục thành một điểm phần.",
        "Phần 1: trả lời tên, quê, chỗ ở, việc học, sở thích, dự định. Câu bỏ trống trừ khoảng 1 điểm.",
        "Phần 2: đúng chủ đề, có chi tiết ai, khi nào, ở đâu, vì sao.",
        "Phần 3: trả lời câu hỏi thêm và có lý do, không chỉ yes/no.",
        "Nhận xét bằng tiếng Việt.",
        "Trả JSON: {\"score\":0,\"task\":\"\",\"grammar\":\"\",\"vocabulary\":\"\",\"coherence\":\"\",\"advice\":[\"\"]}",
      ].join("\n"),
    },
    {
      role: "user",
      content: `Phần ${part}: ${title}\nCâu hỏi:\n${questions.map((question) => `- ${question}`).join("\n")}\n\nBản chữ:\n${transcript}`,
    },
  ])
  return {
    score: clampScore(raw.score, max),
    max,
    task: String(raw.task ?? ""),
    grammar: String(raw.grammar ?? ""),
    vocabulary: String(raw.vocabulary ?? ""),
    coherence: String(raw.coherence ?? ""),
    advice: Array.isArray(raw.advice) ? raw.advice.map(String).filter(Boolean).slice(0, 3) : [],
  }
}

export async function transcribeSpeech({ base64, mime }) {
  const key = process.env.GROQ_API_KEY
  if (!key) {
    const error = new Error("Chưa có GROQ_API_KEY")
    error.status = 503
    throw error
  }
  const bytes = Buffer.from(base64, "base64")
  if (!bytes.length) {
    const error = new Error("File nghe trống")
    error.status = 400
    throw error
  }
  const form = new FormData()
  form.append("file", new Blob([bytes], { type: mime || "audio/webm" }), "speech.webm")
  form.append("model", process.env.GROQ_WHISPER || "whisper-large-v3-turbo")
  form.append("language", "en")
  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  })
  const payload = await response.json()
  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Không chuyển được giọng nói thành chữ")
    error.status = 502
    throw error
  }
  return { text: String(payload.text ?? "").trim() }
}
