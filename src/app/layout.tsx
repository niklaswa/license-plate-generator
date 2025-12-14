import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "License Plate Generator",
  description: "Generate license plates as images - German plates with state plakette and HU plakette",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gray-200 dark:bg-gray-800 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Bundesland-Wappen von{' '}
            <a 
              href="https://commons.wikimedia.org/wiki/Category:Coats_of_arms_of_states_of_Germany" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Wikimedia Commons
            </a>
            {' '}• Lizenziert unter Public Domain / CC-BY-SA
          </p>
          <p className="mt-2">
            <a 
              href="https://github.com/niklaswa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
            {' '}•{' '}
            <a 
              href="https://ts.la/niklas82130" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Tesla
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
