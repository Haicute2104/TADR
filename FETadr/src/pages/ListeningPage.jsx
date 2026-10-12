import { Typography } from "antd"
import { useEffect, useState } from "react"
import { ListeningBoard } from "../components/ListeningBoard"
import { listeningParts } from "../data/listening"

const { Paragraph, Title } = Typography

export function ListeningPage() {
  const [partId, setPartId] = useState(listeningParts[0].id)
  const part = listeningParts.find((item) => item.id === partId) ?? listeningParts[0]
  const [testId, setTestId] = useState(part.tests[0].id)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    const nextPart = listeningParts.find((item) => item.id === partId) ?? listeningParts[0]
    setTestId(nextPart.tests[0].id)
    setAnswers({})
  }, [partId])

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Luyện nghe</Title>
      <Paragraph>
        Chọn đáp án trên phiếu, rồi bấm Kiểm tra đáp án. Chữ đúng hiện ngay dưới từng câu.
      </Paragraph>
      <ListeningBoard
        partId={partId}
        testId={testId}
        onPart={setPartId}
        onTest={(next) => {
          setTestId(next)
          setAnswers({})
        }}
        answers={answers}
        onAnswer={(id, choice) => setAnswers((current) => ({ ...current, [id]: choice }))}
      />
    </div>
  )
}
