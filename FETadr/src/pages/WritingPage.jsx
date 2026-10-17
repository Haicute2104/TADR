import { Alert, Button, Checkbox, Dropdown, Input, Modal, Select, Tag, Typography } from "antd"
import { memo, useCallback, useMemo, useRef, useState } from "react"
import { categoryOrder, hintFor, writingHints } from "../data/hints"
import writingItems from "../data/writingItems.json"
import { acceptsWrittenAnswer, answerLeadFor } from "../lib/answers"

const { Paragraph, Text, Title } = Typography

const leads = Object.fromEntries(writingItems.map((item) => [item.id, answerLeadFor(item)]))
const categoryCounts = Object.fromEntries(categoryOrder.map((id) => [
  id,
  writingItems.filter((item) => item.category === id).length,
]))
const itemsById = new Map(writingItems.map((item) => [item.id, item]))

function shuffleIds(ids) {
  const next = [...ids]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }
  return next
}

const RewriteRow = memo(function RewriteRow({
  item,
  lead,
  categoryTitle,
  draft,
  checked,
  shown,
  onDraft,
  onCheck,
  onToggleAnswer,
  onHint,
}) {
  const correct = checked && acceptsWrittenAnswer(draft, lead, item.answers)
  return (
    <div className="rewrite-row">
      <div className="rewrite-head">
        <Text className="rewrite-prompt">
          <Text type="secondary">Câu gốc: </Text>
          “{item.prompt}”
        </Text>
        <Tag style={{ margin: 0 }}>{categoryTitle}</Tag>
      </div>
      <div className="rewrite-line">
        {lead && <Text strong className="rewrite-lead">{lead}</Text>}
        <Input
          className="rewrite-input"
          value={draft}
          placeholder={lead ? "viết tiếp câu..." : "viết cả câu..."}
          onChange={(event) => onDraft(item.id, event.target.value)}
        />
        <Button type="primary" onClick={() => onCheck(item.id)}>Kiểm tra</Button>
        <Button onClick={() => onToggleAnswer(item.id)}>Đáp án</Button>
        <Button type="link" onClick={() => onHint(item.id)}>Gợi ý</Button>
      </div>
      {checked && (
        <Alert
          style={{ marginTop: 10 }}
          type={correct ? "success" : "error"}
          showIcon
          title={correct ? "Đúng." : "Chưa khớp. Viết tiếp sau cụm in sẵn, hoặc mở Đáp án."}
        />
      )}
      {shown && (
        <ul className="rewrite-answers">
          {item.answers.map((answer) => <li key={answer}>{answer}</li>)}
        </ul>
      )}
    </div>
  )
})

