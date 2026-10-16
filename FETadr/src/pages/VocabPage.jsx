import { Button, Input, Modal, Select, Tag, Typography } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { vocabCards as bankCards } from "../data/vocab"

const { Paragraph, Title } = Typography
const { TextArea } = Input
const storageKey = "tlu-b1-vocab"
const customTopic = "Từ của tôi"

function loadStore() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { known: [], learning: [], custom: [] }
    const parsed = JSON.parse(raw)
    const ids = (key) => (Array.isArray(parsed?.[key]) ? parsed[key].filter((id) => typeof id === "string") : [])
    const custom = Array.isArray(parsed?.custom)
      ? parsed.custom.filter((card) => card && typeof card.id === "string" && typeof card.term === "string" && typeof card.meaning === "string")
      : []
    return { known: ids("known"), learning: ids("learning"), custom }
  } catch {
    return { known: [], learning: [], custom: [] }
  }
}

function shuffle(list) {
  const next = [...list]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }
  return next
}

export function VocabPage() {
  const saved = useMemo(() => loadStore(), [])
  const [topic, setTopic] = useState("all")
  const [round, setRound] = useState(0)
  const [known, setKnown] = useState(saved.known)
  const [learning, setLearning] = useState(saved.learning)
  const [custom, setCustom] = useState(saved.custom)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [queue, setQueue] = useState([])
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState("in")
  const [burst, setBurst] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ term: "", meaning: "", example: "", kind: "word", topic: customTopic })
  const knownRef = useRef(known)
  const focusRef = useRef("")
  const timerRef = useRef(0)
  knownRef.current = known

  const cards = useMemo(() => [...bankCards, ...custom], [custom])
  const topics = useMemo(() => [...new Set(cards.map((card) => card.topic))], [cards])
  const knownSet = useMemo(() => new Set(known), [known])
  const learningSet = useMemo(() => new Set(learning), [learning])
  const pool = useMemo(
    () => cards.filter((card) => topic === "all" || card.topic === topic),
    [cards, topic],
  )
  const card = queue[index]
  const wordTotal = cards.filter((item) => item.kind === "word").length
  const phraseTotal = cards.filter((item) => item.kind === "phrase").length
  const knownInPool = pool.filter((item) => knownSet.has(item.id)).length
  const progress = pool.length ? Math.round((knownInPool / pool.length) * 100) : 0

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ known, learning, custom }))
  }, [known, learning, custom])

  useEffect(() => {
    const learned = new Set(knownRef.current)
    let next = shuffle(pool.filter((item) => !learned.has(item.id)))
    const focus = focusRef.current
    if (focus) {
      focusRef.current = ""
      const picked = next.find((item) => item.id === focus)
      if (picked) next = [picked, ...next.filter((item) => item.id !== focus)]
    }
    setQueue(next)
    setIndex(0)
    setFlipped(false)
    setPhase("in")
    setReady(true)
  }, [pool, round])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function leave(mark) {
    if (!card || phase === "out") return
    if (mark) {
      setKnown((current) => (current.includes(card.id) ? current : [...current, card.id]))
      setLearning((current) => current.filter((id) => id !== card.id))
      setBurst(true)
      window.setTimeout(() => setBurst(false), 520)
    }
    setPhase("out")
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setFlipped(false)
      setIndex((value) => value + 1)
      setPhase("in")
    }, 280)
  }

  function toggleFlip() {
    if (!card || phase === "out") return
    if (!flipped) {
      setLearning((current) => (current.includes(card.id) ? current : [...current, card.id]))
    }
    setFlipped((value) => !value)
  }

  function resetTopic() {
    const ids = new Set(pool.map((item) => item.id))
    setKnown((current) => current.filter((id) => !ids.has(id)))
    setLearning((current) => current.filter((id) => !ids.has(id)))
    setRound((value) => value + 1)
  }

  function addCard() {
    const term = draft.term.trim()
    const meaning = draft.meaning.trim()
    if (!term || !meaning) return
    const next = {
      id: `custom-${Date.now()}`,
      kind: draft.kind === "phrase" ? "phrase" : "word",
      topic: draft.topic.trim() || customTopic,
      term,
      meaning,
      example: draft.example.trim(),
      source: "Bạn thêm",
    }
    focusRef.current = next.id
    setCustom((current) => [...current, next])
    setTopic(next.topic)
    setDraft({ term: "", meaning: "", example: "", kind: "word", topic: customTopic })
    setAdding(false)
  }

  return (
    <div className="vocab-page">
      <div className="vocab-head">
        <div>
          <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>Từ mới trong đề</Title>
          <Paragraph style={{ marginBottom: 0 }}>
            Từ và cụm lấy từ phần từ vựng của 110 câu khoanh. Không biết thì lật thẻ qua lại giữa tiếng Anh và tiếng Việt. Bấm Thẻ tiếp theo thì mới sang thẻ khác.
          </Paragraph>
        </div>
        <Button type="primary" onClick={() => setAdding(true)}>Thêm từ mới</Button>
      </div>
      <div className="vocab-meter">
        <div className="vocab-meter-label">
          <span>Đã thuộc {knownInPool}/{pool.length}</span>
          <span>{wordTotal} từ · {phraseTotal} cụm</span>
        </div>
        <div className="vocab-meter-track">
          <div className="vocab-meter-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="skill-grid vocab-stats">
        <div className="skill-card">
          <div className="skill-name">Tổng trong đề</div>
          <div className="skill-score">{cards.length}</div>
        </div>
        <div className="skill-card">
          <div className="skill-name">Đã thuộc</div>
          <div className="skill-score">{knownInPool}<span>/{pool.length}</span></div>
        </div>
        <div className="skill-card">
          <div className="skill-name">Chưa thuộc</div>
          <div className="skill-score">{pool.length - knownInPool}</div>
        </div>
        <div className="skill-card">
          <div className="skill-name">Đã lật nghĩa</div>
          <div className="skill-score">{pool.filter((item) => learningSet.has(item.id)).length}</div>
        </div>
      </div>
      <div className="vocab-topics">
        <button type="button" className={topic === "all" ? "vocab-topic active" : "vocab-topic"} onClick={() => setTopic("all")}>
          <span>Tất cả</span>
          <strong>{cards.filter((item) => knownSet.has(item.id)).length}/{cards.length}</strong>
        </button>
        {topics.map((name) => {
          const items = cards.filter((item) => item.topic === name)
          const done = items.filter((item) => knownSet.has(item.id)).length
          return (
            <button
              key={name}
              type="button"
              className={topic === name ? "vocab-topic active" : "vocab-topic"}
              onClick={() => setTopic(name)}
            >
              <span>{name}</span>
              <strong>{done}/{items.length}</strong>
            </button>
          )
        })}
      </div>
      {ready && card ? (
        <div className={`vocab-stage ${phase}`}>
          <div className="vocab-progress">Thẻ {Math.min(index + 1, queue.length)}/{queue.length}</div>
          <div className={`vocab-scene ${burst ? "burst" : ""}`} key={card.id}>
            <button type="button" className="vocab-flipper" onClick={toggleFlip}>
            <div className={flipped ? "vocab-card flipped" : "vocab-card"}>
              <div className="vocab-face vocab-front">
                <div className="vocab-tags">
                  <Tag color={card.kind === "word" ? "blue" : "gold"}>{card.kind === "word" ? "Từ" : "Cụm từ"}</Tag>
                  <Tag>{card.topic}</Tag>
                  <Tag>{card.source}</Tag>
                </div>
                <div className="vocab-term">{card.term}</div>
                <div className="vocab-hint">Bấm thẻ để xem nghĩa</div>
              </div>
              <div className="vocab-face vocab-back">
                <div className="vocab-kicker">{card.source}</div>
                <div className="vocab-meaning">{card.meaning}</div>
                {card.example ? <div className="vocab-example">{card.example}</div> : null}
                <div className="vocab-hint light">Bấm thẻ để xem lại tiếng Anh</div>
              </div>
            </div>
            </button>
          </div>
          <div className="vocab-actions">
            <Button size="large" onClick={toggleFlip}>
              <span className="vocab-action-label">
                <span className={flipped ? "is-hidden" : ""}>Không biết</span>
                <span className={flipped ? "" : "is-hidden"}>Xem tiếng Anh</span>
              </span>
            </Button>
            <Button size="large" onClick={() => leave(false)}>Thẻ tiếp theo</Button>
            <Button size="large" type="primary" onClick={() => leave(true)}>Thuộc rồi</Button>
          </div>
        </div>
      ) : ready ? (
        <div className="vocab-done vocab-scene">
          <div className="vocab-term">Hết thẻ</div>
          <Paragraph>Bạn đã thuộc {knownInPool}/{pool.length} thẻ của nhóm này.</Paragraph>
          <div className="vocab-actions">
            <Button onClick={() => setRound((value) => value + 1)}>Xáo lại thẻ chưa thuộc</Button>
            <Button type="primary" onClick={resetTopic}>Học lại từ đầu</Button>
          </div>
        </div>
      ) : null}
      <Modal
        title="Thêm từ mới"
        open={adding}
        onCancel={() => setAdding(false)}
        onOk={addCard}
        okText="Thêm vào bộ thẻ"
        cancelText="Huỷ"
        okButtonProps={{ disabled: !draft.term.trim() || !draft.meaning.trim() }}
      >
        <div className="vocab-form">
          <Input
            placeholder="Từ hoặc cụm, ví dụ talent"
            value={draft.term}
            onChange={(event) => setDraft((current) => ({ ...current, term: event.target.value }))}
          />
          <Input
            placeholder="Nghĩa tiếng Việt"
            value={draft.meaning}
            onChange={(event) => setDraft((current) => ({ ...current, meaning: event.target.value }))}
          />
          <TextArea
            rows={3}
            placeholder="Câu ví dụ, có thể bỏ trống"
            value={draft.example}
            onChange={(event) => setDraft((current) => ({ ...current, example: event.target.value }))}
          />
          <Select
            value={draft.kind}
            onChange={(kind) => setDraft((current) => ({ ...current, kind }))}
            options={[
              { value: "word", label: "Từ" },
              { value: "phrase", label: "Cụm từ" },
            ]}
          />
          <Select
            value={draft.topic}
            onChange={(nextTopic) => setDraft((current) => ({ ...current, topic: nextTopic }))}
            options={[customTopic, ...topics.filter((name) => name !== customTopic)].map((name) => ({ value: name, label: name }))}
          />
        </div>
      </Modal>
    </div>
  )
}
