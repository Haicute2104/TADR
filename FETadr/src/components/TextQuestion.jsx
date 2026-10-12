import { Radio, Tag, Typography } from "antd"

const { Paragraph, Text } = Typography

export function TextQuestion({ label, stem, prompt, options, value, onChange, revealed, answer }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <Text type="secondary">{label}</Text>
        {revealed && answer && (
          <Tag color={value === answer ? "success" : "error"}>Đáp án {answer}</Tag>
        )}
      </div>
      {stem && <Paragraph style={{ fontSize: 18, marginBottom: 12 }}>{stem}</Paragraph>}
      {prompt && <Paragraph strong>{prompt}</Paragraph>}
      <Radio.Group
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}
      >
        {options.map((option) => {
          const selected = value === option.key
          const isAnswer = revealed && option.key === answer
          const isWrong = revealed && selected && option.key !== answer
          let border = "#e6ebf2"
          let background = "#fff"
          if (isAnswer) {
            border = "#16a34a"
            background = "#f0fdf4"
          } else if (isWrong) {
            border = "#dc2626"
            background = "#fef2f2"
          } else if (selected) {
            border = "#0f3d6e"
            background = "#f4f8fc"
          }
          return (
            <Radio
              key={option.key}
              value={option.key}
              style={{
                margin: 0,
                padding: "10px 12px",
                border: `1px solid ${border}`,
                borderRadius: 10,
                background,
                width: "100%",
              }}
            >
              <Text strong style={{ marginRight: 8 }}>{option.key}.</Text>
              {option.text}
            </Radio>
          )
        })}
      </Radio.Group>
    </div>
  )
}
