import { Radio, Tag, Typography } from "antd"

const { Text } = Typography

export function ChoiceList({ items, choices, value, onChange, revealed, answerOf }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item) => {
        const selected = value[item.id]
        const answer = revealed ? answerOf(item) : null
        const correct = answer != null && selected === answer
        return (
          <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Text strong style={{ minWidth: 88 }}>
              {item.label}
            </Text>
            <Radio.Group
              value={selected}
              onChange={(event) => onChange(item.id, event.target.value)}
            >
              {choices.map((choice) => (
                <Radio key={choice} value={choice}>
                  {choice}
                </Radio>
              ))}
            </Radio.Group>
            {answer != null && (
              <Tag color={selected ? (correct ? "success" : "error") : "gold"}>
                Đáp án {answer}
              </Tag>
            )}
          </div>
        )
      })}
    </div>
  )
}
