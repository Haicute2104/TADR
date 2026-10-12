import sets from "./readingQuestions.json"

export const readingSets = sets
export const readingItems = sets.flatMap((set) => set.items)
