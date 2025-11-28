import { Github, Linkedin, Mail, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter text-neutral-900 dark:text-neutral-100">
        Suraj Singh
      </h1>
      <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        I'm a Software Development Engineer with nearly 4 years of experience in full-stack development.
        I currently work at <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          <a href="https://fynd.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors underline">Fynd</a></span>,
        where I engineer robust Offline POS clients and retail systems.
      </p>
      <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        I specialize in building high-performance web applications using modern technologies like
        <span className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded mx-1 text-neutral-900 dark:text-neutral-100">Next.js</span>,
        <span className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded mx-1 text-neutral-900 dark:text-neutral-100">React Native</span>,
        and <span className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded mx-1 text-neutral-900 dark:text-neutral-100">Node.js</span>.
      </p>

      <div className="my-8 flex flex-col space-y-4 w-full">
        <h2 className="font-semibold text-xl tracking-tight text-neutral-900 dark:text-neutral-100">Connect</h2>
        <div className="flex flex-wrap gap-4 text-neutral-600 dark:text-neutral-400">
          <a
            href="https://linkedin.com/in/suraj-singh-in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <Linkedin size={16} className="mr-2" /> LinkedIn
          </a>
          <a
            href="https://github.com/suraj-singh-in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <Github size={16} className="mr-2" /> GitHub
          </a>
          <a
            href="mailto:suraj.singh.in.delhi@gmail.com"
            className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <Mail size={16} className="mr-2" /> Email
          </a>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center">
          <MapPin size={14} className="mr-1" /> Delhi, India
        </p>
      </div>
    </section>
  );
}