export function WritingPage() {
  const [category, setCategory] = useState("all")
  const [picked, setPicked] = useState(() => [...categoryOrder])
  const [queue, setQueue] = useState(null)
  const [mixOpen, setMixOpen] = useState(false)
  const closingMix = useRef(false)
  const pool = useMemo(() => {
    if (queue) return queue.map((id) => itemsById.get(id)).filter(Boolean)
    if (category === "all") return writingItems
    return writingItems.filter((item) => item.category === category)
  }, [category, queue])
  const [drafts, setDrafts] = useState({})
  const [checked, setChecked] = useState({})
  const [shown, setShown] = useState({})
  const [hintId, setHintId] = useState(null)
  const hintItem = writingItems.find((item) => item.id === hintId)
  const hint = hintItem ? hintFor(hintItem) : null
  const onDraft = useCallback((id, value) => {
    setDrafts((current) => (current[id] === value ? current : { ...current, [id]: value }))
    setChecked((current) => (current[id] ? { ...current, [id]: false } : current))
  }, [])
  const onCheck = useCallback((id) => {
    setChecked((current) => ({ ...current, [id]: true }))
  }, [])
  const onToggleAnswer = useCallback((id) => {
    setShown((current) => ({ ...current, [id]: !current[id] }))
  }, [])
  const onHint = useCallback((id) => setHintId(id), [])
  const shufflePicked = useCallback(() => {
    const allow = new Set(picked)
    const ids = writingItems.filter((item) => allow.has(item.category)).map((item) => item.id)
    if (!ids.length) return
    setQueue(shuffleIds(ids))
    closingMix.current = true
    setMixOpen(false)
  }, [picked])

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Viết lại câu</Title>
      <Paragraph>
        Nếu đề in sẵn đầu câu, viết tiếp vào ô. Câu không in sẵn thì viết cả câu, rồi bấm Kiểm tra.
      </Paragraph>
      <div className="rewrite-toolbar">
        <Select
          value={category}
          onChange={(value) => {
            setCategory(value)
            setQueue(null)
          }}
          options={[
            { value: "all", label: `Tất cả (${writingItems.length} câu)` },
            ...categoryOrder.map((id) => ({
              value: id,
              label: `${writingHints[id].title} (${categoryCounts[id]})`,
            })),
          ]}
        />
        <Dropdown
          trigger={["click"]}
          classNames={{ root: "rewrite-mix-popup" }}
          open={mixOpen}
          onOpenChange={(open) => {
            if (open && closingMix.current) {
              closingMix.current = false
              setMixOpen(false)
              return
            }
            setMixOpen(open)
          }}
          popupRender={() => (
            <div className="rewrite-mix-panel" onMouseDown={(event) => event.preventDefault()}>
              <div className="rewrite-mix-tools">
                <Button type="link" onClick={() => setPicked([...categoryOrder])}>Chọn tất cả</Button>
                <Button type="link" onClick={() => setPicked([])}>Bỏ chọn tất cả</Button>
              </div>
              <Checkbox.Group
                className="rewrite-topics"
                value={picked}
                options={categoryOrder.map((id) => ({
                  value: id,
                  label: `${writingHints[id].title} (${categoryCounts[id]})`,
                }))}
                onChange={(values) => setPicked(values.map(String))}
              />
              <Button type="primary" block disabled={picked.length === 0} onClick={shufflePicked}>
                Trộn {picked.reduce((sum, id) => sum + (categoryCounts[id] ?? 0), 0)} câu
              </Button>
            </div>
          )}
        >
          <button type="button" className="rewrite-mix-trigger">
            <span>{queue ? `Đã trộn · ${queue.length} câu` : "Trộn câu"}</span>
            <span className="rewrite-mix-caret" />
          </button>
        </Dropdown>
      </div>
      <div className="rewrite-list">
        {pool.length === 0 && <Alert type="info" showIcon title="Chọn ít nhất một chủ đề trong Trộn câu." />}
        {pool.map((item) => (
          <RewriteRow
            key={item.id}
            item={item}
            lead={leads[item.id]}
            categoryTitle={writingHints[item.category].title}
            draft={drafts[item.id] ?? ""}
            checked={Boolean(checked[item.id])}
            shown={Boolean(shown[item.id])}
            onDraft={onDraft}
            onCheck={onCheck}
            onToggleAnswer={onToggleAnswer}
            onHint={onHint}
          />
        ))}
      </div>
      <Modal
        title={hint?.title ?? "Gợi ý"}
        open={Boolean(hint)}
        onCancel={() => setHintId(null)}
        footer={<Button type="primary" onClick={() => setHintId(null)}>Đã hiểu</Button>}
      >
        {hint && (
          <>
            <Paragraph strong>Dấu hiệu nhận biết</Paragraph>
            <ul>{hint.signs.map((sign) => <li key={sign}>{sign}</li>)}</ul>
            <Paragraph strong>Cấu trúc cần viết</Paragraph>
            <ul>{hint.structure.map((line) => <li key={line}>{line}</li>)}</ul>
          </>
        )}
      </Modal>
    </div>
  )
}
