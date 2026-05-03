const FONTSHARE_ORIGIN = "https://api.fontshare.com";
const FONTSHARE_CSS_URL =
  `${FONTSHARE_ORIGIN}/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&f[]=gambarino@400&display=swap`;
const DEDUP_ATTR = "data-fontshare-loaded";

export function loadFonts(): void {
  // SSR / non-browser guard
  if (typeof document === "undefined") return;

  // Deduplication — skip if already injected
  if (document.documentElement.hasAttribute(DEDUP_ATTR)) return;
  document.documentElement.setAttribute(DEDUP_ATTR, "");

  const head = document.head;
  const frag = document.createDocumentFragment();

  // ── 1. Early connection hints ─────────────────────────────────────────────

  // preconnect: DNS + TCP + TLS in one shot (modern browsers)
  const preconnect = Object.assign(document.createElement("link"), {
    rel: "preconnect",
    href: FONTSHARE_ORIGIN,
    crossOrigin: "anonymous",
  });

  // dns-prefetch: DNS-only fallback for older browsers
  const dnsPrefetch = Object.assign(document.createElement("link"), {
    rel: "dns-prefetch",
    href: FONTSHARE_ORIGIN,
  });

  frag.append(preconnect, dnsPrefetch);

  // ── 2. Non-blocking async stylesheet load ─────────────────────────────────
  
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "style";
  preload.href = FONTSHARE_CSS_URL;
  (preload as HTMLLinkElement & { fetchpriority: string }).fetchpriority = "high";

  const activate = (): void => {
    preload.onload = null;
    preload.onerror = null;
    preload.rel = "stylesheet";
  };

  preload.onload = activate;
  // Graceful degradation: if preload fails mid-flight, still apply as stylesheet
  preload.onerror = activate;

  frag.append(preload);

  // ── 3. <noscript> fallback (no-JS environments, crawlers, SSR hydration) ──

  const noscript = document.createElement("noscript");
  noscript.innerHTML = `<link rel="stylesheet" href="${FONTSHARE_CSS_URL}">`;
  frag.append(noscript);

  // Single reflow — all nodes land in one DOM operation
  head.append(frag);
}

// Auto-run when the module is imported from main.ts.
loadFonts();

