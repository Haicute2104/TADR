import { Alert, Button, Card, Input, Select, Typography } from "antd"
import { useRef, useState } from "react"
import { ScoreResult } from "../components/ScoreResult"
import { personalPoints, speakingTopics } from "../data/speaking"

const { Paragraph, Text, Title } = Typography
const { TextArea } = Input

const catalog = speakingTopics.map((topic, index) => ({
  id: topic.id,
  title: topic.title,
  label: `Topic ${index + 1} · ${topic.title}`,
  sample: topic.sample,
  points: topic.points,
  closing: topic.closing,
  blocks: [
    {
      key: "personal",
      part: 1,
      kind: "points",
      label: "Part 1 · thông tin cá nhân · 6 điểm",
      questions: personalPoints,
    },
    {
      key: "talk",
      part: 2,
      kind: "cue",
      label: "Part 2 · You should say · 8 điểm",
      questions: [
        topic.title,
        "You should say:",
        ...topic.points,
        ...(topic.closing ? [topic.closing] : []),
      ],
    },
    {
      key: "follow",
      part: 3,
      kind: "questions",
      label: "Part 3 · thảo luận · 6 điểm",
      questions: topic.followUps,
    },
  ],
}))

function createRecognizer() {
  const speechWindow = window
  const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
  if (!Recognition) return null
  const recognition = new Recognition()
  recognition.lang = "en-US"
  recognition.continuous = true
  recognition.interimResults = true
  return recognition
}

export function SpeakingPage({ onOpenPlan }) {
  const [view, setView] = useState("paper")
  const [openSample, setOpenSample] = useState({})
  const [topicId, setTopicId] = useState(catalog[0].id)
  const [blockKey, setBlockKey] = useState(catalog[0].blocks[0].key)
  const [transcript, setTranscript] = useState("")
  const [recording, setRecording] = useState(false)
  const [interim, setInterim] = useState("")
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const recognitionRef = useRef(null)
  const listeningRef = useRef(false)
  const prefixRef = useRef("")
  const stableRef = useRef("")
  const topic = catalog.find((item) => item.id === topicId) ?? catalog[0]
  const block = topic.blocks.find((item) => item.key === blockKey) ?? topic.blocks[0]

  function stopListening() {
    listeningRef.current = false
    recognitionRef.current?.stop()
    setInterim("")
    setRecording(false)
  }

  function chooseTopic(nextId) {
    stopListening()
    const next = catalog.find((item) => item.id === nextId) ?? catalog[0]
    setTopicId(next.id)
    setBlockKey(next.blocks[0].key)
    stableRef.current = ""
    setTranscript("")
    setResult(null)
  }

  function chooseBlock(nextKey) {
    stopListening()
    setBlockKey(nextKey)
    stableRef.current = ""
    setTranscript("")
    setResult(null)
  }

  function toggleRecord() {
    setError("")
    if (listeningRef.current) {
      listeningRef.current = false
      recognitionRef.current?.stop()
      setTranscript(stableRef.current)
      setInterim("")
      setRecording(false)
      return
    }
    const recognition = createRecognizer()
    if (!recognition) {
      setError("Hãy mở trang bằng Chrome hoặc Edge để chữ hiện ngay khi đang nói.")
      return
    }
    prefixRef.current = transcript.trim()
    stableRef.current = transcript.trim()
    listeningRef.current = true
    recognition.onresult = (event) => {
      let finals = ""
      let pending = ""
      for (let index = 0; index < event.results.length; index += 1) {
        const piece = event.results[index][0]?.transcript ?? ""
        if (event.results[index].isFinal) finals = `${finals} ${piece}`
        else pending = `${pending} ${piece}`
      }
      stableRef.current = [prefixRef.current, finals.trim()].filter(Boolean).join(" ")
      const live = pending.trim()
      setInterim(live)
      setTranscript(live ? `${stableRef.current} ${live}`.trim() : stableRef.current)
    }
    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return
      listeningRef.current = false
      setRecording(false)
      setError("Micro chưa nhận tiếng. Hãy cho phép micro rồi nói lại.")
    }
    recognition.onend = () => {
      if (!listeningRef.current) {
        setRecording(false)
        setInterim("")
        setTranscript(stableRef.current)
        return
      }
      prefixRef.current = stableRef.current
      try {
        recognition.start()
      } catch {
        listeningRef.current = false
        setRecording(false)
      }
    }
    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  async function score() {
    setBusy("Đang chấm...")
    setError("")
    try {
      const response = await fetch("/api/score/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: block.part,
          title: topic.title,
          questions: block.questions,
          transcript,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Không chấm được")
      setResult(payload)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không chấm được")
    } finally {
      setBusy("")
    }
  }

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Nói</Title>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button size="large" type={view === "paper" ? "primary" : "default"} onClick={() => setView("paper")}>
          Đề
        </Button>
        <Button size="large" type={view === "practice" ? "primary" : "default"} onClick={() => setView("practice")}>
          Luyện nói
        </Button>
      </div>
      {view === "paper" ? (
        <PaperView openSample={openSample} setOpenSample={setOpenSample} />
      ) : (
        <PracticeView
          topic={topic}
          block={block}
          recording={recording}
          busy={busy}
          transcript={transcript}
          interim={interim}
          error={error}
          result={result}
          onTopic={chooseTopic}
          onBlock={chooseBlock}
          onRecord={toggleRecord}
          onScore={score}
          onTranscript={(value) => {
            stableRef.current = value
            setTranscript(value)
          }}
          onOpenPlan={onOpenPlan}
        />
      )}
    </div>
  )
}

