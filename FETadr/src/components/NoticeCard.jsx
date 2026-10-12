import { Card } from "antd"
import { TextQuestion } from "./TextQuestion"

export function NoticeCard({ item, value, onChange, revealed }) {
  return (
    <Card styles={{ body: { display: "grid", gap: 16 } }}>
      <pre
        style={{
          margin: 0,
          padding: 16,
          whiteSpace: "pre-wrap",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 16,
          lineHeight: 1.45,
          background: "#fffdf6",
          border: "1px solid #e7d7a1",
          borderRadius: 12,
        }}
      >
        {item.notice}
      </pre>
      <TextQuestion
        label={item.label}
        prompt={item.prompt}
        options={item.options}
        value={value}
        onChange={onChange}
        revealed={revealed}
        answer={item.answer}
      />
    </Card>
  )
}
