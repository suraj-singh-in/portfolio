import { BOOKS, CATEGORIES } from "../data/books"

/** Visually hidden, crawlable list of every book — the accessible twin of the drawing. */
export default function ShelfList() {
  return (
    <section className="sr-only" aria-label="All books, by shelf">
      {CATEGORIES.map((category) => {
        const books = BOOKS.filter((b) => b.category === category)
        if (books.length === 0) return null
        return (
          <div key={category}>
            <h2>{category}</h2>
            <ul>
              {books.map((b) => (
                <li key={b.id}>
                  {b.title}
                  {b.author ? ` by ${b.author}` : ""}
                  {b.rating !== undefined ? `, ${b.rating} of 5 samosas` : ""}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
