"use client";

import { useRouter, usePathname } from "next/navigation";

const navItems = {
    home: { label: 'home', pathname: "/" },
    experience: { label: 'experience', pathname: "/experience" },
    projects: { label: 'projects', pathname: "/projects" },
};

const Navbar = () => {
    const router = useRouter();
    const currentPage = usePathname();
    return (
        <aside className="-ml-[8px] mb-8 md:mb-16 tracking-tight">
            <div className="lg:sticky lg:top-20">
                <nav className="flex flex-row items-start relative px-0 pb-0 md:overflow-auto scroll-pr-6 md:relative" id="nav">
                    <div className="flex flex-row space-x-0 pr-10">
                        {Object.entries(navItems).map(([key, { label, pathname }]) => (
                            <button
                                key={key}
                                onClick={() => router.push(pathname)}
                                className={`transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1 ${currentPage === pathname
                                    ? 'font-medium text-neutral-900 dark:text-neutral-100'
                                    : 'text-neutral-500 dark:text-neutral-400'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Navbar;