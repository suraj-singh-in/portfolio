const manhattanProjectData = {
    currentlyLearningData: [
        {
            title: "MIT OCW 18.06 Linear Algebra",
            subtitle: "This is a basic subject on matrix theory and linear algebra. Emphasis is given to topics that will be useful in other disciplines, including systems of equations, vector spaces, determinants, eigenvalues, similarity, and positive definite matrices.",
            url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        },
    ],
};

const ManhattanProject = () => (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Manhattan Project</h1>

        <div className="flex flex-col gap-10">

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Manhattan Project is my personal moonshot:</span> a decade-long quest to master Quantum Computing, AI, and the systems that will define the next technological era. My goal is to become one of the world’s leading Quantum-AI engineers and eventually build a company that creates real, practical quantum-accelerated intelligence systems.
            </p>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                This project is my commitment to learning the deepest foundations of math, physics, quantum algorithms, machine learning, error correction, and quantum hardware — and then using that knowledge to build something the world has never seen.
            </p>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                It’s ambitious, it’s bold, and it will take years. <br />
                But that’s exactly why I’m doing it.
            </p>

            <div className="flex flex-col">
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">Currently Learning</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                    {manhattanProjectData.currentlyLearningData.map((item) => (
                        <li key={item.title}>
                            <a
                                href={item.url}
                                className="underline"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {item.title}
                            </a>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-small">{item.subtitle}</p>
                        </li>
                    ))}
                </ul>
            </div>

        </div>

    </section>
);

export default ManhattanProject;