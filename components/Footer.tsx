import Link from "next/link"

const Footer = () => (
    <footer className="mt-20 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-neutral-500 dark:text-neutral-400 text-sm">
        <span>© {new Date().getFullYear()} Suraj Singh</span>
        <div className="flex space-x-4">
            <Link href="credits">credits</Link>
        </div>
    </footer>
)

export default Footer