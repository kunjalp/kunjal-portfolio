import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "./globals.css";
import Dock from "@/components/Dock";
import Leaves from "@/components/Leaves";
import Scenery from "@/components/Scenery";

export const metadata: Metadata = {
  title: "Kunjal Purohit | CS & Computer Engineering",
  description:
    "Kunjal Purohit is a Computer Science and Computer Engineering double major at UC Santa Cruz, working across embedded firmware, autonomous systems, and full-stack software.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Sets the theme before first paint to avoid a flash of the wrong mode.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Scenery />
        {children}
        <Dock />
        <Leaves />
      </body>
    </html>
  );
}
