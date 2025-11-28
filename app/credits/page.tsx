const CreditsPage = () => (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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

        </div>
    </section>
)

export default CreditsPage