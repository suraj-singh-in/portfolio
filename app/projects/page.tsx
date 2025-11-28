import { ArrowUpRight } from 'lucide-react';

const ProjectsPage = () => (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Projects</h1>

        <div className="grid grid-cols-1 gap-6">

            {/* Project 1 */}
            <a
                href="https://github.com/suraj-singh-in/Actor"
                target="_blank" rel="noopener noreferrer"
                className="group block border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
            >
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100 flex items-center">
                        Actor (API Mocking Service)
                        <ArrowUpRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" />
                    </h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 leading-relaxed">
                    Developed an innovative API mocking service for API testing and documentation sharing.
                </p>
                <div className="text-xs text-neutral-500 dark:text-neutral-500 flex flex-col gap-2">
                    <span className="flex items-start">
                        • Engineered back-end architecture with 60% unit test code coverage.
                    </span>
                    <span className="flex items-start">
                        • Implemented Docker to containerize application, reducing deployment time by 20%.
                    </span>
                </div>
            </a>

            {/* Project 2 */}
            <a
                href="https://www.prospergreens.com/"
                target="_blank" rel="noopener noreferrer"
                className="group block border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
            >
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100 flex items-center">
                        MSI Power Website
                        <ArrowUpRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" />
                    </h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 leading-relaxed">
                    Led end-to-end design and development of MSI Power’s primary website as a freelance developer.
                </p>
                <div className="text-xs text-neutral-500 dark:text-neutral-500">
                    Operated under direct reporting lines to core management for seamless execution.
                </div>
            </a>

        </div>
    </section>
);

export default ProjectsPage;