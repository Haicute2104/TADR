import { Alert, Button, Card, Input, Select, Space, Statistic, Typography } from "antd"
import { useEffect, useState } from "react"
import { ScoreResult } from "../components/ScoreResult"
import { letters } from "../data/letters"
import { countWords } from "../lib/answers"

const { Paragraph, Title } = Typography
const { TextArea } = Input
const storageKey = "tlu-b1-letters"

export function LetterPage() {
  const [letterId, setLetterId] = useState(letters[0].id)
  const letter = letters.find((item) => item.id === letterId) ?? letters[0]
  const [drafts, setDrafts] = useState({})
  const [scoring, setScoring] = useState(false)
  const [scoreError, setScoreError] = useState("")
  const [scores, setScores] = useState({})
  const text = drafts[letter.id] ?? ""
  const words = countWords(text)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) setDrafts(JSON.parse(saved))
  }, [])

  function save(next) {
    setDrafts(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Viết thư</Title>
      <Paragraph>
        Bài viết 80–100 từ theo đề. Bài được lưu trên máy bạn. Nút Nhờ chấm gửi bài cho Groq theo rubric 20 điểm.
      </Paragraph>
      <Select
        value={letter.id}
        style={{ minWidth: 320, marginBottom: 16 }}
        options={letters.map((item) => ({ value: item.id, label: item.topic }))}
        onChange={setLetterId}
      />
      <Card title={letter.topic}>
        <Paragraph>{letter.prompt}</Paragraph>
        <TextArea
          rows={10}
          value={text}
          onChange={(event) => save({ ...drafts, [letter.id]: event.target.value })}
        />
        <Space style={{ marginTop: 16 }} align="center">
          <Statistic title="Số từ" value={words} />
          <Button onClick={() => save({ ...drafts, [letter.id]: "" })}>Xóa bài</Button>
          <Button
            type="primary"
            loading={scoring}
            disabled={!text.trim()}
            onClick={async () => {
              setScoring(true)
              setScoreError("")
              try {
                const response = await fetch("/api/score/letter", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    topicId: letter.id,
                    prompt: letter.prompt,
                    text,
                    wordCount: words,
                  }),
                })
                const payload = await response.json()
                if (!response.ok) throw new Error(payload.error || "Không chấm được")
                setScores((current) => ({ ...current, [letter.id]: payload }))
              } catch (error) {
                setScoreError(error instanceof Error ? error.message : "Không chấm được")
              } finally {
                setScoring(false)
              }
            }}
          >
            Nhờ chấm
          </Button>
        </Space>
        <Alert
          style={{ marginTop: 16 }}
          type={words >= 80 && words <= 100 ? "success" : "info"}
          showIcon
          title={
            words >= 80 && words <= 100
              ? "Độ dài nằm trong khoảng đề yêu cầu."
              : "Đề yêu cầu khoảng 80–100 từ."
          }
        />
        {scoreError && <Alert style={{ marginTop: 16 }} type="error" showIcon title={scoreError} />}
        <ScoreResult result={scores[letter.id]} />
      </Card>
    </div>
  )
}
