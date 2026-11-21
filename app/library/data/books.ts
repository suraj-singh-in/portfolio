export const CATEGORIES = [
  "Fantasy & Sci-Fi",
  "English Classics",
  "Modern English",
  "Murakami",
  "Japanese/Korean Lit",
  "Russian Lit",
  "Philosophy",
  "History",
  "Self-Help",
  "Non-Fiction / Memoirs / Business",
  "Indian Lit",
  "Tech",
  "Poetry",
  "Unsorted",
] as const

export type CategoryName = (typeof CATEGORIES)[number]

export type Rating = 0 | 1 | 2 | 3 | 4 | 5

export type Book = {
  id: string
  title: string
  category: CategoryName
  author?: string
  /** Real cover image. If empty, a pencil-drawn cover is generated. */
  coverUrl?: string
  description?: string
  review?: string
  /** Number of samosas given (0-5). Omit for unrated. */
  rating?: Rating
  /** Label above the title. Defaults to "Finished read". */
  status?: string
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const b = (category: CategoryName, title: string, author?: string): Book => ({
  id: slug(title),
  title,
  category,
  author,
})

export const BOOKS: Book[] = [
  // Fantasy & Sci-Fi
  b("Fantasy & Sci-Fi", "The Wheel of Time: Book 13", "Robert Jordan"),
  b("Fantasy & Sci-Fi", "Piranesi", "Susanna Clarke"),
  b("Fantasy & Sci-Fi", "Mahayoddha Kalki: Sword of Shiva (Book 3)"),
  b("Fantasy & Sci-Fi", "Parables of the Talents and Sower", "Octavia E. Butler"),
  b("Fantasy & Sci-Fi", "Remembrance of Earth's Past", "Liu Cixin"),
  b("Fantasy & Sci-Fi", "Hainish Cycle", "Ursula K. Le Guin"),

  // English Classics
  b("English Classics", "The Fountainhead", "Ayn Rand"),
  b("English Classics", "Fahrenheit 451", "Ray Bradbury"),
  b("English Classics", "Brave New World", "Aldous Huxley"),
  b("English Classics", "The Odyssey", "Homer"),

  // Modern English
  b("Modern English", "Intermezzo", "Sally Rooney"),
  b("Modern English", "Flashlight: A Novel", "Susan Choi"),
  b("Modern English", "Kairos", "Jenny Erpenbeck"),
  b("Modern English", "Pachinko", "Min Jin Lee"),
  b("Modern English", "The Kite Runner", "Khaled Hosseini"),
  b("Modern English", "Bunny", "Mona Awad"),
  b("Modern English", "As Long as the Lemon Trees Grow", "Zoulfa Katouh"),
  b("Modern English", "Klara and the Sun", "Kazuo Ishiguro"),
  b("Modern English", "Collide"),
  b("Modern English", "Lonely People Meet"),

  // Murakami
  b("Murakami", "A Wild Sheep Chase", "Haruki Murakami"),
  b("Murakami", "The City and Its Uncertain Walls", "Haruki Murakami"),
  b("Murakami", "Sputnik Sweetheart", "Haruki Murakami"),

  // Japanese/Korean Lit
  b("Japanese/Korean Lit", "Welcome to the Hyunam-dong Bookshop", "Hwang Bo-reum"),
  b("Japanese/Korean Lit", "I Want to Die but I Want to Eat Tteokbokki", "Baek Sehee"),
  b("Japanese/Korean Lit", "The Vegetarian", "Han Kang"),
  b("Japanese/Korean Lit", "The Temple of Dawn", "Yukio Mishima"),
  b("Japanese/Korean Lit", "Great Japanese Stories"),

  // Russian Lit
  b("Russian Lit", "Anna Karenina", "Leo Tolstoy"),
  b("Russian Lit", "White Nights", "Fyodor Dostoevsky"),

  // Philosophy
  b("Philosophy", "Meditations", "Marcus Aurelius"),
  b("Philosophy", "Letters from a Stoic", "Seneca"),
  b("Philosophy", "Twilight of the Idols and The Anti-Christ", "Friedrich Nietzsche"),
  b("Philosophy", "The Use and Abuse of History", "Friedrich Nietzsche"),
  b("Philosophy", "An Outline of Psychoanalysis", "Sigmund Freud"),
  b("Philosophy", "God Is Not Great", "Christopher Hitchens"),
  b("Philosophy", "Das Kapital", "Karl Marx"),
  b("Philosophy", "We Who Wrestle with God", "Jordan B. Peterson"),

  // History
  b("History", "Integration of the Indian States", "V. P. Menon"),

  // Self-Help
  b("Self-Help", "Think Again", "Adam Grant"),
  b("Self-Help", "Mindset", "Carol S. Dweck"),
  b("Self-Help", "Unfuck Yourself", "Gary John Bishop"),
  b("Self-Help", "Steal Like an Artist", "Austin Kleon"),
  b("Self-Help", "Ego Is the Enemy", "Ryan Holiday"),
  b("Self-Help", "Psycho-Cybernetics", "Maxwell Maltz"),
  b("Self-Help", "Commit to Yourself"),

  // Non-Fiction / Memoirs / Business
  b("Non-Fiction / Memoirs / Business", "Sex at Dawn", "Christopher Ryan & Cacilda Jethá"),
  b("Non-Fiction / Memoirs / Business", "Mother Mary Comes to Me", "Arundhati Roy"),
  b("Non-Fiction / Memoirs / Business", "Just Kids", "Patti Smith"),
  b("Non-Fiction / Memoirs / Business", "Breath", "James Nestor"),
  b("Non-Fiction / Memoirs / Business", "Influence", "Robert B. Cialdini"),
  b("Non-Fiction / Memoirs / Business", "Factfulness", "Hans Rosling"),
  b("Non-Fiction / Memoirs / Business", "Creating a Role", "Konstantin Stanislavski"),
  b("Non-Fiction / Memoirs / Business", "50 World's Greatest Letters"),
  b("Non-Fiction / Memoirs / Business", "It Is About Islam"),

  // Indian Lit
  b("Indian Lit", "Midnight's Children", "Salman Rushdie"),
  b("Indian Lit", "Five Point Someone", "Chetan Bhagat"),
  b("Indian Lit", "One Arranged Murder", "Chetan Bhagat"),
  b("Indian Lit", "12 Years"),
  b("Indian Lit", "Sita: Warrior of Mithila", "Amish"),
  b("Indian Lit", "Raavan: Enemy of Aryavarta", "Amish"),
  b("Indian Lit", "War of Lanka", "Amish"),
  b("Indian Lit", "The Hidden Hindu", "Akshat Gupta"),
  b("Indian Lit", "Ashadh Ka Ek Din", "Mohan Rakesh"),
  b("Indian Lit", "The Chola Tigers: Avengers of Somnath"),
  b("Indian Lit", "Samsara: Enter the Valley of the Gods"),

  // Tech
  b("Tech", "Introduction to Algorithms", "Cormen, Leiserson, Rivest & Stein"),
  b("Tech", "Cracking the Coding Interview", "Gayle Laakmann McDowell"),
  b("Tech", "Clean Code", "Robert C. Martin"),
  b("Tech", "Software Engineering at Google", "Titus Winters et al."),
  b("Tech", "Data Structures and Algorithms Made Easy", "Narasimha Karumanchi"),

  // Poetry
  b("Poetry", "The Prophet", "Kahlil Gibran"),
  b("Poetry", "Love Longing Loss"),

  // Unsorted
  b("Unsorted", "Sisters in Yellow"),
  b("Unsorted", "Secret Rendezvous"),
  b("Unsorted", "The Soul Catchers"),
]
