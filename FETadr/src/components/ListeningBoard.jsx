import { Alert, Button, Card, Col, Image, Row, Space, Typography } from "antd"
import { useEffect, useState } from "react"
import { listeningParts } from "../data/listening"

const { Paragraph, Text, Title } = Typography

export function ListeningBoard({
  partId,
  testId,
  onPart,
  onTest,
  answers,
  onAnswer,
  extra,
  allowReveal = true,
  initialRevealed = false,
  locked = false,
}) {
  const part = listeningParts.find((item) => item.id === partId) ?? listeningParts[0]
  const test = part.tests.find((item) => item.id === testId) ?? part.tests[0]
  const [pageIndex, setPageIndex] = useState(0)
  const [revealed, setRevealed] = useState(initialRevealed)
  useEffect(() => {
    setPageIndex(0)
    setRevealed(initialRevealed)
  }, [test.id, initialRevealed])
  const safePage = Math.min(pageIndex, test.pages.length - 1)
  const answered = part.questions.filter((number) => answers[`${part.id}-${number}`]).length
  const books = [...new Set(part.tests.map((item) => item.title.split("·")[0].trim()))]

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={15}>
        <Card
          title={test.title}
          extra={<Text type="secondary">Trang {safePage + 1}/{test.pages.length}</Text>}
          styles={{ body: { background: "#f7f9fc" } }}
        >
          <Paragraph style={{ marginTop: 0 }}>{part.instruction}</Paragraph>
          {!test.audio && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              title="Đề này chưa có file nghe. Vẫn xem được tranh và câu hỏi."
            />
          )}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src={test.pages[safePage]}
              alt={test.title}
              style={{ maxHeight: "68vh", width: "auto", maxWidth: "100%", background: "#fff" }}
            />
          </div>
          {test.pages.length > 1 && (
            <Space style={{ marginTop: 12 }}>
              <Button disabled={safePage === 0} onClick={() => setPageIndex(safePage - 1)}>Trang trước</Button>
              <Button disabled={safePage === test.pages.length - 1} onClick={() => setPageIndex(safePage + 1)}>Trang sau</Button>
            </Space>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <div className="listen-side">
          <Card styles={{ body: { display: "flex", flexDirection: "column", gap: 14 } }}>
            {onPart && (
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>Chọn phần</Text>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {listeningParts.map((item) => (
                    <Button
                      key={item.id}
                      block
                      size="large"
                      type={item.id === part.id ? "primary" : "default"}
                      onClick={() => onPart(item.id)}
                    >
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {onTest && (
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>Chọn đề KET</Text>
                {books.map((book) => (
                  <div key={book} style={{ marginBottom: 8 }}>
                    <Text type="secondary">{book}</Text>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {part.tests.filter((item) => item.title.startsWith(book)).map((item) => {
                        const testLabel = item.title.split("·")[1]?.trim() ?? item.title
                        const selected = item.id === test.id
                        return (
                          <Button
                            key={item.id}
                            size="large"
                            type={selected ? "primary" : "default"}
                            style={selected ? undefined : { borderColor: "#0f3d6e", color: "#0f3d6e" }}
                            onClick={() => onTest(item.id)}
                          >
                            {testLabel}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!onPart && <Title level={5} style={{ margin: 0 }}>{part.title} · {test.title}</Title>}
            {test.audio && <audio key={test.audio} controls src={test.audio} style={{ width: "100%" }} />}
            <div>
              <Text strong>Đáp án · {answered}/{part.questions.length}</Text>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {part.questions.map((number) => (
                  <div
                    key={number}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid #c5d7ea",
                      background: answers[`${part.id}-${number}`] ? "#f4f8fc" : "#fff",
                    }}
                  >
                    <Text strong>Câu {number}</Text>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(part.choices.length, 4)}, minmax(0, 1fr))`,
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {part.choices.map((choice) => {
                        const selected = answers[`${part.id}-${number}`] === choice
                        const correctChoice = test.answers?.[number]
                        const isCorrect = revealed && choice === correctChoice
                        const isWrong = revealed && selected && choice !== correctChoice
                        return (
                          <Button
                            key={choice}
                            size="large"
                            type={selected && !isWrong ? "primary" : "default"}
                            danger={isWrong}
                            style={isCorrect ? { background: "#237804", borderColor: "#237804", color: "#fff" } : undefined}
                            onClick={() => {
                              if (!locked) onAnswer(`${part.id}-${number}`, choice)
                            }}
                          >
                            {choice}
                          </Button>
                        )
                      })}
                    </div>
                    {revealed && test.answers?.[number] && (
                      <Text style={{ display: "block", marginTop: 8 }}>
                        Đáp án đúng: <Text strong>{test.answers[number]}</Text>
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {allowReveal && !initialRevealed && test.answers && (
              <Button type="primary" onClick={() => setRevealed(true)}>
                Kiểm tra đáp án
              </Button>
            )}
            {allowReveal && !test.answers && (
              <Text type="secondary">Đề này chưa có file nghe nên chưa chấm được.</Text>
            )}
            {extra}
          </Card>
        </div>
      </Col>
    </Row>
  )
}
