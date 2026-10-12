import { Button, Card, Select, Statistic, Typography } from "antd"
import { useMemo, useState } from "react"
import { NoticeCard } from "../components/NoticeCard"
import { TextQuestion } from "../components/TextQuestion"
import { grammarQuestions } from "../data/grammar"
import { readingItems, readingSets } from "../data/reading"

const { Title } = Typography

export function ReadingPage() {
  const [mode, setMode] = useState("grammar")
  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Luyện đọc</Title>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button type={mode === "grammar" ? "primary" : "default"} onClick={() => setMode("grammar")}>
          Ngữ pháp & từ vựng
        </Button>
        <Button type={mode === "notices" ? "primary" : "default"} onClick={() => setMode("notices")}>
          Biển báo, tin nhắn
        </Button>
      </div>
      {mode === "grammar" ? <GrammarList /> : <NoticeList />}
    </div>
  )
}

function GrammarList() {
  const topics = ["Tất cả", ...new Set(grammarQuestions.map((item) => item.topic))]
  const [topic, setTopic] = useState("Tất cả")
  const pool = useMemo(
    () => (topic === "Tất cả" ? grammarQuestions : grammarQuestions.filter((item) => item.topic === topic)),
    [topic],
  )
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState({})
  const score = pool.filter((question) => checked[question.number] && answers[question.number] === question.answer).length

  return (
    <div>
      <Select
        value={topic}
        style={{ minWidth: 280, marginBottom: 16 }}
        options={topics.map((name) => ({ value: name, label: name === "Tất cả" ? `Tất cả (${grammarQuestions.length})` : name }))}
        onChange={setTopic}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pool.map((question) => (
          <Card key={question.number} size="small" title={`Câu ${question.number}`}>
            <TextQuestion
              label={question.topic}
              stem={question.stem}
              options={question.options}
              value={answers[question.number]}
              onChange={(choice) => {
                setAnswers((current) => ({ ...current, [question.number]: choice }))
                setChecked((current) => ({ ...current, [question.number]: false }))
              }}
              revealed={Boolean(checked[question.number])}
              answer={question.answer}
            />
            <Button
              style={{ marginTop: 12 }}
              type="primary"
              onClick={() => setChecked((current) => ({ ...current, [question.number]: true }))}
            >
              Kiểm tra câu này
            </Button>
          </Card>
        ))}
      </div>
      <Statistic style={{ marginTop: 16 }} title="Đã kiểm tra đúng" value={score} suffix={`/ ${pool.length}`} />
    </div>
  )
}

function NoticeList() {
  const [setId, setSetId] = useState("all")
  const pool = setId === "all" ? readingItems : readingItems.filter((item) => item.setId === setId)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState({})
  const score = pool.filter((notice) => checked[notice.id] && answers[notice.id] === notice.answer).length

  return (
    <div>
      <Select
        value={setId}
        style={{ minWidth: 220, marginBottom: 16 }}
        options={[
          { value: "all", label: `Tất cả (${readingItems.length})` },
          ...readingSets.map((set) => ({ value: set.id, label: set.title })),
        ]}
        onChange={setSetId}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pool.map((item) => (
          <div key={item.id}>
            <NoticeCard
              item={item}
              value={answers[item.id]}
              revealed={Boolean(checked[item.id])}
              onChange={(choice) => {
                setAnswers((current) => ({ ...current, [item.id]: choice }))
                setChecked((current) => ({ ...current, [item.id]: false }))
              }}
            />
            <Button
              style={{ marginTop: 8 }}
              type="primary"
              onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
            >
              Kiểm tra câu này
            </Button>
          </div>
        ))}
      </div>
      <Statistic style={{ marginTop: 16 }} title="Đã kiểm tra đúng" value={score} suffix={`/ ${pool.length}`} />
    </div>
  )
}
