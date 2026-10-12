export const writingHints = {
  "past-perfect": {
    title: "Past simple → Present perfect",
    signs: [
      "last / the last time / ago: hành động đã dừng → phải có not",
      "started / began: hành động còn tiếp tục → không có not",
    ],
    structure: [
      "Không có started/began: S + has/have + not + V3 + since/for",
      "Có started/began: S + has/have + V3 + since/for, hoặc has/have been V-ing",
      "Mốc (last year, in + năm, when) → since. Khoảng (ago) → for",
    ],
  },
  comparison: {
    title: "So sánh",
    signs: [
      "more/adj-er than đổi được sang not as...as và less...than",
      "not as...as đổi được sang so sánh hơn",
      "No...as...as đổi được sang so sánh nhất hoặc more...than any other",
    ],
    structure: [
      "A is more X than B → B isn't as X as A / B is less X than A",
      "A is not as X as B → B is X-er/more X than A",
      "No N is as X as Y → Y is the X-est N / Y is X-er than any other N",
    ],
  },
  relative: {
    title: "Mệnh đề quan hệ",
    signs: [
      "Hai câu. Câu sau bổ nghĩa cho danh từ ở câu trước.",
      "Người: who hoặc that. Vật: which hoặc that. Nơi: where, in which, hoặc which ... in.",
    ],
    structure: [
      "Ghép hai câu, bỏ đại từ she/he/it/they/there/here ở câu sau",
      "N (người) + who/that + V",
      "N (vật) + which/that + V",
      "N (nơi) + where + S + V",
    ],
  },
  cond1: {
    title: "Câu điều kiện loại 1",
    signs: [
      "If + hiện tại, will. Unless = If ... not.",
      "Chỉ việc có thể xảy ra ở tương lai.",
    ],
    structure: [
      "If + S + don't/doesn't + V, S + will + V  ↔  Unless + S + V, S + will + V",
      "Unless bỏ don't/doesn't. If ... not thì thêm don't/doesn't lại.",
      "Mệnh đề If/Unless có thể đứng trước hoặc sau.",
    ],
  },
  cond2: {
    title: "Câu điều kiện loại 2",
    signs: [
      "because / so + sự thật hiện tại trái ngược với điều mong muốn.",
      "can't, don't, doesn't ở câu gốc là sự thật, không phải điều kiện loại 1.",
    ],
    structure: [
      "If + S + V2 / didn't + V, S + would/could + V",
      "Nguyên nhân phủ định (don't have, doesn't study) thành khẳng định trong If.",
      "Nguyên nhân khẳng định (works hard, smokes) thành phủ định trong If.",
    ],
  },
  reported: {
    title: "Câu tường thuật (câu kể)",
    signs: [
      "Có ngoặc kép và said / said to.",
      "Lùi thì, đổi đại từ, đổi trạng từ chỉ thời gian và nơi chốn.",
    ],
    structure: [
      "Hiện tại đơn → quá khứ đơn. Quá khứ đơn / hiện tại hoàn thành → quá khứ hoàn thành.",
      "can → could, will → would. am/is/are → was/were.",
      "yesterday → the day before / the previous day. tomorrow → the next day / the following day. this → that.",
      "said to + người = told + người. that có thể bỏ.",
    ],
  },
  modal: {
    title: "Động từ khuyết thiếu",
    signs: [
      "necessary ≠ should. necessary = have to / must.",
      "not necessary = don't have to, không phải mustn't.",
      "a good idea / need = should.",
    ],
    structure: [
      "Hiện tại: S + have to/must/should + V",
      "Quá khứ necessary: Why did + S + have to + V?",
      "Câu hỏi: Do/Does + S + have to + V?",
    ],
  },
  although: {
    title: "Although ↔ In spite of / Despite",
    signs: [
      "Although đi với mệnh đề có S + V.",
      "In spite of và Despite đi với danh từ, V-ing, hoặc the fact that + mệnh đề.",
    ],
    structure: [
      "Although + S + V → In spite of/Despite + the fact that + S + V",
      "Although + S + be + adj → In spite of/Despite + being + adj, hoặc + danh từ",
      "In spite of/Despite + N → Although + S + V",
      "In spite of = Despite.",
    ],
  },
}