function PromptBlock({ topic, block }) {
  if (block.kind === "cue") {
    return (
      <div className="speak-cue">
        <div className="speak-question">{topic.title}</div>
        <Text strong>You should say:</Text>
        <ul className="speak-points">
          {topic.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
        {topic.closing && <div className="speak-closing">{topic.closing}</div>}
      </div>
    )
  }
  return block.questions.map((question) => (
    <div key={question} className="speak-question">{question}</div>
  ))
}

function PaperView({ openSample, setOpenSample }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {catalog.map((topic) => (
        <Card key={topic.id} title={topic.label}>
          {topic.blocks.map((item) => (
            <div key={item.key} style={{ marginBottom: 12 }}>
              <Text type="secondary">{item.label}</Text>
              <PromptBlock topic={topic} block={item} />
            </div>
          ))}
          <Button onClick={() => setOpenSample((current) => ({ ...current, [topic.id]: !current[topic.id] }))}>
            {openSample[topic.id] ? "Ẩn bài mẫu" : "Xem bài mẫu"}
          </Button>
          {openSample[topic.id] && <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>{topic.sample}</Paragraph>}
        </Card>
      ))}
    </div>
  )
}

function PracticeView({
  topic,
  block,
  recording,
  busy,
  transcript,
  interim,
  error,
  result,
  onTopic,
  onBlock,
  onRecord,
  onScore,
  onTranscript,
  onOpenPlan,
}) {
  return (
    <div>
      <Paragraph>Chọn một chủ đề, đọc câu hỏi, rồi nói. Chữ hiện ngay khi bạn đang nói.</Paragraph>
      <Select
        value={topic.id}
        size="large"
        style={{ width: "100%", maxWidth: 560, marginBottom: 16 }}
        options={catalog.map((item) => ({ value: item.id, label: item.label }))}
        onChange={onTopic}
      />
      <Card title={topic.label}>
        {topic.blocks.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {topic.blocks.map((item) => (
              <Button
                key={item.key}
                type={item.key === block.key ? "primary" : "default"}
                onClick={() => onBlock(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        )}
        <PromptBlock topic={topic} block={block} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <Button type={recording ? "primary" : "default"} danger={recording} onClick={onRecord} disabled={Boolean(busy)}>
            {recording ? "Dừng nói" : "Bắt đầu nói"}
          </Button>
          <Button type="primary" disabled={!transcript.trim() || recording || Boolean(busy)} onClick={onScore}>
            Chấm phần này
          </Button>
        </div>
        <TextArea
          style={{ marginTop: 12 }}
          rows={6}
          value={transcript}
          placeholder="Chữ sẽ chạy ra đây ngay khi bạn nói. Dừng mic rồi có thể sửa tay."
          readOnly={recording}
          onChange={(event) => onTranscript(event.target.value)}
        />
        {recording && (
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            {interim ? `Đang nghe: ${interim}` : "Đang nghe... hãy nói tiếng Anh."}
          </Text>
        )}
        {busy && <Alert style={{ marginTop: 12 }} type="info" showIcon title={busy} />}
        {error && <Alert style={{ marginTop: 12 }} type="error" showIcon title={error} />}
        <ScoreResult result={result} />
      </Card>
      <Button style={{ marginTop: 16 }} onClick={onOpenPlan}>
        Xem rubric chấm
      </Button>
    </div>
  )
}
