import { CATEGORIES, type Book, type CategoryName } from "../data/books"

export const CABINETS = 3
export const ROWS = 6

export type Shelf = {
  index: number
  cabinet: 0 | 1 | 2
  row: number
  category: CategoryName | null
  books: Book[]
}

/**
 * Categories fill shelves in reading order: left → right across the three cabinets,
 * then the next row down (matches the real shelves). Shelves past the last category stay empty.
 */
export function assignShelves(books: Book[]): Shelf[] {
  const shelves: Shelf[] = []
  for (let cabinet = 0; cabinet < CABINETS; cabinet++) {
    for (let row = 0; row < ROWS; row++) {
      const index = cabinet * ROWS + row
      // Row-major: left→right across the three cabinets, then the next row down.
      const category = CATEGORIES[row * CABINETS + cabinet] ?? null
      shelves.push({
        index,
        cabinet: cabinet as 0 | 1 | 2,
        row,
        category,
        books: category ? books.filter((bk) => bk.category === category) : [],
      })
    }
  }
  return shelves
}
