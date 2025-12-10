"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const navItems = {
  home: { label: "home", pathname: "/" },
  experience: { label: "experience", pathname: "/experience" },
  projects: { label: "projects", pathname: "/projects" },
  blogs: { label: "blogs", pathname: "/blogs" },
  compass: { label: "compass", pathname: "/compass" },
  manhattanProject: { label: "manhattan project", pathname: "/manhattan-project" },
};

const Navbar = () => {
  const router = useRouter();
  const currentPage = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (pathname: string) => {
    router.push(pathname);
    setIsOpen(false); // close mobile menu after navigation
  };

  return (
    <aside className="mb-6 md:mb-8 tracking-tight -ml-[8px]">
      <div className="lg:sticky lg:top-20">
        <nav className="relative px-0 pb-0 md:overflow-auto scroll-pr-6 md:relative" id="nav">
          {/* Wrapper so overlay can be absolutely positioned */}
          <div className="relative md:static">
            {/* Mobile header */}
            <div className="flex items-center justify-between md:hidden px-1 mb-1">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"></span>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-2 rounded-md border border-neutral-200 dark:border-neutral-700 
                           text-neutral-700 dark:text-neutral-200 
                           focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                aria-expanded={isOpen}
                aria-label="Toggle navigation"
              >
                <div className="space-y-1">
                  <span className="block h-[2px] w-5 bg-current rounded" />
                  <span className="block h-[2px] w-5 bg-current rounded" />
                  <span className="block h-[2px] w-5 bg-current rounded" />
                </div>
              </button>
            </div>

            {/* Mobile overlay menu (absolute, does NOT push content) */}
            {isOpen && (
              <div
                className="
                  absolute inset-x-0 top-full mt-2 z-50 md:hidden
                "
              >
                {/* Optional backdrop */}
                <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" />

                <div className="relative z-50 mx-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-2">
                  <div className="flex flex-col max-h-[70vh] overflow-y-auto">
                    {Object.entries(navItems).map(([key, { label, pathname }]) => {
                      const isActive = currentPage === pathname || (pathname.length > 1 && currentPage.startsWith(pathname));

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleNavigate(pathname)}
                          className={`transition-all text-left hover:text-neutral-800 dark:hover:text-neutral-200 
                                      inline-flex items-center whitespace-nowrap 
                                      relative py-2 px-3 rounded-lg text-sm
                                      ${
                                        isActive
                                          ? "font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                          : "text-neutral-500 dark:text-neutral-400"
                                      }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop / tablet nav (original inline layout) */}
            <div className="hidden md:flex flex-row space-x-0 pr-10">
              {Object.entries(navItems).map(([key, { label, pathname }]) => {
                const isActive = currentPage === pathname || (pathname.length > 1 && currentPage.startsWith(pathname));

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNavigate(pathname)}
                    className={`transition-all hover:text-neutral-800 dark:hover:text-neutral-200 
                                flex items-center relative py-1 px-2 m-1
                                ${isActive ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;
