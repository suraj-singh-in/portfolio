import type { Metadata } from "next"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Credits",
  description: "Attribution for the icons, libraries, and open-source tools used across this site.",
  alternates: { canonical: "/credits" },
  openGraph: {
    title: "Credits — Suraj Singh",
    description: "Attribution for the icons, libraries, and open-source tools used across this site.",
    url: "/credits",
    type: "website",
  },
  twitter: {
    title: "Credits — Suraj Singh",
    description: "Attribution for the icons, libraries, and open-source tools used across this site.",
  },
}

const CreditsPage = () => (
    <PageShell>
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Credits</h1>

        <div className="flex flex-col gap-10">

            {/* Job 1 */}
            <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">Icons</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                    <li><a target="_blank" href="https://icons8.com/icon/e4uvhYvaKsQB/samosa">Samosa</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></li>
                </ul>
            </div>

            <div className="flex flex-col">
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">3D models and textures (lore)</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                    <li><a target="_blank" href="https://poly.pizza/m/5EGWBMpuXq">Adventurer</a>, <a target="_blank" href="https://poly.pizza/m/qvTrSG9pZF">Horse</a> and <a target="_blank" href="https://poly.pizza/m/5d80r2XX3O">Wall Towers Door</a>, <a target="_blank" href="https://poly.pizza/m/tdeAOh3LQV">Stone Wall</a> and <a target="_blank" href="https://poly.pizza/m/ZuRHRsKWoz">Path Straight</a> by <a target="_blank" href="https://quaternius.com">Quaternius</a> (CC0)</li>
                    <li>Trees, ferns, shrubs, rocks, stumps, fire pit, branches and axe from <a target="_blank" href="https://polyhaven.com">Poly Haven</a> by Rico Cilliers, Rob Tuytel, Kless Gyzen, Jenelle van Heerden, Sebastian Platen and Ulan Cabanilla (CC0)</li>
                </ul>
            </div>

        </div>
    </PageShell>
)

export default CreditsPage