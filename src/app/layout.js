import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s · Fitness Delhi",
    default: "Fitness Delhi",
  },
  description: "Gyms, events and fitness gear in Delhi",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0d" },
  ],
};

// Runs before the page paints, so a dark-mode visitor never sees a white flash.
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var dark = saved === "dark" ||
      (saved !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full bg-app">
        <div className="mx-auto flex h-dvh max-w-md flex-col border-line bg-app sm:border-x">
          <main className="flex-1 overflow-y-auto">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
