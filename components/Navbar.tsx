"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const navItems = {
  home: { label: "home", pathname: "/" },
  experience: { label: "experience", pathname: "/experience" },
  projects: { label: "projects", pathname: "/projects" },
  blogs: { label: "blogs", pathname: "/blogs" },
  compass: { label: "compass", pathname: "/compass" },
  manhattanProject: { label: "manhattan project", pathname: "/manhattan-project" },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

const Navbar = () => {
  const router = useRouter();
  const currentPage = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (pathname: string) => {
    router.push(pathname);
    setIsOpen(false);
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
                <motion.div
                  className="flex flex-col justify-center items-center w-5 h-4 gap-[5px]"
                  animate={isOpen ? "open" : "closed"}
                >
                  <motion.span
                    className="block h-[2px] w-5 bg-current rounded origin-center"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 7 },
                    }}
                    transition={{ duration: 0.22, ease: EASE }}
                  />
                  <motion.span
                    className="block h-[2px] w-5 bg-current rounded"
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                    transition={{ duration: 0.22, ease: EASE }}
                  />
                  <motion.span
                    className="block h-[2px] w-5 bg-current rounded origin-center"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -7 },
                    }}
                    transition={{ duration: 0.22, ease: EASE }}
                  />
                </motion.div>
              </button>
            </div>

            {/* Mobile overlay menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="mobile-menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="absolute inset-x-0 top-full mt-2 z-50 md:hidden"
                >
                  <motion.div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                  <div className="relative z-50 mx-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-2">
                    <motion.div
                      className="flex flex-col max-h-[70vh] overflow-y-auto"
                      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                      initial="hidden"
                      animate="visible"
                    >
                      {Object.entries(navItems).map(([key, { label, pathname }]) => {
                        const isActive =
                          currentPage === pathname ||
                          (pathname.length > 1 && currentPage.startsWith(pathname));

                        return (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => handleNavigate(pathname)}
                            variants={menuItemVariants}
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
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop nav with animated active pill */}
            <LayoutGroup id="desktop-nav">
              <div className="hidden md:flex flex-row space-x-0 pr-10">
                {Object.entries(navItems).map(([key, { label, pathname }]) => {
                  const isActive =
                    currentPage === pathname ||
                    (pathname.length > 1 && currentPage.startsWith(pathname));

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNavigate(pathname)}
                      className={`transition-colors hover:text-neutral-800 dark:hover:text-neutral-200
                                  flex items-center relative py-1 px-2 m-1 cursor-pointer
                                  ${isActive ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-md bg-neutral-100 dark:bg-neutral-800"
                          transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;
