import { Alert, Typography } from "antd"

const { Paragraph, Text } = Typography

export function ScoreResult({ result }) {
  if (!result) return null
  const total = result.total ?? result.score
  return (
    <div style={{ marginTop: 16 }}>
      <Alert
        type="success"
        showIcon
        title={`Điểm: ${total} / ${result.max}`}
      />
      {result.criteria && (
        <ul style={{ marginBottom: 0 }}>
          {result.criteria.map((item) => (
            <li key={item.id}>
              <Text strong>{item.name}: {item.score}/{item.max}. </Text>
              {item.comment}
            </li>
          ))}
        </ul>
      )}
      {result.task && <Paragraph style={{ marginBottom: 4 }}>Nhiệm vụ: {result.task}</Paragraph>}
      {result.grammar && <Paragraph style={{ marginBottom: 4 }}>Ngữ pháp: {result.grammar}</Paragraph>}
      {result.vocabulary && <Paragraph style={{ marginBottom: 4 }}>Từ vựng: {result.vocabulary}</Paragraph>}
      {result.coherence && <Paragraph style={{ marginBottom: 4 }}>Mạch lạc: {result.coherence}</Paragraph>}
      {result.advice?.length > 0 && (
        <>
          <Paragraph strong style={{ marginBottom: 4 }}>Góp ý</Paragraph>
          <ul>{result.advice.map((line) => <li key={line}>{line}</li>)}</ul>
        </>
      )}
    </div>
  )
}
