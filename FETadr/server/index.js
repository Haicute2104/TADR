import cors from "cors"
import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { loadEnv, scoreLetter, scoreSpeaking, transcribeSpeech } from "./groq.js"

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, "..")
const answerDir = path.resolve(appRoot, "../TADR/L/Answer")

const app = express()
app.use(cors())
app.use(express.json({ limit: "20mb" }))

app.get("/api/health", (_req, res) => {
  res.json({ ok: true })
})

app.post("/api/score/letter", async (req, res) => {
  try {
    const text = String(req.body?.text ?? "").trim()
    const prompt = String(req.body?.prompt ?? "").trim()
    if (!text || !prompt) {
      res.status(400).json({ error: "Thiếu đề hoặc bài viết" })
      return
    }
    const result = await scoreLetter({
      prompt,
      text,
      wordCount: Number(req.body?.wordCount) || text.split(/\s+/).filter(Boolean).length,
    })
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Không chấm được thư" })
  }
})

app.post("/api/transcribe", async (req, res) => {
  try {
    const base64 = String(req.body?.base64 ?? "")
    if (!base64) {
      res.status(400).json({ error: "Thiếu file nghe" })
      return
    }
    const result = await transcribeSpeech({ base64, mime: req.body?.mime })
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Không nhận dạng được giọng nói" })
  }
})

app.post("/api/score/speaking", async (req, res) => {
  try {
    const transcript = String(req.body?.transcript ?? "").trim()
    const part = Number(req.body?.part)
    const questions = Array.isArray(req.body?.questions) ? req.body.questions.map(String) : []
    if (!transcript || ![1, 2, 3].includes(part)) {
      res.status(400).json({ error: "Thiếu phần nói hoặc bản chữ" })
      return
    }
    const result = await scoreSpeaking({
      part,
      title: String(req.body?.title ?? ""),
      questions,
      transcript,
    })
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Không chấm được phần nói" })
  }
})

app.get("/api/answers", (_req, res) => {
  const files = fs
    .readdirSync(answerDir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .map((name) => `/media/answers/${name}`)
  res.json(files)
})

app.use("/media/answers", express.static(answerDir))
app.use("/media", express.static(path.join(appRoot, "media")))

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`TADR server http://localhost:${port}`)
})