export const categoryOrder = [
  "past-perfect",
  "comparison",
  "relative",
  "cond1",
  "cond2",
  "reported",
  "modal",
  "although",
]

function pastHint(item) {
  const prompt = item.prompt
  const continued = /\b(started|began)\b/i.test(prompt)
  const useFor = /\bago\b/i.test(prompt)
  const time = useFor ? "for + khoảng thời gian" : "since + mốc thời gian"
  const subject = item.answers[0].split(/\s+has|\s+have/i)[0]
  if (continued) {
    return {
      title: writingHints["past-perfect"].title,
      signs: [
        "Câu này có started/began: việc bắt đầu trong quá khứ và vẫn còn tới bây giờ.",
        "Không thêm not. Bỏ started/began, giữ động từ chính.",
        useFor ? "Có ago nên dùng for, không dùng since." : "Mốc thời gian nên dùng since, không dùng for.",
      ],
      structure: [
        `${subject} + has/have + V3 + ${time}`,
        `${subject} + has/have + been + V-ing + ${time}`,
        "Cả thì hoàn thành đơn và hoàn thành tiếp diễn đều đúng.",
      ],
    }
  }
  return {
    title: writingHints["past-perfect"].title,
    signs: [
      "Câu này có last / the last time, không có started/began.",
      "Việc đã dừng, nên bắt buộc has/have + not (hoặc never).",
      useFor ? "Có ago nên dùng for + số năm/tháng." : "last year, last summer, in + năm, when là mốc → since.",
    ],
    structure: [
      `${subject} + has/have + not + V3 + ${time}`,
      "hasn't = has not. haven't = have not. has never / have never cũng đúng.",
      "Danh từ không đếm được hoặc số nhiều ở câu phủ định có thể thêm any.",
    ],
  }
}

function comparisonHint(item) {
  const prompt = item.prompt
  if (/\bno\b.+\bas\b.+\bas\b/i.test(prompt)) {
    return {
      title: writingHints.comparison.title,
      signs: [
        "Có No ... as + tính từ + as: không ai/không nơi nào bằng.",
        "Đưa người hoặc nơi được so sánh lên làm chủ ngữ.",
      ],
      structure: [
        "S + be + the + adj-est / the most + adj + ...",
        "S + be + adj-er / more + adj + than any other + danh từ",
        "S + be + adj-er / more + adj + than the other + danh từ số nhiều",
      ],
    }
  }
  if (/\bnot as\b.+\bas\b/i.test(prompt)) {
    return {
      title: writingHints.comparison.title,
      signs: [
        "Có not as + tính từ + as: vế kém hơn đang đứng trước.",
        "Đảo hai vế khi viết thành so sánh hơn.",
      ],
      structure: [
        "Vế hơn + be + adj-er / more + adj + than + vế kém",
        "Vế kém + be + less + adj + than + vế hơn",
        "Tính từ ngắn dùng -er; tính từ dài dùng more.",
      ],
    }
  }
  return {
    title: writingHints.comparison.title,
    signs: [
      "Có more/adj-er + than: vế hơn đang đứng trước.",
      "Khi đổi sang not as hoặc less, đưa vế kém lên đầu.",
    ],
    structure: [
      "Vế kém + be + not as + adj + as + vế hơn",
      "Vế kém + be + less + adj + than + vế hơn",
      "isn't = is not. aren't = are not.",
    ],
  }
}

function relativeHint(item) {
  const prompt = item.prompt
  const place = /\b(there|here|in there)\b/i.test(prompt.split(".").slice(1).join("."))
  const thing = /\b(it|they)\b/i.test(prompt) && !/\b(he|she)\b/i.test(prompt)
  if (place) {
    return {
      title: writingHints.relative.title,
      signs: [
        "Câu sau có there/here/in there: đang nói về nơi chốn.",
        "Bỏ there/here khi ghép câu.",
      ],
      structure: [
        "Nơi + where + S + V",
        "Nơi + in which + S + V",
        "Nơi + which + S + V + in",
      ],
    }
  }
  if (thing) {
    return {
      title: writingHints.relative.title,
      signs: [
        "Đại từ it/they chỉ vật, không chỉ người.",
        "Bỏ it/they, nối thẳng sau danh từ.",
      ],
      structure: [
        "Danh từ + which + phần còn lại của câu sau",
        "Danh từ + that + phần còn lại của câu sau",
        "which và that trong câu này đều đúng.",
      ],
    }
  }
  return {
    title: writingHints.relative.title,
    signs: [
      "Đại từ he/she chỉ người.",
      "Bỏ he/she, nối sau danh từ chỉ người.",
    ],
    structure: [
      "Danh từ người + who + động từ của câu sau",
      "Danh từ người + that + động từ của câu sau",
      "who và that trong câu này đều đúng.",
    ],
  }
}

