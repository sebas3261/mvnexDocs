import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide";
import { MorphIcon } from "morphicons/react";

interface Props {
  lang: "en" | "es";
  currentPath: string;
  localizedPaths?: Partial<Record<"en" | "es", string>>;
  messages: {
    brandHomeLabel: string;
    mainNavigationLabel: string;
    mobileNavigationLabel: string;
    navigationMenuLabel: string;
    switchToDark: string;
    switchToLight: string;
    openMenu: string;
    closeMenu: string;
    languageCode: string;
    languages: {
      en: string;
      es: string;
    };
    links: {
      home: string;
      docs: string;
      resources: string;
    };
    cta: string;
  };
}

type Theme = "light" | "dark";

function getLocalizedPath(
  currentPath: string,
  targetLang: "en" | "es",
  localizedPaths?: Partial<Record<"en" | "es", string>>,
) {
  if (localizedPaths?.[targetLang]) return localizedPaths[targetLang];

  const normalizedPath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;

  if (normalizedPath === "/") return `/${targetLang}/`;

  if (/^\/(en|es)(\/|$)/.test(normalizedPath)) {
    return normalizedPath.replace(/^\/(en|es)(?=\/|$)/, `/${targetLang}`);
  }

  return `/${targetLang}${normalizedPath}`;
}

export default function NavBar({ lang, currentPath, localizedPaths, messages }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [suppressNavHover, setSuppressNavHover] = useState(true);
  const lastScrollY = useRef(0);
  const SCROLL_THRESHOLD = 10;

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("theme");
    } catch {}
    const initial: Theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    document.documentElement.style.colorScheme = initial;
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
  }

  useEffect(() => {
    function handleScroll() {
      if (menuOpen) return;

      const currentY = Math.max(0, window.scrollY);
      const atTop = currentY < SCROLL_THRESHOLD;
      const scrollingUp = currentY < lastScrollY.current;

      setScrolled(!atTop);
      setHidden(!atTop && !scrollingUp);
      lastScrollY.current = currentY;
    }

    lastScrollY.current = Math.max(0, window.scrollY);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      setScrolled(true);
      setHidden(false);
    } else {
      const atTop = window.scrollY < SCROLL_THRESHOLD;
      setScrolled(!atTop);
      setHidden(false);
      lastScrollY.current = window.scrollY;
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    }

    function handlePageShow() {
      document.body.style.overflow = "";
      setMenuOpen(false);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const dark = theme === "dark";
  const navLinks = [
    { href: `/${lang}/`, label: messages.links.home },
    { href: `/${lang}/docs/`, label: messages.links.docs },
    { href: `/${lang}/resources/`, label: messages.links.resources },
  ];
  const englishHref = getLocalizedPath(currentPath, "en", localizedPaths);
  const spanishHref = getLocalizedPath(currentPath, "es", localizedPaths);

  return (
    <>
      <header
        style={{
          background: menuOpen
            ? "transparent"
            : scrolled
              ? dark
                ? "rgba(9,9,11,0.6)"
                : "rgba(255,255,255,0.6)"
              : "transparent",
          backdropFilter: scrolled && !menuOpen ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled && !menuOpen ? "blur(20px) saturate(180%)" : "none",
          borderBottomColor:
            scrolled && !menuOpen
              ? dark
                ? "rgba(39,39,42,0.8)"
                : "rgba(228,228,231,0.8)"
              : "transparent",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
        }}
        className="fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300"
      >
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href={`/${lang}/`}
            aria-label={messages.brandHomeLabel}
            className="inline-flex shrink-0 items-center gap-3"
          >
            <img
              src={dark ? "/logo.svg" : "/logo-dark.svg"}
              alt=""
              width="44"
              height="44"
              className="size-10 select-none sm:size-11"
              draggable={false}
            />
            <span className="hidden text-sm font-semibold text-zinc-950 dark:text-white sm:inline">
              mvnex docs
            </span>
          </a>

          <nav
            aria-label={messages.mainNavigationLabel}
            onMouseLeave={() => setSuppressNavHover(false)}
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex"
          >
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onMouseEnter={() => setSuppressNavHover(false)}
                className={`relative transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-zinc-950 after:transition-transform after:duration-300 hover:text-zinc-950 dark:after:bg-white dark:hover:text-white ${suppressNavHover ? "" : "hover:after:origin-left hover:after:scale-x-100"}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className={`transition-opacity duration-200 ${menuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={dark ? messages.switchToLight : messages.switchToDark}
                title={dark ? messages.switchToLight : messages.switchToDark}
                className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <MorphIcon icon={dark ? Sun : Moon} size={20} reducedMotion="user" />
              </button>
            </div>

            <div className={`transition-opacity duration-200 ${menuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}>
              <details className="group relative select-none">
                <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  {messages.languageCode}
                </summary>
                <div className="absolute right-0 top-full z-50 mt-3 min-w-36 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <a href={englishHref} lang="en" className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                    {messages.languages.en}
                  </a>
                  <a href={spanishHref} lang="es" className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                    {messages.languages.es}
                  </a>
                </div>
              </details>
            </div>

            <a
              href="https://github.com/sebas3261/mvnex"
              className={`ml-1 hidden select-none rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white md:inline-flex ${menuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
              {messages.cta}
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? messages.closeMenu : messages.openMenu}
              aria-expanded={menuOpen}
              aria-controls="fullscreen-menu"
              className="ml-1 flex size-11 items-center justify-center text-zinc-600 transition-colors dark:text-zinc-300 md:hidden"
            >
              <MorphIcon icon={menuOpen ? X : Menu} size={20} reducedMotion="user" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="fullscreen-menu"
        role="dialog"
        aria-modal="true"
        aria-label={messages.navigationMenuLabel}
        className={`fixed inset-0 z-40 flex flex-col bg-white transition-transform duration-500 ease-in-out dark:bg-zinc-950 md:hidden ${menuOpen ? "translate-y-0" : "pointer-events-none -translate-y-full"}`}
      >
        <nav aria-label={messages.mobileNavigationLabel} className="flex flex-col items-start gap-1 px-8 pt-24">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-4xl font-semibold tracking-tight text-zinc-950 transition-colors hover:text-zinc-400 dark:text-white dark:hover:text-zinc-500"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-6 pb-10">
          <a
            href="https://github.com/sebas3261/mvnex"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center justify-center rounded-2xl bg-zinc-950 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {messages.cta}
          </a>
        </div>
      </div>
    </>
  );
}
