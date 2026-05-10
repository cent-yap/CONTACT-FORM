const ORIGIN = "https://api.fontshare.com";
const CSS_URL = `${ORIGIN}/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&f[]=gambarino@400&display=swap`;

export function loadFonts(): void {
  // Prevent execution in SSR environments
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Prevent duplicate injections
  if (root.hasAttribute("data-fonts")) return;
  root.setAttribute("data-fonts", "");

  // 1. Setup Preload
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "style";
  preload.href = CSS_URL;
  preload.fetchPriority = "high";

  // Handle load/error events with self-cleanup
  preload.onload = preload.onerror = () => {
    preload.onload = null;
    preload.onerror = null;
    preload.rel = "stylesheet";
  };

  // 2. Setup Noscript Fallback
  const noscript = document.createElement("noscript");
  noscript.innerHTML = `<link rel="stylesheet" href="${CSS_URL}">`;

  // 3. Setup Preconnect
  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = ORIGIN;
  preconnect.crossOrigin = "anonymous";

  // 4. Setup DNS Prefetch
  const dnsPrefetch = document.createElement("link");
  dnsPrefetch.rel = "dns-prefetch";
  dnsPrefetch.href = ORIGIN;

  // Append all elements to the document head
  document.head.append(preconnect, dnsPrefetch, preload, noscript);
}

loadFonts();