function cond1Hint(item) {
  const prompt = item.prompt
  const toUnless = /\bif\b.+\b(doesn't|don't|does not|do not)\b/i.test(prompt)
  if (toUnless) {
    return {
      title: writingHints.cond1.title,
      signs: [
        "Câu gốc có If ... not. Đổi thành Unless.",
        "Unless không đi với doesn't/don't.",
      ],
      structure: [
        "Unless + S + V (khẳng định), S + will / won't + V",
        "Giữ nguyên mệnh đề kết quả, chỉ đổi mệnh đề điều kiện.",
        "won't = will not. doesn't = does not.",
      ],
    }
  }
  const ifNegative = /\bif\b.+\b(doesn't|don't|does not|do not)\b/i.test(item.answers[0] ?? "")
  if (ifNegative) {
    return {
      title: writingHints.cond1.title,
      signs: [
        "Câu gốc có Unless + động từ khẳng định.",
        "Đổi thành If và thêm don't/doesn't vào mệnh đề điều kiện.",
        "Mệnh đề kết quả giữ will hoặc won't như câu gốc.",
      ],
      structure: [
        "If + S + don't/doesn't + V, S + will/won't + V",
        "Hai mệnh đề có thể đảo chỗ.",
      ],
    }
  }
  return {
    title: writingHints.cond1.title,
    signs: [
      "Câu gốc phủ định cả hai vế: won't ... unless.",
      "Bỏ cả hai phủ định: If + động từ khẳng định, will + động từ khẳng định.",
    ],
    structure: [
      "If + S + V, S + will + V",
      "Cách kia vẫn đúng: If + S + don't/doesn't + V, S + won't + V",
    ],
  }
}

function cond2Hint(item) {
  const ifClause = (item.answers[0] ?? "").split(",")[0]
  const ifNegative = /\bdidn't\b|\bdid not\b/i.test(ifClause)
  const could = /\bcould\b/i.test(item.answers[0] ?? "")
  return {
    title: writingHints.cond2.title,
    signs: [
      "Câu gốc là sự thật hiện tại, viết thành giả định trái với hiện tại.",
      ifNegative
        ? "Nguyên nhân câu gốc là khẳng định, nên If viết phủ định với didn't."
        : "Nguyên nhân câu gốc là phủ định, nên If viết khẳng định ở quá khứ đơn.",
      could ? "Câu gốc có can't nên kết quả dùng could." : "Kết quả dùng would.",
    ],
    structure: [
      ifNegative ? "If + S + didn't + V, S + would/could + V" : "If + S + V2, S + would/could + V",
      "didn't = did not. wouldn't = would not. couldn't = could not.",
      "would be able to dùng được khi câu gốc có can't.",
    ],
  }
}

