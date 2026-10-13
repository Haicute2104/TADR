import { Alert, Button, Card, Input, Progress, Space, Statistic, Steps, Typography } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { ListeningBoard } from "../components/ListeningBoard"
import { NoticeCard } from "../components/NoticeCard"
import { TextQuestion } from "../components/TextQuestion"
import { grammarAnswer, grammarQuestionList } from "../data/grammar"
import { letters } from "../data/letters"
import { listeningParts } from "../data/listening"
import { readingItems } from "../data/reading"
import { personalPoints, speakingTopics } from "../data/speaking"
import { acceptsWrittenAnswer, answerLeadFor, compareWrittenAnswer, countWords } from "../lib/answers"
import { buildPaper, writingItems } from "../lib/paper"

const { Paragraph, Text, Title } = Typography
const { TextArea } = Input

function formatMark(value) {
  return String(Math.round(Number(value) * 100) / 100).replace(".", ",")
}

export function MockPage() {
  const [paper, setPaper] = useState(null)
  const [step, setStep] = useState(0)
  const [listeningIndex, setListeningIndex] = useState(0)
  const [listeningAnswers, setListeningAnswers] = useState({})
  const [grammarAnswers, setGrammarAnswers] = useState({})
  const [noticeAnswers, setNoticeAnswers] = useState({})
  const [writingDrafts, setWritingDrafts] = useState({})
  const [letterDraft, setLetterDraft] = useState("")
  const [speakingTranscript, setSpeakingTranscript] = useState("")
  const [speakingInterim, setSpeakingInterim] = useState("")
  const [speakingRecording, setSpeakingRecording] = useState(false)
  const [speakingBusy, setSpeakingBusy] = useState(false)
  const [speakingError, setSpeakingError] = useState("")
  const [speakingResult, setSpeakingResult] = useState(null)
  const [letterResult, setLetterResult] = useState(null)
  const [left, setLeft] = useState(75 * 60)
  const [running, setRunning] = useState(false)
  const recognitionRef = useRef(null)
  const listeningRef = useRef(false)
  const prefixRef = useRef("")
  const stableRef = useRef("")

  useEffect(() => {
    if (!running) return undefined
    const timer = setInterval(() => {
      setLeft((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  const minutes = String(Math.floor(left / 60)).padStart(2, "0")
  const seconds = String(left % 60).padStart(2, "0")

  function start() {
    setPaper(buildPaper())
    setStep(1)
    setListeningIndex(0)
    setListeningAnswers({})
    setGrammarAnswers({})
    setNoticeAnswers({})
    setWritingDrafts({})
    setLetterDraft("")
    listeningRef.current = false
    recognitionRef.current?.stop()
    setSpeakingTranscript("")
    setSpeakingInterim("")
    setSpeakingRecording(false)
    setSpeakingBusy(false)
    setSpeakingError("")
    setSpeakingResult(null)
    setLetterResult(null)
    stableRef.current = ""
    setLeft(75 * 60)
    setRunning(true)
  }

  const result = useMemo(() => {
    if (!paper) return null
    const grammarScore = paper.grammar.filter((number) => grammarAnswers[number] === grammarAnswer(number)).length
    const noticeScore = paper.notices.filter((id) => {
      const item = readingItems.find((notice) => notice.id === id)
      return noticeAnswers[id] === item?.answer
    }).length
    const writingScore = paper.writing.reduce((sum, id) => {
      const item = writingItems.find((row) => row.id === id)
      if (!item) return sum
      return sum + (acceptsWrittenAnswer(writingDrafts[id] ?? "", answerLeadFor(item), item.answers) ? 2 : 0)
    }, 0)
    const listeningByPart = {}
    const listeningScore = paper.listening.reduce((sum, slot) => {
      const part = listeningParts.find((item) => item.id === slot.partId)
      const test = part?.tests.find((item) => item.id === slot.testId)
      if (!part || !test?.answers) {
        if (part) listeningByPart[part.id] = 0
        return sum
      }
      const correct = part.questions.filter((number) => listeningAnswers[`${part.id}-${number}`] === test.answers[number]).length
      const points = correct * part.pointsEach
      listeningByPart[part.id] = points
      return sum + points
    }, 0)
    const misses = [
      ...paper.listening.flatMap((slot) => {
        const part = listeningParts.find((item) => item.id === slot.partId)
        const test = part?.tests.find((item) => item.id === slot.testId)
        if (!part || !test?.answers) return []
        return part.questions
          .filter((number) => listeningAnswers[`${part.id}-${number}`] !== test.answers[number])
          .map((number) => ({
            id: `listen-${part.id}-${number}`,
            group: "listen",
            title: `${part.title} · ${test.title} · Câu ${number}`,
            yours: listeningAnswers[`${part.id}-${number}`] || "Chưa chọn",
            correct: test.answers[number],
          }))
      }),
      ...paper.grammar.flatMap((number) => {
        const question = grammarQuestionList.find((item) => item.number === number)
        if (!question || grammarAnswers[number] === question.answer) return []
        const chosen = question.options.find((option) => option.key === grammarAnswers[number])
        const right = question.options.find((option) => option.key === question.answer)
        return [{
          id: `grammar-${number}`,
          group: "read",
          title: `Ngữ pháp · Câu ${number}`,
          detail: question.stem,
          yours: chosen ? `${chosen.key}. ${chosen.text}` : "Chưa chọn",
          correct: right ? `${right.key}. ${right.text}` : question.answer,
        }]
      }),
      ...paper.notices.flatMap((id) => {
        const notice = readingItems.find((item) => item.id === id)
        if (!notice || noticeAnswers[id] === notice.answer) return []
        const chosen = notice.options.find((option) => option.key === noticeAnswers[id])
        const right = notice.options.find((option) => option.key === notice.answer)
        return [{
          id: `notice-${id}`,
          group: "read",
          title: `Biển báo · ${notice.label}`,
          detail: notice.prompt,
          yours: chosen ? `${chosen.key}. ${chosen.text}` : "Chưa chọn",
          correct: right ? `${right.key}. ${right.text}` : notice.answer,
        }]
      }),
      ...paper.writing.flatMap((id, index) => {
        const item = writingItems.find((row) => row.id === id)
        if (!item) return []
        const lead = answerLeadFor(item)
        const draft = writingDrafts[id] ?? ""
        if (acceptsWrittenAnswer(draft, lead, item.answers)) return []
        return [{
          id: `write-${id}`,
          group: "write",
          title: `Viết lại câu ${index + 1}`,
          detail: item.prompt,
          compare: compareWrittenAnswer(draft, lead, item.answers),
        }]
      }),
    ]
    return { grammarScore, noticeScore, writingScore, listeningScore, listeningByPart, misses }
  }, [paper, grammarAnswers, noticeAnswers, writingDrafts, listeningAnswers])

  const writtenTotal = result
    ? result.listeningScore + result.grammarScore + result.noticeScore + result.writingScore
    : 0
  const speakingPoints = speakingResult?.total ?? 0
  const letterPoints = letterResult?.total ?? 0
  const grandTotal = writtenTotal + letterPoints + speakingPoints
  const speakingTopic = speakingTopics.find((item) => item.id === paper?.speaking) ?? speakingTopics[0]
  const speakingIndex = speakingTopics.findIndex((item) => item.id === speakingTopic.id) + 1

  function toggleSpeaking() {
    setSpeakingError("")
    if (listeningRef.current) {
      listeningRef.current = false
      recognitionRef.current?.stop()
      setSpeakingTranscript(stableRef.current)
      setSpeakingInterim("")
      setSpeakingRecording(false)
      return
    }
    const speechWindow = window
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setSpeakingError("Hãy mở trang bằng Chrome hoặc Edge để chữ hiện ngay khi đang nói.")
      return
    }
    const recognition = new Recognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true
    prefixRef.current = speakingTranscript.trim()
    stableRef.current = speakingTranscript.trim()
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
      setSpeakingInterim(live)
      setSpeakingTranscript(live ? `${stableRef.current} ${live}`.trim() : stableRef.current)
    }
    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return
      listeningRef.current = false
      setSpeakingRecording(false)
      setSpeakingError("Micro chưa nhận tiếng. Hãy cho phép micro rồi nói lại.")
    }
    recognition.onend = () => {
      if (!listeningRef.current) {
        setSpeakingRecording(false)
        setSpeakingInterim("")
        setSpeakingTranscript(stableRef.current)
        return
      }
      prefixRef.current = stableRef.current
      try {
        recognition.start()
      } catch {
        listeningRef.current = false
        setSpeakingRecording(false)
      }
    }
    recognitionRef.current = recognition
    recognition.start()
    setSpeakingRecording(true)
  }

  async function finishExam() {
    listeningRef.current = false
    recognitionRef.current?.stop()
    setSpeakingRecording(false)
    setSpeakingInterim("")
    setRunning(false)
    const transcript = (stableRef.current || speakingTranscript).trim()
    setSpeakingTranscript(transcript)
    setSpeakingBusy(true)
    setSpeakingError("")
    const topicQuestions = [speakingTopic.title, "You should say:", ...speakingTopic.points, speakingTopic.closing].filter(Boolean)
    const letterPrompt = letters.find((item) => item.id === paper.letter)?.prompt ?? ""
    const letterText = letterDraft.trim()
    try {
      const [letterOutcome, speakingOutcome] = await Promise.all([
        letterText
          ? fetch("/api/score/letter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topicId: paper.letter,
              prompt: letterPrompt,
              text: letterText,
              wordCount: countWords(letterText),
            }),
          }).then(async (response) => {
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || "Không chấm được thư")
            return { ...payload, note: "" }
          })
          : Promise.resolve({
            criteria: [],
            total: 0,
            max: 20,
            advice: [],
            note: "Bạn chưa viết thư nên phần này 0/20 điểm.",
          }),
        transcript
          ? fetch("/api/score/speaking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              part: 2,
              title: speakingTopic.title,
              questions: [
                ...topicQuestions,
                "Chỉ chấm đoạn nói về topic này. Bỏ qua phần giới thiệu bản thân và các câu trả lời hỏi thêm nếu chúng nằm trong cùng bản chữ.",
              ],
              transcript,
            }),
          }).then(async (response) => {
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || "Không chấm được phần nói")
            return {
              parts: [{ part: 2, title: speakingTopic.title, ...payload }],
              total: payload.score,
              max: 8,
              note: "",
            }
          })
          : Promise.resolve({
            parts: [],
            total: 0,
            max: 8,
            note: "Bạn chưa nói về topic nên phần này 0/20 điểm.",
          }),
      ])
      setLetterResult(letterOutcome)
      setSpeakingResult(speakingOutcome)
      setStep(5)
    } catch (caught) {
      setSpeakingError(caught instanceof Error ? caught.message : "Không chấm được bài")
    } finally {
      setSpeakingBusy(false)
    }
  }

  if (!paper || step === 0) {
    return (
      <div>
        <Title level={3} style={{ marginTop: 0 }}>Thi thử</Title>
        <Paragraph>
          Đề gồm nghe, đọc, viết và một topic nói kèm giới thiệu bản thân. Nộp bài xong mới có tổng điểm. Đậu từ 40 điểm. Thời gian gợi ý của phần viết là 75 phút.
        </Paragraph>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="Chưa có ngân hàng bài đọc dài và bài điền từ, nên hai phần đó không có trong đề. Thư được chấm khi nộp bài. Phần nghe chấm theo đáp án của từng đề."
        />
        <Button type="primary" onClick={start}>Tạo đề mới</Button>
      </div>
    )
  }

  const listenPart = listeningParts[listeningIndex]
  const listenSlot = paper.listening.find((item) => item.partId === listenPart.id)
  const listenTest = listenPart.tests.find((item) => item.id === listenSlot?.testId) ?? listenPart.tests[0]

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} align="start">
        <Title level={3} style={{ margin: 0 }}>Thi thử</Title>
        <Statistic title="Thời gian còn" value={`${minutes}:${seconds}`} />
      </Space>
      <Steps
        current={step - 1}
        style={{ marginBottom: 16 }}
        items={[{ title: "Nghe" }, { title: "Đọc" }, { title: "Viết" }, { title: "Nói" }, { title: "Điểm" }]}
      />
      {step === 1 && (
        <ListeningBoard
          partId={listenPart.id}
          testId={listenTest.id}
          allowReveal={false}
          answers={listeningAnswers}
          onAnswer={(id, choice) => setListeningAnswers((current) => ({ ...current, [id]: choice }))}
          extra={
            <div style={{ marginTop: 16 }}>
              {listeningIndex < listeningParts.length - 1 ? (
                <Button type="primary" onClick={() => setListeningIndex((value) => value + 1)}>Phần nghe tiếp</Button>
              ) : (
                <Button type="primary" onClick={() => setStep(2)}>Sang phần đọc</Button>
              )}
            </div>
          }
        />
      )}
      {step === 2 && (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card title="Đọc · 10 câu ngữ pháp và từ vựng">
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              {paper.grammar.map((number) => {
                const question = grammarQuestionList.find((item) => item.number === number)
                if (!question) return null
                return (
                  <TextQuestion
                    key={number}
                    label={`Câu ${number}`}
                    stem={question.stem}
                    options={question.options}
                    value={grammarAnswers[number]}
                    onChange={(choice) => setGrammarAnswers((current) => ({ ...current, [number]: choice }))}
                    revealed={false}
                    answer={question.answer}
                  />
                )
              })}
            </Space>
          </Card>
          <Card title="Đọc · 5 biển báo">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {paper.notices.map((id) => {
                const notice = readingItems.find((item) => item.id === id)
                if (!notice) return null
                return (
                  <NoticeCard
                    key={id}
                    item={notice}
                    value={noticeAnswers[id]}
                    revealed={false}
                    onChange={(choice) => setNoticeAnswers((current) => ({ ...current, [id]: choice }))}
                  />
                )
              })}
            </Space>
          </Card>
          <Button type="primary" onClick={() => setStep(3)}>Sang phần viết</Button>
        </Space>
      )}
      {step === 3 && (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {paper.writing.map((id, index) => {
            const item = writingItems.find((row) => row.id === id)
            if (!item) return null
            const lead = answerLeadFor(item)
            return (
              <div
                key={id}
                style={{ padding: "12px 14px", borderRadius: 12, background: "#f7f9fc", border: "1px solid #e6edf5" }}
              >
                <Paragraph style={{ marginTop: 0 }}>
                  <Text type="secondary">Câu {index + 1} · Câu gốc: </Text>
                  “{item.prompt}”
                </Paragraph>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {lead && <Text strong style={{ whiteSpace: "nowrap" }}>{lead}</Text>}
                  <Input
                    value={writingDrafts[id] ?? ""}
                    placeholder={lead ? "viết tiếp câu..." : "viết cả câu..."}
                    onChange={(event) => setWritingDrafts((current) => ({ ...current, [id]: event.target.value }))}
                  />
                </div>
              </div>
            )
          })}
          <Card title="Viết thư · 80–100 từ">
            <Paragraph>{letters.find((item) => item.id === paper.letter)?.prompt}</Paragraph>
            <TextArea rows={8} value={letterDraft} onChange={(event) => setLetterDraft(event.target.value)} />
            <Paragraph style={{ marginTop: 8 }}>Số từ: {countWords(letterDraft)}</Paragraph>
          </Card>
          <Button
            type="primary"
            onClick={() => {
              setRunning(false)
              setStep(4)
            }}
          >
            Sang phần nói
          </Button>
        </Space>
      )}
      {step === 4 && (
        <Card title={`Nói · Topic ${speakingIndex}`}>
          <Paragraph style={{ marginTop: 0 }}>
            Nói một lượt: giới thiệu bản thân, rồi nói topic, rồi trả lời câu hỏi thêm. Điểm nói chỉ chấm phần topic, tối đa 8/20. Nộp bài xong mới có tổng trên 100.
          </Paragraph>
          <Text type="secondary">Part 1 · giới thiệu bản thân</Text>
          {personalPoints.map((point) => (
            <div key={point} className="speak-question">{point}</div>
          ))}
          <div style={{ marginTop: 12 }}>
              <Text type="secondary">Part 2 · nói về topic · 8 điểm, phần được chấm</Text>
            <div className="speak-cue">
              <div className="speak-question">{speakingTopic.title}</div>
              <Text strong>You should say:</Text>
              <ul className="speak-points">
                {speakingTopic.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              {speakingTopic.closing && <div className="speak-closing">{speakingTopic.closing}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
              <Text type="secondary">Part 3 · câu hỏi thêm</Text>
            {speakingTopic.followUps.map((question) => (
              <div key={question} className="speak-question">{question}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            <Button danger={speakingRecording} type={speakingRecording ? "primary" : "default"} onClick={toggleSpeaking} disabled={speakingBusy}>
              {speakingRecording ? "Dừng nói" : "Bắt đầu nói"}
            </Button>
            <Button type="primary" onClick={finishExam} disabled={speakingRecording || speakingBusy}>
              {speakingBusy ? "Đang chấm thư, phần nói và tính điểm..." : "Nộp bài"}
            </Button>
          </div>
          <TextArea
            style={{ marginTop: 12 }}
            rows={5}
            value={speakingTranscript}
            readOnly={speakingRecording}
            placeholder="Chữ sẽ chạy ra đây ngay khi bạn nói. Có thể gõ nếu không dùng micro."
            onChange={(event) => {
              stableRef.current = event.target.value
              setSpeakingTranscript(event.target.value)
            }}
          />
          {speakingRecording && (
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              {speakingInterim ? `Đang nghe: ${speakingInterim}` : "Đang nghe... hãy nói tiếng Anh."}
            </Text>
          )}
          {speakingError && <Alert style={{ marginTop: 12 }} type="error" showIcon title={speakingError} />}
        </Card>
      )}
      {step === 5 && result && speakingResult && letterResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Kết quả">
            <Statistic title="Tổng" value={formatMark(grandTotal)} suffix="/ 100" />
            <div className="skill-grid">
              {[
                { name: "Nghe", score: result.listeningScore, max: 20 },
                { name: "Đọc", score: result.grammarScore + result.noticeScore, max: 30 },
                { name: "Viết", score: result.writingScore + letterPoints, max: 30 },
                { name: "Nói", score: speakingPoints, max: 20 },
              ].map((skill) => (
                <div key={skill.name} className="skill-card">
                  <div className="skill-name">{skill.name}</div>
                  <div className="skill-score">{formatMark(skill.score)}<span>/{skill.max}</span></div>
                  <Progress
                    percent={Math.round((skill.score / skill.max) * 100)}
                    showInfo={false}
                    strokeColor="#0f3d6e"
                    railColor="#e6edf5"
                  />
                </div>
              ))}
            </div>
            <div className="score-groups">
              <section>
                <Text strong>Nghe · {formatMark(result.listeningScore)}/20</Text>
                <ul className="score-rule">
                  <li>Phần 1 · 5 câu × 1,5 <strong>{formatMark(result.listeningByPart.p1 ?? 0)}/7,5</strong></li>
                  <li>Phần 2 · 5 câu × 1,25 <strong>{formatMark(result.listeningByPart.p2 ?? 0)}/6,25</strong></li>
                  <li>Phần 3 · 5 câu × 1,25 <strong>{formatMark(result.listeningByPart.p3 ?? 0)}/6,25</strong></li>
                </ul>
              </section>
              <section>
                <Text strong>Đọc · {formatMark(result.grammarScore + result.noticeScore)}/30</Text>
                <ul className="score-rule">
                  <li>Ngữ pháp · 10 câu × 1 <strong>{result.grammarScore}/10</strong></li>
                  <li>Biển báo · 5 câu × 1 <strong>{result.noticeScore}/5</strong></li>
                  <li>Bài dài · 5 câu × 1 <strong>0/5</strong></li>
                  <li>Điền từ · 10 câu × 1 <strong>0/10</strong></li>
                </ul>
              </section>
              <section>
                <Text strong>Viết · {formatMark(result.writingScore + letterPoints)}/30</Text>
                <ul className="score-rule">
                  <li>Viết lại câu · 5 câu × 2 <strong>{result.writingScore}/10</strong></li>
                  <li>Thư · {countWords(letterDraft)} từ <strong>{formatMark(letterPoints)}/20</strong></li>
                </ul>
              </section>
              <section>
                <Text strong>Nói · {formatMark(speakingPoints)}/20</Text>
                <ul className="score-rule">
                  <li>Giới thiệu bản thân <strong>0/6</strong></li>
                  <li>Nói về topic · phần được chấm <strong>{formatMark(speakingPoints)}/8</strong></li>
                  <li>Câu hỏi thêm <strong>0/6</strong></li>
                </ul>
              </section>
            </div>
            <Alert
              style={{ marginTop: 16 }}
              type={grandTotal >= 40 ? "success" : "warning"}
              showIcon
              title={grandTotal >= 40 ? `Đậu · ${grandTotal} điểm` : `Chưa đậu · ${grandTotal} điểm`}
              description="Mốc đậu là 40 điểm."
            />
            <Paragraph style={{ marginTop: 8, marginBottom: 12 }}>
              Điểm nói chỉ cộng phần topic, tối đa 8/20.
            </Paragraph>
            <Button onClick={start}>Tạo đề khác</Button>
          </Card>
          <AnswerReview
            misses={result.misses}
            transcript={speakingTranscript}
            speakingResult={speakingResult}
            topicLabel={`Topic ${speakingIndex} · ${speakingTopic.title}`}
            speakingPoints={speakingPoints}
            letterDraft={letterDraft}
            letterResult={letterResult}
          />
          {paper.listening.map((slot) => {
            const part = listeningParts.find((item) => item.id === slot.partId)
            if (!part) return null
            return (
              <ListeningBoard
                key={slot.partId}
                partId={slot.partId}
                testId={slot.testId}
                answers={listeningAnswers}
                onAnswer={() => {}}
                allowReveal={false}
                initialRevealed
                locked
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function MarkedWords({ marks }) {
  return marks.map((item, index) => (
    <span key={`${item.kind}-${index}-${item.word}`} className={`word-${item.kind}`}>
      {index > 0 ? " " : ""}
      {item.word}
    </span>
  ))
}

function AnswerReview({ misses, transcript, speakingResult, topicLabel, speakingPoints, letterDraft, letterResult }) {
  const groups = [
    { id: "listen", name: "Nghe", items: misses.filter((item) => item.group === "listen") },
    { id: "read", name: "Đọc", items: misses.filter((item) => item.group === "read") },
    { id: "write", name: "Viết", items: misses.filter((item) => item.group === "write") },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map((group) => (
        <section key={group.id} className="review-group">
          <div className="review-group-head">
            <span>{group.name}</span>
            <span>{group.items.length ? `${group.items.length} câu sai` : "Không có câu sai"}</span>
          </div>
          {group.items.length === 0 ? (
            <div className="review-empty">Các câu đã chấm ở phần này đều đúng.</div>
          ) : group.items.map((item) => (
            <article key={item.id} className="review-item">
              <div className="review-title">{item.title}</div>
              {item.detail && <div className="review-detail">{item.detail}</div>}
              {item.compare ? <WritingCompare compare={item.compare} /> : <ChoiceCompare yours={item.yours} correct={item.correct} />}
            </article>
          ))}
        </section>
      ))}
      <section className="review-group">
        <div className="review-group-head">
          <span>Viết thư</span>
          <span>{formatMark(letterResult.total)}/20</span>
        </div>
        <article className="review-item">
          <div className="review-pair">
            <div className="review-pane wrong">
              <div className="review-tag">Bạn viết</div>
              <div className="review-value">{letterDraft.trim() || "Chưa viết"}</div>
            </div>
            <div className="review-pane right">
              <div className="review-tag">Nhận xét</div>
              <LetterAdvice result={letterResult} />
            </div>
          </div>
        </article>
      </section>
      <section className="review-group">
        <div className="review-group-head">
          <span>Nói</span>
          <span>{formatMark(speakingPoints)}/8 điểm topic</span>
        </div>
        <article className="review-item">
          <div className="review-title">{topicLabel}</div>
          <div className="review-pair">
            <div className="review-pane wrong">
              <div className="review-tag">Bạn nói</div>
              <div className="review-value">{transcript.trim() || "Chưa nói"}</div>
            </div>
            <div className="review-pane right">
              <div className="review-tag">Gợi ý</div>
              <SpeakingAdvice result={speakingResult} />
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

function ChoiceCompare({ yours, correct }) {
  const yoursBig = yours.length <= 8
  const correctBig = correct.length <= 8
  return (
    <div className="review-pair">
      <div className="review-pane wrong">
        <div className="review-tag">Bạn làm</div>
        <div className={yoursBig ? "review-letter" : "review-value"}>{yours}</div>
      </div>
      <div className="review-pane right">
        <div className="review-tag">Đáp án đúng</div>
        <div className={correctBig ? "review-letter" : "review-value"}>{correct}</div>
      </div>
    </div>
  )
}

function WritingCompare({ compare }) {
  return (
    <>
      <div className="review-pair">
        <div className="review-pane wrong">
          <div className="review-tag">Bạn viết</div>
          <div className="review-value">
            {compare.empty ? "Chưa viết" : <MarkedWords marks={compare.userMarks} />}
          </div>
        </div>
        <div className="review-pane right">
          <div className="review-tag">Đáp án đúng</div>
          <div className="review-value">
            {compare.empty ? compare.closest : <MarkedWords marks={compare.answerMarks} />}
          </div>
        </div>
      </div>
      {!compare.empty && (
        <div className="review-chips">
          <span className="chip miss">Thiếu: {compare.missing.length ? compare.missing.join(", ") : "không"}</span>
          <span className="chip extra">Sai hoặc thừa: {compare.extra.length ? compare.extra.join(", ") : "không"}</span>
        </div>
      )}
    </>
  )
}

function LetterAdvice({ result }) {
  if (result.note) return <div className="review-value">{result.note}</div>
  return (
    <div>
      <div className="review-value">{formatMark(result.total)}/20</div>
      {result.criteria?.map((item) => (
        <div key={item.id} className="review-detail">
          {item.name}: {formatMark(item.score)}/{item.max}. {item.comment}
        </div>
      ))}
      {result.advice?.length > 0 && (
        <ul className="review-advice">
          {result.advice.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
    </div>
  )
}

function SpeakingAdvice({ result }) {
  if (result.note) return <div className="review-value">{result.note}</div>
  return result.parts.map((item) => (
    <div key={item.part}>
      <div className="review-value">Part {item.part} · {item.score}/{item.max}</div>
      {item.task && <div className="review-detail">{item.task}</div>}
      {item.grammar && <div className="review-detail">Ngữ pháp: {item.grammar}</div>}
      {item.vocabulary && <div className="review-detail">Từ vựng: {item.vocabulary}</div>}
      {item.coherence && <div className="review-detail">Mạch lạc: {item.coherence}</div>}
      {item.advice?.length > 0 && (
        <ul className="review-advice">
          {item.advice.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
    </div>
  ))
}
