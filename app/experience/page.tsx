const ExperiencePage = () => (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Experience</h1>

        <div className="flex flex-col gap-10">

            {/* Job 1 */}
            <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                    <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">Fynd (Shopsense Retail)</h2>
                    <span className="text-sm text-neutral-500 dark:text-neutral-500 tabular-nums shrink-0 ml-4">Aug 2024 – Present</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">Software Developer Engineer</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                    <li>Engineered a robust Offline POS client leveraging IndexedDB, Service Workers, and web workers, achieving full offline-first capability.</li>
                    <li>Reduced average order time from 1 min to 20 seconds through optimized local data handling.</li>
                    <li>Delivered the StoreOS system for retail outlets in just 4 months.</li>
                    <li>Designed the FSI (Fynd StoreOS Interface) to standardize inter-platform communication between Android and Web layers.</li>
                </ul>
            </div>

            {/* Job 2 */}
            <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                    <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">Freecharge Payment Technologies</h2>
                    <span className="text-sm text-neutral-500 dark:text-neutral-500 tabular-nums shrink-0 ml-4">Jul 2022 – Aug 2024</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">Software Developer Engineer</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                    <li>Enhanced the primary back-end of the customer app, leading to a 20% decrease in response time.</li>
                    <li>Orchestrated the transition of the Operation Panel from Angular JS to React, reducing bug occurrences by 60%.</li>
                    <li>Resolved a critical client issue where 90% of users dropped off during checkout; redesigned the interface to reduce drop rate to 2%.</li>
                    <li>Built a blog admin panel handling 63K requests per minute as an intern.</li>
                </ul>
            </div>

            {/* Job 3 */}
            <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                    <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">ProsperMe Developers</h2>
                    <span className="text-sm text-neutral-500 dark:text-neutral-500 tabular-nums shrink-0 ml-4">Feb 2021 – Jul 2021</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">Intern - Developer</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                    <li>Developed ProsperMe Greens website, increasing lead generation by 10%.</li>
                    <li>Engineered tracking mechanisms within the lead management system, reducing support response time by 20%.</li>
                </ul>
            </div>
        </div>

        <hr className="my-10 border-neutral-100 dark:border-neutral-800" />

        <h2 className="font-semibold text-xl mb-6 tracking-tighter text-neutral-900 dark:text-neutral-100">Achievements</h2>
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">Fynd Stars: Going Above & Beyond</span>
                <span className="text-neutral-500 text-sm">Sep 2025</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-4">
                Recognized for exemplary ownership and innovation in delivering mission-critical product enhancements.
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">FC Warrior</span>
                <span className="text-neutral-500 text-sm">Nov 2022 – Mar 2023</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Recognized for outstanding contributions and exceptional performance.
            </p>
        </div>

        <hr className="my-10 border-neutral-100 dark:border-neutral-800" />

        <h2 className="font-semibold text-xl mb-6 tracking-tighter text-neutral-900 dark:text-neutral-100">Skills</h2>
        <div className="flex flex-wrap gap-2">
            {['HTML/CSS/JS', 'React', 'React Native', 'Next.js', 'Redux', 'Tailwind CSS', 'Node', 'Express', 'Nest.js', 'Docker', 'MongoDB', 'SQL', 'TypeScript', 'C++', 'Python'].map((skill) => (
                <span key={skill} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded border border-neutral-200 dark:border-neutral-700">
                    {skill}
                </span>
            ))}
        </div>
    </section>
);

export default ExperiencePage;