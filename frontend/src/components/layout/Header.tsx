import { Link, useRouterState } from "@tanstack/react-router";

/** SVG crown icon — Basileus = sovereign */
function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20h20" />
      <path d="M4 17l-2-9 5 4 5-8 5 8 5-4-2 9H4z" />
    </svg>
  );
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Extract agent label from /agent/:label
  const agentMatch = pathname.match(/^\/agent\/([^/]+)/);
  const agentLabel = agentMatch?.[1] ?? null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        {agentLabel ? (
          <>
            <Link
              to="/"
              className="flex items-center gap-2 text-[#a1a1aa] transition-colors hover:text-[#fafafa]"
            >
              <CrownIcon className="h-4 w-4" />
              <span
                className="text-sm font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Basileus
              </span>
            </Link>

            {/* Separator */}
            <svg viewBox="0 0 8 20" className="h-5 w-2 text-[#3f3f46]">
              <line x1="7" y1="0" x2="1" y2="20" stroke="currentColor" strokeWidth={1.5} />
            </svg>

            {/* Agent ENS name */}
            <span
              className="truncate text-sm font-semibold tracking-tight text-[#fafafa]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {decodeURIComponent(agentLabel)}
              <span className="text-[#a1a1aa]">.basileus-agent.eth</span>
            </span>
          </>
        ) : (
          <Link to="/" className="flex items-center gap-2.5">
            <CrownIcon className="h-5 w-5 text-[#fafafa]" />
            <span
              className="text-xl font-bold tracking-tight text-[#fafafa]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Basileus
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
