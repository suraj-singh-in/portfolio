import { pageMetadata } from "@/lib/metadata"
import LoreClient from "./LoreClient"

export const metadata = pageMetadata({
  title: "Lore",
  description: "A small walkable world drawn entirely in text symbols: a hut at the edge of a forest, a campfire, and a horse grazing in a windy meadow.",
  path: "/lore",
})

export default function LorePage() {
  return <LoreClient />
}
