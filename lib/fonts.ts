import localFont from "next/font/local";

// Self-hosted (Fontshare, free for commercial use — license copies kept in
// public/fonts/LICENSE/). Never a runtime CDN dependency. See CLAUDE.md
// design-system section for the palette/type spec these implement.
export const clashDisplay = localFont({
  src: [
    { path: "../public/fonts/clash-display/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/clash-display/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/clash-display/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

export const satoshi = localFont({
  src: [
    { path: "../public/fonts/satoshi/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});
