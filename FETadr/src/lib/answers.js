const contractionPairs = [
  [/\bhas not\b/g, "hasn't"],
  [/\bhave not\b/g, "haven't"],
  [/\bdoes not\b/g, "doesn't"],
  [/\bdo not\b/g, "don't"],
  [/\bdid not\b/g, "didn't"],
  [/\bis not\b/g, "isn't"],
  [/\bare not\b/g, "aren't"],
  [/\bwas not\b/g, "wasn't"],
  [/\bwere not\b/g, "weren't"],
  [/\bcannot\b/g, "can't"],
  [/\bcan not\b/g, "can't"],
  [/\bwill not\b/g, "won't"],
  [/\bwould not\b/g, "wouldn't"],
  [/\bshould not\b/g, "shouldn't"],
  [/\bcould not\b/g, "couldn't"],
  [/\bmust not\b/g, "mustn't"],
  [/\bi am\b/g, "i'm"],
  [/\bit is\b/g, "it's"],
  [/\bwe are\b/g, "we're"],
  [/\bthey are\b/g, "they're"],
  [/\bshe is\b/g, "she's"],
  [/\bhe is\b/g, "he's"],
]

export function normalizeAnswer(raw) {
  let text = String(raw ?? "").toLowerCase().trim()
  text = text.replace(/[’‘]/g, "'")
  text = text.replace(/\b([a-z]+) n't\b/g, "$1n't")
  text = text.replace(/shoudn['’]t/g, "shouldn't")
  text = text.replace(/\bnoisier\b/g, "nosier")
  text = text.replace(/\bdespite\b/g, "in spite of")
  text = text.replace(/\btraveling\b/g, "travelling")
  contractionPairs.forEach(([pattern, next]) => {
    text = text.replace(pattern, next)
  })
  text = text.replace(/\b(said|told)\s+that\b/g, "$1")
  text = text.replace(/[^a-z0-9' ]+/g, " ")
  text = text.replace(/\s+/g, " ").trim()
  return text
}

export function answerLeadFor(item) {
  return typeof item?.lead === "string" ? item.lead : ""
}

export function completeWithLead(draft, lead) {
  const text = String(draft ?? "").trim()
  if (!lead || lead.includes("/")) return text
  if (!text) return lead
  if (normalizeAnswer(text).startsWith(normalizeAnswer(lead))) return text
  return `${lead} ${text}`
}

export function matchesWrittenAnswer(user, answers) {
  const normalized = normalizeAnswer(user)
  if (!normalized) return false
  return answers.some((answer) => normalizeAnswer(answer) === normalized)
}

export function acceptsWrittenAnswer(draft, lead, answers) {
  const text = String(draft ?? "").trim()
  if (!text) return false
  if (matchesWrittenAnswer(text, answers)) return true
  return matchesWrittenAnswer(completeWithLead(text, lead), answers)
}

export function countWords(text) {
  const cleaned = String(text ?? "").trim()
  if (!cleaned) return 0
  return cleaned.split(/\s+/).length
}

function displayWords(text) {
  return String(text ?? "")
    .replace(/[.,!?;:]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function wordKey(word) {
  return normalizeAnswer(word)
}

function alignWords(userWords, answerWords) {
  const userKeys = userWords.map(wordKey)
  const answerKeys = answerWords.map(wordKey)
  const rows = userKeys.length + 1
  const cols = answerKeys.length + 1
  const scores = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      scores[i][j] = userKeys[i - 1] === answerKeys[j - 1]
        ? scores[i - 1][j - 1] + 1
        : Math.max(scores[i - 1][j], scores[i][j - 1])
    }
  }
  const userMarks = []
  const answerMarks = []
  let i = userKeys.length
  let j = answerKeys.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && userKeys[i - 1] === answerKeys[j - 1]) {
      userMarks.push({ word: userWords[i - 1], kind: "ok" })
      answerMarks.push({ word: answerWords[j - 1], kind: "ok" })
      i -= 1
      j -= 1
    } else if (j > 0 && (i === 0 || scores[i][j - 1] >= scores[i - 1][j])) {
      answerMarks.push({ word: answerWords[j - 1], kind: "missing" })
      j -= 1
    } else {
      userMarks.push({ word: userWords[i - 1], kind: "extra" })
      i -= 1
    }
  }
  return { userMarks: userMarks.reverse(), answerMarks: answerMarks.reverse() }
}

export function compareWrittenAnswer(draft, lead, answers) {
  const raw = String(draft ?? "").trim()
  const yours = raw ? completeWithLead(raw, lead) : ""
  const userWords = displayWords(yours)
  let closest = answers[0] ?? ""
  let best = alignWords(userWords, displayWords(closest))
  let bestScore = best.answerMarks.filter((item) => item.kind === "ok").length
  for (const answer of answers.slice(1)) {
    const marks = alignWords(userWords, displayWords(answer))
    const score = marks.answerMarks.filter((item) => item.kind === "ok").length
    if (score > bestScore) {
      closest = answer
      best = marks
      bestScore = score
    }
  }
  return {
    empty: !raw,
    yours,
    closest,
    userMarks: best.userMarks,
    answerMarks: best.answerMarks,
    missing: best.answerMarks.filter((item) => item.kind === "missing").map((item) => item.word),
    extra: best.userMarks.filter((item) => item.kind === "extra").map((item) => item.word),
  }
}