function reportedHint(item) {
  const prompt = item.prompt
  const bits = []
  if (/\b(am|is|are|want|hope|have enjoyed|can't|can)\b/i.test(prompt)) bits.push("Động từ trong ngoặc ở hiện tại hoặc can → lùi về quá khứ / could.")
  if (/\b(studied|saw|I've|I have|have lived)\b/i.test(prompt)) bits.push("Quá khứ đơn hoặc hiện tại hoàn thành → had + V3.")
  if (/yesterday/i.test(prompt)) bits.push("yesterday → the day before hoặc the previous day.")
  if (/tomorrow/i.test(prompt)) bits.push("tomorrow → the next day hoặc the following day.")
  if (/\bthis\b/i.test(prompt)) bits.push("this → that.")
  if (/said to/i.test(prompt) || /father/i.test(prompt)) bits.push("said to + người = told + người.")
  if (bits.length === 0) bits.push("Lùi thì trong ngoặc và đổi đại từ I/you theo người nói và người nghe.")
  return {
    title: writingHints.reported.title,
    signs: bits,
    structure: [
      "S + said (that) + mệnh đề đã lùi thì",
      "S + told + tân ngữ + (that) + mệnh đề đã lùi thì",
      "that viết hoặc bỏ đều đúng.",
    ],
  }
}

function modalHint(item) {
  const prompt = item.prompt
  if (/not necessary/i.test(prompt)) {
    return {
      title: writingHints.modal.title,
      signs: [
        "not necessary = không bắt buộc, không phải cấm.",
        "Dùng don't have to / do not have to. Không dùng mustn't.",
      ],
      structure: [
        "S + don't/doesn't + have to + V",
        "Giữ nguyên phần câu phía sau nếu có.",
      ],
    }
  }
  if (/necessary/i.test(prompt) && /last saturday/i.test(prompt)) {
    return {
      title: writingHints.modal.title,
      signs: [
        "necessary ở quá khứ, câu hỏi Why.",
        "was it necessary for you → did you have to.",
      ],
      structure: [
        "Why did + S + have to + V + quá khứ?",
      ],
    }
  }
  if (/is it necessary/i.test(prompt)) {
    return {
      title: writingHints.modal.title,
      signs: [
        "Câu hỏi với necessary ở hiện tại.",
        "is it necessary for you → do you have to.",
      ],
      structure: [
        "Do/Does + S + have to + V?",
      ],
    }
  }
  if (/necessary/i.test(prompt)) {
    return {
      title: writingHints.modal.title,
      signs: [
        "necessary = bắt buộc. Không đổi thành should.",
        "have to và must đều đúng.",
      ],
      structure: [
        "S + have to + V",
        "S + must + V",
      ],
    }
  }
  if (/not a good idea/i.test(prompt)) {
    return {
      title: writingHints.modal.title,
      signs: [
        "not a good idea = lời khuyên phủ định.",
        "Đổi thành shouldn't / should not, không phải don't have to.",
      ],
      structure: [
        "S + shouldn't + V",
        "Nếu câu gốc là leave + tân ngữ, có thể viết câu bị động: tân ngữ + shouldn't be left + V3",
      ],
    }
  }
  return {
    title: writingHints.modal.title,
    signs: [
      "a good idea / need = lời khuyên, dùng should.",
      "Bỏ I think / It's a good idea for you, đưa người được khuyên lên làm chủ ngữ.",
    ],
    structure: [
      "S + should + V",
      "should not viết đủ cũng đúng khi câu gốc phủ định.",
    ],
  }
}

function althoughHint(item) {
  const prompt = item.prompt
  if (/^although\b/i.test(prompt) || /\balthough\b/i.test(prompt) && !/in spite of|despite/i.test(prompt)) {
    return {
      title: writingHints.although.title,
      signs: [
        "Câu gốc có Although + mệnh đề.",
        "Đổi mệnh đề đó thành danh từ, V-ing, hoặc the fact that + mệnh đề sau In spite of / Despite.",
        "Mệnh đề chính giữ nguyên ý.",
      ],
      structure: [
        "In spite of/Despite + the fact that + S + V, S + V",
        "In spite of + being + tính từ / danh từ, S + V",
        "Despite + being + tính từ / danh từ, S + V",
        "In spite of và Despite đổi cho nhau được.",
      ],
    }
  }
  return {
    title: writingHints.although.title,
    signs: [
      "Câu gốc có In spite of hoặc Despite + danh từ / V-ing.",
      "Đổi cụm đó thành Although + S + V.",
      "V-ing trở lại thành động từ có thì. Danh từ trở lại thành mệnh đề.",
    ],
    structure: [
      "Although + S + V, S + V",
      "Giữ đúng thì của câu gốc: quá khứ vẫn là quá khứ.",
    ],
  }
}

export function hintFor(item) {
  if (item.category === "past-perfect") return pastHint(item)
  if (item.category === "comparison") return comparisonHint(item)
  if (item.category === "relative") return relativeHint(item)
  if (item.category === "cond1") return cond1Hint(item)
  if (item.category === "cond2") return cond2Hint(item)
  if (item.category === "reported") return reportedHint(item)
  if (item.category === "modal") return modalHint(item)
  return althoughHint(item)
}
